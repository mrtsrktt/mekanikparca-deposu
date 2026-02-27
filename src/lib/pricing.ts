import { prisma } from './prisma'

interface PricingProduct {
  id: string
  priceTRY: number
  b2bPrice?: number | null
  brandId?: string | null
  categoryId?: string | null
}

/**
 * Tüm onaylı bayiler için geçerli B2B fiyat hesaplama.
 * Öncelik sırası:
 * 1. Ürün bazlı bayi fiyat (product.b2bPrice)
 * 2. Marka bazlı global indirim (B2BDiscount scopeType=BRAND)
 * 3. Kategori bazlı global indirim (B2BDiscount scopeType=CATEGORY)
 * 4. Genel bayi indirim (B2BDiscount scopeType=GENERAL)
 */
export async function calculateB2BPrice(product: PricingProduct): Promise<number> {
  // Priority 1: Product-specific B2B price
  if (product.b2bPrice && product.b2bPrice > 0) {
    return product.b2bPrice
  }

  // Priority 2: Brand-based global discount
  if (product.brandId) {
    const brandDiscount = await (prisma as any).b2BDiscount.findFirst({
      where: { scopeType: 'BRAND', brandId: product.brandId },
    })
    if (brandDiscount) {
      return product.priceTRY * (1 - brandDiscount.discount / 100)
    }
  }

  // Priority 3: Category-based global discount
  if (product.categoryId) {
    const catDiscount = await (prisma as any).b2BDiscount.findFirst({
      where: { scopeType: 'CATEGORY', categoryId: product.categoryId },
    })
    if (catDiscount) {
      return product.priceTRY * (1 - catDiscount.discount / 100)
    }
  }

  // Priority 4: General B2B discount
  const generalDiscount = await (prisma as any).b2BDiscount.findFirst({
    where: { scopeType: 'GENERAL' },
  })
  if (generalDiscount) {
    return product.priceTRY * (1 - generalDiscount.discount / 100)
  }

  return product.priceTRY
}

export async function recalculateProductPrices(currency: string, rate: number) {
  const products = await prisma.product.findMany({
    where: { priceCurrency: currency }
  })

  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: { priceTRY: product.priceOriginal * rate }
    })
  }
}

export function formatPrice(amount: number, currency: string = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function calculateTRYPrice(
  price: number, 
  currency: string, 
  exchangeRates: { USD: number; EUR: number }
): number {
  if (currency === 'TRY' || currency === 'TL') return price
  if (currency === 'USD') return price * exchangeRates.USD
  if (currency === 'EUR') return price * exchangeRates.EUR
  return price
}

export function formatPriceWithCurrency(
  price: number, 
  currency: string, 
  exchangeRates: { USD: number; EUR: number }
): string {
  const tryPrice = calculateTRYPrice(price, currency, exchangeRates)
  return formatPrice(tryPrice)
}
