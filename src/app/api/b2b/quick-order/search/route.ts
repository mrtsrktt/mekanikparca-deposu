import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isCorporateApplicationEnabled } from '@/lib/featureFlags'
import { isApprovedCorporateUser } from '@/lib/corporateUserHelper'
import { applySalePrice } from '@/lib/pricing'

export const dynamic = 'force-dynamic'

const SEARCH_SELECT = {
  id: true,
  name: true,
  sku: true,
  slug: true,
  priceTRY: true,
  stock: true,
  brand: { select: { name: true } },
  images: { take: 1, select: { url: true } },
} as const

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  if (!isCorporateApplicationEnabled()) {
    return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  }

  try {
    const role = (session.user as { role?: string }).role
    const allowed =
      role === 'ADMIN' || (await isApprovedCorporateUser(prisma, session.user.id))
    if (!allowed) {
      return NextResponse.json(
        { error: 'Yalnızca onaylı kurumsal müşteriler erişebilir' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() ?? ''
    if (q.length < 2) {
      return NextResponse.json({ products: [] }, { status: 200 })
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { sku: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: SEARCH_SELECT,
      take: 20,
      orderBy: { name: 'asc' },
    })

    const enriched = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      slug: p.slug,
      priceTRY: applySalePrice(p.priceTRY),
      stock: p.stock,
      brand: p.brand,
      images: p.images,
    }))

    return NextResponse.json({ products: enriched }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}