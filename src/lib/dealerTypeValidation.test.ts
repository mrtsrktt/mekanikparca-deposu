/**
 * Bayi turu dogrulama testleri.
 *
 * Calistirma: npx --no-install tsx src/lib/dealerTypeValidation.test.ts
 *
 * NOT: Bu test, gercek uretim kodunun kullandigi `dealerTypeShared` modulunu
 * import eder; sabitler kopyalanmaz. Yalnizca Zod sema parcasi burada
 * yeniden kurulur, cunku onu tasiyan modul `server-only` icerdigi icin
 * duz `tsx` altinda yuklenemez.
 */
import { z } from 'zod'
import { DEALER_TYPES, isDealerTypeInput } from './dealerTypeShared'

let passed = 0
let failed = 0

function check(name: string, fn: () => void): void {
  try {
    fn()
    passed += 1
    console.log(`  ok   ${name}`)
  } catch (error) {
    failed += 1
    console.log(`  FAIL ${name}`)
    console.log(`       ${(error as Error).message}`)
  }
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) {
    throw new Error(
      `${label}: beklenen ${String(expected)}, gelen ${String(actual)}`
    )
  }
}

// --- Uretim koduyla ayni sekilde kurulmus sema parcasi ---
const dealerTypeSchema = z
  .union([z.enum(DEALER_TYPES), z.literal(''), z.null(), z.undefined()])
  .transform((value) => (isDealerTypeInput(value) ? value : undefined))
  .optional()

console.log('dealerType semasi')

check('WHOLESALER kabul edilir', () => {
  const r = dealerTypeSchema.safeParse('WHOLESALER')
  assertEqual(r.success, true, 'success')
  assertEqual(r.success ? r.data : null, 'WHOLESALER', 'data')
})

check('SERVICE kabul edilir', () => {
  const r = dealerTypeSchema.safeParse('SERVICE')
  assertEqual(r.success, true, 'success')
  assertEqual(r.success ? r.data : null, 'SERVICE', 'data')
})

check('bos string -> undefined (admin secer)', () => {
  const r = dealerTypeSchema.safeParse('')
  assertEqual(r.success, true, 'success')
  assertEqual(r.success ? r.data : 'X', undefined, 'data')
})

check('null -> undefined', () => {
  const r = dealerTypeSchema.safeParse(null)
  assertEqual(r.success, true, 'success')
  assertEqual(r.success ? r.data : 'X', undefined, 'data')
})

check('undefined -> undefined', () => {
  const r = dealerTypeSchema.safeParse(undefined)
  assertEqual(r.success, true, 'success')
  assertEqual(r.success ? r.data : 'X', undefined, 'data')
})

check('gecersiz deger reddedilir', () => {
  const r = dealerTypeSchema.safeParse('RESELLER')
  assertEqual(r.success, false, 'success')
})

check('kucuk harf reddedilir (case-sensitive)', () => {
  const r = dealerTypeSchema.safeParse('wholesaler')
  assertEqual(r.success, false, 'success')
})

check('sayi reddedilir', () => {
  const r = dealerTypeSchema.safeParse(25)
  assertEqual(r.success, false, 'success')
})

check('dizi reddedilir', () => {
  const r = dealerTypeSchema.safeParse(['WHOLESALER'])
  assertEqual(r.success, false, 'success')
})

console.log('')
console.log('isDealerTypeInput')

check('WHOLESALER -> true', () => {
  assertEqual(isDealerTypeInput('WHOLESALER'), true, 'sonuc')
})

check('SERVICE -> true', () => {
  assertEqual(isDealerTypeInput('SERVICE'), true, 'sonuc')
})

check('bos string -> false', () => {
  assertEqual(isDealerTypeInput(''), false, 'sonuc')
})

check('null -> false', () => {
  assertEqual(isDealerTypeInput(null), false, 'sonuc')
})

check('undefined -> false', () => {
  assertEqual(isDealerTypeInput(undefined), false, 'sonuc')
})

check('dizi -> false', () => {
  assertEqual(isDealerTypeInput(['WHOLESALER']), false, 'sonuc')
})

check('prototip anahtari toString -> false', () => {
  assertEqual(isDealerTypeInput('toString'), false, 'sonuc')
})

check('prototip anahtari constructor -> false', () => {
  assertEqual(isDealerTypeInput('constructor'), false, 'sonuc')
})

check('__proto__ -> false', () => {
  assertEqual(isDealerTypeInput('__proto__'), false, 'sonuc')
})

console.log('')
console.log(`${passed} gecti, ${failed} basarisiz`)
if (failed > 0) {
  process.exit(1)
}
