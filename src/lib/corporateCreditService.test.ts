/**
 * corporateCreditService icin sifir bagimlilikli birim testleri.
 * Calistirma: npx --no-install tsx src/lib/corporateCreditService.test.ts
 */
import {
  calculateCreditStatus,
  type CreditStatus,
} from './corporateCreditService'

let passed = 0
let failed = 0

function check(name: string, condition: boolean): void {
  if (condition) {
    passed++
    console.log(`PASS - ${name}`)
  } else {
    failed++
    console.log(`FAIL - ${name}`)
  }
}

function expectEqual<T>(name: string, actual: T, expected: T): void {
  const ok = Object.is(actual, expected)
  if (!ok) {
    console.log(`  beklenen: ${String(expected)}, gelen: ${String(actual)}`)
  }
  check(name, ok)
}

function expectResult(
  name: string,
  actual: CreditStatus,
  expected: CreditStatus
): void {
  expectEqual(`${name} :: creditLimit`, actual.creditLimit, expected.creditLimit)
  expectEqual(`${name} :: usedCredit`, actual.usedCredit, expected.usedCredit)
  expectEqual(
    `${name} :: availableCredit`,
    actual.availableCredit,
    expected.availableCredit
  )
  expectEqual(`${name} :: isEligible`, actual.isEligible, expected.isEligible)
  expectEqual(
    `${name} :: remainingAfterOrder`,
    actual.remainingAfterOrder,
    expected.remainingAfterOrder
  )
}

console.log('--- 1. Normal senaryo ---')
{
  const r = calculateCreditStatus(100000, 20000, 30000)
  expectResult('limit 100k / kullanilan 20k / siparis 30k', r, {
    creditLimit: 100000,
    usedCredit: 20000,
    availableCredit: 80000,
    isEligible: true,
    remainingAfterOrder: 50000,
  })
}

console.log('--- 2. Yetersiz limit senaryosu ---')
{
  const r = calculateCreditStatus(50000, 40000, 15000)
  expectResult('limit 50k / kullanilan 40k / siparis 15k', r, {
    creditLimit: 50000,
    usedCredit: 40000,
    availableCredit: 10000,
    isEligible: false,
    remainingAfterOrder: 10000,
  })
  expectEqual('uygun degil', r.isEligible, false)
  expectEqual(
    'uygun degilse remainingAfterOrder = availableCredit',
    r.remainingAfterOrder,
    r.availableCredit
  )
}

console.log('--- 3. Limit sifir / tanimsiz ---')
{
  const zero = calculateCreditStatus(0, 0, 1000)
  expectEqual('limit 0 -> isEligible false', zero.isEligible, false)
  expectEqual('limit 0 -> availableCredit 0', zero.availableCredit, 0)
  expectEqual('limit 0 -> remainingAfterOrder 0', zero.remainingAfterOrder, 0)

  const undefinedLimit = calculateCreditStatus(
    undefined as unknown as number,
    0,
    500
  )
  expectEqual('limit undefined -> 0', undefinedLimit.creditLimit, 0)
  expectEqual('limit undefined -> isEligible false', undefinedLimit.isEligible, false)

  const nullLimit = calculateCreditStatus(null as unknown as number, 0, 500)
  expectEqual('limit null -> 0', nullLimit.creditLimit, 0)
  expectEqual('limit null -> isEligible false', nullLimit.isEligible, false)

  const nanLimit = calculateCreditStatus(NaN, 0, 500)
  expectEqual('limit NaN -> 0', nanLimit.creditLimit, 0)
  expectEqual('limit NaN -> isEligible false', nanLimit.isEligible, false)

  const usedExceedsLimit = calculateCreditStatus(10000, 25000, 1)
  expectEqual('kullanilan > limit -> availableCredit 0', usedExceedsLimit.availableCredit, 0)
  expectEqual('kullanilan > limit -> isEligible false', usedExceedsLimit.isEligible, false)
}

console.log('--- 4. Kurus hassasiyeti ve yuvarlama ---')
{
  const penny = calculateCreditStatus(1000.55, 200.25, 300.1)
  expectEqual('availableCredit kurus', penny.availableCredit, 800.3)
  expectEqual('remainingAfterOrder kurus', penny.remainingAfterOrder, 500.2)
  expectEqual('kurusta uygun', penny.isEligible, true)

  const rounding = calculateCreditStatus(0.1 + 0.2, 0.05, 0.15)
  // Spec: creditLimit ham (yuvarlanmamis) doner; sadece availableCredit ve remainingAfterOrder yuvarlanir.
  expectEqual('0.1+0.2 ham creditLimit', rounding.creditLimit, 0.1 + 0.2)
  expectEqual('kurus yuvarlama availableCredit', rounding.availableCredit, 0.25)
  expectEqual('kurus yuvarlama remaining', rounding.remainingAfterOrder, 0.1)

  const thirds = calculateCreditStatus(1000 / 3, 0, 100)
  expectEqual('ucuncu yuvarlama creditLimit', thirds.creditLimit, 333.3333333333333)
  expectEqual('ucuncu yuvarlama availableCredit', thirds.availableCredit, 333.33)
  expectEqual('ucuncu yuvarlama remaining', thirds.remainingAfterOrder, 233.33)

  const exactBoundary = calculateCreditStatus(1000, 500, 500)
  expectEqual('tam sinir uygun', exactBoundary.isEligible, true)
  expectEqual('tam sinir kalan 0', exactBoundary.remainingAfterOrder, 0)

  const justOverBoundary = calculateCreditStatus(1000, 500, 500.01)
  expectEqual('sinir asimi uygun degil', justOverBoundary.isEligible, false)
  expectEqual('sinir asimi kalan', justOverBoundary.remainingAfterOrder, 500)
}

