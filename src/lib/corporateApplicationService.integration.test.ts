/**
 * corporateApplicationService icin YEREL DB entegrasyon testi.
 *
 * Amac:
 * - Gercek createCorporateApplication servisini yerel test DB'sine karsi calistirmak.
 * - PENDING basvuru + ilk gecmis olayinin dogru aktorle olustugunu dogrulamak.
 * - Altı firma alaninin sifreli saklandigini ve cozuldugunde girdiyle eslestigini
 *   dogrulamak (degerler LOGLANMAZ).
 * - Ayni kullaniciyla ikinci cagrinin ACTIVE_APPLICATION_EXISTS dondugunu ve
 *   kayit sayilarinin bir kaldigini dogrulamak.
 *
 * Temizlik:
 * - Yalnizca bu testin olusturdugu kayitlar, tam ID'leriyle silinir.
 * - Silme sirasi event -> basvuru -> kullanici; genel/prefix silme YOK.
 * - Kalan kayit sayilari sifir olmali.
 *
 * Bu test yalnizca YEREL test DB'sinde calisir; TEST_DATABASE_URL zorunludur.
 *
 * Calistirma:
 *   npx --no-install tsx --conditions=react-server src/lib/corporateApplicationService.integration.test.ts
 */

import { randomBytes, randomUUID } from 'crypto'
import { Prisma, PrismaClient } from '@prisma/client'
import { createCorporateApplication } from './corporateApplicationService'
import { decryptField } from './corporateCrypto'

/**
 * Teste OZEL Prisma uzantisi: yalnizca `corporateApplicationEvent.create`
 * cagrisi sirasinda kontrollu bir hata uretir. Transaction veya basvuru
 * yazimi TAKLIT EDILMEZ; gercek DB ve gercek transaction kullanilir. Boylece
 * event hatasi sonucu transaction'in geri alindigi (rollback) dogrulanabilir.
 */
function withEventCreateFailure(
  base: PrismaClient,
  message: string
): { client: PrismaClient; getCallCount: () => number; getApplicationId: () => string | null } {
  let callCount = 0
  let applicationId: string | null = null
  const client = base.$extends({
    query: {
      corporateApplicationEvent: {
        create: async ({ args, query }) => {
          callCount++
          const data = args.data as { applicationId?: unknown } | undefined
          applicationId =
            data && typeof data.applicationId === 'string' ? data.applicationId : null
          throw new Error(message)
        },
      },
    },
  }) as unknown as PrismaClient
  return {
    client,
    getCallCount: () => callCount,
    getApplicationId: () => applicationId,
  }
}

let passed = 0
let failed = 0

function check(name: string, fn: () => Promise<void>): Promise<void> {
  return fn()
    .then(() => {
      passed++
      console.log(`PASS  ${name}`)
    })
    .catch((e) => {
      failed++
      console.log(`FAIL  ${name}: ${e instanceof Error ? e.message : String(e)}`)
    })
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(
      `${label}: beklenen '${String(expected)}', gelen '${String(actual)}'`
    )
  }
}

function assertTrue(value: boolean, label: string): void {
  if (!value) throw new Error(`${label}: true bekleniyordu`)
}

