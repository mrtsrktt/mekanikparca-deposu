/**
 * corporateApplicationTransitions icin odakli birim testleri.
 *
 * Calistirma:
 *   npx --no-install tsx --conditions=react-server src/lib/corporateApplicationTransitions.test.ts
 */

import {
  validateStatusTransition,
  assertServerOnly,
  isValidStatus,
  CORPORATE_APPLICATION_STATUSES,
  type TransitionActor,
} from './corporateApplicationTransitions'

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

function expectThrow(name: string, fn: () => void): void {
  try {
    fn()
    failed++
    console.log(`FAIL  ${name}: hata beklendi ama firlatilmadi`)
  } catch {
    passed++
    console.log(`PASS  ${name}`)
  }
}

const adminActor: TransitionActor = { userId: 'admin_123', role: 'ADMIN' }
const customerActor: TransitionActor = { userId: 'cust_456', role: 'CUSTOMER' }
const emptyActor: TransitionActor = { userId: '', role: 'ADMIN' }
const fakeAdminActor: TransitionActor = { userId: 'attacker_1', role: 'USER_SUPPLIED_ADMIN' }

// 1. Modul ve durum dogrulamalari
check('server-only korumasi sunucu kosulunda calisir', () => {
  assertServerOnly()
})

check('isValidStatus tum gecerli durumlari tanir', () => {
  for (const s of CORPORATE_APPLICATION_STATUSES) {
    if (!isValidStatus(s)) throw new Error(`${s} taninmadi`)
  }
  if (isValidStatus('UNKNOWN')) throw new Error('UNKNOWN kabul edildi')
  if (isValidStatus(null)) throw new Error('null kabul edildi')
  if (isValidStatus(undefined)) throw new Error('undefined kabul edildi')
})

// 2. Izinli gecisler (ADMIN tarafindan)
check('PENDING -> APPROVED basarilidir (gerekcesiz)', () => {
  const result = validateStatusTransition({
    fromStatus: 'PENDING',
    toStatus: 'APPROVED',
    actor: adminActor,
  })
  if (result.fromStatus !== 'PENDING' || result.toStatus !== 'APPROVED') {
    throw new Error('sonuc durumlari uyusmuyor')
  }
  if (result.reason !== null) throw new Error('gerekce null olmaliydi')
  if (result.actorRole !== 'ADMIN') throw new Error('actorRole ADMIN olmali')
})

check('PENDING -> APPROVED basarilidir (gerekceli ve trim edilmis)', () => {
  const result = validateStatusTransition({
    fromStatus: 'PENDING',
    toStatus: 'APPROVED',
    actor: adminActor,
    reason: '  Evraklar eksiksiz incelendi.  ',
  })
  if (result.reason !== 'Evraklar eksiksiz incelendi.') {
    throw new Error(`gerekce trim edilmedi: '${result.reason}'`)
  }
})

check('PENDING -> REJECTED basarilidir (gerekce ile)', () => {
  const result = validateStatusTransition({
    fromStatus: 'PENDING',
    toStatus: 'REJECTED',
    actor: adminActor,
    reason: 'Vergi levhasi guncel degil.',
  })
  if (result.fromStatus !== 'PENDING' || result.toStatus !== 'REJECTED') {
    throw new Error('sonuc durumlari uyusmuyor')
  }
  if (result.reason !== 'Vergi levhasi guncel degil.') {
    throw new Error('gerekce dogru aktarilmadi')
  }
})

check('APPROVED -> REVOKED basarilidir (gerekce ile)', () => {
  const result = validateStatusTransition({
    fromStatus: 'APPROVED',
    toStatus: 'REVOKED',
    actor: adminActor,
    reason: 'Firma faaliyeti sonlandirildi.',
  })
  if (result.fromStatus !== 'APPROVED' || result.toStatus !== 'REVOKED') {
    throw new Error('sonuc durumlari uyusmuyor')
  }
  if (result.reason !== 'Firma faaliyeti sonlandirildi.') {
    throw new Error('gerekce dogru aktarilmadi')
  }
})

// 3. Gerekce zorunlulugu kontrolleri (REJECTED ve REVOKED icin)
expectThrow('PENDING -> REJECTED gerekcesiz reddedilir (undefined)', () => {
  validateStatusTransition({
    fromStatus: 'PENDING',
    toStatus: 'REJECTED',
    actor: adminActor,
  })
})

expectThrow('PENDING -> REJECTED bos string gerekce ile reddedilir', () => {
  validateStatusTransition({
    fromStatus: 'PENDING',
    toStatus: 'REJECTED',
    actor: adminActor,
    reason: '',
  })
})

expectThrow('PENDING -> REJECTED yalnizca bosluklardan olusan gerekce ile reddedilir', () => {
  validateStatusTransition({
    fromStatus: 'PENDING',
    toStatus: 'REJECTED',
    actor: adminActor,
    reason: '    \t\n  ',
  })
})

