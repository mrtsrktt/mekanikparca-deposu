import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  // slug veya id ile arama yap
  let product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { sortOrder: 'asc' } },
    },
  })

  // Slug ile bulunamazsa ID ile dene
  if (!product) {
    product = await prisma.product.findUnique({
      where: { id: params.slug },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    })
  }

  if (!product) return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 })
  return NextResponse.json(product)
}
