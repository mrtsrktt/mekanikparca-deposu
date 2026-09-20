/**
 * Kurumsal basvuru YONETICI KARAR servisi (server-only).
 *
 * Amac:
 * - Dogrulanmis ADMIN kimligiyle bir kurumsal basvuru icin onay / red / onay
 *   kaldirma kararini islemek.
 * - Durum gecislerini mevcut `corporateApplicationTransitions` moduluyle dogrulamak.
 * - Durum + decidedAt + decidedByUserId guncellemesini ve gecmis olayini TEK
 *   transaction icinde yazmak.
 *
 * Guvenlik ve tasarim kurallari:
 * - Yalnizca sunucu tarafinda calisir (`server-only`).
 * - PrismaClient DISARIDAN verilir; bu modul varsayilan baglanti OLUSTURMAZ.
 * - Yonetici ID'si formdan ALINMAZ; sunucuda dogrulanmis oturumdan parametre
 *   olarak gelir ve transaction ICINDE DB'den role === 'ADMIN' oldugu dogrulanir.
 * - Ozellik bayragi (ENABLE_CORPORATE_APPLICATION) kapaliysa DB'ye HIC dokunulmaz.
 * - Durum guncellemesi ID + okunan ESKI durum kosuluyla yapilir. Etkilenen kayit
 *   sayisi 1 degilse cakisma hatasiyla transaction geri alinir; olay YAZILMAZ.
 * - Event yazimi basarisiz olursa durum degisikligi de geri alinir (tek transaction).
 * - Firma bilgileri, kullanici rolu, fiyatlar veya limitler DEGISTIRILMEZ.
 * - Yanitta yalnizca id, status ve karar tarihi doner; hassas veri LOGLANMAZ.
 */
import 'server-only'
import type { PrismaClient } from '@prisma/client'
import { isCorporateApplicationEnabled } from './featureFlags'
import { validateStatusTransition } from './corporateApplicationTransitions'

/**
 * Yonetici karari sirasinda durum guncellemesinin etkilenen kayit sayisinin 1
 * olmamasi (es zamanli degisiklik / ID+durum uyusmazligi) durumunda firlatilir.
 * Bu hata transaction'in geri alinmasini ve olayin YAZILMAMASINI saglar.
 */
export class DecisionConflictError extends Error {
  constructor() {
    super('Karar sirasinda basvuru durumu cakisti.')
    this.name = 'DecisionConflictError'
  }
}

/**
 * Yonetici karari girdisi.
 */
export type DecideCorporateApplicationInput = {
  /** Sunucuda dogrulanmis oturumdan gelen YONETICI ID'si. Formdan ALINMAZ. */
  adminUserId: string
  /** Karar verilecek basvuru ID'si. */
  applicationId: string
  /** Hedef durum: APPROVED | REJECTED | REVOKED. Modul tarafindan dogrulanir. */
  toStatus: unknown
  /** Red / onay kaldirma icin bosluktan olusmayan gerekce ZORUNLUDUR. */
  reason?: string | null
}

export type DecideCorporateApplicationResult =
  | {
      ok: true
      application: {
        id: string
        status: string
        decidedAt: Date
      }
    }
  | { ok: false; reason: 'FEATURE_DISABLED' }
  | { ok: false; reason: 'ADMIN_NOT_AUTHORIZED' }
  | { ok: false; reason: 'APPLICATION_NOT_FOUND' }
  | { ok: false; reason: 'INVALID_TRANSITION' }
  | { ok: false; reason: 'CONFLICT' }
  | { ok: false; reason: 'UNEXPECTED_ERROR' }

/**
 * Bir kurumsal basvuru icin yonetici kararini isler.
 *
 * @param prisma Disaridan verilen PrismaClient. Varsayilan baglanti olusturulmaz.
 * @param input  { adminUserId, applicationId, toStatus, reason }
 */