async function main(): Promise<void> {
  // --- Hedef dogrulama ---
  const url = process.env.TEST_DATABASE_URL
  if (!url) {
    console.error('TEST_DATABASE_URL tanimli degil.')
    process.exitCode = 2
    return
  }
  const u = new URL(url)
  const checks = {
    protocol: u.protocol === 'postgresql:',
    host: u.hostname === '127.0.0.1',
    port: u.port === '5433',
    user: decodeURIComponent(u.username) === 'mpd_test',
    db: u.pathname.replace(/^\//, '') === 'mpd_test',
  }
  console.log('HEDEF KONTROLLERI:', JSON.stringify(checks))
  if (!Object.values(checks).every(Boolean)) {
    console.error('Hedef beklenenlerle uyusmuyor, duruluyor.')
    process.exitCode = 3
    return
  }

  // --- Ortam degiskenlerini sakla ---
  const originalFlag = process.env.ENABLE_CORPORATE_APPLICATION
  const originalKeyV1 = process.env.CORPORATE_ENC_KEY_V1
  const hadFlag = Object.prototype.hasOwnProperty.call(
    process.env,
    'ENABLE_CORPORATE_APPLICATION'
  )
  const hadKeyV1 = Object.prototype.hasOwnProperty.call(
    process.env,
    'CORPORATE_ENC_KEY_V1'
  )

  const tempKey = randomBytes(32).toString('base64')

  // Yalnizca bu testin olusturdugu kayitlarin ID'leri.
  const createdUserId = randomUUID()
  let createdApplicationId: string | null = null
  // Rollback senaryosu icin ikinci sentetik kullanici.
  const rollbackUserId = randomUUID()

  const prisma = new PrismaClient({ datasources: { db: { url } } })

  try {
    process.env.ENABLE_CORPORATE_APPLICATION = 'true'
    process.env.CORPORATE_ENC_KEY_V1 = tempKey

    const form = {
      companyName: 'Entegrasyon Firma',
      taxNumber: '0987654321',
      taxOffice: 'Entegrasyon VD',
      companyAddress: 'Entegrasyon Adres',
      companyPhone: '02120001122',
      authorizedPerson: 'Entegrasyon Yetkili',
    }

    // Sentetik CUSTOMER olustur (yalnizca bu testin kaydi).
    await prisma.user.create({
      data: {
        id: createdUserId,
        email: `it-${createdUserId}@test.local`,
        password: 'x',
        name: 'Integration Test User',
        role: 'CUSTOMER',
      },
    })

    await check('ilk cagri -> ok:true', async () => {
      const res = await createCorporateApplication(prisma, {
        userId: createdUserId,
        form,
      })
      assertTrue(res.ok === true, 'ok')
      if (res.ok === true) {
        createdApplicationId = res.application.id
        assertEqual(res.application.status, 'PENDING', 'status')
      }
    })

    await check('PENDING basvuru ve ilk gecmis olayi dogru aktorle olustu', async () => {
      if (!createdApplicationId) throw new Error('basvuru ID yok')
      const app = await prisma.corporateApplication.findUnique({
        where: { id: createdApplicationId },
        select: { id: true, userId: true, status: true },
      })
      assertTrue(app !== null, 'basvuru bulundu')
      if (app) {
        assertEqual(app.status, 'PENDING', 'status')
        assertEqual(app.userId, createdUserId, 'userId')
      }

      const events = await prisma.corporateApplicationEvent.findMany({
        where: { applicationId: createdApplicationId },
        select: { id: true, fromStatus: true, toStatus: true, actorUserId: true, actorRole: true },
      })
      assertEqual(events.length, 1, 'olay sayisi')
      const ev = events[0]
      if (ev) {
        assertEqual(ev.fromStatus, null, 'fromStatus')
        assertEqual(ev.toStatus, 'PENDING', 'toStatus')
        assertEqual(ev.actorUserId, createdUserId, 'actorUserId')
        assertEqual(ev.actorRole, 'CUSTOMER', 'actorRole')
      }
    })

    await check('altı firma alani sifreli saklandi ve cozulunce girdiyle eslesiyor', async () => {
      if (!createdApplicationId) throw new Error('basvuru ID yok')
      const app = await prisma.corporateApplication.findUnique({
        where: { id: createdApplicationId },
        select: {
          companyName: true,
          taxNumber: true,
          taxOffice: true,
          companyAddress: true,
          companyPhone: true,
          authorizedPerson: true,
        },
      })
      if (!app) throw new Error('basvuru bulunamadi')

      const fields = [
        ['companyName', app.companyName, form.companyName],
        ['taxNumber', app.taxNumber, form.taxNumber],
        ['taxOffice', app.taxOffice, form.taxOffice],
        ['companyAddress', app.companyAddress, form.companyAddress],
        ['companyPhone', app.companyPhone, form.companyPhone],
        ['authorizedPerson', app.authorizedPerson, form.authorizedPerson],
      ] as const

      for (const [name, stored, expected] of fields) {
        // Saklanan deger bir sifreli zarf olmali (duz metin DEGIL).
        assertTrue(
          typeof stored === 'object' && stored !== null && 'ciphertext' in stored,
          `${name} sifreli zarf`
        )
        const decrypted = decryptField(stored as never)
        // Degerler YAZDIRILMAZ; yalnizca alan adi + 'eslesmedi' mesaji verilir.
        if (decrypted !== expected) {
          throw new Error(`${name} eslesmedi`)
        }
      }
    })

    await check('ayni kullaniciyla ikinci cagri -> ACTIVE_APPLICATION_EXISTS', async () => {
      const res = await createCorporateApplication(prisma, {
        userId: createdUserId,
        form,
      })
      assertEqual(res.ok, false, 'ok')
      if (res.ok === false) {
        assertEqual(res.reason, 'ACTIVE_APPLICATION_EXISTS', 'reason')
      }
    })

    await check('cakisma sonrasi basvuru ve olay sayisi bir kaldi', async () => {
      const appCount = await prisma.corporateApplication.count({
        where: { userId: createdUserId },
      })
      assertEqual(appCount, 1, 'basvuru sayisi')
      if (!createdApplicationId) throw new Error('basvuru ID yok')
      const evCount = await prisma.corporateApplicationEvent.count({
        where: { applicationId: createdApplicationId },
      })
      assertEqual(evCount, 1, 'olay sayisi')
    })

    // --- Transaction rollback senaryosu ---

    // Ikinci sentetik CUSTOMER (yalnizca bu senaryo icin).
    await prisma.user.create({
      data: {
        id: rollbackUserId,
        email: `it-rb-${rollbackUserId}@test.local`,
        password: 'x',
        name: 'Rollback Test User',
        role: 'CUSTOMER',
      },
    })

    // Event asamasina TAM BIR KEZ ulasildigini ve o asamada hedeflenen
    // basvuru ID'sinin yakalandigini dogrulamak icin sayac/ID tutulur.
    let eventCreateCalls = 0
    let capturedApplicationId: string | null = null

    await check(
      'event.create hata -> UNEXPECTED_ERROR ve transaction geri alinir',
      async () => {
        const failing = withEventCreateFailure(
          prisma,
          'test: event.create kontrollu hata'
        )
        const res = await createCorporateApplication(failing.client, {
          userId: rollbackUserId,
          form,
        })
        assertEqual(res.ok, false, 'ok')
        if (res.ok === false) {
          assertEqual(res.reason, 'UNEXPECTED_ERROR', 'reason')
        }
        // Erken baska bir hata (event asamasina hic gelinmeden) rollback
        // basarisi sayilmasin diye event.create tam bir kez cagrilmis olmali.
        eventCreateCalls = failing.getCallCount()
        capturedApplicationId = failing.getApplicationId()
        assertEqual(eventCreateCalls, 1, 'event.create cagri sayisi')
        assertTrue(
          capturedApplicationId !== null,
          'event.create applicationId yakalandi'
        )
      }
    )

    await check(
      'rollback sonrasi hedeflenen basvuru DB de yok ve olay sayisi sifir',
      async () => {
        if (capturedApplicationId === null) {
          throw new Error('yakalanan basvuru ID yok')
        }
        // Event asamasinda hedeflenen basvuru ID'si DB'de BULUNMAMALI.
        const app = await prisma.corporateApplication.findUnique({
          where: { id: capturedApplicationId },
          select: { id: true },
        })
        assertTrue(app === null, 'hedeflenen basvuru DB de yok')
        // O basvuruya bagli olay sayisi sifir olmali.
        const evCount = await prisma.corporateApplicationEvent.count({
          where: { applicationId: capturedApplicationId },
        })
        assertEqual(evCount, 0, 'olay sayisi')
      }
    )

    await check(
      'rollback sonrasi kullanicinin basvuru ve olay sayisi sifir',
      async () => {
        const appCount = await prisma.corporateApplication.count({
          where: { userId: rollbackUserId },
        })
        assertEqual(appCount, 0, 'basvuru sayisi')

        // Basvuru ID'si alinamadigi icin varsayilan 0 KABUL EDILMEZ; kullaniciya
        // ait gercek basvuru ID'leri sorgulanir ve olay sayisi o ID'ler uzerinden
        // dogrulanir.
        const apps = await prisma.corporateApplication.findMany({
          where: { userId: rollbackUserId },
          select: { id: true },
        })
        const appIds = apps.map((a) => a.id)
        const evCount = await prisma.corporateApplicationEvent.count({
          where: { applicationId: { in: appIds } },
        })
        assertEqual(evCount, 0, 'olay sayisi')
      }
    )
  } finally {
    // --- Temizlik: event -> basvuru -> kullanici (tam ID'lerle, transaction icinde) ---
    // Yalnizca bu calismada olusturulan kullanicilara ait kayitlar bulunur; ID'ler
    // once SORGULANIR (varsayilan 0 KABUL EDILMEZ), sonra tam ID'lerle silinir.
    const testUserIds = [createdUserId, rollbackUserId]
    let cleanupOk = true
    try {
      const appsToDelete = await prisma.corporateApplication.findMany({
        where: { userId: { in: testUserIds } },
        select: { id: true },
      })
      const appIdsToDelete = appsToDelete.map((a) => a.id)

      await prisma.$transaction(async (tx) => {
        if (appIdsToDelete.length > 0) {
          await tx.corporateApplicationEvent.deleteMany({
            where: { applicationId: { in: appIdsToDelete } },
          })
          await tx.corporateApplication.deleteMany({
            where: { id: { in: appIdsToDelete } },
          })
        }
        await tx.user.deleteMany({ where: { id: { in: testUserIds } } })
      })
    } catch {
      console.error('TEMIZLIK HATASI: kayitlar silinemedi.')
      cleanupOk = false
    }

    // Kalan kayit sayilari sifir olmali (gercek sorgularla).
    try {
      const leftUser = await prisma.user.count({
        where: { id: { in: testUserIds } },
      })
      const leftApps = await prisma.corporateApplication.findMany({
        where: { userId: { in: testUserIds } },
        select: { id: true },
      })
      const leftAppIds = leftApps.map((a) => a.id)
      const leftEvent = await prisma.corporateApplicationEvent.count({
        where: { applicationId: { in: leftAppIds } },
      })
      const leftApp = leftAppIds.length
      console.log('TEMIZLIK_KANIT kalan_User:', leftUser)
      console.log('TEMIZLIK_KANIT kalan_Application:', leftApp)
      console.log('TEMIZLIK_KANIT kalan_Event:', leftEvent)
      if (leftUser !== 0 || leftApp !== 0 || leftEvent !== 0) {
        cleanupOk = false
      }
    } catch {
      console.error('TEMIZLIK DOGRULAMA HATASI.')
      cleanupOk = false
    }

    if (!cleanupOk) {
      process.exitCode = 1
    }

    // Ortam degiskenlerini geri yukle.
    if (hadFlag) {
      process.env.ENABLE_CORPORATE_APPLICATION = originalFlag
    } else {
      delete process.env.ENABLE_CORPORATE_APPLICATION
    }
    if (hadKeyV1) {
      process.env.CORPORATE_ENC_KEY_V1 = originalKeyV1
    } else {
      delete process.env.CORPORATE_ENC_KEY_V1
    }

    await prisma.$disconnect()
  }

  console.log(`\nSONUC: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    process.exitCode = 1
  }
}

main().catch((e) => {
  console.error('BEKLENMEYEN HATA: test calistirilamadi.')
  process.exitCode = 1
})
