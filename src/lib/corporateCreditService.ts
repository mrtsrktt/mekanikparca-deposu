/**
 * Cari (kurumsal) limit ve bakiye hesaplama servisi.
 *
 * Saf (pure) modul: hicbir I/O, DB veya ag cagrisi yapmaz.
 * Tum hesaplamalar verilen sayisal girdiler uzerinden yurutulur.
 */

/** calculateCreditStatus cagrisinin sonucu. */
export type CreditStatus = {
  /** Negatif olmayan, normalize edilmis kredi limiti. */
  creditLimit: number
  /** Negatif olmayan, normalize edilmis kullanilan kredi. */
  usedCredit: number
  /** Kalan kullanilabilir limit (asla negatif olmaz). */
  availableCredit: number
  /** Siparis bu limit dahilinde karsilanabilir mi. */
  isEligible: boolean
  /** Siparis sonrasi kalan limit; siparis uygun degilse availableCredit. */
  remainingAfterOrder: number
}

/**
 * Degeri 0 veya daha buyuk, sonlu bir sayiya normalize eder.
 * NaN, Infinity, -Infinity, negatif degerler ve sayisal olmayan girdiler 0 olur.
 */
function normalizeNonNegative(value: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return 0
  }
  return value
}

/** Iki ondalikli kurus hassasiyetinde yuvarlar. */
function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Cari limit durumunu hesaplar.
 *
 * @param creditLimit  Toplam kredi limiti (TL)
 * @param usedCredit   Halihazirda kullanilmis kredi (TL)
 * @param orderAmount  Degerlendirilecek siparis tutari (TL), varsayilan 0
 */
export function calculateCreditStatus(
  creditLimit: number,
  usedCredit: number,
  orderAmount: number = 0
): CreditStatus {
  const cleanLimit = normalizeNonNegative(creditLimit)
  const cleanUsed = normalizeNonNegative(usedCredit)
  const cleanOrder = normalizeNonNegative(orderAmount)

  const availableCredit = Math.max(0, round2(cleanLimit - cleanUsed))

  const isEligible = cleanLimit > 0 && cleanOrder > 0 && availableCredit >= cleanOrder

  const remainingAfterOrder = isEligible
    ? round2(availableCredit - cleanOrder)
    : availableCredit

  return {
    creditLimit: cleanLimit,
    usedCredit: cleanUsed,
    availableCredit,
    isEligible,
    remainingAfterOrder,
  }
}