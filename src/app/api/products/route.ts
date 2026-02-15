import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('q') || ''
  const categorySlug = searchParams.get('category')
  const brandSlug = searchParams.get('brand')
  const sort = searchParams.get('sort') || 'newest'

  const where: any = { isActive: true }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { sku: { contains: search } },
    ]
  }
  if (categorySlug) {
    where.category = { slug: categorySlug }
  }
  if (brandSlug) {
    where.brand = { slug: brandSlug }
  }

  const orderBy: any = sort === 'price-asc' ? { priceTRY: 'asc' }
    : sort === 'price-desc' ? { priceTRY: 'desc' }
    : sort === 'name' ? { name: 'asc' }
    : { createdAt: 'desc' }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, brand: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({ products, total, pages: Math.ceil(total / limit) })
}
