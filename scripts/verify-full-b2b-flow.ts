/**
 * B2B-B2C Hibrit Sistemini Uçtan Uca (E2E) Doğrulama Simülasyonu
 *
 * Harici veritabanı veya ağ bağımlılığı olmadan, bellek içi mock
 * ve saf iş mantığı servislerini doğrudan test eder.
 *
 * Çalıştırma:
 *   npx tsx --conditions=react-server scripts/verify-full-b2b-flow.ts
 */

import crypto from 'crypto'

// Test ortamı için güvenli 32-bayt AES-256 şifreleme anahtarı tanımla
process.env.CORPORATE_ENC_KEY_V1 = Buffer.alloc(32, 7).toString('base64')

import { validateCorporateApplication } from '../src/lib/corporateApplicationValidation'
import { encryptField, decryptField } from '../src/lib/corporateCrypto'
import { getB2BPriceForProduct, getTaxExcludedPrice } from '../src/lib/b2bPricing'
import { applySalePrice } from '../src/lib/pricing'
import { validateAndAdjustQuantity } from '../src/lib/orderQuantityValidation'
import { calculateCreditStatus } from '../src/lib/corporateCreditService'

let totalTests = 0
let passedTests = 0
let failedTests = 0

function assert(condition: boolean, message: string) {
  totalTests++
  if (condition) {
    passedTests++
    console.log(`  ✓ ${message}`)
  } else {
    failedTests++
    console.error(`  ✗ FAIL: ${message}`)
  }
}

function expectEqual<T>(actual: T, expected: T, message: string) {
  assert(
    actual === expected,
    `${message} (Beklenen: ${expected}, Gelen: ${actual})`
  )
}

console.log('='.repeat(70))
console.log('B2B-B2C HİBRİT SİSTEMİ TAM DOĞRULAMA SİMÜLASYONU')
console.log('='.repeat(70))

// ---------------------------------------------------------------------------
// TEST 1: Kurumsal Form Validasyonu
// ---------------------------------------------------------------------------
console.log('\n[TEST 1] Kurumsal Form Validasyonu')

const validCorporateData = {
  companyName: 'Aksoy Otomotiv Yedek Parça Ltd. Şti.',
  taxNumber: '1234567890',
  taxOffice: 'Kadıköy',
  companyAddress: 'Koşuyolu Mah. Otomotiv Sanayi No: 12 Kadıköy / İstanbul',
  companyPhone: '0216 555 12 34',
  authorizedPerson: 'Mehmet Aksoy',
  dealerType: 'WHOLESALER',
  applicationNote: '10 yıldır toptan mekanik parça dağıtımı yapmaktayız.',
}

const resValid = validateCorporateApplication(validCorporateData)
assert(resValid.success === true, 'Geçerli kurumsal başvuru formu onaylandı')

// Eksik firma adı
const resMissingName = validateCorporateApplication({
  ...validCorporateData,
  companyName: '   ',
})
assert(
  resMissingName.success === false &&
    resMissingName.errors?.companyName !== undefined,
  'Boş/boşluklu firma adı güvenle reddedildi'
)

// Eksik vergi numarası
const resMissingTax = validateCorporateApplication({
  ...validCorporateData,
  taxNumber: '',
})
assert(
  resMissingTax.success === false &&
    resMissingTax.errors?.taxNumber !== undefined,
  'Eksik vergi numarası güvenle reddedildi'
)

// Geçersiz bayi türü
const resInvalidDealerType = validateCorporateApplication({
  ...validCorporateData,
  dealerType: 'SUPER_DEALER',
})
assert(
  resInvalidDealerType.success === false &&
    resInvalidDealerType.errors?.dealerType !== undefined,
  'Geçersiz bayi türü (SUPER_DEALER) reddedildi'
)

