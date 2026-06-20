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
      priceTiers: { orderBy: { unitPriceTRY: 'asc' } },
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
        priceTiers: { orderBy: { unitPriceTRY: 'asc' } },
      },
    })
  }

  if (!product) return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 })

  // Fiyatı TL'ye çevir
  const priceTRY = calculateTRYPrice(product.priceOriginal, product.priceCurrency, exchangeRates)
  // En ucuz kademe fiyatını kullan
  const cheapestTierPrice = product.priceTiers?.length > 0
    ? Math.min(...product.priceTiers.map(t => t.unitPriceTRY))
    : null
  const displayPrice = cheapestTierPrice && cheapestTierPrice < priceTRY
    ? cheapestTierPrice
    : priceTRY
  const productWithConvertedPrice = {
    ...product,
    priceTRY: displayPrice,
    retailPriceTRY: priceTRY,
    hasTierDiscount: cheapestTierPrice !== null && cheapestTierPrice < priceTRY,
  }

  return NextResponse.json(productWithConvertedPrice)
}
