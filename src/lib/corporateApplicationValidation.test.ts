/**
 * corporateApplicationValidation icin odakli birim testleri.
 *
 * Calistirma:
 *   npx --no-install tsx --conditions=react-server src/lib/corporateApplicationValidation.test.ts
 */
import {
  validateCorporateApplication,
  CORPORATE_APPLICATION_TEXT_LIMITS,
} from './corporateApplicationValidation'

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

function expectFail(name: string, input: unknown, field?: string): void {
  check(name, () => {
    const result = validateCorporateApplication(input)
    if (result.success) {
      throw new Error('gecersiz girdi kabul edildi')
    }
    if (field && !result.errors[field]) {
      throw new Error(`beklenen alan hatasi yok: ${field}`)
    }
  })
}

/** Gecerli temel basvuru (her testte klonlanarak kullanilir). */
function validApplication(): Record<string, unknown> {
  return {
    companyName: 'Ornek Mekanik A.S.',
    taxNumber: '0123456789',
    taxOffice: 'Kadikoy',
    companyAddress: 'Ornek Mah. 123 Sok. No:4 Istanbul',
    companyPhone: '02121234567',
    authorizedPerson: 'Murat Yilmaz',
  }
}

// 1. Gecerli basvuru
check('Gecerli basvuru kabul edilir', () => {
  const result = validateCorporateApplication(validApplication())
  if (!result.success) {
    throw new Error('gecerli basvuru reddedildi')
  }
  if (result.data.companyName !== 'Ornek Mekanik A.S.') {
    throw new Error('companyName beklenen degerde degil')
  }
})

check('Bastaki sifirlar korunur (taxNumber ve companyPhone string kalir)', () => {
  const result = validateCorporateApplication(validApplication())
  if (!result.success) throw new Error('gecerli basvuru reddedildi')
  if (result.data.taxNumber !== '0123456789') {
    throw new Error('taxNumber bastaki sifirlari kaybetti')
  }
  if (result.data.companyPhone !== '02121234567') {
    throw new Error('companyPhone bastaki sifirlari kaybetti')
  }
  if (typeof result.data.taxNumber !== 'string' || typeof result.data.companyPhone !== 'string') {
    throw new Error('taxNumber/companyPhone string olmali')
  }
})

check('applicationNote opsiyoneldir (verilmese de gecerli)', () => {
  const app = validApplication()
  delete app.applicationNote
  const result = validateCorporateApplication(app)
  if (!result.success) throw new Error('not olmadan gecerli olmaliydi')
  if (result.data.applicationNote !== undefined) {
    throw new Error('applicationNote undefined olmaliydi')
  }
})

check('Gecerli applicationNote kabul edilir ve trim edilir', () => {
  const app = validApplication()
  app.applicationNote = '  Ek bilgi: hizli teslimat.  '
  const result = validateCorporateApplication(app)
  if (!result.success) throw new Error('gecerli not reddedildi')
  if (result.data.applicationNote !== 'Ek bilgi: hizli teslimat.') {
    throw new Error('not trim edilmedi')
  }
})

check('Zorunlu alanlarin bas/son bosluklari trim edilir', () => {
  const app = validApplication()
  app.companyName = '  Trim Test A.S.  '
  app.taxOffice = '  Besiktas  '
  const result = validateCorporateApplication(app)
  if (!result.success) throw new Error('trim sonrasi gecerli olmaliydi')
  if (result.data.companyName !== 'Trim Test A.S.') {
    throw new Error('companyName trim edilmedi')
  }
  if (result.data.taxOffice !== 'Besiktas') {
    throw new Error('taxOffice trim edilmedi')
  }
})

// 2. Bos / zorunlu alan
expectFail('Bos companyName reddedilir', (() => {
  const a = validApplication()
  a.companyName = ''
  return a
})(), 'companyName')

expectFail('Yalnizca bosluktan olusan taxNumber reddedilir', (() => {
  const a = validApplication()
  a.taxNumber = '    '
  return a
})(), 'taxNumber')

expectFail('Eksik taxOffice reddedilir', (() => {
  const a = validApplication()
  delete a.taxOffice
  return a
})(), 'taxOffice')

expectFail('Eksik companyAddress reddedilir', (() => {
  const a = validApplication()
  delete a.companyAddress
  return a
})(), 'companyAddress')

expectFail('Bos companyPhone reddedilir', (() => {
  const a = validApplication()
  a.companyPhone = '  '
  return a
})(), 'companyPhone')

expectFail('Eksik authorizedPerson reddedilir', (() => {
  const a = validApplication()
  delete a.authorizedPerson
  return a
})(), 'authorizedPerson')

// 3. Uzunluk sinirlari
check('companyName tam sinirda (200) kabul edilir', () => {
  const a = validApplication()
  a.companyName = 'A'.repeat(CORPORATE_APPLICATION_TEXT_LIMITS.companyName)
  const result = validateCorporateApplication(a)
  if (!result.success) {
    throw new Error('companyName 200 karakter reddedildi')
  }
})

