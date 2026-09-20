import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { decryptField, type EncryptedEnvelope } from '@/lib/corporateCrypto'
import {
  DEALER_DISCOUNT_KEYS,
  DEFAULT_DEALER_DISCOUNTS,
  isDealerType,
} from '@/lib/dealerDiscount'
import type { DealerType } from '@prisma/client'

export const dynamic = 'force-dynamic'

const ENCRYPTED_FIELDS = [
  'companyName',
  'taxNumber',
  'taxOffice',
  'companyAddress',
  'companyPhone',
  'authorizedPerson',
] as const

/**
 * Sifreli firma alanlarini guvenli bicimde cozer.
 *
 * Cozme basarisiz olursa (eksik anahtar, bozuk veri) ilgili alan `null`
 * olarak doner; ucnokun tamami cokmez. Hata detayi loglanmaz.
 */
function safeDecrypt(envelope: unknown): string | null {
  if (envelope === null || envelope === undefined) return null
  try {
    return decryptField(envelope as EncryptedEnvelope)
  } catch {
    return null
  }
}

/** SiteSetting'ten tur bazli indirim oranini cozer. */
async function resolveDiscount(dealerType: DealerType): Promise<number> {
  const key = DEALER_DISCOUNT_KEYS[dealerType]
  const setting = await prisma.siteSetting.findUnique({
    where: { key },
    select: { value: true },
  })
  const raw = setting?.value
  if (raw === undefined || raw === null) return DEFAULT_DEALER_DISCOUNTS[dealerType]
  const trimmed = String(raw).trim()
  if (trimmed.length === 0) return DEFAULT_DEALER_DISCOUNTS[dealerType]
  const num = Number(trimmed)
  if (!Number.isFinite(num) || num < 0) return DEFAULT_DEALER_DISCOUNTS[dealerType]
  return Math.min(num, 100)
}

/**
 * GET /api/admin/dealers/[userId]
 *
 * Tek bir bayinin detayini doner: kullanici bilgisi, cozulmus firma bilgisi
 * (son basvurudan), uygulanacak indirim orani, siparisler ve teklifler.
 *
 * - Yalnizca ADMIN erisir.
 * - `dealerType` null ise 404 doner (bu kullanici bayi degil).
 * - Firma bilgisi EN SON karar verilmis basvurudan alinir; hic yoksa null.
 */
export async function GET(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  const { error } = await requireAdmin()
  if (error) return error

  if (typeof params?.userId !== 'string' || params.userId.trim().length === 0) {
    return NextResponse.json({ error: 'Bayi bulunamadı' }, { status: 404 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dealerType: true,
        createdAt: true,
      },
    })

    if (!user || !isDealerType(user.dealerType)) {
      return NextResponse.json({ error: 'Bayi bulunamadı' }, { status: 404 })
    }

    const dealerType = user.dealerType

    // Firma bilgisi: en son karar verilmis (APPROVED/REJECTED) basvuru.
    // Sifreli alanlar yalnizca burada cozulur.
    const application = await prisma.corporateApplication.findFirst({
      where: {
        userId: user.id,
        status: { in: ['APPROVED', 'REJECTED'] },
      },
      orderBy: [{ decidedAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        status: true,
        dealerType: true,
        submittedAt: true,
        decidedAt: true,
        applicationNote: true,
        companyName: true,
        taxNumber: true,
        taxOffice: true,
        companyAddress: true,
        companyPhone: true,
        authorizedPerson: true,
      },
    })

    let company: Record<string, string | null> | null = null
    let applicationMeta: {
      id: string
      status: string
      dealerType: DealerType | null
      submittedAt: Date
      decidedAt: Date | null
      applicationNote: string | null
    } | null = null

    if (application) {
      company = {}
      for (const field of ENCRYPTED_FIELDS) {
        company[field] = safeDecrypt(application[field])
      }
      applicationMeta = {
        id: application.id,
        status: application.status,
        dealerType: application.dealerType,
        submittedAt: application.submittedAt,
        decidedAt: application.decidedAt,
        applicationNote: application.applicationNote,
      }
    }

    const discountPercent = await resolveDiscount(dealerType)

    // Siparisler: tarihsel tutarlar DEGISTIRILMEZ, oldugu gibi gosterilir.
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        currency: true,
        companyName: true,
        taxNumber: true,
        taxOffice: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    })

    const quotes = await prisma.quoteRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        quoteNumber: true,
        status: true,
        currency: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        dealer: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          dealerType,
          discountPercent,
          createdAt: user.createdAt,
        },
        company,
        application: applicationMeta,
        orders: orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          paymentStatus: o.paymentStatus,
          totalAmount: o.totalAmount,
          currency: o.currency,
          companyName: o.companyName,
          taxNumber: o.taxNumber,
          taxOffice: o.taxOffice,
          itemCount: o._count.items,
          createdAt: o.createdAt,
        })),
        quotes,
      },
      { status: 200 }
    )
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/dealers/[userId]
 *
 * Bayinin turunu degistirir. Yalnizca `dealerType` alani kabul edilir.
 *
 * - Gecerli degerler: 'WHOLESALER' | 'SERVICE' | null (bayilik kaldirilir).
 * - Degisiklik YALNIZCA bundan sonraki fiyatlandirmayi etkiler; gecmis
 *   siparis/teklif tutarlari degismez.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const { error } = await requireAdmin()
  if (error) return error

  if (typeof params?.userId !== 'string' || params.userId.trim().length === 0) {
    return NextResponse.json({ error: 'Bayi bulunamadı' }, { status: 404 })
  }

  let body: { dealerType?: unknown }
  try {
    body = (await req.json()) as { dealerType?: unknown }
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 })
  }

  // `dealerType` acikca gonderilmis olmalidir. null = bayiligi kaldir.
  if (!('dealerType' in body)) {
    return NextResponse.json(
      { error: 'dealerType alanı zorunludur' },
      { status: 400 }
    )
  }

  const raw = body.dealerType
  if (raw !== null && !isDealerType(raw)) {
    return NextResponse.json(
      { error: 'Geçersiz bayi türü' },
      { status: 400 }
    )
  }
  const nextType: DealerType | null = raw === null ? null : raw

  try {
    const existing = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, dealerType: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    const updated = await prisma.user.update({
      where: { id: params.userId },
      data: { dealerType: nextType },
      select: { id: true, dealerType: true },
    })

    const discountPercent =
      updated.dealerType && isDealerType(updated.dealerType)
        ? await resolveDiscount(updated.dealerType)
        : 0

    return NextResponse.json(
      {
        dealer: {
          id: updated.id,
          dealerType: updated.dealerType,
          discountPercent,
        },
      },
      { status: 200 }
    )
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}