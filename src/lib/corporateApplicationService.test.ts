/**
 * corporateApplicationService icin DB'ye BAGLANMAYAN odakli testler.
 *
 * Kapsam:
 * - Hata kaynagi ayrimi: create'den gelen P2002/userId -> ACTIVE_APPLICATION_EXISTS,
 *   event'den gelen ayni hata -> UNEXPECTED_ERROR.
 * - On kosul kapilari: FEATURE_DISABLED, INVALID_INPUT, USER_NOT_FOUND,
 *   USER_NOT_CUSTOMER, sifreleme anahtari eksik -> UNEXPECTED_ERROR.
 *   Bu durumlarda hangi DB metotlarinin cagrildigi SAYACLARLA dogrulanir.
 *
 * ONEMLI: Bu testler transaction rollback'ini DOGRULAMAZ. Gercek DB'ye baglanmaz.
 *
 * Calistirma:
 *   npx --no-install tsx --conditions=react-server src/lib/corporateApplicationService.test.ts
 */

import { randomBytes } from 'crypto'
import { createCorporateApplication } from './corporateApplicationService'

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

/** Mevcut kesin eslestirmeye uyan P2002/userId hatasi uretir. */
function activeApplicationP2002(): Error {
  const err = new Error('Unique constraint failed') as Error & {
    code?: string
    meta?: { target?: unknown }
  }
  err.code = 'P2002'
  err.meta = { target: ['userId'] }
  return err
}

const VALID_FORM = {
  companyName: 'Test Firma',
  taxNumber: '0123456789',
  taxOffice: 'Test VD',
  companyAddress: 'Test Adres',
  companyPhone: '02120000000',
  authorizedPerson: 'Test Yetkili',
}

const INVALID_FORM = {
  companyName: '',
  taxNumber: '0123456789',
  taxOffice: 'Test VD',
  companyAddress: 'Test Adres',
  companyPhone: '02120000000',
  authorizedPerson: 'Test Yetkili',
}

interface CallCounters {
  userFindUnique: number
  appCreate: number
  eventCreate: number
  transaction: number
}

interface FakeOpts {
  /** user.findUnique sonucu: null ise kullanici yok. */
  user?: { id: string; role: string } | null
  appCreateError?: Error
  eventCreateError?: Error
}

/**
 * Sahte PrismaClient. Cagri sayaclarini tutar; user.findUnique, app.create,
 * event.create ve $transaction davranislari enjekte edilebilir.
 */
function makeFakePrisma(opts: FakeOpts): {
  prisma: unknown
  counters: CallCounters
} {
  const counters: CallCounters = {
    userFindUnique: 0,
    appCreate: 0,
    eventCreate: 0,
    transaction: 0,
  }

  const fakeTx = {
    corporateApplication: {
      create: async () => {
        counters.appCreate++
        if (opts.appCreateError) throw opts.appCreateError
        return {
          id: 'app-1',
          status: 'PENDING',
          createdAt: new Date('2026-01-01T00:00:00Z'),
          submittedAt: new Date('2026-01-01T00:00:00Z'),
        }
      },
    },
    corporateApplicationEvent: {
      create: async () => {
        counters.eventCreate++
        if (opts.eventCreateError) throw opts.eventCreateError
        return { id: 'evt-1' }
      },
    },
  }

  const prisma = {
    user: {
      findUnique: async () => {
        counters.userFindUnique++
        return opts.user === undefined
          ? { id: 'user-1', role: 'CUSTOMER' }
          : opts.user
      },
    },
    $transaction: async (cb: (tx: unknown) => Promise<unknown>) => {
      counters.transaction++
      return cb(fakeTx)
    },
  }

  return { prisma, counters }
}