expectFail('companyName sinir asimi (201) reddedilir', (() => {
  const a = validApplication()
  a.companyName = 'A'.repeat(CORPORATE_APPLICATION_TEXT_LIMITS.companyName + 1)
  return a
})(), 'companyName')

expectFail('taxNumber sinir asimi reddedilir', (() => {
  const a = validApplication()
  a.taxNumber = '9'.repeat(CORPORATE_APPLICATION_TEXT_LIMITS.taxNumber + 1)
  return a
})(), 'taxNumber')

expectFail('taxOffice sinir asimi reddedilir', (() => {
  const a = validApplication()
  a.taxOffice = 'B'.repeat(CORPORATE_APPLICATION_TEXT_LIMITS.taxOffice + 1)
  return a
})(), 'taxOffice')

expectFail('companyAddress sinir asimi reddedilir', (() => {
  const a = validApplication()
  a.companyAddress = 'C'.repeat(CORPORATE_APPLICATION_TEXT_LIMITS.companyAddress + 1)
  return a
})(), 'companyAddress')

expectFail('companyPhone sinir asimi reddedilir', (() => {
  const a = validApplication()
  a.companyPhone = '0'.repeat(CORPORATE_APPLICATION_TEXT_LIMITS.companyPhone + 1)
  return a
})(), 'companyPhone')

expectFail('authorizedPerson sinir asimi reddedilir', (() => {
  const a = validApplication()
  a.authorizedPerson = 'D'.repeat(CORPORATE_APPLICATION_TEXT_LIMITS.authorizedPerson + 1)
  return a
})(), 'authorizedPerson')

expectFail('applicationNote sinir asimi reddedilir', (() => {
  const a = validApplication()
  a.applicationNote = 'E'.repeat(CORPORATE_APPLICATION_TEXT_LIMITS.applicationNote + 1)
  return a
})(), 'applicationNote')

// 4. Yanlis veri tipi
expectFail('companyName number oldugunda reddedilir', (() => {
  const a = validApplication()
  a.companyName = 12345
  return a
})(), 'companyName')

expectFail('taxNumber number oldugunda reddedilir', (() => {
  const a = validApplication()
  a.taxNumber = 1234567890
  return a
})(), 'taxNumber')

expectFail('companyPhone number oldugunda reddedilir', (() => {
  const a = validApplication()
  a.companyPhone = 2121234567
  return a
})(), 'companyPhone')

expectFail('companyAddress null oldugunda reddedilir', (() => {
  const a = validApplication()
  a.companyAddress = null
  return a
})(), 'companyAddress')

expectFail('authorizedPerson obje oldugunda reddedilir', (() => {
  const a = validApplication()
  a.authorizedPerson = { name: 'Murat' }
  return a
})(), 'authorizedPerson')

expectFail('applicationNote number oldugunda reddedilir', (() => {
  const a = validApplication()
  a.applicationNote = 42
  return a
})(), 'applicationNote')

expectFail('Girdi obje degilse (string) reddedilir', 'gecersiz-girdi')

expectFail('Girdi null ise reddedilir', null)

// 5. Fazladan / tanimsiz alanlar (strict)
// Yeni sozlesme: kullanicidan gelen anahtar adlari yanita YAZILMAZ.
// Tum tanimsiz alanlar sabit `_root` anahtari altinda raporlanir.
const UNKNOWN_FIELD_MESSAGE = 'Bilinmeyen alan kabul edilmez.'

check('Fazladan alan (_root altinda) reddedilir ve anahtar adi yansitilmaz', () => {
  const a = validApplication()
  a.somethingRandom = 'x'
  const result = validateCorporateApplication(a)
  if (result.success) throw new Error('gecersiz girdi kabul edildi')
  if (!result.errors._root || !result.errors._root.includes(UNKNOWN_FIELD_MESSAGE)) {
    throw new Error('_root altinda bilinmeyen alan mesaji yok')
  }
  if (JSON.stringify(result.errors).includes('somethingRandom')) {
    throw new Error('yanit bilinmeyen alan adini yansitiyor')
  }
})

check('userId fazladan alani reddedilir; anahtar adi ve degeri yansitilmaz', () => {
  const a = validApplication()
  a.userId = 'attacker_1'
  const result = validateCorporateApplication(a)
  if (result.success) throw new Error('gecersiz girdi kabul edildi')
  const serialized = JSON.stringify(result.errors)
  if (!result.errors._root || !result.errors._root.includes(UNKNOWN_FIELD_MESSAGE)) {
    throw new Error('_root altinda bilinmeyen alan mesaji yok')
  }
  if (serialized.includes('userId') || serialized.includes('attacker_1')) {
    throw new Error('yanit alan adini veya degerini yansitiyor')
  }
})

