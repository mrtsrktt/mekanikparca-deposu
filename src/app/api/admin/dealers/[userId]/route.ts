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
        customDiscountPercent: true,
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

    // Tur bazli varsayilan ile kisiye ozel orani ayri ayri coz; arayuz
    // ikisini karsilastirabilsin.
    const typeDiscountPercent = await resolveDiscount(dealerType)
    const customDiscountPercent =
      user.customDiscountPercent !== null &&
      Number.isFinite(user.customDiscountPercent) &&
      user.customDiscountPercent >= 0
        ? Math.min(user.customDiscountPercent, 100)
        : null
    const discountPercent =
      customDiscountPercent !== null ? customDiscountPercent : typeDiscountPercent

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
          typeDiscountPercent,
          customDiscountPercent,
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
 * Bayinin turunu ve/veya kisiye ozel indirim oranini degistirir.
 *
 * Kabul edilen alanlar (en az biri gonderilmelidir):
 * - `dealerType`: 'WHOLESALER' | 'SERVICE' | null (bayilik kaldirilir).
 * - `customDiscountPercent`: 0..100 | null (null = ozel oran kaldirilir,
 *   tur bazli varsayilana donulur).
 *
 * Degisiklik YALNIZCA bundan sonraki fiyatlandirmayi etkiler; gecmis
 * siparis/teklif tutarlari degismez.
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

  let body: { dealerType?: unknown; customDiscountPercent?: unknown }
  try {
    body = (await req.json()) as {
      dealerType?: unknown
      customDiscountPercent?: unknown
    }
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 })
  }

  const hasType = 'dealerType' in body
  const hasCustom = 'customDiscountPercent' in body
  if (!hasType && !hasCustom) {
    return NextResponse.json(
      { error: 'dealerType veya customDiscountPercent alanı zorunludur' },
      { status: 400 }
    )
  }

  // --- dealerType dogrulama ---
  let nextType: DealerType | null | undefined = undefined
  if (hasType) {
    const raw = body.dealerType
    if (raw !== null && !isDealerType(raw)) {
      return NextResponse.json({ error: 'Geçersiz bayi türü' }, { status: 400 })
    }
    nextType = raw === null ? null : raw
  }

  // --- customDiscountPercent dogrulama ---
  // null = ozel orani kaldir. Sayisal deger 0..100 araliginda olmalidir.
  let nextCustom: number | null | undefined = undefined
  if (hasCustom) {
    const raw = body.customDiscountPercent
    if (raw === null) {
      nextCustom = null
    } else if (typeof raw === 'number' && Number.isFinite(raw)) {
      if (raw < 0 || raw > 100) {
        return NextResponse.json(
          { error: 'Özel indirim oranı 0 ile 100 arasında olmalıdır' },
          { status: 400 }
        )
      }
      nextCustom = raw
    } else if (typeof raw === 'string' && raw.trim().length > 0) {
      const num = Number(raw.trim())
      if (!Number.isFinite(num) || num < 0 || num > 100) {
        return NextResponse.json(
          { error: 'Özel indirim oranı 0 ile 100 arasında olmalıdır' },
          { status: 400 }
        )
      }
      nextCustom = num
    } else {
      return NextResponse.json(
        { error: 'Geçersiz özel indirim oranı' },
        { status: 400 }
      )
    }
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, dealerType: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    const data: { dealerType?: DealerType | null; customDiscountPercent?: number | null } = {}
    if (nextType !== undefined) data.dealerType = nextType
    if (nextCustom !== undefined) data.customDiscountPercent = nextCustom

    const updated = await prisma.user.update({
      where: { id: params.userId },
      data,
      select: { id: true, dealerType: true, customDiscountPercent: true },
    })

    let typeDiscountPercent = 0
    if (updated.dealerType && isDealerType(updated.dealerType)) {
      typeDiscountPercent = await resolveDiscount(updated.dealerType)
    }
    const customDiscountPercent =
      updated.customDiscountPercent !== null &&
      Number.isFinite(updated.customDiscountPercent) &&
      updated.customDiscountPercent >= 0
        ? Math.min(updated.customDiscountPercent, 100)
        : null
    const discountPercent =
      customDiscountPercent !== null ? customDiscountPercent : typeDiscountPercent

    return NextResponse.json(
      {
        dealer: {
          id: updated.id,
          dealerType: updated.dealerType,
          discountPercent,
          typeDiscountPercent,
          customDiscountPercent,
        },
      },
      { status: 200 }
    )
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}