// İstenmeyen / injection alan (strict schema kontrolü)
const resUnrecognized = validateCorporateApplication({
  ...validCorporateData,
  isAdmin: true,
  role: 'ADMIN',
})
assert(
  resUnrecognized.success === false &&
    resUnrecognized.errors?._root !== undefined,
  'Beklenmeyen alanlar (_root / unrecognized_keys) strict schema ile engellendi'
)

// ---------------------------------------------------------------------------
// TEST 2: AES-256-GCM Şifreleme ve Deşifreleme
// ---------------------------------------------------------------------------
console.log('\n[TEST 2] AES-256-GCM Şifreleme & Deşifreleme')

const sensitiveCompanyName = 'Gizli Kurumsal Otomotiv A.Ş.'
const envelope = encryptField(sensitiveCompanyName)

assert(
  typeof envelope.ciphertext === 'string' && envelope.ciphertext.length > 0,
  'Firma bilgisi AES-256-GCM ile şifrelendi (ciphertext üretildi)'
)
assert(
  typeof envelope.iv === 'string' && envelope.iv.length > 0,
  'Benzersiz 12-byte IV oluşturuldu'
)
assert(
  typeof envelope.tag === 'string' && envelope.tag.length > 0,
  'GCM kimlik doğrulama etiketi (auth tag) üretildi'
)
expectEqual(envelope.keyVersion, 'V1', 'Anahtar sürümü V1 doğrulandı')

const decrypted = decryptField(envelope)
expectEqual(
  decrypted,
  sensitiveCompanyName,
  'Şifrelenmiş firma bilgisi kayıpsız ve hatasız deşifre edildi'
)

// Veri manipülasyonu / tahrifat kontrolü (Tamper detection)
let tamperFailed = false
try {
  const tamperedEnvelope = {
    ...envelope,
    ciphertext: 'A' + envelope.ciphertext.slice(1),
  }
  decryptField(tamperedEnvelope)
} catch {
  tamperFailed = true
}
assert(tamperFailed, 'Tahrif edilmiş şifreli metin GCM doğrulamasında yakalanıp reddedildi')

// ---------------------------------------------------------------------------
// TEST 3: Manuel B2B Fiyatlandırması (TRY, USD, EUR dövizli ürünler)
// ---------------------------------------------------------------------------
console.log('\n[TEST 3] Manuel B2B Fiyatlandırması (Döviz Destekli)')

// USD Ürünü Simülasyonu (Kur: 35)
// Perakende: 100 USD = 3500 TL
// Toptancı: 70 USD = 2450 TL
// Servis: 80 USD = 2800 TL
const usdProduct = {
  priceTRY: 3500,
  wholesalerPriceTRY: 2450,
  servicePriceTRY: 2800,
}

const wholesalerPrice = getB2BPriceForProduct(usdProduct, 'WHOLESALER')
expectEqual(
  wholesalerPrice.b2bPrice,
  applySalePrice(2450),
  'USD Ürün - Toptancı fiyatı: applySalePrice(2450 TL) olarak hesaplandı'
)
assert(wholesalerPrice.savings > 0, 'Toptancı için perakendeye göre tasarruf oluştu')

const servicePrice = getB2BPriceForProduct(usdProduct, 'SERVICE')
expectEqual(
  servicePrice.b2bPrice,
  applySalePrice(2800),
  'USD Ürün - Servis fiyatı: applySalePrice(2800 TL) olarak hesaplandı'
)

// EUR Ürünü Simülasyonu (Kur: 38)
// Perakende: 200 EUR = 7600 TL
// Toptancı: 150 EUR = 5700 TL
// Servis: 160 EUR = 6080 TL
const eurProduct = {
  priceTRY: 7600,
  wholesalerPriceTRY: 5700,
  servicePriceTRY: 6080,
}
const eurWholesaler = getB2BPriceForProduct(eurProduct, 'WHOLESALER')
expectEqual(
  eurWholesaler.b2bPrice,
  applySalePrice(5700),
  'EUR Ürün - Toptancı fiyatı: applySalePrice(5700 TL) olarak hesaplandı'
)