check('role fazladan alani reddedilir; anahtar adi yansitilmaz', () => {
  const a = validApplication()
  a.role = 'ADMIN'
  const result = validateCorporateApplication(a)
  if (result.success) throw new Error('gecersiz girdi kabul edildi')
  if (!result.errors._root || !result.errors._root.includes(UNKNOWN_FIELD_MESSAGE)) {
    throw new Error('_root altinda bilinmeyen alan mesaji yok')
  }
  if (JSON.stringify(result.errors).includes('role')) {
    throw new Error('yanit bilinmeyen alan adini yansitiyor')
  }
})

check('status fazladan alani reddedilir; anahtar adi yansitilmaz', () => {
  const a = validApplication()
  a.status = 'APPROVED'
  const result = validateCorporateApplication(a)
  if (result.success) throw new Error('gecersiz girdi kabul edildi')
  if (!result.errors._root || !result.errors._root.includes(UNKNOWN_FIELD_MESSAGE)) {
    throw new Error('_root altinda bilinmeyen alan mesaji yok')
  }
  if (JSON.stringify(result.errors).includes('status')) {
    throw new Error('yanit bilinmeyen alan adini yansitiyor')
  }
})

check('decidedByUserId fazladan alani reddedilir; anahtar adi yansitilmaz', () => {
  const a = validApplication()
  a.decidedByUserId = 'admin_1'
  const result = validateCorporateApplication(a)
  if (result.success) throw new Error('gecersiz girdi kabul edildi')
  if (!result.errors._root || !result.errors._root.includes(UNKNOWN_FIELD_MESSAGE)) {
    throw new Error('_root altinda bilinmeyen alan mesaji yok')
  }
  if (JSON.stringify(result.errors).includes('decidedByUserId')) {
    throw new Error('yanit bilinmeyen alan adini yansitiyor')
  }
})

// 5b. Prototip anahtarlari (JSON.parse ile) hata firlatmadan reddedilir
check('JSON.parse ile gelen "__proto__" alani hata firlatmadan reddedilir', () => {
  const raw = JSON.stringify(validApplication()).replace(
    '{',
    '{"__proto__":{"polluted":true},'
  )
  const parsedInput = JSON.parse(raw)
  const result = validateCorporateApplication(parsedInput)
  if (result.success) throw new Error('__proto__ alani kabul edildi')
  if (!result.errors._root || !result.errors._root.includes(UNKNOWN_FIELD_MESSAGE)) {
    throw new Error('_root altinda bilinmeyen alan mesaji yok')
  }
})

check('JSON.parse ile gelen "constructor" alani hata firlatmadan reddedilir', () => {
  const raw = JSON.stringify(validApplication()).replace(
    '{',
    '{"constructor":{"prototype":{"polluted":true}},'
  )
  const parsedInput = JSON.parse(raw)
  const result = validateCorporateApplication(parsedInput)
  if (result.success) throw new Error('constructor alani kabul edildi')
  if (!result.errors._root || !result.errors._root.includes(UNKNOWN_FIELD_MESSAGE)) {
    throw new Error('_root altinda bilinmeyen alan mesaji yok')
  }
})

check('JSON.parse ile gelen "toString" alani hata firlatmadan reddedilir', () => {
  const raw = JSON.stringify(validApplication()).replace(
    '{',
    '{"toString":"evil",'
  )
  const parsedInput = JSON.parse(raw)
  const result = validateCorporateApplication(parsedInput)
  if (result.success) throw new Error('toString alani kabul edildi')
  if (!result.errors._root || !result.errors._root.includes(UNKNOWN_FIELD_MESSAGE)) {
    throw new Error('_root altinda bilinmeyen alan mesaji yok')
  }
})

// 5c. Bilinmeyen alana gizlenen kisisel veri yanitta bulunmaz
check('Bilinmeyen alana gizlenen kisisel veri yanitta bulunmaz', () => {
  const secret = 'KISISEL-VERI-SIZINTI-TESTI-9876543210'
  const a = validApplication()
  a.userId = secret
  const result = validateCorporateApplication(a)
  if (result.success) throw new Error('gecersiz girdi kabul edildi')
  const serialized = JSON.stringify(result.errors)
  if (serialized.includes(secret)) {
    throw new Error('yanit bilinmeyen alandaki kisisel veriyi sizdiriyor')
  }
  if (serialized.includes('KISISEL-VERI')) {
    throw new Error('yanit bilinmeyen alandaki kisisel veriyi sizdiriyor')
  }
})

// 6. Hata mesajlari kisisel veri icermez
check('Hata mesajlari girilen degeri tekrar etmez', () => {
  const secret = 'COKGIZLI-FIRMA-ADI-1234567890'
  const a = validApplication()
  a.companyName = '   ' // bos -> hata
  a.taxNumber = secret // uzunluk asimi -> hata
  const result = validateCorporateApplication(a)
  if (result.success) throw new Error('gecersiz girdi kabul edildi')
  const serialized = JSON.stringify(result.errors)
  if (serialized.includes(secret)) {
    throw new Error('hata mesaji kisisel veri iceriyor')
  }
  if (serialized.includes('COKGIZLI')) {
    throw new Error('hata mesaji kisisel veri iceriyor')
  }
})

console.log(`\nSONUC: ${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)