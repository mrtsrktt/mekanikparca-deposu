/**
 * B2B iskonto ve fiyat hesaplama yardimcilari.
 *
 * Bu modul mevcut pricing.ts motorundan bagimsizdir; perakende fiyati
 * uzerinden B2B (kurumsal) iskontolu fiyat hesaplar.
 */
import { applySalePrice } from './pricing'

/** Varsayilan B2B iskonto orani (yuzde). */
export const DEFAULT_B2B_DISCOUNT_PERCENT = 10

/** Varsayilan KDV orani (yuzde 20). */
export const B2B_KDV_RATE = 0.2

/** B2B fiyat hesabi sonucu. */
export interface B2BPriceResult {
  /** Iskontolu B2B fiyati (kurus hassasiyetinde yuvarlanmis). */
  b2bPrice: number
  /** Uygulanan iskonto tutari (kurus hassasiyetinde yuvarlanmis). */
  savings: number
  /** Gercekte uygulanan iskonto orani (yuzde). */
  discountPercent: number
}

/** Iki ondalik basamaga (kurus) yuvarlar. */
function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Perakende fiyattan B2B iskontolu fiyati hesaplar.
 *
 * Kurallar:
 * - retailPrice <= 0 veya discountPercent <= 0 ise indirim uygulanmaz:
 *   b2bPrice = retailPrice, savings = 0, discountPercent = 0.
 * - discountPercent >= 100 ise %100 olarak sinirlandirilir.
 * - savings = Math.round(retailPrice * (discountPercent / 100) * 100) / 100
 * - b2bPrice = Math.round((retailPrice - savings) * 100) / 100
 *
 * @param retailPrice Perakende (liste) fiyati.
 * @param discountPercent Uygulanacak iskonto orani (yuzde). Varsayilan %10.
 */
export function calculateB2BPrice(
  retailPrice: number,
  discountPercent: number = DEFAULT_B2B_DISCOUNT_PERCENT
): B2BPriceResult {
  // Gecersiz fiyat veya oran: indirim uygulanmaz.
  if (!Number.isFinite(retailPrice) || retailPrice <= 0 || !Number.isFinite(discountPercent) || discountPercent <= 0) {
    return {
      b2bPrice: Number.isFinite(retailPrice) && retailPrice > 0 ? retailPrice : 0,
      savings: 0,
      discountPercent: 0,
    }
  }

  // Iskonto oranini en fazla %100 olacak sekilde sinirla.
  const appliedPercent = Math.min(discountPercent, 100)

  const savings = round2(retailPrice * (appliedPercent / 100))
  const b2bPrice = round2(retailPrice - savings)

  return {
    b2bPrice,
    savings,
    discountPercent: appliedPercent,
  }
}

export interface ProductB2BPrices {
  priceTRY?: number
  wholesalerPriceTRY?: number | null
  servicePriceTRY?: number | null
}

/**
 * Bir ürün için bayi türüne göre manuel veya standart fiyatı çözümler.
 *
 * - Eğer bayi türü 'WHOLESALER' ise ve ürünün wholesalerPriceTRY değeri varsa:
 *   applySalePrice(wholesalerPriceTRY)
 * - Eğer bayi türü 'SERVICE' ise ve ürünün servicePriceTRY değeri varsa:
 *   applySalePrice(servicePriceTRY)
 * - Eğer ürüne özel fiyat girilmemişse (null/boşsa): Standart perakende fiyatı geçerli olur.
 */
export function getB2BPriceForProduct(
  product: ProductB2BPrices,
  dealerType?: string | null,
  fallbackRetailSalePrice?: number
): B2BPriceResult {
  const retail =
    fallbackRetailSalePrice ?? (product.priceTRY != null ? applySalePrice(product.priceTRY) : 0)

  if (dealerType === 'WHOLESALER' && product.wholesalerPriceTRY != null && product.wholesalerPriceTRY > 0) {
    const b2bPrice = applySalePrice(product.wholesalerPriceTRY)
    const savings = Math.max(0, round2(retail - b2bPrice))
    const discountPercent = retail > 0 ? round2((savings / retail) * 100) : 0
    return { b2bPrice, savings, discountPercent }
  }

  if (dealerType === 'SERVICE' && product.servicePriceTRY != null && product.servicePriceTRY > 0) {
    const b2bPrice = applySalePrice(product.servicePriceTRY)
    const savings = Math.max(0, round2(retail - b2bPrice))
    const discountPercent = retail > 0 ? round2((savings / retail) * 100) : 0
    return { b2bPrice, savings, discountPercent }
  }

  return {
    b2bPrice: retail,
    savings: 0,
    discountPercent: 0,
  }
}

/** KDV ayristirma sonucu. */
export interface B2BTaxBreakdown {
  /** KDV haric (net) fiyat (kurus hassasiyetinde yuvarlanmis). */
  taxExcludedPrice: number
  /** KDV dahil fiyattan ayrilan KDV tutari (kurus hassasiyetinde yuvarlanmis). */
  taxAmount: number
}

/**
 * KDV dahil fiyattan KDV haric fiyati ve KDV tutarini hesaplar.
 *
 * Kurallar:
 * - Gecersiz (NaN/Infinity) veya <= 0 fiyat icin { taxExcludedPrice: 0, taxAmount: 0 }.
 * - taxExcludedPrice = Math.round((taxIncludedPrice / (1 + B2B_KDV_RATE)) * 100) / 100
 * - taxAmount = Math.round((taxIncludedPrice - taxExcludedPrice) * 100) / 100
 *
 * @param taxIncludedPrice KDV dahil (brut) fiyat.
 */
export function getTaxExcludedPrice(taxIncludedPrice: number): B2BTaxBreakdown {
  // Gecersiz veya pozitif olmayan fiyat: KDV ayristirilamaz.
  if (!Number.isFinite(taxIncludedPrice) || taxIncludedPrice <= 0) {
    return { taxExcludedPrice: 0, taxAmount: 0 }
  }

  const taxExcludedPrice = round2(taxIncludedPrice / (1 + B2B_KDV_RATE))
  const taxAmount = round2(taxIncludedPrice - taxExcludedPrice)

  return { taxExcludedPrice, taxAmount }
}
