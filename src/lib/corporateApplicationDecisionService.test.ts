/**
 * corporateApplicationDecisionService icin odakli birim testleri (DB'siz).
 *
 * Gercek veritabani BAGLANTISI KURULMAZ. Sahte (fake) bir PrismaClient
 * kullanilir; transaction, updateMany ve event.create cagrilari kaydedilir ve
 * kontrollu bicimde davranir. Boylece servis mantigi DB olmadan dogrulanir.
 *
 * Calistirma:
 *   npx --no-install tsx --conditions=react-server src/lib/corporateApplicationDecisionService.test.ts
 */

import {
  decideCorporateApplication,
  type DecideCorporateApplicationInput,
} from './corporateApplicationDecisionService'

let passed = 0
let failed = 0

async function check(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn()
    passed++
    console.log(`PASS  ${name}`)
  } catch (e) {
    failed++
    console.log(`FAIL  ${name}: ${e instanceof Error ? e.message : String(e)}`)
  }
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

/**
 * updateMany cagrisinda kaydedilen veri ve olay cagrisinda kaydedilen veri.
 */
type RecordedUpdate = { where: unknown; data: unknown }
type RecordedEvent = { data: Record<string, unknown> }

/**
 * DB'siz sahte PrismaClient. `$transaction` geri cagriyi dogrudan calistirir;
 * hata firlatilirsa AYNEN yukari tasinir (gercek transaction'in geri alma
 * davranisini taklit etmez; servis mantigini dogrulamak yeterlidir).
 */
function makeFakePrisma(opts: {
  adminRole?: string | null
  applicationStatus?: string | null
  updateCount?: number
  eventCreateThrows?: boolean
  recordedUpdates: RecordedUpdate[]
  recordedEvents: RecordedEvent[]
}): unknown {
  const tx = {
    user: {
      findUnique: async (_args: unknown) => {
        if (opts.adminRole === null) return null
        return { id: 'admin-1', role: opts.adminRole ?? 'ADMIN' }
      },
    },
    corporateApplication: {
      findUnique: async (_args: unknown) => {
        if (opts.applicationStatus === null) return null
        return { id: 'app-1', status: opts.applicationStatus ?? 'PENDING' }
      },
      updateMany: async (args: unknown) => {
        opts.recordedUpdates.push(args as RecordedUpdate)
        const count = opts.updateCount ?? 1
        return { count }
      },
    },
    corporateApplicationEvent: {
      create: async (args: unknown) => {
        if (opts.eventCreateThrows) {
          throw new Error('test: event.create kontrollu hata')
        }
        opts.recordedEvents.push(args as RecordedEvent)
        return { id: 'ev-1' }
      },
    },
  }

  return {
    $transaction: async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx),
  }
}

const BASE_INPUT: DecideCorporateApplicationInput = {
  adminUserId: 'admin-1',
  applicationId: 'app-1',
  toStatus: 'APPROVED',
  reason: null,
}

