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
  const cur = currency === 'TL' ? 'TRY' : currency
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: cur,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function convertFromTRY(tryAmount: number, toCurrency: string, rates: { USD?: number | null; EUR?: number | null }): number {
  if (toCurrency === 'TRY' || toCurrency === 'TL') return tryAmount
  if (toCurrency === 'USD' && rates.USD) return tryAmount / rates.USD
  if (toCurrency === 'EUR' && rates.EUR) return tryAmount / rates.EUR
  return tryAmount
}

export function convertToTRY(amount: number, fromCurrency: string, rates: { USD?: number | null; EUR?: number | null }): number {
  if (fromCurrency === 'TRY' || fromCurrency === 'TL') return amount
  if (fromCurrency === 'USD' && rates.USD) return amount * rates.USD
  if (fromCurrency === 'EUR' && rates.EUR) return amount * rates.EUR
  return amount
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