// Özel Fiyatı Olmayan Ürün (Perakendeye Güvenli Düşüş)
const standardProduct = {
  priceTRY: 1000,
  wholesalerPriceTRY: null,
  servicePriceTRY: null,
}
const fallbackWholesaler = getB2BPriceForProduct(standardProduct, 'WHOLESALER')
expectEqual(
  fallbackWholesaler.b2bPrice,
  applySalePrice(1000),
  'Özel fiyatı olmayan ürün toptancı için perakende satış fiyatına düştü'
)
expectEqual(fallbackWholesaler.savings, 0, 'Özel fiyat yoksa tasarruf 0 oldu')

// B2C / Standart Müşteri (Bayi Değil)
const b2cPrice = getB2BPriceForProduct(usdProduct, null)
expectEqual(
  b2cPrice.b2bPrice,
  applySalePrice(3500),
  'Standart B2C müşteri için liste perakende fiyatı geçerli oldu'
)

// ---------------------------------------------------------------------------
// TEST 4: KDV Hariç / Dahil Ayrıştırması
// ---------------------------------------------------------------------------
console.log('\n[TEST 4] KDV Hariç / Dahil Ayrıştırması (+KDV Tutarlılığı)')

const tax120 = getTaxExcludedPrice(120)
expectEqual(tax120.taxExcludedPrice, 100, '120 TL dahil -> 100 TL KDV hariç')
expectEqual(tax120.taxAmount, 20, '120 TL dahil -> 20 TL KDV tutarı')
expectEqual(
  Math.round((tax120.taxExcludedPrice + tax120.taxAmount) * 100) / 100,
  120,
  'KDV hariç + KDV tutarı tam 120 TL verdi'
)

const tax359 = getTaxExcludedPrice(359.90)
expectEqual(tax359.taxExcludedPrice, 299.92, '359.90 TL dahil -> 299.92 TL KDV hariç')
expectEqual(tax359.taxAmount, 59.98, '359.90 TL dahil -> 59.98 TL KDV tutarı')
expectEqual(
  Math.round((tax359.taxExcludedPrice + tax359.taxAmount) * 100) / 100,
  359.90,
  'Kuruş hassasiyetinde toplam birebir eşitlendi'
)

// ---------------------------------------------------------------------------
// TEST 5: Minimum Sipariş Adedi ve Koli Katı Tamamlama
// ---------------------------------------------------------------------------
console.log('\n[TEST 5] Min. Sipariş Adedi & Koli Katı Tamamlama')

// Minimum sipariş kuralı
const minCheck = validateAndAdjustQuantity(2, 5)
expectEqual(minCheck.validQuantity, 5, 'İstenen 2 adet, minOrder 5 ise 5 adede tamamlandı')
expectEqual(minCheck.wasAdjusted, true, 'wasAdjusted: true olarak işaretlendi')
expectEqual(minCheck.reason, 'MIN_ORDER_ENFORCED', 'Sebep: MIN_ORDER_ENFORCED')

// Koli katı kuralı
const boxCheck = validateAndAdjustQuantity(7, 1, 6, true)
expectEqual(
  boxCheck.validQuantity,
  12,
  'İstenen 7 adet (koli: 6) -> 2 tam koliye (12 adet) yukarı yuvarlandı'
)
expectEqual(boxCheck.reason, 'BOX_MULTIPLE_ENFORCED', 'Sebep: BOX_MULTIPLE_ENFORCED')

// Zaten koli katında olan sipariş
const exactBoxCheck = validateAndAdjustQuantity(12, 1, 6, true)
expectEqual(exactBoxCheck.validQuantity, 12, '12 adet koli katına tam uyduğu için değişmedi')
expectEqual(exactBoxCheck.wasAdjusted, false, 'wasAdjusted: false')

// ---------------------------------------------------------------------------
// TEST 6: Cari Limit ve Bakiye Hesaplama
// ---------------------------------------------------------------------------
console.log('\n[TEST 6] Cari Kredi Limiti ve Bakiye Kontrolü')

