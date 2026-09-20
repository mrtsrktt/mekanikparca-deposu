import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isCorporateApplicationEnabled } from '@/lib/featureFlags'
import { decryptField, type EncryptedEnvelope } from '@/lib/corporateCrypto'
import { decideCorporateApplication } from '@/lib/corporateApplicationDecisionService'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

const DETAIL_INCLUDE = {
  user: { select: { id: true, name: true, email: true, phone: true } },
  decidedByUser: { select: { id: true, name: true, email: true } },
  events: {
    orderBy: { createdAt: 'asc' },
    include: { actorUser: { select: { id: true, name: true, email: true } } },
  },
} as const satisfies Prisma.CorporateApplicationInclude

const ENCRYPTED_FIELDS = [
  'companyName',
  'taxNumber',
  'taxOffice',
  'companyAddress',
  'companyPhone',
  'authorizedPerson',
] as const

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
  }

  if (!isCorporateApplicationEnabled()) {
    return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  }

  if (typeof params?.id !== 'string' || params.id.trim().length === 0) {
    return NextResponse.json({ error: 'Başvuru bulunamadı' }, { status: 404 })
  }

  try {
    const application = await prisma.corporateApplication.findUnique({
      where: { id: params.id },
      include: DETAIL_INCLUDE,
    })

    if (!application) {
      return NextResponse.json({ error: 'Başvuru bulunamadı' }, { status: 404 })
    }

    const decrypted: Record<string, string> = {}
    for (const field of ENCRYPTED_FIELDS) {
      decrypted[field] = decryptField(application[field] as unknown as EncryptedEnvelope)
    }

    const rest = { ...application }
    for (const field of ENCRYPTED_FIELDS) {
      delete (rest as Record<string, unknown>)[field]
    }

return NextResponse.json(
      { application: { ...rest, ...decrypted } },
      { status: 200 }
    )
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
  }

  if (!isCorporateApplicationEnabled()) {
    return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  }

  if (typeof params?.id !== 'string' || params.id.trim().length === 0) {
    return NextResponse.json({ error: 'Başvuru bulunamadı' }, { status: 404 })
  }

  let body: { toStatus?: unknown; reason?: unknown; dealerType?: unknown }
  try {
    body = (await req.json()) as { toStatus?: unknown; reason?: unknown; dealerType?: unknown }
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 })
  }

  const reason = typeof body?.reason === 'string' ? body.reason : null

  try {
    const result = await decideCorporateApplication(prisma, {
      adminUserId: session.user.id,
      applicationId: params.id,
      toStatus: body?.toStatus,
      reason,
      // Admin, onay aninda bayi turunu belirler/degistirir. Gecersiz veya
      // bos ise servis mevcut basvuru turunu korur.
      dealerType: body?.dealerType,
    })

    if (result.ok) {
      return NextResponse.json(
        { application: result.application },
        { status: 200 }
      )
    }

    switch (result.reason) {
      case 'FEATURE_DISABLED':
        return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
      case 'ADMIN_NOT_AUTHORIZED':
        return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
      case 'APPLICATION_NOT_FOUND':
        return NextResponse.json({ error: 'Başvuru bulunamadı' }, { status: 404 })
      case 'INVALID_TRANSITION':
        return NextResponse.json(
          { error: 'Geçersiz durum geçişi veya eksik gerekçe' },
          { status: 400 }
        )
      case 'CONFLICT':
        return NextResponse.json(
          { error: 'Başvuru durumu eşzamanlı bir işlemle değişti' },
          { status: 409 }
        )
      default:
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

