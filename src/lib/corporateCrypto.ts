/**
 * Kurumsal firma bilgileri icin bagimsiz, server-only sifreleme modulu.
 *
 * - Node yerlesik `crypto` modulu ile AES-256-GCM.
 * - Her sifrelemede yeni rastgele 12 bayt IV.
 * - Cikti: { ciphertext, iv, tag, keyVersion } (base64).
 * - Anahtarlar surumlu ortam degiskenlerinden okunur: CORPORATE_ENC_KEY_V{n}
 *   (base64 ile kodlanmis 32 bayt = 256 bit). Varsayilan anahtar YOKTUR;
 *   anahtar eksik/gecersizse islem durdurulur.
 * - Cozmede veri bicimi dogrulanir; yanlis anahtar veya degistirilmis veride hata verir.
 * - Hassas veriler (duz metin, anahtar, ciphertext) LOGLANMAZ.
 *
 * Server-only korumasi (iki katmanli, featureFlags.ts ile ayni yaklasim):
 * - 1) Derleme zamani: `import 'server-only'`.
 * - 2) Calisma zamani: `assertServerOnly()` tarayicida hata firlatir.
 * Bu modul mevcut akislara BAGLANMAMISTIR.
 */
import 'server-only'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const KEY_LENGTH = 32
const VERSION_PATTERN = /^V(\d+)$/
// Siki Base64: yalnizca gecerli karakter kumesi, dogru dolgu (padding) ve uzunluk.
const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/

/**
 * Bir degerin siki Base64 olup olmadigini kontrol eder.
 * Gecersiz karakterleri sessizce kabul etmez; ayrica canonical tekrar kodlamayi dogrular.
 */
function assertStrictBase64(value: string, fieldName: string): Buffer {
  if (value.length === 0 || value.length % 4 !== 0 || !BASE64_PATTERN.test(value)) {
    throw new Error(`Gecersiz Base64: '${fieldName}' alani gecerli bir Base64 dizesi degil.`)
  }
  const buf = Buffer.from(value, 'base64')
  // Canonical kontrol: cozulen veri tekrar kodlandiginda ayni dizeyi vermeli.
  // Node bazi gecersiz girdileri sessizce tolere ettigi icin bu kontrol gereklidir.
  if (buf.toString('base64') !== value) {
    throw new Error(`Gecersiz Base64: '${fieldName}' alani canonical degil.`)
  }
  return buf
}

/** Sifreli veri zarfi. JSON olarak saklanmak uzere tasarlanmistir. */
export interface EncryptedEnvelope {
  ciphertext: string
  iv: string
  tag: string
  keyVersion: string
}

/**
 * Modulun yalnizca sunucuda degerlendirildigini garanti eder.
 * Tarayici (window tanimli) ortaminda cagrilirsa hata firlatir.
 */
export function assertServerOnly(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      'corporateCrypto yalnizca sunucu tarafinda kullanilabilir. Istemci bileseninden import edilemez.'
    )
  }
}

assertServerOnly()

/**
 * Verilen surum icin anahtari ortam degiskeninden okur ve dogrular.
 * Eksik veya gecersizse hata firlatir. Varsayilan anahtar KULLANILMAZ.
 */
function loadKey(keyVersion: string): Buffer {
  if (!VERSION_PATTERN.test(keyVersion)) {
    throw new Error('Gecersiz anahtar surumu bicimi. Beklenen: V1, V2, ...')
  }
  const envName = `CORPORATE_ENC_KEY_${keyVersion}`
  const raw = process.env[envName]
  if (typeof raw !== 'string' || raw.length === 0) {
    throw new Error(`${envName} tanimli degil. Sifreleme anahtari olmadan islem yapilamaz.`)
  }
  const key = assertStrictBase64(raw, envName)
  if (key.length !== KEY_LENGTH) {
    throw new Error(
      `${envName} gecersiz uzunlukta (${key.length} bayt). AES-256 icin 32 bayt (base64) gerekir.`
    )
  }
  return key
}

/** Bir zarfin bicimsel olarak gecerli olup olmadigini kontrol eder (kripto dogrulamasi degil). */
function assertEnvelopeShape(value: unknown): asserts value is EncryptedEnvelope {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Sifreli veri bicimi gecersiz: nesne bekleniyordu.')
  }
  const v = value as Record<string, unknown>
  for (const field of ['ciphertext', 'iv', 'tag', 'keyVersion'] as const) {
    if (typeof v[field] !== 'string' || (v[field] as string).length === 0) {
      throw new Error(`Sifreli veri bicimi gecersiz: '${field}' alani eksik veya bos.`)
    }
  }
  if (!VERSION_PATTERN.test(v.keyVersion as string)) {
    throw new Error('Sifreli veri bicimi gecersiz: keyVersion bicimi hatali.')
  }
}

/**
 * Metni AES-256-GCM ile sifreler. Her cagride yeni rastgele 12 bayt IV uretir.
 * @param plaintext Sifrelenecek metin
 * @param keyVersion Kullanilacak anahtar surumu (orn. "V1")
 */
export function encryptField(plaintext: string, keyVersion = 'V1'): EncryptedEnvelope {
  assertServerOnly()
  if (typeof plaintext !== 'string') {
    throw new Error('Sifrelenecek veri string olmalidir.')
  }
  if (plaintext.length === 0) {
    throw new Error('Sifrelenecek veri bos olamaz.')
  }
  const key = loadKey(keyVersion)
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    keyVersion,
  }
}

/**
 * Sifreli zarfı cozer. Bicim, anahtar veya kimlik dogrulama hatasinda hata firlatir.
 * Yanlis anahtar veya degistirilmis veri GCM tag dogrulamasinda yakalanir.
 */
export function decryptField(envelope: EncryptedEnvelope): string {
  assertServerOnly()
  assertEnvelopeShape(envelope)
  const key = loadKey(envelope.keyVersion)

  const iv = assertStrictBase64(envelope.iv, 'iv')
  const ciphertext = assertStrictBase64(envelope.ciphertext, 'ciphertext')
  const tag = assertStrictBase64(envelope.tag, 'tag')
  if (iv.length !== IV_LENGTH) {
    throw new Error('Sifreli veri bicimi gecersiz: IV uzunlugu 12 bayt olmalidir.')
  }
  if (tag.length !== 16) {
    throw new Error('Sifreli veri bicimi gecersiz: GCM tag uzunlugu 16 bayt olmalidir.')
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  try {
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return plaintext.toString('utf8')
  } catch {
    // Kimlik dogrulama basarisiz: yanlis anahtar veya degistirilmis veri.
    // Hassas veri loglanmaz; yalnizca genel mesaj verilir.
    throw new Error('Sifreli veri cozulemedi: kimlik dogrulama basarisiz (yanlis anahtar veya bozulmus veri).')
  }
}
