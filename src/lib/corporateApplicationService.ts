/**
 * Kurumsal basvuru olusturma servisi (server-only).
 *
 * Amac:
 * - Dogrulanmis kullanici (CUSTOMER) icin yeni bir kurumsal basvuru olusturmak.
 * - Altı firma alanini sifreleyip (encryptField) tek transaction'da PENDING
 *   basvuru + ilk gecmis olayini yazmak.
 *
 * Guvenlik ve tasarim kurallari:
 * - Yalnizca sunucu tarafinda calisir (`server-only`).
 * - PrismaClient DISARIDAN verilir; bu modul varsayilan baglanti OLUSTURMAZ.
 * - `userId` formdan ALINMAZ; sunucuda dogrulanmis oturumdan parametre olarak gelir.
 *   Kullanici DB'den tekrar dogrulanir ve yalnizca role === 'CUSTOMER' kabul edilir.
 * - Ozellik bayragi (ENABLE_CORPORATE_APPLICATION) kapaliysa DB'ye HIC dokunulmaz.
 * - Aktif basvuru cakismasi DB unique kuralina (kismi unique index) birakilir;
 *   yalnizca ilgili unique ihlali "aktif basvurunuz var" sonucuna cevrilir, diger
 *   hatalar gizlenmez/yutulmaz.
 * - Yanitta yalnizca id, status ve tarih doner; firma verileri/loglari dokulmez.
 * - Hassas veri (duz metin firma alanlari, sifreli zarflar) LOGLANMAZ.
 */
import 'server-only'
import { Prisma } from '@prisma/client'
import type { PrismaClient } from '@prisma/client'
import { isCorporateApplicationEnabled } from './featureFlags'
import { encryptField } from './corporateCrypto'
import type { EncryptedEnvelope } from './corporateCrypto'
import { validateCorporateApplication } from './corporateApplicationValidation'

/**
 * Sifreli zarfı Prisma'nın JSON alanina yazilabilir bir degere cevirir.
 * `EncryptedEnvelope` bir interface oldugu icin `InputJsonValue` ile yapisal
 * olarak uyusmaz (index signature yoktur); alanlar acikca kopyalanir. Boylece
 * mevcut sifreleme modulu DEGISTIRILMEDEN kullanilir.
 */
function toJsonInput(envelope: EncryptedEnvelope): Prisma.InputJsonObject {
  return {
    ciphertext: envelope.ciphertext,
    iv: envelope.iv,
    tag: envelope.tag,
    keyVersion: envelope.keyVersion,
  }
}

export type CreateCorporateApplicationInput = {
  /** Sunucuda dogrulanmis oturumdan gelen kullanici ID'si. Formdan ALINMAZ. */
  userId: string
  /** Ham form verisi; `validateCorporateApplication` ile dogrulanir. */
  form: unknown
}

export type CreateCorporateApplicationResult =
  | {
      ok: true
      application: {
        id: string
        status: string
        createdAt: Date
        submittedAt: Date
      }
    }
  | { ok: false; reason: 'FEATURE_DISABLED' }
  | { ok: false; reason: 'INVALID_INPUT'; errors: Record<string, string[]> }
  | { ok: false; reason: 'USER_NOT_FOUND' }
  | { ok: false; reason: 'USER_NOT_CUSTOMER' }
  | { ok: false; reason: 'ACTIVE_APPLICATION_EXISTS' }
  | { ok: false; reason: 'UNEXPECTED_ERROR' }

/**
 * Yalnizca `corporateApplication.create` cagrisindan gelen ve tam olarak aktif
 * basvuru kismi unique index'ine karsilik gelen cakismayi temsil eder.
 * Event olusturma veya baska bir kaynaktan gelen hatalar bu tipe SARILMAZ.
 */
export class ActiveApplicationConflictError extends Error {
  constructor() {
    super('Aktif kurumsal basvuru cakismasi.')
    this.name = 'ActiveApplicationConflictError'
  }
}

const ACTIVE_APPLICATION_INDEX_NAME =
  'CorporateApplication_one_active_per_user'

/**
 * Yalnizca `corporateApplication.create` isleminden gelen ve TAM OLARAK aktif
 * basvuru kismi unique index'ine karsilik gelen P2002 hatasini tespit eder.
 *
 * Eslesme kurali (includes YOK):
 * - `meta.target` bir dizi ise uzunlugu tam 1 olmali ve tek elemani 'userId' olmali,
 *   VEYA tek elemani tam indeks adi olmali.
 * - `meta.target` bir string ise tam olarak 'userId' veya tam indeks adi olmali.
 *
 * Baska bir unique alan (orn. email) veya event/create disi bir hata bu sonuca
 * donusturulmez. Ham SQL kullanilmadigi icin P2010/23505 varsayimi YOKTUR.
 */
function isActiveApplicationUniqueViolation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  const e = error as { code?: unknown; meta?: unknown }
  if (e.code !== 'P2002') return false

  const meta =
    typeof e.meta === 'object' && e.meta !== null
      ? (e.meta as Record<string, unknown>)
      : null
  if (!meta) return false

  const target = meta.target

  const isExactMatch = (value: string): boolean =>
    value === 'userId' || value === ACTIVE_APPLICATION_INDEX_NAME

  if (typeof target === 'string') {
    return isExactMatch(target)
  }

  if (Array.isArray(target)) {
    if (target.length !== 1) return false
    const [only] = target
    return typeof only === 'string' && isExactMatch(only)
  }

  return false
}

