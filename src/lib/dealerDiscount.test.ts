/**
 * dealerDiscount icin odakli birim testleri.
 *
 * Calistirma:
 *   npx --no-install tsx --conditions=react-server src/lib/dealerDiscount.test.ts
 *
 * NOT: Modul `server-only` icerdigi icin `--conditions=react-server` gerekir.
 */
import {
  isDealerType,
  parseDiscountPercent,
  resolveDiscountPercent,
  DEALER_DISCOUNT_KEYS,
  DEFAULT_DEALER_DISCOUNTS,
  DEALER_TYPE_LABELS,
} from './dealerDiscount'

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

function expectEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: beklenen ${String(expected)}, gelen ${String(actual)}`)
  }
}

// --- Sabitler ---

check('1) varsayilan toptanci indirimi %25', () => {
  expectEqual(DEFAULT_DEALER_DISCOUNTS.WHOLESALER, 25, 'WHOLESALER')
})

check('2) varsayilan servis indirimi %15', () => {
  expectEqual(DEFAULT_DEALER_DISCOUNTS.SERVICE, 15, 'SERVICE')
})

check('3) ayar anahtarlari dogru', () => {
  expectEqual(DEALER_DISCOUNT_KEYS.WHOLESALER, 'dealer_discount_wholesaler', 'wholesaler key')
  expectEqual(DEALER_DISCOUNT_KEYS.SERVICE, 'dealer_discount_service', 'service key')
})

check('4) tur etiketleri Turkce', () => {
  expectEqual(DEALER_TYPE_LABELS.WHOLESALER, 'Toptancı', 'WHOLESALER label')
  expectEqual(DEALER_TYPE_LABELS.SERVICE, 'Servis', 'SERVICE label')
})

// --- isDealerType ---

check('5) isDealerType gecerli degerler icin true', () => {
  expectEqual(isDealerType('WHOLESALER'), true, 'WHOLESALER')
  expectEqual(isDealerType('SERVICE'), true, 'SERVICE')
})

check('6) isDealerType gecersiz degerler icin false', () => {
  expectEqual(isDealerType('WHOLESALE'), false, 'yanlis yazim')
  expectEqual(isDealerType('wholesaler'), false, 'kucuk harf')
  expectEqual(isDealerType(''), false, 'bos string')
  expectEqual(isDealerType(null), false, 'null')
  expectEqual(isDealerType(undefined), false, 'undefined')
  expectEqual(isDealerType(0), false, 'sayi')
  expectEqual(isDealerType({}), false, 'nesne')
})

// --- parseDiscountPercent: gecerli girdiler ---

check('7) parseDiscountPercent sayi string kabul eder', () => {
  expectEqual(parseDiscountPercent('25'), 25, "'25'")
  expectEqual(parseDiscountPercent('15'), 15, "'15'")
  expectEqual(parseDiscountPercent('0'), 0, "'0'")
  expectEqual(parseDiscountPercent('12.5'), 12.5, "'12.5'")
})

check('8) parseDiscountPercent sayi kabul eder', () => {
  expectEqual(parseDiscountPercent(25), 25, '25')
  expectEqual(parseDiscountPercent(0), 0, '0')
  expectEqual(parseDiscountPercent(12.5), 12.5, '12.5')
})

check('9) parseDiscountPercent bosluklu degeri trim eder', () => {
  expectEqual(parseDiscountPercent('  30  '), 30, 'bosluklu')
})

check('10) parseDiscountPercent 100 ustunu 100e sinirlar', () => {
  expectEqual(parseDiscountPercent('150'), 100, '150 -> 100')
  expectEqual(parseDiscountPercent(999), 100, '999 -> 100')
})

check('11) parseDiscountPercent 0 gecerlidir (indirim yok)', () => {
  expectEqual(parseDiscountPercent('0'), 0, 'sifir gecerli')
})

// --- parseDiscountPercent: gecersiz girdiler ---

check('12) parseDiscountPercent negatif icin null', () => {
  expectEqual(parseDiscountPercent('-5'), null, "'-5'")
  expectEqual(parseDiscountPercent(-1), null, '-1')
})

check('13) parseDiscountPercent NaN/Infinity icin null', () => {
  expectEqual(parseDiscountPercent('abc'), null, "'abc'")
  expectEqual(parseDiscountPercent(NaN), null, 'NaN')
  expectEqual(parseDiscountPercent(Infinity), null, 'Infinity')
  expectEqual(parseDiscountPercent(-Infinity), null, '-Infinity')
})

check('14) parseDiscountPercent null/undefined/bos icin null', () => {
  expectEqual(parseDiscountPercent(null), null, 'null')
  expectEqual(parseDiscountPercent(undefined), null, 'undefined')
  expectEqual(parseDiscountPercent(''), null, "bos string -> Number('')=0 DEGIL, trim sonrasi bos")
})

check('15) parseDiscountPercent nesne/dizi icin null', () => {
  expectEqual(parseDiscountPercent({}), null, 'nesne')
  expectEqual(parseDiscountPercent([]), null, 'dizi')
})

// --- resolveDiscountPercent ---

check('16) resolveDiscountPercent ayar varsa onu kullanir', () => {
  const r = resolveDiscountPercent(
    { dealer_discount_wholesaler: '30', dealer_discount_service: '18' },
    'WHOLESALER'
  )
  expectEqual(r, 30, 'toptanci ayardan')
})

check('17) resolveDiscountPercent servis ayarini okur', () => {
  const r = resolveDiscountPercent(
    { dealer_discount_wholesaler: '30', dealer_discount_service: '18' },
    'SERVICE'
  )
  expectEqual(r, 18, 'servis ayardan')
})

check('18) resolveDiscountPercent ayar yoksa varsayilana duser', () => {
  expectEqual(resolveDiscountPercent({}, 'WHOLESALER'), 25, 'toptanci varsayilan')
  expectEqual(resolveDiscountPercent({}, 'SERVICE'), 15, 'servis varsayilan')
})

check('19) resolveDiscountPercent bos haritada varsayilana duser', () => {
  expectEqual(resolveDiscountPercent({}, 'WHOLESALER'), 25, 'bos harita toptanci')
})

check('20) resolveDiscountPercent gecersiz ayarda varsayilana duser', () => {
  expectEqual(
    resolveDiscountPercent({ dealer_discount_wholesaler: 'abc' }, 'WHOLESALER'),
    25,
    'gecersiz string'
  )
  expectEqual(
    resolveDiscountPercent({ dealer_discount_wholesaler: '-10' }, 'WHOLESALER'),
    25,
    'negatif'
  )
})

check('21) resolveDiscountPercent undefined ayarda varsayilana duser', () => {
  expectEqual(
    resolveDiscountPercent({ dealer_discount_wholesaler: undefined }, 'WHOLESALER'),
    25,
    'undefined deger'
  )
})

check('22) resolveDiscountPercent 0 ayarini korur (varsayilana dusmez)', () => {
  expectEqual(
    resolveDiscountPercent({ dealer_discount_service: '0' }, 'SERVICE'),
    0,
    'sifir indirim gecerli'
  )
})

check('23) resolveDiscountPercent diger turun ayarindan etkilenmez', () => {
  // Yalnizca servis ayari var; toptanci sorgulaninca varsayilan gelmeli.
  const r = resolveDiscountPercent({ dealer_discount_service: '5' }, 'WHOLESALER')
  expectEqual(r, 25, 'toptanci kendi ayari yok -> varsayilan')
})

check('24) resolveDiscountPercent 100 ustu ayari 100e sinirlar', () => {
  expectEqual(
    resolveDiscountPercent({ dealer_discount_wholesaler: '500' }, 'WHOLESALER'),
    100,
    'sinirlama'
  )
})

// --- Ozet ---

console.log('')
console.log(`${passed} gecti, ${failed} basarisiz.`)
process.exit(failed === 0 ? 0 : 1)
