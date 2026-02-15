import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const q = req.nextUrl.searchParams.get('q') || ''
  if (q.length < 2) return NextResponse.json([])

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q } },
        { sku: { contains: q } },
      ],
    },
    include: {
      brand: { select: { name: true } },
      images: { take: 1 },
    },
    take: 10,
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(products)
}
