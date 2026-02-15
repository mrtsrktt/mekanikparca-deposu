import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''

  const where = search ? {
    OR: [
      { name: { contains: search, mode: 'insensitive' as const } },
      { sku: { contains: search, mode: 'insensitive' as const } },
    ]
  } : {}

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, brand: true, images: { take: 1 } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({ products, total, pages: Math.ceil(total / limit) })
}

export async function POST(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await req.json()
    const { name, slug, sku, description, technicalDetails, priceCurrency, priceOriginal, b2bPrice,
      stock, trackStock, categoryId, brandId, isActive, isFeatured, metaTitle, metaDesc, weight, unit, minOrder, freeShipping, images } = body

    // Calculate TRY price
    let priceTRY = priceOriginal
    if (priceCurrency !== 'TRY') {
      const rate = await prisma.currencyRate.findUnique({ where: { currency: priceCurrency } })
      if (rate) priceTRY = priceOriginal * rate.rate
    }

    const product = await prisma.product.create({
      data: {
        name, slug, sku, description, technicalDetails, priceCurrency, priceOriginal, priceTRY,
        b2bPrice: b2bPrice || null, stock, trackStock: trackStock ?? true,
        categoryId: categoryId || null, brandId: brandId || null,
        isActive: isActive ?? true, isFeatured: isFeatured ?? false,
        freeShipping: freeShipping ?? false,
        metaTitle, metaDesc, weight, unit, minOrder: minOrder || 1,
        images: images?.length ? { create: images.map((img: any, i: number) => ({ url: img.url, alt: img.alt, sortOrder: i })) } : undefined,
      },
      include: { images: true, category: true, brand: true },
    })

    return NextResponse.json(product)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
