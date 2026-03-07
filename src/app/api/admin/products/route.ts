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
    const { name, slug, sku, description, technicalDetails, priceCurrency, priceOriginal,
      stock, trackStock, categoryId, brandId, isActive, isFeatured, metaTitle, metaDesc, weight, unit, minOrder, freeShipping, images, videos, documents,
      boxQuantity, priceTiers } = body

    // Calculate TRY price
    let priceTRY = priceOriginal
    if (priceCurrency !== 'TRY') {
      const rateRecord = await prisma.currencyRate.findUnique({ where: { currency: priceCurrency } })
      if (rateRecord) {
        priceTRY = priceOriginal * rateRecord.rate
      }
    }

    // Döviz kuru (kademe fiyatları için de kullanılacak)
    const currencyRate = priceCurrency !== 'TRY'
      ? (await prisma.currencyRate.findUnique({ where: { currency: priceCurrency } }))?.rate || 1
      : 1

    const createData: any = {
      name, slug, sku, description, technicalDetails, priceCurrency, priceOriginal, priceTRY,
      stock, trackStock: trackStock ?? true,
      categoryId: categoryId || null, brandId: brandId || null,
      isActive: isActive ?? true, isFeatured: isFeatured ?? false,
      freeShipping: freeShipping ?? false,
      metaTitle, metaDesc, weight, unit, minOrder: minOrder || 1,
      boxQuantity: boxQuantity || null,
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

    // Fiyat kademelerini oluştur
    if (priceTiers?.length) {
      await prisma.priceTier.createMany({
        data: priceTiers.map((tier: any) => ({
          productId: product.id,
          minQuantity: tier.minQuantity,
          unitPrice: tier.unitPrice,
          unitPriceTRY: priceCurrency === 'TRY' ? tier.unitPrice : tier.unitPrice * currencyRate,
        }))
      })
    }

    return NextResponse.json(product)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
