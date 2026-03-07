import { prisma } from './prisma'

export async function recalculateProductPrices(currency: string, rate: number) {
  const products = await prisma.product.findMany({
    where: { priceCurrency: currency },
    include: { priceTiers: true },
  })

  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: { priceTRY: product.priceOriginal * rate }
    })

    // Kademe fiyatlarının TL karşılığını da güncelle
    for (const tier of product.priceTiers) {
      await prisma.priceTier.update({
        where: { id: tier.id },
        data: { unitPriceTRY: tier.unitPrice * rate }
      })
    }
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
