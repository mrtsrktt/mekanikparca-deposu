/**
 * GET /api/admin/corporate-applications
 *
 * Admin (ADMIN) icin kurumsal basvurularin listelenmesi. Yalnizca sunucu tarafinda calisir.
 *
 * Guvenlik ve tasarim kurallari:
 * - Rol ILERIDE sunucu tarafinda dogrulanmis oturumdan (getServerSession) alinir; istemciden gelen
 *   rol bilgisine ASLA guvenilmez.
 * - Oturum yoksa 401 'Yetkisiz'; rol ADMIN degilse 403 'Yetkisiz erişim'.
 * - Ozellik bayragi kapaliysa varlik sizdirilmaz: 404 'Bulunamadı'.
 * - `status` query parametresi yalnizca gecerli bir CorporateApplicationStatus ise filtreye eklenir;
 *   aksi halde filtre UYGULANMAZ (tum kayitlar doner).
 * - JSON bicimi: { applications: [...] } (200).
 * - Hata durumunda ayrinti LOGLANMAZ: 500 'Sunucu hatası'.
 */
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isCorporateApplicationEnabled } from '@/lib/featureFlags'
import { isValidStatus } from '@/lib/corporateApplicationTransitions'

export const dynamic = 'force-dynamic'

const LIST_SELECT = {
  id: true,
  userId: true,
  status: true,
  submittedAt: true,
  decidedAt: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: { id: true, name: true, email: true, phone: true },
  },
} as const

export async function GET(req: Request) {
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

  const statusParam = new URL(req.url).searchParams.get('status')
  const where = isValidStatus(statusParam) ? { status: statusParam } : undefined

  try {
    const applications = await prisma.corporateApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: LIST_SELECT,
    })

    return NextResponse.json({ applications }, { status: 200 })
  } catch {
    // DB hatasi ayrintisi LOGLANMAZ.
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}