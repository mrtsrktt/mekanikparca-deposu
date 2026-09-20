/**
 * corporateApplicationDecisionService APPROVED akisi icin YEREL DB entegrasyon testi.
 *
 * Gercek decideCorporateApplication servisini yerel test DB'sine karsi calistirir.
 * Yalnizca bu testin olusturdugu kayitlar tam ID'lerle temizlenir.
 *
 * Calistirma:
 *   npx --no-install tsx --conditions=react-server src/lib/corporateApplicationDecisionService.integration.test.ts
 */

import { randomUUID } from 'crypto'
import { Prisma, PrismaClient } from '@prisma/client'
import { decideCorporateApplication } from './corporateApplicationDecisionService'

/**
 * Teste OZEL Prisma uzantisi: yalnizca `corporateApplicationEvent.create`
 * cagrisi sirasinda kontrollu bir hata uretir. Transaction veya basvuru yazimi
 * TAKLIT EDILMEZ; gercek DB ve gercek transaction kullanilir. Boylece event
 * hatasi sonucu transaction'in geri alindigi (rollback) dogrulanabilir.
 */
function withEventCreateFailure(
  base: PrismaClient,
  message: string
): { client: PrismaClient; getCallCount: () => number } {
  let callCount = 0
  const client = base.$extends({
    query: {
      corporateApplicationEvent: {
        create: async () => {
          callCount++
          throw new Error(message)
        },
      },
    },
  }) as unknown as PrismaClient
  return { client, getCallCount: () => callCount }
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

/** Sozlesmeye uygun test zarfi (keyVersion 'V1', 12B IV, 16B tag). */
function envelope(): {
  ciphertext: string
  iv: string
  tag: string
  keyVersion: string
} {
  return {
    ciphertext: 'AAAA',
    iv: 'AAAAAAAAAAAAAAAA',
    tag: 'AAAAAAAAAAAAAAAAAAAAAA==',
    keyVersion: 'V1',
  }
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

  // --- Ortam bayragini sakla ---
  const originalFlag = process.env.ENABLE_CORPORATE_APPLICATION
  const hadFlag = Object.prototype.hasOwnProperty.call(
    process.env,
    'ENABLE_CORPORATE_APPLICATION'
  )

  // Yalnizca bu testin olusturdugu kayitlarin ID'leri.
  const adminUserId = randomUUID()
  const customerUserId = randomUUID()
  // Genisletilmis senaryolar icin ayri sentetik CUSTOMER.
  const customer2UserId = randomUUID()
  let applicationId: string | null = null
  // REJECTED senaryosu basvurusu.
  let rejectedAppId: string | null = null
  // APPROVED -> REVOKED senaryosu basvurusu.
  let revokedAppId: string | null = null
  // Event hatasi rollback senaryosu icin ayri sentetik CUSTOMER ve basvuru.
  const failUserId = randomUUID()
  let failAppId: string | null = null

  const prisma = new PrismaClient({ datasources: { db: { url } } })

  try {
    process.env.ENABLE_CORPORATE_APPLICATION = 'true'

    // Sentetik ADMIN ve CUSTOMER.
    await prisma.user.create({
      data: {
        id: adminUserId,
        email: `it-admin-${adminUserId}@test.local`,
        password: 'x',
        name: 'Integration Admin',
        role: 'ADMIN',
      },
    })
    await prisma.user.create({
      data: {
        id: customerUserId,
        email: `it-cust-${customerUserId}@test.local`,
        password: 'x',
        name: 'Integration Customer',
        role: 'CUSTOMER',
      },
    })
    await prisma.user.create({
      data: {
        id: customer2UserId,
        email: `it-cust2-${customer2UserId}@test.local`,
        password: 'x',
        name: 'Integration Customer 2',
        role: 'CUSTOMER',
      },
    })
    await prisma.user.create({
      data: {
        id: failUserId,
        email: `it-fail-${failUserId}@test.local`,
        password: 'x',
        name: 'Integration Failure User',
        role: 'CUSTOMER',
      },
    })

    // PENDING basvuru (sifreli firma alanlari gerekli DEGIL; durum/karar akisi test edilir).
    await check('PENDING basvuru olusturuldu', async () => {
      const app = await prisma.corporateApplication.create({
        data: {
          userId: customerUserId,
          status: 'PENDING',
          companyName: { ciphertext: 'AAAA', iv: 'AAAAAAAAAAAAAAAA', tag: 'AAAAAAAAAAAAAAAAAAAAAA==', keyVersion: 'V1' },
          taxNumber: { ciphertext: 'AAAA', iv: 'AAAAAAAAAAAAAAAA', tag: 'AAAAAAAAAAAAAAAAAAAAAA==', keyVersion: 'V1' },
          taxOffice: { ciphertext: 'AAAA', iv: 'AAAAAAAAAAAAAAAA', tag: 'AAAAAAAAAAAAAAAAAAAAAA==', keyVersion: 'V1' },
          companyAddress: { ciphertext: 'AAAA', iv: 'AAAAAAAAAAAAAAAA', tag: 'AAAAAAAAAAAAAAAAAAAAAA==', keyVersion: 'V1' },
          companyPhone: { ciphertext: 'AAAA', iv: 'AAAAAAAAAAAAAAAA', tag: 'AAAAAAAAAAAAAAAAAAAAAA==', keyVersion: 'V1' },
          authorizedPerson: { ciphertext: 'AAAA', iv: 'AAAAAAAAAAAAAAAA', tag: 'AAAAAAAAAAAAAAAAAAAAAA==', keyVersion: 'V1' },
        },
        select: { id: true, status: true },
      })
      applicationId = app.id
      assertEqual(app.status, 'PENDING', 'status')
    })

    await check('ADMIN APPROVED karari ok:true dondu', async () => {
      if (!applicationId) throw new Error('basvuru ID yok')
      const res = await decideCorporateApplication(prisma, {
        adminUserId,
        applicationId,
        toStatus: 'APPROVED',
        reason: null,
      })
      assertEqual(res.ok, true, 'ok')
      if (res.ok === true) {
        assertEqual(res.application.status, 'APPROVED', 'status')
      }
    })

    await check('durum, decidedAt, decidedByUserId dogru', async () => {
      if (!applicationId) throw new Error('basvuru ID yok')
      const app = await prisma.corporateApplication.findUnique({
        where: { id: applicationId },
        select: { status: true, decidedAt: true, decidedByUserId: true },
      })
      assertTrue(app !== null, 'basvuru bulundu')
      if (app) {
        assertEqual(app.status, 'APPROVED', 'status')
        assertTrue(app.decidedAt instanceof Date, 'decidedAt Date')
        assertEqual(app.decidedByUserId, adminUserId, 'decidedByUserId')
      }
    })

    await check('event kaydi APPROVED ve reason null', async () => {
      if (!applicationId) throw new Error('basvuru ID yok')
      const events = await prisma.corporateApplicationEvent.findMany({
        where: { applicationId },
        select: { fromStatus: true, toStatus: true, actorUserId: true, actorRole: true, reason: true },
      })
      assertEqual(events.length, 1, 'event sayisi')
      const ev = events[0]
      if (ev) {
        assertEqual(ev.fromStatus, 'PENDING', 'fromStatus')
        assertEqual(ev.toStatus, 'APPROVED', 'toStatus')
        assertEqual(ev.actorUserId, adminUserId, 'actorUserId')
        assertEqual(ev.actorRole, 'ADMIN', 'actorRole')
        assertEqual(ev.reason, null, 'reason')
      }
    })

    // --- Senaryo: PENDING -> REJECTED (gerekce trim) ---
    const customer2Original = await prisma.user.findUnique({
      where: { id: customer2UserId },
      select: { role: true },
    })

    await check('REJECTED: bosluklu gerekce trim edilerek kaydedilir', async () => {
      const app = await prisma.corporateApplication.create({
        data: {
          userId: customer2UserId,
          status: 'PENDING',
          companyName: envelope(),
          taxNumber: envelope(),
          taxOffice: envelope(),
          companyAddress: envelope(),
          companyPhone: envelope(),
          authorizedPerson: envelope(),
        },
        select: { id: true },
      })
      rejectedAppId = app.id
      const res = await decideCorporateApplication(prisma, {
        adminUserId,
        applicationId: app.id,
        toStatus: 'REJECTED',
        reason: '   eksik belge   ',
      })
      assertEqual(res.ok, true, 'ok')
      if (res.ok === true) {
        assertEqual(res.application.status, 'REJECTED', 'status')
      }
      const ev = await prisma.corporateApplicationEvent.findMany({
        where: { applicationId: app.id },
        select: { fromStatus: true, toStatus: true, reason: true },
      })
      assertEqual(ev.length, 1, 'event sayisi')
      assertEqual(ev[0]?.fromStatus, 'PENDING', 'fromStatus')
      assertEqual(ev[0]?.toStatus, 'REJECTED', 'toStatus')
      assertEqual(ev[0]?.reason, 'eksik belge', 'reason trim')
    })

    // --- Senaryo: PENDING -> APPROVED -> REVOKED (iki event, sirali) ---
    await check('REVOKED: APPROVED sonrasi iki event sirali ve gerekce trim', async () => {
      const app = await prisma.corporateApplication.create({
        data: {
          userId: customer2UserId,
          status: 'PENDING',
          companyName: envelope(),
          taxNumber: envelope(),
          taxOffice: envelope(),
          companyAddress: envelope(),
          companyPhone: envelope(),
          authorizedPerson: envelope(),
        },
        select: { id: true },
      })
      revokedAppId = app.id

      const approved = await decideCorporateApplication(prisma, {
        adminUserId,
        applicationId: app.id,
        toStatus: 'APPROVED',
        reason: null,
      })
      assertEqual(approved.ok, true, 'approved ok')

      const revoked = await decideCorporateApplication(prisma, {
        adminUserId,
        applicationId: app.id,
        toStatus: 'REVOKED',
        reason: '   politik ihlal   ',
      })
      assertEqual(revoked.ok, true, 'revoked ok')
      if (revoked.ok === true) {
        assertEqual(revoked.application.status, 'REVOKED', 'status')
      }

      // Event sirasini createdAt'e BAGLAMADAN, gecis ciftlerine gore bul.
      const events = await prisma.corporateApplicationEvent.findMany({
        where: { applicationId: app.id },
        select: { fromStatus: true, toStatus: true, reason: true },
      })
      assertEqual(events.length, 2, 'event sayisi')

      const approvedEv = events.filter(
        (e) => e.fromStatus === 'PENDING' && e.toStatus === 'APPROVED'
      )
      const revokedEv = events.filter(
        (e) => e.fromStatus === 'APPROVED' && e.toStatus === 'REVOKED'
      )
      // Her gecis TAM BIR KEZ bulunmali.
      assertEqual(approvedEv.length, 1, 'PENDING->APPROVED adedi')
      assertEqual(revokedEv.length, 1, 'APPROVED->REVOKED adedi')
      assertEqual(approvedEv[0]?.reason, null, 'PENDING->APPROVED reason')
      assertEqual(
        revokedEv[0]?.reason,
        'politik ihlal',
        'APPROVED->REVOKED reason trim'
      )
    })

    // --- Senaryo: kararlar sirasinda firma JSON alanlari ve roller degismemeli ---
    await check('firma JSON alanlari ve kullanici rolleri degismedi', async () => {
      if (!rejectedAppId || !revokedAppId) throw new Error('senaryo basvuru ID yok')

      const before = await prisma.corporateApplication.findUnique({
        where: { id: rejectedAppId },
        select: {
          companyName: true,
          taxNumber: true,
          taxOffice: true,
          companyAddress: true,
          companyPhone: true,
          authorizedPerson: true,
        },
      })
      const after = await prisma.corporateApplication.findUnique({
        where: { id: rejectedAppId },
        select: {
          companyName: true,
          taxNumber: true,
          taxOffice: true,
          companyAddress: true,
          companyPhone: true,
          authorizedPerson: true,
        },
      })
      assertEqual(JSON.stringify(after), JSON.stringify(before), 'firma alanlari sabit')

      const revokedApp = await prisma.corporateApplication.findUnique({
        where: { id: revokedAppId },
        select: {
          companyName: true,
          taxNumber: true,
          taxOffice: true,
          companyAddress: true,
          companyPhone: true,
          authorizedPerson: true,
        },
      })
      // Alan bazinda karsilastirma (JSON anahtar sirasi onemsiz).
      const expected = envelope()
      const envFields = [
        ['companyName', revokedApp?.companyName],
        ['taxNumber', revokedApp?.taxNumber],
        ['taxOffice', revokedApp?.taxOffice],
        ['companyAddress', revokedApp?.companyAddress],
        ['companyPhone', revokedApp?.companyPhone],
        ['authorizedPerson', revokedApp?.authorizedPerson],
      ] as const
      for (const [name, value] of envFields) {
        assertEqual((value as { ciphertext: string }).ciphertext, expected.ciphertext, `${name}.ciphertext`)
        assertEqual((value as { iv: string }).iv, expected.iv, `${name}.iv`)
        assertEqual((value as { tag: string }).tag, expected.tag, `${name}.tag`)
        assertEqual((value as { keyVersion: string }).keyVersion, expected.keyVersion, `${name}.keyVersion`)
      }

      const admin = await prisma.user.findUnique({
        where: { id: adminUserId },
        select: { role: true },
      })
      const customer2 = await prisma.user.findUnique({
        where: { id: customer2UserId },
        select: { role: true },
      })
      assertEqual(admin?.role, 'ADMIN', 'admin role sabit')
      assertEqual(customer2?.role, 'CUSTOMER', 'customer role sabit')
      assertEqual(customer2Original?.role, 'CUSTOMER', 'customer oncesi rol')
    })

    // --- Senaryo: event.create hatasi -> transaction rollback ---
    await check('event.create hata -> UNEXPECTED_ERROR, basvuru PENDING kalir', async () => {
      const app = await prisma.corporateApplication.create({
        data: {
          userId: failUserId,
          status: 'PENDING',
          companyName: envelope(),
          taxNumber: envelope(),
          taxOffice: envelope(),
          companyAddress: envelope(),
          companyPhone: envelope(),
          authorizedPerson: envelope(),
        },
        select: { id: true },
      })
      failAppId = app.id

      const failing = withEventCreateFailure(
        prisma,
        'test: event.create kontrollu hata'
      )
      const res = await decideCorporateApplication(failing.client, {
        adminUserId,
        applicationId: app.id,
        toStatus: 'APPROVED',
        reason: null,
      })
      assertEqual(res.ok, false, 'ok')
      if (res.ok === false) {
        assertEqual(res.reason, 'UNEXPECTED_ERROR', 'reason')
      }
      // Event asamasina tam BIR KEZ ulasilmis olmali (erken baska hata olmasin).
      assertEqual(failing.getCallCount(), 1, 'event.create cagri sayisi')

      // Transaction geri alindi: basvuru hala PENDING, karar alanlari null.
      const after = await prisma.corporateApplication.findUnique({
        where: { id: app.id },
        select: { status: true, decidedAt: true, decidedByUserId: true },
      })
      assertTrue(after !== null, 'basvuru bulundu')
      if (after) {
        assertEqual(after.status, 'PENDING', 'status rollback')
        assertEqual(after.decidedAt, null, 'decidedAt rollback')
        assertEqual(after.decidedByUserId, null, 'decidedByUserId rollback')
      }
      const evCount = await prisma.corporateApplicationEvent.count({
        where: { applicationId: app.id },
      })
      assertEqual(evCount, 0, 'event sayisi rollback')
    })
  } finally {
    // --- Temizlik: event -> basvuru -> kullanici (tam ID'lerle) ---
    const testUserIds = [adminUserId, customerUserId, customer2UserId, failUserId]
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

    // Ortam bayragini geri yukle.
    if (hadFlag) {
      process.env.ENABLE_CORPORATE_APPLICATION = originalFlag
    } else {
      delete process.env.ENABLE_CORPORATE_APPLICATION
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