console.log('--- 5. Negatif, 0 ve sinir durumlari ---')
{
  const negativeLimit = calculateCreditStatus(-5000, 0, 100)
  expectEqual('negatif limit -> 0', negativeLimit.creditLimit, 0)
  expectEqual('negatif limit -> isEligible false', negativeLimit.isEligible, false)

  const negativeUsed = calculateCreditStatus(10000, -3000, 100)
  expectEqual('negatif kullanilan -> 0', negativeUsed.usedCredit, 0)
  expectEqual('negatif kullanilan availableCredit', negativeUsed.availableCredit, 10000)
  expectEqual('negatif kullanilan uygun', negativeUsed.isEligible, true)

  const negativeOrder = calculateCreditStatus(10000, 0, -500)
  expectEqual('negatif siparis -> 0', negativeOrder.isEligible, false)
  expectEqual('negatif siparis remainingAfterOrder', negativeOrder.remainingAfterOrder, 10000)

  const zeroOrder = calculateCreditStatus(10000, 0, 0)
  expectEqual('siparis 0 -> isEligible false', zeroOrder.isEligible, false)
  expectEqual('siparis 0 -> availableCredit 10000', zeroOrder.availableCredit, 10000)
  expectEqual('siparis 0 -> remaining 10000', zeroOrder.remainingAfterOrder, 10000)

  const defaultOrder = calculateCreditStatus(10000, 0)
  expectEqual('varsayilan siparis 0 -> isEligible false', defaultOrder.isEligible, false)
  expectEqual('varsayilan siparis -> remaining 10000', defaultOrder.remainingAfterOrder, 10000)

  const nanUsed = calculateCreditStatus(10000, NaN, 100)
  expectEqual('NaN kullanilan -> 0', nanUsed.usedCredit, 0)
  expectEqual('NaN kullanilan -> uygun', nanUsed.isEligible, true)

  const nanOrder = calculateCreditStatus(10000, 0, NaN)
  expectEqual('NaN siparis -> isEligible false', nanOrder.isEligible, false)
  expectEqual('NaN siparis -> remaining', nanOrder.remainingAfterOrder, 10000)

  const infinityLimit = calculateCreditStatus(Infinity, 0, 100)
  expectEqual('Infinity limit -> 0', infinityLimit.creditLimit, 0)
  expectEqual('Infinity limit -> isEligible false', infinityLimit.isEligible, false)

  const infiniteUsed = calculateCreditStatus(10000, Infinity, 100)
  expectEqual('Infinity kullanilan -> 0', infiniteUsed.usedCredit, 0)

  const nanOnly = calculateCreditStatus(NaN, NaN, NaN)
  expectResult('tamamen NaN', nanOnly, {
    creditLimit: 0,
    usedCredit: 0,
    availableCredit: 0,
    isEligible: false,
    remainingAfterOrder: 0,
  })

  const zeros = calculateCreditStatus(0, 0, 0)
  expectResult('tamamen 0', zeros, {
    creditLimit: 0,
    usedCredit: 0,
    availableCredit: 0,
    isEligible: false,
    remainingAfterOrder: 0,
  })
}

console.log('--- 6. Girdi degismezligi ---')
{
  const inputLimit = 1000
  const inputUsed = 250
  const inputOrder = 100
  const r = calculateCreditStatus(inputLimit, inputUsed, inputOrder)
  expectEqual('girdi limit degismedi', inputLimit, 1000)
  expectEqual('girdi kullanilan degismedi', inputUsed, 250)
  expectEqual('girdi siparis degismedi', inputOrder, 100)
  expectEqual('donen nesne yeni', typeof r, 'object')

  const a = calculateCreditStatus(1000, 100, 100)
  const b = calculateCreditStatus(1000, 100, 100)
  expectEqual('deterministik', a.remainingAfterOrder, b.remainingAfterOrder)
}

console.log('')
console.log(`${passed} gecti, ${failed} basarisiz.`)
console.log(`TEST-EXIT:${failed === 0 ? 0 : 1}`)

if (failed > 0) {
  process.exit(1)
}