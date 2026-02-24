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
      stock, trackStock, categoryId, brandId, isActive, isFeatured, metaTitle, metaDesc, weight, unit, minOrder, freeShipping, images, videos, documents } = body

    // Calculate TRY price
    let priceTRY = priceOriginal
    let b2bPriceTRY = b2bPrice || null
    if (priceCurrency !== 'TRY') {
      const rate = await prisma.currencyRate.findUnique({ where: { currency: priceCurrency } })
      if (rate) {
        priceTRY = priceOriginal * rate.rate
        if (b2bPrice) b2bPriceTRY = b2bPrice * rate.rate
      }
    }

    const createData: any = {
      name, slug, sku, description, technicalDetails, priceCurrency, priceOriginal, priceTRY,
      b2bPrice: b2bPriceTRY, stock, trackStock: trackStock ?? true,
      categoryId: categoryId || null, brandId: brandId || null,
      isActive: isActive ?? true, isFeatured: isFeatured ?? false,
      freeShipping: freeShipping ?? false,
      metaTitle, metaDesc, weight, unit, minOrder: minOrder || 1,
      images: images?.length ? { create: images.map((img: any, i: number) => ({ url: img.url, alt: img.alt, sortOrder: i })) } : undefined,
    }
    
    // Only add videos/documents if tables exist
    try {
      if (videos?.length) {
        createData.videos = { create: videos.map((vid: any, i: number) => ({ url: vid.url, title: vid.title, sortOrder: i })) }
      }
      if (documents?.length) {
        createData.documents = { create: documents.map((doc: any, i: number) => ({ url: doc.url, title: doc.title, fileSize: doc.fileSize, sortOrder: i })) }
      }
    } catch (e) {
      // Tables don't exist yet, skip
    }

    const product = await prisma.product.create({
      data: createData,
      include: { images: true, category: true, brand: true },
    })

    return NextResponse.json(product)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
