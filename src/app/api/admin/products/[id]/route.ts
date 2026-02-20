import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { 
      category: true, 
      brand: true, 
      images: { orderBy: { sortOrder: 'asc' } },
      videos: { orderBy: { sortOrder: 'asc' } },
      documents: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!product) return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await req.json()
    const { name, slug, sku, description, technicalDetails, priceCurrency, priceOriginal, b2bPrice,
      stock, trackStock, categoryId, brandId, isActive, isFeatured, metaTitle, metaDesc, weight, unit, minOrder, freeShipping, images, videos, documents } = body

    let priceTRY = priceOriginal
    if (priceCurrency !== 'TRY') {
      const rate = await prisma.currencyRate.findUnique({ where: { currency: priceCurrency } })
      if (rate) priceTRY = priceOriginal * rate.rate
    }

    // Delete old media and create new ones
    if (images) {
      await prisma.productImage.deleteMany({ where: { productId: params.id } })
    }
    if (videos) {
      await (prisma as any).productVideo.deleteMany({ where: { productId: params.id } })
    }
    if (documents) {
      await (prisma as any).productDocument.deleteMany({ where: { productId: params.id } })
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name, slug, sku, description, technicalDetails, priceCurrency, priceOriginal, priceTRY,
        b2bPrice: b2bPrice || null, stock, trackStock: trackStock ?? true,
        categoryId: categoryId || null, brandId: brandId || null,
        isActive, isFeatured, metaTitle, metaDesc, weight, unit, minOrder,
        freeShipping: freeShipping ?? false,
        images: images?.length ? { create: images.map((img: any, i: number) => ({ url: img.url, alt: img.alt, sortOrder: i })) } : undefined,
        videos: videos?.length ? { create: videos.map((vid: any, i: number) => ({ url: vid.url, title: vid.title, sortOrder: i })) } : undefined,
        documents: documents?.length ? { create: documents.map((doc: any, i: number) => ({ url: doc.url, title: doc.title, fileSize: doc.fileSize, sortOrder: i })) } : undefined,
      },
      include: { images: true, videos: true, documents: true, category: true, brand: true },
    })

    return NextResponse.json(product)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error

  await prisma.product.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Ürün silindi.' })
}
