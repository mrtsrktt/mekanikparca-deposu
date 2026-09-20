/**
 * corporateCrypto icin odakli test.
 *
 * Test anahtarlari BU DOSYA ICINDE rastgele uretilir; gercek .env dosyalarina
 * dokunulmaz. Kullanilan/degistirilen tum ortam degiskenleri `finally` blogunda
 * eski hâline getirilir. Testler eksik anahtar yuzunden SKIP/exit 0 ile GECMEZ.
 *
 * Not: `import 'server-only'` duz Node/tsx altinda hata firlatir. Bu nedenle
 * testler Next'in sunucu kosulunu temsil eden `--conditions=react-server` ile
 * calistirilir. Koruma KALDIRILMAZ/ATLATILMAZ.
 *
 * Calistirma:
 *   npx --no-install tsx --conditions=react-server src/lib/corporateCrypto.test.ts
 */

import { randomBytes } from 'crypto'
import {
  encryptField,
  decryptField,
  assertServerOnly,
  type EncryptedEnvelope,
} from './corporateCrypto'

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
    console.log(`FAIL  ${name}: hata beklendi ama hata firlatilmadi`)
  } catch {
    passed++
    console.log(`PASS  ${name}`)
  }
}

// Test surumleri
const V1 = 'V1'
const V2 = 'V2'
const V3 = 'V3'
const V_INVALID_B64 = 'V88'
const V_WRONG_LEN = 'V89'

// Test anahtarlarini rastgele uret (32 bayt => gecerli AES-256 anahtari).
const keyV1 = randomBytes(32).toString('base64')
const keyV2 = randomBytes(32).toString('base64')
// 16 baytlik gecersiz uzunlukta (ama gecerli Base64) anahtar
const keyWrongLen = randomBytes(16).toString('base64')
// Gecersiz Base64 karakterler iceren anahtar
const keyInvalidB64 = '!!!not-valid-base64-key!!!'

// Eski ortami sakla (tum test anahtarlari icin)
const savedEnv: Record<string, string | undefined> = {
  CORPORATE_ENC_KEY_V1: process.env.CORPORATE_ENC_KEY_V1,
  CORPORATE_ENC_KEY_V2: process.env.CORPORATE_ENC_KEY_V2,
  CORPORATE_ENC_KEY_V3: process.env.CORPORATE_ENC_KEY_V3,
  CORPORATE_ENC_KEY_V88: process.env.CORPORATE_ENC_KEY_V88,
  CORPORATE_ENC_KEY_V89: process.env.CORPORATE_ENC_KEY_V89,
}

// Ortami test icin ayarla
process.env.CORPORATE_ENC_KEY_V1 = keyV1
process.env.CORPORATE_ENC_KEY_V2 = keyV2
process.env.CORPORATE_ENC_KEY_V88 = keyInvalidB64
process.env.CORPORATE_ENC_KEY_V89 = keyWrongLen
// V3 bilerek tanimsiz birakilir; dis ortamdan kalmis olabilecek deger silinir
delete process.env.CORPORATE_ENC_KEY_V3