export async function decideCorporateApplication(
  prisma: PrismaClient,
  input: DecideCorporateApplicationInput
): Promise<DecideCorporateApplicationResult> {
  // 1) Ozellik bayragi: kapaliysa DB'ye hic dokunmadan reddet (fail-closed).
  if (!isCorporateApplicationEnabled()) {
    return { ok: false, reason: 'FEATURE_DISABLED' }
  }

  const adminUserId =
    typeof input.adminUserId === 'string' ? input.adminUserId : ''
  const applicationId =
    typeof input.applicationId === 'string' ? input.applicationId : ''

  // Basvuru ID'si bos ise DB'ye dokunmadan reddet.
  if (applicationId.trim().length === 0) {
    return { ok: false, reason: 'APPLICATION_NOT_FOUND' }
  }

  // 2) Yonetici dogrulamasi + basvuru okuma + durum gecisi + guncelleme + olay
  //    TEK transaction icinde. Basari sonucu YALNIZCA transaction tamamlandiktan
  //    sonra uretilir.
  let decided: { id: string; status: string; decidedAt: Date }
  try {
    decided = await prisma.$transaction(async (tx) => {
      // 2a) Yonetici kimligini DB'den dogrula (transaction ICINDE).
      //     Yalnizca id ve role secilir (en az veri).
      const admin = await tx.user.findUnique({
        where: { id: adminUserId },
        select: { id: true, role: true },
      })
      if (!admin || admin.role !== 'ADMIN') {
        throw new AdminNotAuthorizedError()
      }

      // 2b) Basvuruyu oku; yalnizca id ve mevcut durum secilir.
      const application = await tx.corporateApplication.findUnique({
        where: { id: applicationId },
        select: { id: true, status: true },
      })
      if (!application) {
        throw new ApplicationNotFoundError()
      }

      // 2c) Durum gecisini mevcut modul ile dogrula. Gecersizse DB'ye yazilmaz.
      let validated
      try {
        validated = validateStatusTransition({
          fromStatus: application.status,
          toStatus: input.toStatus,
          actor: { userId: admin.id, role: admin.role },
          reason: input.reason,
        })
      } catch {
        // Gecis kuralina aykiri (durum, terminal, gerekce vb.); ayrinti LOGLANMAZ.
        throw new InvalidTransitionError()
      }

      const decidedAt = new Date()

      // 2d) Guncelleme ID + OKUNAN ESKI durum kosuluyla yapilir. Etkilenen kayit
      //     sayisi 1 degilse cakisma hatasiyla transaction geri alinir; bu durumda
      //     olay YAZILMAZ.
      const updated = await tx.corporateApplication.updateMany({
        where: { id: application.id, status: validated.fromStatus },
        data: {
          status: validated.toStatus,
          decidedAt,
          decidedByUserId: validated.actorUserId,
        },
      })
      if (updated.count !== 1) {
        throw new DecisionConflictError()
      }

      // 2e) Gecmis olayi. Hatasi bu sonuca DONUSTURULMEZ; yukari tasinir ve
      //     transaction geri alinir (durum degisikligi de geri alinir).
      await tx.corporateApplicationEvent.create({
        data: {
          applicationId: application.id,
          fromStatus: validated.fromStatus,
          toStatus: validated.toStatus,
          actorUserId: validated.actorUserId,
          actorRole: 'ADMIN',
          reason: validated.reason,
        },
      })

      return {
        id: application.id,
        status: validated.toStatus,
        decidedAt,
      }
    })
  } catch (error) {
    // Transaction disindaki catch YALNIZCA anlamli ozel hatalari sonuca cevirir.
    if (error instanceof AdminNotAuthorizedError) {
      return { ok: false, reason: 'ADMIN_NOT_AUTHORIZED' }
    }
    if (error instanceof ApplicationNotFoundError) {
      return { ok: false, reason: 'APPLICATION_NOT_FOUND' }
    }
    if (error instanceof InvalidTransitionError) {
      return { ok: false, reason: 'INVALID_TRANSITION' }
    }
    if (error instanceof DecisionConflictError) {
      return { ok: false, reason: 'CONFLICT' }
    }
    // Event hatasi dahil digerleri UNEXPECTED_ERROR olur. Ayrinti LOGLANMAZ.
    return { ok: false, reason: 'UNEXPECTED_ERROR' }
  }

  // 3) Yanitta yalnizca id, durum ve karar tarihi.
  return {
    ok: true,
    application: {
      id: decided.id,
      status: decided.status,
      decidedAt: decided.decidedAt,
    },
  }
}

/** Transaction icinde firlatilan, disarida anlamli sonuca cevrilen ic hatalar. */
class AdminNotAuthorizedError extends Error {
  constructor() {
    super('Yonetici yetkisi dogrulanamadi.')
    this.name = 'AdminNotAuthorizedError'
  }
}

class ApplicationNotFoundError extends Error {
  constructor() {
    super('Basvuru bulunamadi.')
    this.name = 'ApplicationNotFoundError'
  }
}

class InvalidTransitionError extends Error {
  constructor() {
    super('Gecersiz durum gecisi.')
    this.name = 'InvalidTransitionError'
  }
}
