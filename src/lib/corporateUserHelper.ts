/**
 * Kurumsal ONAYLI kullanici tespiti icin sunucu yardimci servisi (server-only).
 *
 * Amac:
 * - Bir kullanici ID'sinin ONAYLI (APPROVED) bir kurumsal basvuruya sahip olup
 *   olmadigini belirlemek.
 *
 * Guvenlik ve tasarim kurallari:
 * - Yalnizca sunucu tarafinda calisir (`server-only`).
 * - PrismaClient DISARIDAN verilir; bu modul varsayilan baglanti OLUSTURMAZ.
 * - Ozellik bayragi (ENABLE_CORPORATE_APPLICATION) kapaliysa DB'ye HIC
 *   dokunulmaz ve false doner (fail-closed).
 * - Girdi userId bos/gecersizse DB'ye dokunulmadan false doner.
 * - Sorgu yalnizca kayit VARLIGINI kontrol eder; `select: { id: true }` ile
 *   en az veri cekilir (firma bilgisi okunmaz).
 * - Hata durumunda guvenli sekilde false doner; hata YUKARI TASINMAZ ve akis
 *   KESILMEZ (fail-closed).
 */
import 'server-only'
import type { PrismaClient } from '@prisma/client'
import { isCorporateApplicationEnabled } from './featureFlags'

/**
 * Kullanicinin ONAYLI (APPROVED) bir kurumsal basvurusu olup olmadigini doner.
 *
 * @param prisma Disaridan verilen PrismaClient. Varsayilan baglanti olusturulmaz.
 * @param userId Kontrol edilecek kullanici ID'si.
 * @returns Onayli basvuru varsa true; aksi halde (bos id, kapali bayrak,
 *          kayit yok veya hata) false.
 */
export async function isApprovedCorporateUser(
  prisma: PrismaClient,
  userId: string
): Promise<boolean> {
  // 1) Ozellik bayragi: kapaliysa DB'ye hic dokunmadan false don (fail-closed).
  if (!isCorporateApplicationEnabled()) {
    return false
  }

  // 2) Girdi dogrulamasi: bos/gecersiz userId icin DB'ye dokunma.
  if (typeof userId !== 'string' || userId.trim().length === 0) {
    return false
  }

  // 3) Sorgu: yalnizca kayit varligini kontrol et; en az veri cek.
  try {
    const application = await prisma.corporateApplication.findFirst({
      where: { userId, status: 'APPROVED' },
      select: { id: true },
    })
    return application !== null
  } catch {
    // Hata durumunda guvenli sekilde false don; ayrinti LOGLANMAZ ve akis
    // kesilmez.
    return false
  }
}
