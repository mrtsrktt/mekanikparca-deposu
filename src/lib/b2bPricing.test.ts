/**
 * b2bPricing icin odakli birim testleri.
 *
 * Calistirma:
 *   npx --no-install tsx src/lib/b2bPricing.test.ts
 */
import {
  calculateB2BPrice,
  DEFAULT_B2B_DISCOUNT_PERCENT,
  B2B_KDV_RATE,
  getTaxExcludedPrice,
} from './b2bPricing'

let passed = 0
let failed = 0

function check(name: string, fn: () => void): void {
  try {
    fn()
    passed++
    console.log(`PASS  ${name}`)
  } catch (e) {
    failed++
    console.log(`FAIL  ${name}: ${e instanceof Error ? e.message : String(e)}`)
  }
}

function expectEqual(actual: number, expected: number, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: beklenen ${expected}, gelen ${actual}`)
  }
}

// --- Varsayilan iskonto ---

check('varsayilan iskonto sabiti %10', () => {
  expectEqual(DEFAULT_B2B_DISCOUNT_PERCENT, 10, 'sabit')
})

check('varsayilan %10 indirim 100 TL', () => {
  const r = calculateB2BPrice(100)
  expectEqual(r.b2bPrice, 90, 'b2bPrice')
  expectEqual(r.savings, 10, 'savings')
  expectEqual(r.discountPercent, 10, 'discountPercent')
})

check('varsayilan indirim ondalikli fiyatta (1250.50 TL)', () => {
  const r = calculateB2BPrice(1250.5)
  expectEqual(r.savings, 125.05, 'savings')
  expectEqual(r.b2bPrice, 1125.45, 'b2bPrice')
  expectEqual(r.discountPercent, 10, 'discountPercent')
})

// --- Ozel iskonto oranlari ---

check('%15 indirim 200 TL', () => {
  const r = calculateB2BPrice(200, 15)
  expectEqual(r.savings, 30, 'savings')
  expectEqual(r.b2bPrice, 170, 'b2bPrice')
  expectEqual(r.discountPercent, 15, 'discountPercent')
})

check('%20 indirim 349.90 TL', () => {
  const r = calculateB2BPrice(349.9, 20)
  expectEqual(r.savings, 69.98, 'savings')
  expectEqual(r.b2bPrice, 279.92, 'b2bPrice')
  expectEqual(r.discountPercent, 20, 'discountPercent')
})

check('%33.5 indirim 999 TL', () => {
  const r = calculateB2BPrice(999, 33.5)
  expectEqual(r.savings, 334.67, 'savings')
  expectEqual(r.b2bPrice, 664.33, 'b2bPrice')
  expectEqual(r.discountPercent, 33.5, 'discountPercent')
})

// --- Sinir durumlari ---

check('retailPrice = 0 indirim uygulanmaz', () => {
  const r = calculateB2BPrice(0)
  expectEqual(r.b2bPrice, 0, 'b2bPrice')
  expectEqual(r.savings, 0, 'savings')
  expectEqual(r.discountPercent, 0, 'discountPercent')
})

check('negatif retailPrice indirim uygulanmaz', () => {
  const r = calculateB2BPrice(-50)
  expectEqual(r.b2bPrice, 0, 'b2bPrice')
  expectEqual(r.savings, 0, 'savings')
  expectEqual(r.discountPercent, 0, 'discountPercent')
})

check('discountPercent = 0 indirim uygulanmaz', () => {
  const r = calculateB2BPrice(100, 0)
  expectEqual(r.b2bPrice, 100, 'b2bPrice')
  expectEqual(r.savings, 0, 'savings')
  expectEqual(r.discountPercent, 0, 'discountPercent')
})

check('negatif discountPercent indirim uygulanmaz', () => {
  const r = calculateB2BPrice(100, -15)
  expectEqual(r.b2bPrice, 100, 'b2bPrice')
  expectEqual(r.savings, 0, 'savings')
  expectEqual(r.discountPercent, 0, 'discountPercent')
})

check('discountPercent >= 100 %100 olarak sinirlanir (150 girdi)', () => {
  const r = calculateB2BPrice(80, 150)
  expectEqual(r.discountPercent, 100, 'discountPercent')
  expectEqual(r.savings, 80, 'savings')
  expectEqual(r.b2bPrice, 0, 'b2bPrice')
})

check('tam %100 indirim', () => {
  const r = calculateB2BPrice(80, 100)
  expectEqual(r.discountPercent, 100, 'discountPercent')
  expectEqual(r.savings, 80, 'savings')
  expectEqual(r.b2bPrice, 0, 'b2bPrice')
})

// --- Kurus yuvarlama hassasiyeti ---

check('kurus yuvarlama: 0.01 * %10 = 0.00', () => {
  const r = calculateB2BPrice(0.01, 10)
  expectEqual(r.savings, 0, 'savings')
  expectEqual(r.b2bPrice, 0.01, 'b2bPrice')
})

check('kurus yuvarlama: 19.99 * %10 = 2.00 / 17.99', () => {
  const r = calculateB2BPrice(19.99, 10)
  expectEqual(r.savings, 2, 'savings')
  expectEqual(r.b2bPrice, 17.99, 'b2bPrice')
})

check('kurus yuvarlama: 33.33 * %15 = 5.00 / 28.33', () => {
  const r = calculateB2BPrice(33.33, 15)
  expectEqual(r.savings, 5, 'savings')
  expectEqual(r.b2bPrice, 28.33, 'b2bPrice')
})

check('kurus yuvarlama: 7.77 * %33.33 = 2.59 / 5.18', () => {
  const r = calculateB2BPrice(7.77, 33.33)
  expectEqual(r.savings, 2.59, 'savings')
  expectEqual(r.b2bPrice, 5.18, 'b2bPrice')
})

check('kayan nokta guvenli: 0.1 + 0.2 tipi degerlerde yuvarlama', () => {
  const r = calculateB2BPrice(0.3, 10)
  expectEqual(r.savings, 0.03, 'savings')
  expectEqual(r.b2bPrice, 0.27, 'b2bPrice')
})

// --- KDV ayristirma ---

check('KDV orani sabiti 0.20', () => {
  expectEqual(B2B_KDV_RATE, 0.2, 'sabit')
})

check('120 TL KDV dahil -> 100 TL haric + 20 TL KDV', () => {
  const r = getTaxExcludedPrice(120)
  expectEqual(r.taxExcludedPrice, 100, 'taxExcludedPrice')
  expectEqual(r.taxAmount, 20, 'taxAmount')
})

check('KDV: 100 TL dahil -> 83.33 haric + 16.67 KDV', () => {
  const r = getTaxExcludedPrice(100)
  expectEqual(r.taxExcludedPrice, 83.33, 'taxExcludedPrice')
  expectEqual(r.taxAmount, 16.67, 'taxAmount')
})

check('KDV: 1 TL dahil -> 0.83 haric + 0.17 KDV', () => {
  const r = getTaxExcludedPrice(1)
  expectEqual(r.taxExcludedPrice, 0.83, 'taxExcludedPrice')
  expectEqual(r.taxAmount, 0.17, 'taxAmount')
})

check('KDV kurus yuvarlama: 359.90 TL dahil', () => {
  const r = getTaxExcludedPrice(359.9)
  expectEqual(r.taxExcludedPrice, 299.92, 'taxExcludedPrice')
  expectEqual(r.taxAmount, 59.98, 'taxAmount')
})

check('KDV kurus yuvarlama: 0.01 TL dahil', () => {
  const r = getTaxExcludedPrice(0.01)
  expectEqual(r.taxExcludedPrice, 0.01, 'taxExcludedPrice')
  expectEqual(r.taxAmount, 0, 'taxAmount')
})

check('KDV kayan nokta guvenli: 120.01 TL dahil', () => {
  const r = getTaxExcludedPrice(120.01)
  expectEqual(r.taxExcludedPrice, 100.01, 'taxExcludedPrice')
  expectEqual(r.taxAmount, 20, 'taxAmount')
})

check('KDV: fiyat 0 -> sifir ayristirma', () => {
  const r = getTaxExcludedPrice(0)
  expectEqual(r.taxExcludedPrice, 0, 'taxExcludedPrice')
  expectEqual(r.taxAmount, 0, 'taxAmount')
})

check('KDV: negatif fiyat -> sifir ayristirma', () => {
  const r = getTaxExcludedPrice(-120)
  expectEqual(r.taxExcludedPrice, 0, 'taxExcludedPrice')
  expectEqual(r.taxAmount, 0, 'taxAmount')
})

check('KDV: NaN ve Infinity -> sifir ayristirma', () => {
  const nan = getTaxExcludedPrice(Number.NaN)
  expectEqual(nan.taxExcludedPrice, 0, 'NaN taxExcludedPrice')
  expectEqual(nan.taxAmount, 0, 'NaN taxAmount')
  const inf = getTaxExcludedPrice(Number.POSITIVE_INFINITY)
  expectEqual(inf.taxExcludedPrice, 0, 'Infinity taxExcludedPrice')
  expectEqual(inf.taxAmount, 0, 'Infinity taxAmount')
})

// --- Ozet ---

console.log(`\n${passed} gecti, ${failed} basarisiz.`)
if (failed > 0) {
  process.exit(1)
}