/**
 * Yeni kurumsal basvuru olusturur.
 *
 * @param prisma Disaridan verilen PrismaClient. Varsayilan baglanti olusturulmaz.
 * @param input  { userId, form }
 */
export async function createCorporateApplication(
  prisma: PrismaClient,
  input: CreateCorporateApplicationInput
): Promise<CreateCorporateApplicationResult> {
  // 1) Ozellik bayragi: kapaliysa DB'ye hic dokunmadan reddet (fail-closed).
  if (!isCorporateApplicationEnabled()) {
    return { ok: false, reason: 'FEATURE_DISABLED' }
  }

  // 2) Form dogrulamasi (mevcut modul). Gecersizse DB'ye dokunulmaz.
  const validated = validateCorporateApplication(input.form)
  if (!validated.success) {
    return { ok: false, reason: 'INVALID_INPUT', errors: validated.errors }
  }
  const data = validated.data

  // 3) Kullaniciyi DB'den dogrula; yalnizca id ve role secilir (en az veri).
  //    Beklenmeyen calisma hatalari tutarli bicimde UNEXPECTED_ERROR'a cevrilir.
  const userId = typeof input.userId === 'string' ? input.userId : ''
  let user: { id: string; role: string } | null
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    })
  } catch {
    // Hassas veri (sorgu degeri, hata ayrintisi) LOGLANMAZ.
    return { ok: false, reason: 'UNEXPECTED_ERROR' }
  }
  if (!user) {
    return { ok: false, reason: 'USER_NOT_FOUND' }
  }
  if (user.role !== 'CUSTOMER') {
    return { ok: false, reason: 'USER_NOT_CUSTOMER' }
  }

  // 4) Altı firma alanini sifrele (mevcut modul). Duz metin loglanmaz.
  //    Sifreleme hatalari da UNEXPECTED_ERROR'a cevrilir.
  let encrypted: Record<
    | 'companyName'
    | 'taxNumber'
    | 'taxOffice'
    | 'companyAddress'
    | 'companyPhone'
    | 'authorizedPerson',
    EncryptedEnvelope
  >
  try {
    encrypted = {
      companyName: encryptField(data.companyName),
      taxNumber: encryptField(data.taxNumber),
      taxOffice: encryptField(data.taxOffice),
      companyAddress: encryptField(data.companyAddress),
      companyPhone: encryptField(data.companyPhone),
      authorizedPerson: encryptField(data.authorizedPerson),
    }
  } catch {
    // Anahtar eksik/gecersiz olabilir; ayrinti LOGLANMAZ.
    return { ok: false, reason: 'UNEXPECTED_ERROR' }
  }

  // 5) PENDING basvuru + ilk gecmis olayi tek transaction'da.
  //    Basari sonucu YALNIZCA transaction tamamlandiktan sonra uretilir.
  let created: {
    id: string
    status: string
    createdAt: Date
    submittedAt: Date
  }
  try {
    created = await prisma.$transaction(async (tx) => {
      // Yalnizca asagidaki create cagrisi ic try/catch ile cevrelidir.
      let application: {
        id: string
        status: string
        createdAt: Date
        submittedAt: Date
      }
      try {
        application = await tx.corporateApplication.create({
          data: {
            userId: user.id,
            status: 'PENDING',
            companyName: toJsonInput(encrypted.companyName),
            taxNumber: toJsonInput(encrypted.taxNumber),
            taxOffice: toJsonInput(encrypted.taxOffice),
            companyAddress: toJsonInput(encrypted.companyAddress),
            companyPhone: toJsonInput(encrypted.companyPhone),
            authorizedPerson: toJsonInput(encrypted.authorizedPerson),
            applicationNote: data.applicationNote ?? null,
          },
          select: {
            id: true,
            status: true,
            createdAt: true,
            submittedAt: true,
          },
        })
      } catch (error) {
        // Yalnizca create'den gelen ve TAM eslesmeye uyan P2002 ozel hataya
        // cevrilir. Diger tum hatalar AYNEN yeniden firlatilir.
        if (isActiveApplicationUniqueViolation(error)) {
          throw new ActiveApplicationConflictError()
        }
        throw error
      }

      // Event olusturma ic try/catch'in DISINDADIR; hatasi bu sonuca
      // DONUSTURULMEZ, aynen yukari tasinir.
      // Ilk gecmis olay: fromStatus=null, toStatus=PENDING, aktor gercek kullanici.
      await tx.corporateApplicationEvent.create({
        data: {
          applicationId: application.id,
          fromStatus: null,
          toStatus: 'PENDING',
          actorUserId: user.id,
          actorRole: 'CUSTOMER',
        },
      })

      return application
    })
  } catch (error) {
    // Transaction disindaki catch YALNIZCA ozel cakisma hatasini anlamli sonuca
    // cevirir. Event hatasi dahil digerleri UNEXPECTED_ERROR olur.
    if (error instanceof ActiveApplicationConflictError) {
      return { ok: false, reason: 'ACTIVE_APPLICATION_EXISTS' }
    }
    // Ayrinti LOGLANMAZ.
    return { ok: false, reason: 'UNEXPECTED_ERROR' }
  }

  // 6) Yanitta yalnizca id, durum ve tarihler.
  return {
    ok: true,
    application: {
      id: created.id,
      status: created.status,
      createdAt: created.createdAt,
      submittedAt: created.submittedAt,
    },
  }
}
