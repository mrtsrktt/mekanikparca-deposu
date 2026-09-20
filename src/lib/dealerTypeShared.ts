/**
 * Bayi turu paylasilan sabitleri.
 *
 * Bu modul `server-only` ICERMEZ; hem sunucu modullerinden hem de duz
 * `tsx` testlerinden import edilebilir. `server-only` tasiyan
 * `corporateApplicationValidation.ts` bu sabitleri buradan alir.
 */

/** Bayi turu: onaylandiginda tur bazli indirim uygulanir. */
export const DEALER_TYPES = ['WHOLESALER', 'SERVICE'] as const

export type DealerTypeInput = (typeof DEALER_TYPES)[number]

/**
 * Gelen degerin gecerli bir bayi turu olup olmadigini soyler.
 * Dizi/nesne/prototip anahtarlari (`toString`, `constructor`) dahil tum
 * gecersiz degerler icin `false` doner.
 */
export function isDealerTypeInput(value: unknown): value is DealerTypeInput {
  return (
    typeof value === 'string' &&
    (DEALER_TYPES as readonly string[]).includes(value)
  )
}