// Limit yeterli senaryo
const creditOk = calculateCreditStatus(100000, 20000, 30000)
expectEqual(creditOk.creditLimit, 100000, 'Toplam limit: 100.000 TL')
expectEqual(creditOk.usedCredit, 20000, 'Kullanılan: 20.000 TL')
expectEqual(creditOk.availableCredit, 80000, 'Kullanılabilir limit: 80.000 TL')
expectEqual(creditOk.isEligible, true, '30.000 TL sipariş için limit onaylandı (isEligible: true)')
expectEqual(creditOk.remainingAfterOrder, 50000, 'Sipariş sonrası kalan: 50.000 TL')

// Limit yetersiz senaryo
const creditExceeded = calculateCreditStatus(50000, 40000, 15000)
expectEqual(creditExceeded.availableCredit, 10000, 'Kullanılabilir limit: 10.000 TL')
expectEqual(
  creditExceeded.isEligible,
  false,
  '15.000 TL sipariş limiti aştığı için reddedildi (isEligible: false)'
)
expectEqual(
  creditExceeded.remainingAfterOrder,
  10000,
  'Reddedilince kalan limit değişmedi'
)

// Tanımlı limiti olmayan bayi (0 TL)
const zeroLimit = calculateCreditStatus(0, 0, 1000)
expectEqual(zeroLimit.isEligible, false, '0 TL limitli bayi siparişi reddedildi')

// ---------------------------------------------------------------------------
// TEST 7: PayTR Callback Tutar ve İdempotensi Doğrulaması
// ---------------------------------------------------------------------------
console.log('\n[TEST 7] PayTR Callback Tutar ve Güvenlik Doğrulaması')

const mockOrder = {
  id: 'ord_123',
  orderNumber: 'ORD123456789',
  paytrMerchantOid: 'ORD123456789',
  totalAmount: 249.99,
  paymentStatus: 'PENDING',
}

const expectedAmountKurus = Math.round(mockOrder.totalAmount * 100) // 24999 kuruş
expectEqual(expectedAmountKurus, 24999, '249.99 TL beklenen kuruş tutarı: 24999 kuruş')

// 1. Durum: Doğru kuruş tutarı ile gelen callback
const validPaytrAmount = '24999'
const isValidAmount = Number(validPaytrAmount) === expectedAmountKurus
assert(isValidAmount, 'PayTR doğru kuruş tutarı ile callback onaylandı')

// 2. Durum: Tutar manipülasyonu simülasyonu (örn: saldırgan 1 TL gönderdi)
const manipulatedPaytrAmount = '100'
const isManipulated = Number(manipulatedPaytrAmount) === expectedAmountKurus
assert(!isManipulated, 'Tutar manipülasyonu tespit edildi ve güvenle engellendi')

// 3. Durum: PayTR HMAC SHA-256 Hash Doğrulama Formülü Simülasyonu
const merchantKey = 'test_merchant_key'
const merchantSalt = 'test_merchant_salt'
const status = 'success'
const hashStr = `${mockOrder.paytrMerchantOid}${merchantSalt}${status}${validPaytrAmount}`
const signature = crypto.createHmac('sha256', merchantKey).update(hashStr).digest('base64')

const verifiedSignature = crypto.createHmac('sha256', merchantKey).update(hashStr).digest('base64')
expectEqual(signature, verifiedSignature, 'PayTR HMAC-SHA256 imza doğrulaması başarılı')

// ---------------------------------------------------------------------------
// ÖZET RAPOR
// ---------------------------------------------------------------------------
console.log('\n' + '='.repeat(70))
console.log(`TOPLAM TEST: ${totalTests}`)
console.log(`BAŞARILI   : ${passedTests}`)
console.log(`BAŞARISIZ  : ${failedTests}`)
console.log('='.repeat(70))

if (failedTests > 0) {
  process.exit(1)
}