async function main(): Promise<void> {
  // Test ortam degiskenlerini sakla; finally ile geri yukle.
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

  // Gecici anahtar: her calistirmada rastgele 32 bayt (base64).
  const tempKey = randomBytes(32).toString('base64')

  try {
    // --- Hata kaynagi ayrimi ---

    process.env.ENABLE_CORPORATE_APPLICATION = 'true'
    process.env.CORPORATE_ENC_KEY_V1 = tempKey

    await check(
      'create P2002/userId -> ACTIVE_APPLICATION_EXISTS',
      async () => {
        const { prisma } = makeFakePrisma({
          appCreateError: activeApplicationP2002(),
        })
        const res = await createCorporateApplication(prisma as never, {
          userId: 'user-1',
          form: VALID_FORM,
        })
        assertEqual(res.ok, false, 'ok')
        if (res.ok === false) {
          assertEqual(res.reason, 'ACTIVE_APPLICATION_EXISTS', 'reason')
        }
      }
    )

    await check(
      'event P2002/userId -> UNEXPECTED_ERROR',
      async () => {
        const { prisma } = makeFakePrisma({
          eventCreateError: activeApplicationP2002(),
        })
        const res = await createCorporateApplication(prisma as never, {
          userId: 'user-1',
          form: VALID_FORM,
        })
        assertEqual(res.ok, false, 'ok')
        if (res.ok === false) {
          assertEqual(res.reason, 'UNEXPECTED_ERROR', 'reason')
        }
      }
    )

    await check('mutlu yol -> ok:true (create ve event basarili)', async () => {
      const { prisma, counters } = makeFakePrisma({})
      const res = await createCorporateApplication(prisma as never, {
        userId: 'user-1',
        form: VALID_FORM,
      })
      assertEqual(res.ok, true, 'ok')
      if (res.ok === true) {
        assertEqual(res.application.id, 'app-1', 'id')
        assertEqual(res.application.status, 'PENDING', 'status')
      }
      assertEqual(counters.transaction, 1, 'transaction cagrisi')
      assertEqual(counters.appCreate, 1, 'appCreate cagrisi')
      assertEqual(counters.eventCreate, 1, 'eventCreate cagrisi')
    })

    // --- On kosul kapilari ---

    await check(
      'ozellik kapali -> FEATURE_DISABLED; hicbir DB metodu cagrilmaz',
      async () => {
        process.env.ENABLE_CORPORATE_APPLICATION = 'false'
        const { prisma, counters } = makeFakePrisma({})
        const res = await createCorporateApplication(prisma as never, {
          userId: 'user-1',
          form: VALID_FORM,
        })
        assertEqual(res.ok, false, 'ok')
        if (res.ok === false) {
          assertEqual(res.reason, 'FEATURE_DISABLED', 'reason')
        }
        assertEqual(counters.userFindUnique, 0, 'userFindUnique cagrisi')
        assertEqual(counters.transaction, 0, 'transaction cagrisi')
        assertEqual(counters.appCreate, 0, 'appCreate cagrisi')
        assertEqual(counters.eventCreate, 0, 'eventCreate cagrisi')
      }
    )

    await check(
      'gecersiz form -> INVALID_INPUT; hicbir DB metodu cagrilmaz',
      async () => {
        process.env.ENABLE_CORPORATE_APPLICATION = 'true'
        const { prisma, counters } = makeFakePrisma({})
        const res = await createCorporateApplication(prisma as never, {
          userId: 'user-1',
          form: INVALID_FORM,
        })
        assertEqual(res.ok, false, 'ok')
        if (res.ok === false) {
          assertEqual(res.reason, 'INVALID_INPUT', 'reason')
        }
        assertEqual(counters.userFindUnique, 0, 'userFindUnique cagrisi')
        assertEqual(counters.transaction, 0, 'transaction cagrisi')
        assertEqual(counters.appCreate, 0, 'appCreate cagrisi')
        assertEqual(counters.eventCreate, 0, 'eventCreate cagrisi')
      }
    )

    await check('kullanici yok -> USER_NOT_FOUND; transaction baslamaz', async () => {
      process.env.ENABLE_CORPORATE_APPLICATION = 'true'
      const { prisma, counters } = makeFakePrisma({ user: null })
      const res = await createCorporateApplication(prisma as never, {
        userId: 'user-1',
        form: VALID_FORM,
      })
      assertEqual(res.ok, false, 'ok')
      if (res.ok === false) {
        assertEqual(res.reason, 'USER_NOT_FOUND', 'reason')
      }
      assertEqual(counters.userFindUnique, 1, 'userFindUnique cagrisi')
      assertEqual(counters.transaction, 0, 'transaction cagrisi')
      assertEqual(counters.appCreate, 0, 'appCreate cagrisi')
      assertEqual(counters.eventCreate, 0, 'eventCreate cagrisi')
    })

    await check(
      'kullanici ADMIN -> USER_NOT_CUSTOMER; transaction baslamaz',
      async () => {
        process.env.ENABLE_CORPORATE_APPLICATION = 'true'
        const { prisma, counters } = makeFakePrisma({
          user: { id: 'user-1', role: 'ADMIN' },
        })
        const res = await createCorporateApplication(prisma as never, {
          userId: 'user-1',
          form: VALID_FORM,
        })
        assertEqual(res.ok, false, 'ok')
        if (res.ok === false) {
          assertEqual(res.reason, 'USER_NOT_CUSTOMER', 'reason')
        }
        assertEqual(counters.userFindUnique, 1, 'userFindUnique cagrisi')
        assertEqual(counters.transaction, 0, 'transaction cagrisi')
        assertEqual(counters.appCreate, 0, 'appCreate cagrisi')
        assertEqual(counters.eventCreate, 0, 'eventCreate cagrisi')
      }
    )

    await check(
      'sifreleme anahtari eksik -> UNEXPECTED_ERROR; transaction baslamaz',
      async () => {
        process.env.ENABLE_CORPORATE_APPLICATION = 'true'
        delete process.env.CORPORATE_ENC_KEY_V1
        const { prisma, counters } = makeFakePrisma({})
        const res = await createCorporateApplication(prisma as never, {
          userId: 'user-1',
          form: VALID_FORM,
        })
        assertEqual(res.ok, false, 'ok')
        if (res.ok === false) {
          assertEqual(res.reason, 'UNEXPECTED_ERROR', 'reason')
        }
        assertEqual(counters.userFindUnique, 1, 'userFindUnique cagrisi')
        assertEqual(counters.transaction, 0, 'transaction cagrisi')
        assertEqual(counters.appCreate, 0, 'appCreate cagrisi')
        assertEqual(counters.eventCreate, 0, 'eventCreate cagrisi')
      }
    )
  } finally {
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
  }

  console.log(`\nSONUC: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    process.exitCode = 1
  }
}

main().catch((e) => {
  // Beklenmeyen ana hata: ayrintiyi dokmeden sifirdan farkli cikis kodu ver.
  console.error('BEKLENMEYEN HATA: test calistirilamadi.')
  process.exitCode = 1
})
