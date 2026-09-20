/**
 * Kurumsal basvuru durum gecisleri (state machine) modulu.
 *
 * Izinli gecisler:
 * - PENDING  -> APPROVED (Yalnizca ADMIN, gerekce opsiyonel)
 * - PENDING  -> REJECTED (Yalnizca ADMIN, bosluktan olusmayan gerekce ZORUNLU)
 * - APPROVED -> REVOKED  (Yalnizca ADMIN, bosluktan olusmayan gerekce ZORUNLU)
 *
 * Kurallar:
 * - Diger tum gecisler, ayni duruma gecisler ve bilinmeyen durum degerleri REDDEDILIR.
 * - REJECTED veya REVOKED durumundaki basvurular yeniden ACILAMAZ (terminal durumlar).
 *   Musteri tekrar basvurmak isterse yeni bir CorporateApplication kaydi olusturulur.
 * - Guvenlik kurali: `actor.role` ve `actor.userId` ILERIDE MUTLAKA sunucu tarafinda
 *   dogrulanmis oturumdan (getServerSession / admin-guard) alinmalidir. Istemciden
 *   gelen rol/kimlik bilgisine ASLA guvenilmez.
 *
 * Server-only korumasi:
 * - Bu modul yalnizca sunucu tarafinda calisir.
 */
import 'server-only'

export const CORPORATE_APPLICATION_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'REVOKED',
] as const

export type CorporateApplicationStatus =
  (typeof CORPORATE_APPLICATION_STATUSES)[number]

export interface TransitionActor {
  userId: string
  /**
   * Guvenlik Uyarisi: Bu alan sunucu tarafinda dogrulanmis oturumdan (session.user.role)
   * saglanmalidir. Istemci govdesinden (body) gelen role degerine ASLA guvenilmez.
   */
  role: string
}

export interface TransitionInput {
  fromStatus: unknown
  toStatus: unknown
  actor: TransitionActor
  reason?: string | null
}

export interface ValidatedTransition {
  fromStatus: CorporateApplicationStatus
  toStatus: CorporateApplicationStatus
  actorUserId: string
  actorRole: 'ADMIN'
  reason: string | null
}

/**
 * Modulun yalnizca sunucuda degerlendirildigini garanti eder.
 */
export function assertServerOnly(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      'corporateApplicationTransitions yalnizca sunucu tarafinda kullanilabilir. Istemci bileseninden import edilemez.'
    )
  }
}

assertServerOnly()

/**
 * Verilen degerin gecerli bir CorporateApplicationStatus olup olmadigini dogrular.
 */
export function isValidStatus(status: unknown): status is CorporateApplicationStatus {
  return (
    typeof status === 'string' &&
    (CORPORATE_APPLICATION_STATUSES as readonly string[]).includes(status)
  )
}

/**
 * Bir durum gecisini kurallara gore dogrular.
 * Gecersiz gecis, yetkisiz aktor veya eksik gerekcede aciklayici hata firlatir.
 * Basarili ise temizlenmis gecis nesnesi dondurur.
 */
export function validateStatusTransition(
  input: TransitionInput
): ValidatedTransition {
  assertServerOnly()

  const { fromStatus, toStatus, actor, reason } = input

  // 1. Durum degerlerinin varligi ve gecerliligi
  if (!isValidStatus(fromStatus)) {
    throw new Error(`Gecersiz baslangic durumu: '${String(fromStatus)}'.`)
  }
  if (!isValidStatus(toStatus)) {
    throw new Error(`Gecersiz hedef durum: '${String(toStatus)}'.`)
  }

  // 2. Ayni duruma gecis yasaktir
  if (fromStatus === toStatus) {
    throw new Error(
      `Ayni duruma gecis yapilamaz: '${fromStatus}' -> '${toStatus}'.`
    )
  }

  // 3. Terminal durumlardan cikis yasaktir (REJECTED / REVOKED kaydi yeniden acilamaz)
  if (fromStatus === 'REJECTED' || fromStatus === 'REVOKED') {
    throw new Error(
      `'${fromStatus}' durumundaki basvuru yeniden isleme alinamaz. Yeniden basvuru icin yeni bir kayit olusturulmalidir.`
    )
  }

  // 4. Aktor kimlik ve rol dogrulamasi (yalnizca ADMIN)
  if (!actor || typeof actor.userId !== 'string' || actor.userId.trim().length === 0) {
    throw new Error('Gecersiz aktor: userId zorunludur.')
  }
  if (actor.role !== 'ADMIN') {
    throw new Error(
      `Yetkisiz islem: Basvuru durum gecisleri yalnizca ADMIN tarafindan yapilabilir. Mevcut rol: '${String(actor?.role)}'.`
    )
  }

  // 5. Izinli gecis ciftleri kontrolu
  const isAllowedTransition =
    (fromStatus === 'PENDING' && (toStatus === 'APPROVED' || toStatus === 'REJECTED')) ||
    (fromStatus === 'APPROVED' && toStatus === 'REVOKED')

  if (!isAllowedTransition) {
    throw new Error(
      `Gecersiz durum gecisi: '${fromStatus}' -> '${toStatus}' gecisine izin verilmez.`
    )
  }

  // 6. Gerekce (reason) dogrulamasi: REJECTED ve REVOKED icin bosluktan olusmayan gerekce zorunlu
  const trimmedReason = typeof reason === 'string' ? reason.trim() : ''
  const isReasonRequired = toStatus === 'REJECTED' || toStatus === 'REVOKED'

  if (isReasonRequired && trimmedReason.length === 0) {
    throw new Error(
      `'${toStatus}' durumu icin gecerli (bos olmayan) bir gerekce belirtilmesi zorunludur.`
    )
  }

  return {
    fromStatus,
    toStatus,
    actorUserId: actor.userId.trim(),
    actorRole: 'ADMIN',
    reason: trimmedReason.length > 0 ? trimmedReason : null,
  }
}
