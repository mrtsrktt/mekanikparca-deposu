import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateTRYPrice } from '@/lib/pricing'

async function getExchangeRates() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/exchange-rates`, {
      next: { revalidate: 3600 } // 1 saat cache
    })
    if (!response.ok) {
      throw new Error('Exchange rates fetch failed')
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    // Fallback rates
    return { USD: 44.0, EUR: 55.0, TRY: 1 }
  }
}

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const exchangeRates = await getExchangeRates()
  
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
  
  // Fiyatı TL'ye çevir
  const priceTRY = calculateTRYPrice(product.priceOriginal, product.priceCurrency, exchangeRates)
  const productWithConvertedPrice = {
    ...product,
    priceTRY
  }
  
  return NextResponse.json(productWithConvertedPrice)
}
