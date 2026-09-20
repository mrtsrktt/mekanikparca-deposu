/**
 * Bayi turu ve indirim orani cozumleme (server-only).
 *
 * Tasarim:
 * - Indirim ORANI kodda sabit DEGILDIR; `SiteSetting` tablosundan okunur ki
 *   isletme sahibi admin panelinden degistirebilsin.
 * - Tur bazli iki ayar anahtari vardir:
 *     dealer_discount_wholesaler -> Toptanci (varsayilan %25)
 *     dealer_discount_service    -> Servis   (varsayilan %15)
 * - Ayar yoksa/gecersizse modul ici varsayilan kullanilir (fail-safe).
 * - Bu modul YALNIZCA sunucu tarafinda kullanilmalidir.
 */
import 'server-only'
import type { PrismaClient } from '@prisma/client'
import { type DealerType, isDealerType, DEALER_TYPE_LABELS } from './dealerTypeShared'

// Bayi turu sabitleri client-safe modulde yasar; burada yeniden disa aktarilir
// ki sunucu tarafi tek noktadan import edebilsin.
export type { DealerType }
export { isDealerType, DEALER_TYPE_LABELS }

/** Ayar anahtarlari. */
export const DEALER_DISCOUNT_KEYS: Record<DealerType, string> = {
  WHOLESALER: 'dealer_discount_wholesaler',
  SERVICE: 'dealer_discount_service',
}

/** Ayar bulunamazsa kullanilacak varsayilan oranlar (yuzde). */
export const DEFAULT_DEALER_DISCOUNTS: Record<DealerType, number> = {
  WHOLESALER: 25,
  SERVICE: 15,
}

/**
 * Bir ayar degerini gecerli indirim oranina cevirir.
 *
 * Kurallar:
 * - Sayisal olmayan, NaN, Infinity, negatif degerler GECERSIZ sayilir.
 * - 0 gecerlidir (indirim yok).
 * - 100'den buyuk degerler 100'e sinirlanir.
 *
 * @returns Gecerli ise oran, degilse null (cagiran varsayilana duser).
 */
export function parseDiscountPercent(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null

  // Yalnizca sayi veya sayisal string kabul edilir. `Number('')` ve `Number([])`
  // sifir dondurdugu icin bunlar acikca dislanir; aksi halde bos bir ayar
  // degeri "%0 indirim" gibi yorumlanirdi.
  let num: number
  if (typeof raw === 'number') {
    num = raw
  } else if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed.length === 0) return null
    num = Number(trimmed)
  } else {
    return null
  }

  if (!Number.isFinite(num) || num < 0) return null
  return Math.min(num, 100)
}

/**
 * Verilen ayar haritasindan tur bazli indirim oranini cozer.
 *
 * Saf fonksiyon: DB cagrisi yapmaz, test edilebilir.
 *
 * @param settings SiteSetting key -> value haritasi.
 * @param dealerType Bayi turu.
 * @returns Uygulanacak indirim orani (yuzde).
 */
export function resolveDiscountPercent(
  settings: Record<string, string | undefined>,
  dealerType: DealerType
): number {
  const key = DEALER_DISCOUNT_KEYS[dealerType]
  const parsed = parseDiscountPercent(settings[key])
  return parsed ?? DEFAULT_DEALER_DISCOUNTS[dealerType]
}

/** Bir kullanicinin bayi bilgisi. */
export interface DealerInfo {
  dealerType: DealerType
  discountPercent: number
}

/**
 * Kullanicinin onayli bayi bilgisini doner.
 *
 * - Kullanici onayli bayi degilse veya turu atanmamissa null doner.
 * - Indirim orani `SiteSetting`'ten okunur; yoksa varsayilan kullanilir.
 * - Hata durumunda null doner; ayrinti LOGLANMAZ ve akis kesilmez.
 *
 * @param prisma Disaridan verilen PrismaClient.
 * @param userId Kontrol edilecek kullanici ID'si.
 */
export async function getDealerInfo(
  prisma: PrismaClient,
  userId: string
): Promise<DealerInfo | null> {
  if (typeof userId !== 'string' || userId.trim().length === 0) return null

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dealerType: true },
    })
    if (!user || !isDealerType(user.dealerType)) return null

    const dealerType = user.dealerType
    const settingKey = DEALER_DISCOUNT_KEYS[dealerType]
    const setting = await prisma.siteSetting.findUnique({
      where: { key: settingKey },
      select: { value: true },
    })

    return {
      dealerType,
      discountPercent: resolveDiscountPercent(
        { [settingKey]: setting?.value },
        dealerType
      ),
    }
  } catch {
    return null
  }
}
