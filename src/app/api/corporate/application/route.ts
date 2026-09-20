/**
 * POST /api/corporate/application
 *
 * Kurumsal basvuru olusturma endpoint'i. Yalnizca sunucu tarafinda calisir.
 *
 * Guvenlik ve tasarim kurallari:
 * - `userId` formdan ALINMAZ; dogrulanmis oturumdan gelir.
 * - Ozellik bayragi kapaliysa varlik sizdirilmaz: 404 'Bulunamadi'.
 * - Bozuk/gecersiz JSON govdesi guvenli bicimde 400'e cevrilir.
 * - Servis sonucu tek tek HTTP durum kodlarina eslenir; ayrinti LOGLANMAZ.
 *
 * GET /api/corporate/application
 *
 * Kullanicinin SON basvurusunu doner. Sifreli/hassas alanlar SECILMEZ;
 * yalnizca id, status, submittedAt, decidedAt, createdAt, updatedAt doner.
 * Basvuru yoksa 200 + { application: null }.
 */
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isCorporateApplicationEnabled } from '@/lib/featureFlags'
import { createCorporateApplication } from '@/lib/corporateApplicationService'

export const dynamic = 'force-dynamic'

const GET_SELECT = {
  id: true,
  status: true,
  submittedAt: true,
  decidedAt: true,
  createdAt: true,
  updatedAt: true,
} as const

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  if (!isCorporateApplicationEnabled()) {
    return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  }

  try {
    const application = await prisma.corporateApplication.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: GET_SELECT,
    })

    return NextResponse.json({ application: application ?? null }, { status: 200 })
  } catch {
    // DB hatasi ayrintisi LOGLANMAZ.
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  if (!isCorporateApplicationEnabled()) {
    return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Geçersiz form verisi', details: {} },
      { status: 400 }
    )
  }

  try {
    const result = await createCorporateApplication(prisma, {
      userId: session.user.id,
      form: body,
    })

    if (result.ok === true) {
      return NextResponse.json({ application: result.application }, { status: 201 })
    }

    switch (result.reason) {
      case 'FEATURE_DISABLED':
        return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
      case 'INVALID_INPUT':
        return NextResponse.json(
          { error: 'Geçersiz form verisi', details: result.errors },
          { status: 400 }
        )
      case 'USER_NOT_CUSTOMER':
        return NextResponse.json(
          { error: 'Yalnızca bireysel müşteriler kurumsal başvuru yapabilir' },
          { status: 403 }
        )
      case 'USER_NOT_FOUND':
        return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
      case 'ACTIVE_APPLICATION_EXISTS':
        return NextResponse.json(
          {
            error:
              'Zaten aktif (beklemede veya onaylanmış) bir başvurunuz bulunmaktadır',
          },
          { status: 409 }
        )
      case 'UNEXPECTED_ERROR':
      default:
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
  } catch {
    // Servis beklenmedik bicimde firlatirsa da ayrinti LOGLANMAZ.
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