try {
  check('server-only korumasi Node (sunucu kosulu) ortaminda gecirir', () => {
    assertServerOnly()
  })

  check('sifrele/coz ayni metni geri verir', () => {
    const env = encryptField('ACME Makine Ltd. Sti.', V1)
    const out = decryptField(env)
    if (out !== 'ACME Makine Ltd. Sti.') throw new Error(`beklenen metin geri gelmedi: ${out}`)
  })

  check('cikti zarfi ciphertext/iv/tag/keyVersion icerir', () => {
    const env = encryptField('x', V1)
    for (const f of ['ciphertext', 'iv', 'tag', 'keyVersion'] as const) {
      if (typeof env[f] !== 'string' || env[f].length === 0) throw new Error(`eksik alan: ${f}`)
    }
    if (env.keyVersion !== V1) throw new Error('keyVersion yanlis')
  })

  check('ayni metin icin IV farklidir (rastgele)', () => {
    const a = encryptField('ayni metin', V1)
    const b = encryptField('ayni metin', V1)
    if (a.iv === b.iv) throw new Error('IV tekrar etti')
    if (a.ciphertext === b.ciphertext) throw new Error('ciphertext tekrar etti')
  })

  check('bozulmus ciphertext hata verir', () => {
    const env = encryptField('gizli', V1)
    const tampered: EncryptedEnvelope = {
      ...env,
      ciphertext: Buffer.from('bozuk-veri').toString('base64'),
    }
    let threw = false
    try {
      decryptField(tampered)
    } catch {
      threw = true
    }
    if (!threw) throw new Error('bozulmus veri hata vermedi')
  })

  check('bozulmus tag hata verir', () => {
    const env = encryptField('gizli', V1)
    const tagBuf = Buffer.from(env.tag, 'base64')
    tagBuf[0] ^= 0xff
    const tampered: EncryptedEnvelope = { ...env, tag: tagBuf.toString('base64') }
    let threw = false
    try {
      decryptField(tampered)
    } catch {
      threw = true
    }
    if (!threw) throw new Error('bozulmus tag hata vermedi')
  })

  check('yanlis IV ile cozme hata verir', () => {
    const env = encryptField('gizli', V1)
    const tampered: EncryptedEnvelope = { ...env, iv: Buffer.alloc(12, 7).toString('base64') }
    let threw = false
    try {
      decryptField(tampered)
    } catch {
      threw = true
    }
    if (!threw) throw new Error('yanlis IV hata vermedi')
  })

  check('farkli bir anahtarla cozme hata verir (V1 zarf, V2 anahtar)', () => {
    const env = encryptField('gizli', V1)
    let threw = false
    try {
      decryptField({ ...env, keyVersion: V2 })
    } catch {
      threw = true
    }
    if (!threw) throw new Error('farkli anahtarla cozme hata vermedi')
  })

  expectThrow('bos metin sifreleme girisinde reddedilir', () => {
    encryptField('', V1)
  })

  expectThrow('eksik anahtar (tanimsiz surum V3 - dis ortamdan temizlendi) hata verir', () => {
    encryptField('x', V3)
  })

  expectThrow('anahtarin gecersiz Base64 olmasi hata verir', () => {
    encryptField('x', V_INVALID_B64)
  })

  expectThrow('anahtarin gecerli Base64 olup 32 bayt olmamasi (16 bayt) hata verir', () => {
    encryptField('x', V_WRONG_LEN)
  })

  expectThrow('gecersiz anahtar surumu bicimi hata verir', () => {
    encryptField('x', 'abc')
  })

  expectThrow('eksik alanli zarf hata verir', () => {
    decryptField({ ciphertext: 'x', iv: '', tag: '', keyVersion: V1 })
  })

  expectThrow('gecersiz Base64 (iv) hata verir', () => {
    const env = encryptField('gizli', V1)
    decryptField({ ...env, iv: '!!!gecersiz!!!' })
  })

  expectThrow('gecersiz Base64 (ciphertext) hata verir', () => {
    const env = encryptField('gizli', V1)
    decryptField({ ...env, ciphertext: 'not*base64' })
  })

  expectThrow('gecersiz Base64 (tag) hata verir', () => {
    const env = encryptField('gizli', V1)
    decryptField({ ...env, tag: '====' })
  })

  expectThrow('gecersiz Base64 (yanlis uzunluk) hata verir', () => {
    const env = encryptField('gizli', V1)
    decryptField({ ...env, iv: 'AAAA' })
  })

  console.log(`\nSONUC: ${passed} passed, ${failed} failed`)
} finally {
  // Kullanilan/degistirilen tum ortam degiskenlerini eski hâline getir.
  for (const [k, v] of Object.entries(savedEnv)) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
}

process.exit(failed === 0 ? 0 : 1)
