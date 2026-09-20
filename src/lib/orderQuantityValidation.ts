/**
 * Siparis adedi ve koli kati dogrulama modulu.
 *
 * B2B/B2C hibrit yapisinda minimum siparis adedi ve koli katı
 * zorunluluklarini tek bir yerde uygulamak icin kullanilir.
 * Saf (pure) fonksiyondur: DB, sepet veya odeme akisina dokunmaz.
 */

export interface QuantityAdjustmentResult {
  validQuantity: number
  wasAdjusted: boolean
  reason?: 'MIN_ORDER_ENFORCED' | 'BOX_MULTIPLE_ENFORCED'
}

/**
 * Istenen adedi minimum siparis ve koli kati kurallarina gore duzeltir.
 *
 * Kurallar:
 * - requestedQty pozitif tam sayi degilse 1 kabul edilir.
 * - minOrder en az 1 kabul edilir.
 * - requestedQty < effectiveMinOrder ise adet minimuma cekilir
 *   (reason: 'MIN_ORDER_ENFORCED').
 * - enforceBoxMultiples === true ve boxQuantity > 1 ise adet, koli
 *   katina yukari yuvarlanir (reason: 'BOX_MULTIPLE_ENFORCED').
 *   Koli yuvarlamasi minimum uygulandiktan sonra calisir; boylece
 *   sonuc her zaman hem minimuma hem koli katina uyar.
 * - Hicbir degisiklik yoksa wasAdjusted false ve reason tanimsiz doner.
 *
 * @param requestedQty Kullanicinin girdigi adet.
 * @param minOrder Minimum siparis adedi (varsayilan 1).
 * @param boxQuantity Bir koli icindeki adet; yoksa/null ise koli kurali uygulanmaz.
 * @param enforceBoxMultiples Koli kati zorunlulugu aktif mi (varsayilan false).
 */
export function validateAndAdjustQuantity(
  requestedQty: number,
  minOrder: number = 1,
  boxQuantity?: number | null,
  enforceBoxMultiples: boolean = false
): QuantityAdjustmentResult {
  // Gecersiz adet (NaN, Infinity, 0, negatif, ondalik) -> 1 kabul et.
  const normalizedQty =
    Number.isInteger(requestedQty) && requestedQty > 0 ? requestedQty : 1

  // Gecersiz minimum -> 1 kabul et.
  const effectiveMinOrder =
    Number.isInteger(minOrder) && minOrder >= 1 ? minOrder : 1

  let validQuantity = normalizedQty
  let wasAdjusted = false
  let reason: QuantityAdjustmentResult['reason']

  // 1. Adim: minimum siparis adedi.
  if (validQuantity < effectiveMinOrder) {
    validQuantity = effectiveMinOrder
    wasAdjusted = true
    reason = 'MIN_ORDER_ENFORCED'
  }

  // 2. Adim: koli kati (minimumdan sonra).
  if (
    enforceBoxMultiples === true &&
    typeof boxQuantity === 'number' &&
    Number.isInteger(boxQuantity) &&
    boxQuantity > 1
  ) {
    const rounded = Math.ceil(validQuantity / boxQuantity) * boxQuantity
    if (rounded !== validQuantity) {
      validQuantity = rounded
      wasAdjusted = true
      reason = 'BOX_MULTIPLE_ENFORCED'
    }
  }

  if (!wasAdjusted) {
    // Degisiklik yok: normalize edilmis degeri dondur. Boylece gecersiz
    // girdi (0, negatif, NaN, Infinity, ondalik) sizinti yapmaz.
    return { validQuantity: normalizedQty, wasAdjusted: false }
  }

  return { validQuantity, wasAdjusted, reason }
}