expectThrow('APPROVED -> REVOKED gerekcesiz reddedilir (null)', () => {
  validateStatusTransition({
    fromStatus: 'APPROVED',
    toStatus: 'REVOKED',
    actor: adminActor,
    reason: null,
  })
})

expectThrow('APPROVED -> REVOKED yalnizca bosluk gerekce ile reddedilir', () => {
  validateStatusTransition({
    fromStatus: 'APPROVED',
    toStatus: 'REVOKED',
    actor: adminActor,
    reason: '   ',
  })
})

// 4. Yetkisiz aktor kontrolleri
expectThrow('CUSTOMER rolu PENDING -> APPROVED yapamaz', () => {
  validateStatusTransition({
    fromStatus: 'PENDING',
    toStatus: 'APPROVED',
    actor: customerActor,
  })
})

expectThrow('CUSTOMER rolu PENDING -> REJECTED yapamaz', () => {
  validateStatusTransition({
    fromStatus: 'PENDING',
    toStatus: 'REJECTED',
    actor: customerActor,
    reason: 'Red gerekcesi',
  })
})

expectThrow('CUSTOMER rolu APPROVED -> REVOKED yapamaz', () => {
  validateStatusTransition({
    fromStatus: 'APPROVED',
    toStatus: 'REVOKED',
    actor: customerActor,
    reason: 'Iptal gerekcesi',
  })
})

expectThrow('Bilinmeyen / sahte rol reddedilir', () => {
  validateStatusTransition({
    fromStatus: 'PENDING',
    toStatus: 'APPROVED',
    actor: fakeAdminActor,
  })
})

expectThrow('Bos userId reddedilir', () => {
  validateStatusTransition({
    fromStatus: 'PENDING',
    toStatus: 'APPROVED',
    actor: emptyActor,
  })
})

// 5. Yasak durum gecisleri
expectThrow('Ayni duruma gecis yasaktir (PENDING -> PENDING)', () => {
  validateStatusTransition({
    fromStatus: 'PENDING',
    toStatus: 'PENDING',
    actor: adminActor,
  })
})

expectThrow('Ayni duruma gecis yasaktir (APPROVED -> APPROVED)', () => {
  validateStatusTransition({
    fromStatus: 'APPROVED',
    toStatus: 'APPROVED',
    actor: adminActor,
  })
})

expectThrow('PENDING -> REVOKED dogrudan yapilamaz (once APPROVED olmali)', () => {
  validateStatusTransition({
    fromStatus: 'PENDING',
    toStatus: 'REVOKED',
    actor: adminActor,
    reason: 'gerekce',
  })
})

expectThrow('APPROVED -> REJECTED yapilamaz (onayli basvuru reddedilemez, REVOKED olmali)', () => {
  validateStatusTransition({
    fromStatus: 'APPROVED',
    toStatus: 'REJECTED',
    actor: adminActor,
    reason: 'gerekce',
  })
})

expectThrow('APPROVED -> PENDING geriye dondurulemez', () => {
  validateStatusTransition({
    fromStatus: 'APPROVED',
    toStatus: 'PENDING',
    actor: adminActor,
  })
})

// 6. Terminal durumlar (REJECTED / REVOKED kaydi yeniden acilamaz)
expectThrow('REJECTED -> PENDING yeniden acilamaz', () => {
  validateStatusTransition({
    fromStatus: 'REJECTED',
    toStatus: 'PENDING',
    actor: adminActor,
  })
})

expectThrow('REJECTED -> APPROVED yeniden acilamaz', () => {
  validateStatusTransition({
    fromStatus: 'REJECTED',
    toStatus: 'APPROVED',
    actor: adminActor,
  })
})

expectThrow('REVOKED -> PENDING yeniden acilamaz', () => {
  validateStatusTransition({
    fromStatus: 'REVOKED',
    toStatus: 'PENDING',
    actor: adminActor,
  })
})

expectThrow('REVOKED -> APPROVED yeniden acilamaz', () => {
  validateStatusTransition({
    fromStatus: 'REVOKED',
    toStatus: 'APPROVED',
    actor: adminActor,
  })
})

// 7. Bilinmeyen veya gecersiz girdi tipleri
expectThrow('Bilinmeyen fromStatus reddedilir', () => {
  validateStatusTransition({
    fromStatus: 'INVALID_STATUS',
    toStatus: 'APPROVED',
    actor: adminActor,
  })
})

expectThrow('Bilinmeyen toStatus reddedilir', () => {
  validateStatusTransition({
    fromStatus: 'PENDING',
    toStatus: 'SOME_STATUS',
    actor: adminActor,
  })
})

expectThrow('null durum degerleri reddedilir', () => {
  validateStatusTransition({
    fromStatus: null,
    toStatus: 'APPROVED',
    actor: adminActor,
  })
})

console.log(`\nSONUC: ${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
