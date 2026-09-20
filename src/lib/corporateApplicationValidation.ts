/**
 * Kurumsal basvuru girdi dogrulama modulu (Zod tabanli).
 *
 * Amac:
 * - Istemciden gelen kurumsal basvuru formunu sunucu tarafinda dogrulamak.
 * - Yalnizca kullanicinin doldurabilecegi alanlari kabul etmek; `userId`, `role`,
 *   `status` gibi sistem tarafindan atanmasi gereken alanlari ve tanimsiz (unknown)
 *   alanlari REDDETMEK (strict).
 *
 * Kurallar:
 * - Zorunlu alanlar trim sonrasinda bos olamaz:
 *   companyName, taxNumber, taxOffice, companyAddress, companyPhone, authorizedPerson.
 * - Uzunluk sinirlari: ad/unvan/vergi dairesi 200, adres 1000, telefon 32,
 *   vergi numarasi 32, istege bagli not 2000.
 * - `taxNumber` ve `companyPhone` STRING kalir; bastaki sifirlar korunur.
 *   (Ornek: "0123456789" gecerli bir string olarak korunur.)
 * - Ulkeye ozel dogrulama YOKTUR (VKN/TCKN/telefon formati kontrol edilmez).
 * - Hata mesajlari kullanicinin girdigi degeri (kisisel veri) ASLA tekrar etmez;
 *   yalnizca alan adi ve kural belirtilir.
 *
 * Server-only korumasi:
 * - Bu modul yalnizca sunucu tarafinda calisir.
 */
import 'server-only'
import { z } from 'zod'

export const CORPORATE_APPLICATION_TEXT_LIMITS = {
  companyName: 200,
  taxNumber: 32,
  taxOffice: 200,
  companyAddress: 1000,
  companyPhone: 32,
  authorizedPerson: 200,
  applicationNote: 2000,
} as const

/**
 * Trim sonrasi bos olmayan, en fazla `max` karakter uzunlugunda metin.
 * Hata mesajlari girilen degeri tekrar etmez; alan adi ve kural bildirir.
 */
function requiredText(label: string, max: number) {
  return z
    .string({
      required_error: `${label} zorunludur.`,
      invalid_type_error: `${label} metin (string) olmalidir.`,
    })
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, {
      message: `${label} bos olamaz.`,
    })
    .refine((value) => value.length <= max, {
      message: `${label} en fazla ${max} karakter olabilir.`,
    })
}

/**
 * Kurumsal basvuru formu semasi.
 * `.strict()` sayesinde tanimsiz alanlar (userId, role, status vb.) reddedilir.
 */
export const corporateApplicationInputSchema = z
  .object({
    companyName: requiredText(
      'Firma adi',
      CORPORATE_APPLICATION_TEXT_LIMITS.companyName
    ),
    taxNumber: requiredText(
      'Vergi numarasi',
      CORPORATE_APPLICATION_TEXT_LIMITS.taxNumber
    ),
    taxOffice: requiredText(
      'Vergi dairesi',
      CORPORATE_APPLICATION_TEXT_LIMITS.taxOffice
    ),
    companyAddress: requiredText(
      'Adres',
      CORPORATE_APPLICATION_TEXT_LIMITS.companyAddress
    ),
    companyPhone: requiredText(
      'Telefon',
      CORPORATE_APPLICATION_TEXT_LIMITS.companyPhone
    ),
    authorizedPerson: requiredText(
      'Yetkili kisi',
      CORPORATE_APPLICATION_TEXT_LIMITS.authorizedPerson
    ),
    applicationNote: z
      .string({
        invalid_type_error: 'Not metin (string) olmalidir.',
      })
      .transform((value) => value.trim())
      .refine(
        (value) => value.length <= CORPORATE_APPLICATION_TEXT_LIMITS.applicationNote,
        {
          message: `Not en fazla ${CORPORATE_APPLICATION_TEXT_LIMITS.applicationNote} karakter olabilir.`,
        }
      )
      .optional(),
  })
  .strict()

export type CorporateApplicationInput = z.infer<
  typeof corporateApplicationInputSchema
>

/**
 * Guvenli dogrulama sonucu. Basarisizlikta hata mesajlari alan adi + kural icerir;
 * girilen degerleri icermez.
 */
export type CorporateApplicationValidationResult =
  | { success: true; data: CorporateApplicationInput }
  | { success: false; errors: Record<string, string[]> }

/**
 * Ham girdiyi dogrular. Hicbir zaman firlatma yapmaz; sonucu ayrik olarak dondurur.
 * Donen hata nesnesi alan adi -> mesaj listesi seklindedir ve kisisel veri icermez.
 */
export function validateCorporateApplication(
  input: unknown
): CorporateApplicationValidationResult {
  const parsed = corporateApplicationInputSchema.safeParse(input)

  if (parsed.success) {
    return { success: true, data: parsed.data }
  }

  // Prototipsiz nesne: `__proto__`, `constructor`, `toString` gibi anahtarlarin
  // prototip zincirini etkilemesini / kirlenmeyi onler.
  const errors: Record<string, string[]> = Object.create(null)

  function push(key: string, message: string): void {
    if (!errors[key]) {
      errors[key] = []
    }
    if (!errors[key].includes(message)) {
      errors[key].push(message)
    }
  }

  for (const issue of parsed.error.issues) {
    // `.strict()` altinda tanimsiz alanlar `unrecognized_keys` koduyla ve
    // BOS path ile gelir. Guvenlik geregi: kullanicidan gelen anahtar adlari
    // (ve dolayisiyla icine gizlenmis kisisel veri) yanit nesnesine YAZILMAZ.
    // Tum tanimsiz alanlar sabit `_root` anahtari altinda toplanir.
    if (issue.code === 'unrecognized_keys') {
      push('_root', 'Bilinmeyen alan kabul edilmez.')
      continue
    }

    const key = issue.path.length > 0 ? issue.path.join('.') : '_root'
    // Mesajlar sema tarafinda sabittir; kullanici girdisini tekrar etmez.
    push(key, issue.message)
  }

  return { success: false, errors }
}