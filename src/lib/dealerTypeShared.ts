/**
 * Bayi turu paylasilan sabitleri.
 *
 * Bu modul `server-only` ICERMEZ; hem sunucu modullerinden, hem CLIENT
 * component'lerden, hem de duz `tsx` testlerinden import edilebilir.
 * `server-only` tasiyan `dealerDiscount.ts` bu sabitleri buradan alip
 * yeniden disa aktarir.
 */

/** Bayi turleri. DB enum'u ile birebir eslesir. */
export type DealerType = 'WHOLESALER' | 'SERVICE'

/** Bayi turu: onaylandiginda tur bazli indirim uygulanir. */
export const DEALER_TYPES = ['WHOLESALER', 'SERVICE'] as const

export type DealerTypeInput = (typeof DEALER_TYPES)[number]

/** Gecerli bir bayi turu mu? */
export function isDealerType(value: unknown): value is DealerType {
  return value === 'WHOLESALER' || value === 'SERVICE'
}

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

/** Turlerin Turkce etiketleri (UI icin tek kaynak). */
export const DEALER_TYPE_LABELS: Record<DealerType, string> = {
  WHOLESALER: 'Toptancı',
  SERVICE: 'Servis',
}