async function main(): Promise<void> {
  // Ozellik bayragi bu testlerde acik olmali.
  const originalFlag = process.env.ENABLE_CORPORATE_APPLICATION
  process.env.ENABLE_CORPORATE_APPLICATION = 'true'

  try {
    await check(
      '1) REJECTED gerekcesi trim edilerek event reason alanina yazilir',
      async () => {
        const updates: RecordedUpdate[] = []
        const events: RecordedEvent[] = []
        const prisma = makeFakePrisma({
          applicationStatus: 'PENDING',
          recordedUpdates: updates,
          recordedEvents: events,
        })
        const res = await decideCorporateApplication(
          prisma as never,
          { ...BASE_INPUT, toStatus: 'REJECTED', reason: '  eksik belge  ' }
        )
        assertEqual(res.ok, true, 'ok')
        if (res.ok === true) {
          assertEqual(res.application.status, 'REJECTED', 'status')
        }
        assertEqual(events.length, 1, 'event sayisi')
        assertEqual(events[0]?.data.reason, 'eksik belge', 'event reason')
        assertEqual(events[0]?.data.actorRole, 'ADMIN', 'actorRole')
      }
    )

    await check(
      '2) APPROVED gerekcesizse event reason=null olur',
      async () => {
        const updates: RecordedUpdate[] = []
        const events: RecordedEvent[] = []
        const prisma = makeFakePrisma({
          applicationStatus: 'PENDING',
          recordedUpdates: updates,
          recordedEvents: events,
        })
        const res = await decideCorporateApplication(prisma as never, {
          ...BASE_INPUT,
          toStatus: 'APPROVED',
          reason: undefined,
        })
        assertEqual(res.ok, true, 'ok')
        assertEqual(events.length, 1, 'event sayisi')
        assertEqual(events[0]?.data.reason, null, 'event reason')
      }
    )

    await check(
      '3) ADMIN olmayan kullanicida ADMIN_NOT_AUTHORIZED ve hicbir guncelleme/olay yok',
      async () => {
        const updates: RecordedUpdate[] = []
        const events: RecordedEvent[] = []
        const prisma = makeFakePrisma({
          adminRole: 'CUSTOMER',
          applicationStatus: 'PENDING',
          recordedUpdates: updates,
          recordedEvents: events,
        })
        const res = await decideCorporateApplication(prisma as never, BASE_INPUT)
        assertEqual(res.ok, false, 'ok')
        if (res.ok === false) {
          assertEqual(res.reason, 'ADMIN_NOT_AUTHORIZED', 'reason')
        }
        assertEqual(updates.length, 0, 'updateMany cagrisi')
        assertEqual(events.length, 0, 'event olusturma')
      }
    )

    await check(
      '3b) ADMIN kullanicisi yoksa da ADMIN_NOT_AUTHORIZED',
      async () => {
        const updates: RecordedUpdate[] = []
        const events: RecordedEvent[] = []
        const prisma = makeFakePrisma({
          adminRole: null,
          applicationStatus: 'PENDING',
          recordedUpdates: updates,
          recordedEvents: events,
        })
        const res = await decideCorporateApplication(prisma as never, BASE_INPUT)
        assertEqual(res.ok, false, 'ok')
        if (res.ok === false) {
          assertEqual(res.reason, 'ADMIN_NOT_AUTHORIZED', 'reason')
        }
        assertEqual(updates.length, 0, 'updateMany cagrisi')
        assertEqual(events.length, 0, 'event olusturma')
      }
    )

    await check(
      '4) updateMany count=0 ise CONFLICT doner ve event olusturulmaz',
      async () => {
        const updates: RecordedUpdate[] = []
        const events: RecordedEvent[] = []
        const prisma = makeFakePrisma({
          applicationStatus: 'PENDING',
          updateCount: 0,
          recordedUpdates: updates,
          recordedEvents: events,
        })
        const res = await decideCorporateApplication(prisma as never, {
          ...BASE_INPUT,
          toStatus: 'APPROVED',
        })
        assertEqual(res.ok, false, 'ok')
        if (res.ok === false) {
          assertEqual(res.reason, 'CONFLICT', 'reason')
        }
        assertEqual(updates.length, 1, 'updateMany cagrisi')
        assertEqual(events.length, 0, 'event olusturma')
      }
    )

    await check('5) event hatasi UNEXPECTED_ERROR doner', async () => {
      const updates: RecordedUpdate[] = []
      const events: RecordedEvent[] = []
      const prisma = makeFakePrisma({
        applicationStatus: 'PENDING',
        eventCreateThrows: true,
        recordedUpdates: updates,
        recordedEvents: events,
      })
      const res = await decideCorporateApplication(prisma as never, {
        ...BASE_INPUT,
        toStatus: 'APPROVED',
      })
      assertEqual(res.ok, false, 'ok')
      if (res.ok === false) {
        assertEqual(res.reason, 'UNEXPECTED_ERROR', 'reason')
      }
    })

    // Ek: guncelleme where kosulu ID + eski durum icermeli.
    await check(
      '6) updateMany where ID + okunan eski durum kosulunu icerir',
      async () => {
        const updates: RecordedUpdate[] = []
        const events: RecordedEvent[] = []
        const prisma = makeFakePrisma({
          applicationStatus: 'PENDING',
          recordedUpdates: updates,
          recordedEvents: events,
        })
        await decideCorporateApplication(prisma as never, {
          ...BASE_INPUT,
          toStatus: 'APPROVED',
        })
        assertEqual(updates.length, 1, 'updateMany cagrisi')
        const where = updates[0]?.where as { id?: string; status?: string }
        assertEqual(where?.id, 'app-1', 'where.id')
        assertEqual(where?.status, 'PENDING', 'where.status')
        const data = updates[0]?.data as {
          status?: string
          decidedByUserId?: string
          decidedAt?: unknown
        }
        assertEqual(data?.status, 'APPROVED', 'data.status')
        assertEqual(data?.decidedByUserId, 'admin-1', 'data.decidedByUserId')
        assertTrue(data?.decidedAt instanceof Date, 'data.decidedAt')
      }
    )

    // Ek: gecersiz gecis INVALID_TRANSITION doner ve yazim yapilmaz.
    await check(
      '7) gecersiz gecis INVALID_TRANSITION doner, yazim yapilmaz',
      async () => {
        const updates: RecordedUpdate[] = []
        const events: RecordedEvent[] = []
        const prisma = makeFakePrisma({
          applicationStatus: 'APPROVED',
          recordedUpdates: updates,
          recordedEvents: events,
        })
        const res = await decideCorporateApplication(prisma as never, {
          ...BASE_INPUT,
          toStatus: 'APPROVED',
        })
        assertEqual(res.ok, false, 'ok')
        if (res.ok === false) {
          assertEqual(res.reason, 'INVALID_TRANSITION', 'reason')
        }
        assertEqual(updates.length, 0, 'updateMany cagrisi')
        assertEqual(events.length, 0, 'event olusturma')
      }
    )
  } finally {
    // Ortam degiskenini geri yukle.
    if (originalFlag === undefined) {
      delete process.env.ENABLE_CORPORATE_APPLICATION
    } else {
      process.env.ENABLE_CORPORATE_APPLICATION = originalFlag
    }
  }

  console.log(`\nSONUC: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    process.exitCode = 1
  }
}

main().catch(() => {
  console.error('BEKLENMEYEN HATA: test calistirilamadi.')
  process.exitCode = 1
})
