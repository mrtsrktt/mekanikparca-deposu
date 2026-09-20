/**
 * Sunucu tarafi ozellik bayraklari (feature flags).
 *
 * Kurallar:
 * - Varsayilan KAPALI (fail-closed).
 * - Yalnizca "true" degeri ozelligi acar. Karsilastirma oncesi deger trim edilir
 *   ve kucuk harfe cevrilir; yani "TRUE", "True", " true " de etkin sayilir.
 *   Diger tum degerler (undefined, "", "1", "yes", "on", "false", gecersiz) => KAPALI.
 * - Bu modul YALNIZCA sunucu tarafinda kullanilmalidir.
 * - Karsilastirma, deger trim edilip kucuk harfe cevrildikten sonra yapilir.
 *
 * Server-only korumasi (iki katmanli):
 * - `NEXT_PUBLIC_` oneki KULLANILMAZ; bu tek basina yeterli bir koruma DEGILDIR.
 * - 1) Derleme zamani: `import 'server-only'` sayesinde Next.js, bu modulu bir
 *   istemci (client) bundle'ina dahil etmeye calisirsa derleme sirasinda hata verir
 *   (Next `server-only` paketini istemci icin hata firlatan bir modul ile esler).
 * - 2) Calisma zamani: `assertServerOnly()` tarayici ortaminda aninda hata firlatir.
 *   Bu katman korunmustur ve kaldirilmamalidir.
 */

// Derleme zamani server-only korumasi. Next.js, istemci bundle'i icin bu modulu
// hata firlatan bir modul ile esler; boylece istemciden import edilemez.
import 'server-only'

/**
 * Modulun yalnizca sunucuda degerlendirildigini garanti eder.
 * Tarayici (window tanimli) ortaminda cagrilirsa hata firlatir.
 */
export function assertServerOnly(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      'featureFlags yalnizca sunucu tarafinda kullanilabilir. Istemci bileseninden import edilemez.'
    )
  }
}

// Modul yuklenir yuklenmez korumayi uygula (import edildigi anda fail-closed).
assertServerOnly()

/**
 * Bir ortam degiskeni degerini guvenli boolean'a cevirir.
 * Deger trim edilir ve kucuk harfe cevrilir; tam olarak "true" ise true doner.
 * Diger tum degerler (undefined, "", "1", "yes", "on", "false", gecersiz) => false.
 */
export function isEnvFlagEnabled(value: string | undefined | null): boolean {
  if (typeof value !== 'string') return false
  return value.trim().toLowerCase() === 'true'
}

/**
 * Kurumsal basvuru ozelligi acik mi?
 * Varsayilan: kapali. Sunucu tarafinda okunur.
 */
export function isCorporateApplicationEnabled(): boolean {
  assertServerOnly()
  return isEnvFlagEnabled(process.env.ENABLE_CORPORATE_APPLICATION)
}
