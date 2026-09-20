/**
 * orderQuantityValidation icin odakli birim testleri.
 *
 * Calistirma:
 *   npx --no-install tsx src/lib/orderQuantityValidation.test.ts
 */
import {
  validateAndAdjustQuantity,
  type QuantityAdjustmentResult,
} from './orderQuantityValidation'

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

function expectEqual(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: beklenen ${String(expected)}, gelen ${String(actual)}`)
  }
}

function expectResult(
  actual: QuantityAdjustmentResult,
  expected: QuantityAdjustmentResult,
  label: string
): void {
  expectEqual(actual.validQuantity, expected.validQuantity, `${label} validQuantity`)
  expectEqual(actual.wasAdjusted, expected.wasAdjusted, `${label} wasAdjusted`)
  expectEqual(actual.reason, expected.reason, `${label} reason`)
}

// --- 1. Normal adet (minOrder=1, koli kisiti yok) ---

check('normal adet: 5 -> degismeden gecer', () => {
  expectResult(
    validateAndAdjustQuantity(5),
    { validQuantity: 5, wasAdjusted: false },
    'normal'
  )
})

check('normal adet: minOrder=1 acikca verilse de degismez', () => {
  expectResult(
    validateAndAdjustQuantity(7, 1),
    { validQuantity: 7, wasAdjusted: false },
    'normal min=1'
  )
})

check('normal adet: enforceBoxMultiples=false iken boxQuantity yok sayilir', () => {
  expectResult(
    validateAndAdjustQuantity(15, 1, 12, false),
    { validQuantity: 15, wasAdjusted: false },
    'koli kapali'
  )
})

// --- 2. Minimum siparis adedinin altinda giris ---

check('minOrder=5 iken 2 -> 5 e cekilir', () => {
  expectResult(
    validateAndAdjustQuantity(2, 5),
    { validQuantity: 5, wasAdjusted: true, reason: 'MIN_ORDER_ENFORCED' },
    'min alti'
  )
})

check('minOrder=5 iken tam 5 -> degismez', () => {
  expectResult(
    validateAndAdjustQuantity(5, 5),
    { validQuantity: 5, wasAdjusted: false },
    'min esit'
  )
})

check('minOrder=10 iken 3 -> 10 a cekilir', () => {
  expectResult(
    validateAndAdjustQuantity(3, 10),
    { validQuantity: 10, wasAdjusted: true, reason: 'MIN_ORDER_ENFORCED' },
    'min 10'
  )
})

check('gecersiz minOrder (0) -> 1 kabul edilir, 4 degismez', () => {
  expectResult(
    validateAndAdjustQuantity(4, 0),
    { validQuantity: 4, wasAdjusted: false },
    'min 0'
  )
})

check('gecersiz minOrder (-5) -> 1 kabul edilir, 1 degismez', () => {
  expectResult(
    validateAndAdjustQuantity(1, -5),
    { validQuantity: 1, wasAdjusted: false },
    'min negatif'
  )
})

check('ondalik minOrder (2.5) -> 1 kabul edilir, 3 degismez', () => {
  expectResult(
    validateAndAdjustQuantity(3, 2.5),
    { validQuantity: 3, wasAdjusted: false },
    'min ondalik'
  )
})

// --- 3. Koli kati zorunlulugu (yuvarlama) ---

check('boxQuantity=12 iken 15 -> 24 e tamamlanir', () => {
  expectResult(
    validateAndAdjustQuantity(15, 1, 12, true),
    { validQuantity: 24, wasAdjusted: true, reason: 'BOX_MULTIPLE_ENFORCED' },
    'koli yuvarla'
  )
})

check('boxQuantity=12 iken tam 24 -> degismez', () => {
  expectResult(
    validateAndAdjustQuantity(24, 1, 12, true),
    { validQuantity: 24, wasAdjusted: false },
    'koli tam kat'
  )
})

check('boxQuantity=12 iken 1 -> 12 ye tamamlanir', () => {
  expectResult(
    validateAndAdjustQuantity(1, 1, 12, true),
    { validQuantity: 12, wasAdjusted: true, reason: 'BOX_MULTIPLE_ENFORCED' },
    'koli 1'
  )
})

check('boxQuantity=6 iken 13 -> 18 e tamamlanir', () => {
  expectResult(
    validateAndAdjustQuantity(13, 1, 6, true),
    { validQuantity: 18, wasAdjusted: true, reason: 'BOX_MULTIPLE_ENFORCED' },
    'koli 6'
  )
})

check('boxQuantity=1 -> koli kurali uygulanmaz', () => {
  expectResult(
    validateAndAdjustQuantity(5, 1, 1, true),
    { validQuantity: 5, wasAdjusted: false },
    'koli 1 adet'
  )
})

check('boxQuantity=null + enforce=true -> koli kurali uygulanmaz', () => {
  expectResult(
    validateAndAdjustQuantity(5, 1, null, true),
    { validQuantity: 5, wasAdjusted: false },
    'koli null'
  )
})

check('boxQuantity tanimsiz + enforce=true -> koli kurali uygulanmaz', () => {
  expectResult(
    validateAndAdjustQuantity(5, 1, undefined, true),
    { validQuantity: 5, wasAdjusted: false },
    'koli undefined'
  )
})

// --- 4. Minimum + koli birlikte ---

check('minOrder=5, boxQuantity=12, istek 2 -> once 5 sonra 12', () => {
  expectResult(
    validateAndAdjustQuantity(2, 5, 12, true),
    { validQuantity: 12, wasAdjusted: true, reason: 'BOX_MULTIPLE_ENFORCED' },
    'min+koli'
  )
})

check('minOrder=10, boxQuantity=12, istek 1 -> once 10 sonra 12', () => {
  expectResult(
    validateAndAdjustQuantity(1, 10, 12, true),
    { validQuantity: 12, wasAdjusted: true, reason: 'BOX_MULTIPLE_ENFORCED' },
    'min10+koli12'
  )
})

check('minOrder=20, boxQuantity=6, istek 2 -> min 20, koli 24 e tamamlanir', () => {
  expectResult(
    validateAndAdjustQuantity(2, 20, 6, true),
    { validQuantity: 24, wasAdjusted: true, reason: 'BOX_MULTIPLE_ENFORCED' },
    'min20+koli6'
  )
})

check('minOrder=24, boxQuantity=6, istek 2 -> min 24 zaten koli kati -> sadece MIN', () => {
  expectResult(
    validateAndAdjustQuantity(2, 24, 6, true),
    { validQuantity: 24, wasAdjusted: true, reason: 'MIN_ORDER_ENFORCED' },
    'min24+koli6'
  )
})

check('minOrder=20, boxQuantity=6, istek 21 -> koli 24 e tamamlanir', () => {
  expectResult(
    validateAndAdjustQuantity(21, 20, 6, true),
    { validQuantity: 24, wasAdjusted: true, reason: 'BOX_MULTIPLE_ENFORCED' },
    'min20+koli6 yuvarla'
  )
})

check('boxQuantity gecersiz (0) -> koli kurali uygulanmaz', () => {
  expectResult(
    validateAndAdjustQuantity(5, 1, 0, true),
    { validQuantity: 5, wasAdjusted: false },
    'koli 0'
  )
})

check('boxQuantity gecersiz (negatif) -> koli kurali uygulanmaz', () => {
  expectResult(
    validateAndAdjustQuantity(5, 1, -12, true),
    { validQuantity: 5, wasAdjusted: false },
    'koli negatif'
  )
})

check('boxQuantity ondalik (2.5) -> koli kurali uygulanmaz', () => {
  expectResult(
    validateAndAdjustQuantity(5, 1, 2.5, true),
    { validQuantity: 5, wasAdjusted: false },
    'koli ondalik'
  )
})

// --- 5. Sinir durumlari: 0, negatif, gecersiz sayilar ---

check('0 -> 1 kabul edilir, min=1 oldugu icin duzeltme sayilmaz', () => {
  expectResult(
    validateAndAdjustQuantity(0),
    { validQuantity: 1, wasAdjusted: false },
    'sifir'
  )
})

check('negatif (-7) -> 1 kabul edilir', () => {
  expectResult(
    validateAndAdjustQuantity(-7),
    { validQuantity: 1, wasAdjusted: false },
    'negatif'
  )
})

check('NaN -> 1 kabul edilir', () => {
  expectResult(
    validateAndAdjustQuantity(Number.NaN),
    { validQuantity: 1, wasAdjusted: false },
    'NaN'
  )
})

check('Infinity -> 1 kabul edilir', () => {
  expectResult(
    validateAndAdjustQuantity(Number.POSITIVE_INFINITY),
    { validQuantity: 1, wasAdjusted: false },
    'Infinity'
  )
})

check('-Infinity -> 1 kabul edilir', () => {
  expectResult(
    validateAndAdjustQuantity(Number.NEGATIVE_INFINITY),
    { validQuantity: 1, wasAdjusted: false },
    'negatif Infinity'
  )
})

check('ondalik adet (2.7) -> 1 kabul edilir', () => {
  expectResult(
    validateAndAdjustQuantity(2.7),
    { validQuantity: 1, wasAdjusted: false },
    'ondalik adet'
  )
})

check('gecersiz adet + minOrder=5 -> 1 normalize, sonra 5 e cekilir', () => {
  expectResult(
    validateAndAdjustQuantity(0, 5),
    { validQuantity: 5, wasAdjusted: true, reason: 'MIN_ORDER_ENFORCED' },
    'sifir+min5'
  )
})

check('NaN + minOrder=3 -> 1 normalize, sonra 3 e cekilir', () => {
  expectResult(
    validateAndAdjustQuantity(Number.NaN, 3),
    { validQuantity: 3, wasAdjusted: true, reason: 'MIN_ORDER_ENFORCED' },
    'NaN+min3'
  )
})

check('0 + enforce koli -> once 1 sonra 12', () => {
  expectResult(
    validateAndAdjustQuantity(0, 1, 12, true),
    { validQuantity: 12, wasAdjusted: true, reason: 'BOX_MULTIPLE_ENFORCED' },
    'sifir+koli'
  )
})

check('NaN + enforce koli + min=5 -> once 5 sonra 12', () => {
  expectResult(
    validateAndAdjustQuantity(Number.NaN, 5, 12, true),
    { validQuantity: 12, wasAdjusted: true, reason: 'BOX_MULTIPLE_ENFORCED' },
    'NaN+min+koli'
  )
})

// --- 6. Donus sekli ---

check('degisiklik yoksa reason alani hic bulunmaz', () => {
  const r = validateAndAdjustQuantity(3, 1)
  expectEqual(r.reason, undefined, 'reason undefined')
  expectEqual('reason' in r, false, 'reason key yok')
})

check('buyuk adetlerde tasma olmaz (10000)', () => {
  expectResult(
    validateAndAdjustQuantity(10000, 1, 12, true),
    { validQuantity: 10008, wasAdjusted: true, reason: 'BOX_MULTIPLE_ENFORCED' },
    'buyuk adet'
  )
})

// --- Ozet ---

console.log(`\n${passed} gecti, ${failed} basarisiz.`)
if (failed > 0) {
  process.exit(1)
}