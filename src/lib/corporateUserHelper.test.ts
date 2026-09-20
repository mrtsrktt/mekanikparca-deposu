/**
 * corporateUserHelper icin odakli birim testleri (DB'siz).
 *
 * Gercek veritabani BAGLANTISI KURULMAZ. Sahte (fake) bir PrismaClient
 * kullanilir; `corporateApplication.findFirst` cagrisi kaydedilir ve kontrollu
 * bicimde davranir. Boylece servis mantigi DB olmadan dogrulanir.
 *
 * Calistirma:
 *   npx --no-install tsx --conditions=react-server src/lib/corporateUserHelper.test.ts
 */

import { isApprovedCorporateUser } from './corporateUserHelper'

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

/**
 * findFirst cagrisinda kaydedilen arguman.
 */
type RecordedFindFirst = { where: unknown; select: unknown }

/**
 * DB'siz sahte PrismaClient. Yalnizca `corporateApplication.findFirst`
 * desteklenir. `findFirstThrows` true ise kontrollu hata firlatilir.
 */
function makeFakePrisma(opts: {
  /** Donen kayit: undefined => null doner, aksi halde kayit doner. */
  record?: { id: string } | null
  findFirstThrows?: boolean
  recorded?: RecordedFindFirst[]
}): unknown {
  return {
    corporateApplication: {
      findFirst: async (args: unknown) => {
        opts.recorded?.push(args as RecordedFindFirst)
        if (opts.findFirstThrows) {
          throw new Error('test: findFirst kontrollu hata')
        }
        if (opts.record === null || opts.record === undefined) return null
        return opts.record
      },
    },
  }
}

async function main(): Promise<void> {
  const originalFlag = process.env.ENABLE_CORPORATE_APPLICATION

  try {
    await check(
      '1) ozellik bayragi kapaliyken her zaman false doner',
      async () => {
        process.env.ENABLE_CORPORATE_APPLICATION = 'false'
        const recorded: RecordedFindFirst[] = []
        const prisma = makeFakePrisma({
          record: { id: 'app-1' },
          recorded,
        })
        const result = await isApprovedCorporateUser(prisma as never, 'user-1')
        assertEqual(result, false, 'sonuc')
        assertEqual(recorded.length, 0, 'DB sorgusu yapilmamali')
      }
    )

    await check(
      '2) ozellik bayragi hic tanimli degilken false doner (fail-closed)',
      async () => {
        delete process.env.ENABLE_CORPORATE_APPLICATION
        const recorded: RecordedFindFirst[] = []
        const prisma = makeFakePrisma({
          record: { id: 'app-1' },
          recorded,
        })
        const result = await isApprovedCorporateUser(prisma as never, 'user-1')
        assertEqual(result, false, 'sonuc')
        assertEqual(recorded.length, 0, 'DB sorgusu yapilmamali')
      }
    )

    // Bu noktadan sonraki testler bayrak ACIK iken calisir.
    process.env.ENABLE_CORPORATE_APPLICATION = 'true'

    await check('3) userId bosken false doner ve DB sorgusu yapilmaz', async () => {
      const recorded: RecordedFindFirst[] = []
      const prisma = makeFakePrisma({ record: { id: 'app-1' }, recorded })
      const result = await isApprovedCorporateUser(prisma as never, '')
      assertEqual(result, false, 'sonuc')
      assertEqual(recorded.length, 0, 'DB sorgusu yapilmamali')
    })

    await check(
      '4) userId yalnizca boslukken false doner ve DB sorgusu yapilmaz',
      async () => {
        const recorded: RecordedFindFirst[] = []
        const prisma = makeFakePrisma({ record: { id: 'app-1' }, recorded })
        const result = await isApprovedCorporateUser(prisma as never, '   ')
        assertEqual(result, false, 'sonuc')
        assertEqual(recorded.length, 0, 'DB sorgusu yapilmamali')
      }
    )

    await check(
      '5) APPROVED basvuru varken true doner ve sorgu userId + APPROVED icerir',
      async () => {
        const recorded: RecordedFindFirst[] = []
        const prisma = makeFakePrisma({ record: { id: 'app-1' }, recorded })
        const result = await isApprovedCorporateUser(prisma as never, 'user-1')
        assertEqual(result, true, 'sonuc')
        assertEqual(recorded.length, 1, 'findFirst cagrisi')
        const where = recorded[0]?.where as { userId?: string; status?: string }
        assertEqual(where?.userId, 'user-1', 'where.userId')
        assertEqual(where?.status, 'APPROVED', 'where.status')
        const select = recorded[0]?.select as { id?: boolean }
        assertEqual(select?.id, true, 'select.id')
      }
    )

    await check(
      '6) APPROVED basvuru yoksa (null) false doner',
      async () => {
        const recorded: RecordedFindFirst[] = []
        const prisma = makeFakePrisma({ record: null, recorded })
        const result = await isApprovedCorporateUser(prisma as never, 'user-1')
        assertEqual(result, false, 'sonuc')
        assertEqual(recorded.length, 1, 'findFirst cagrisi')
      }
    )

    await check(
      '7) PENDING basvuru false doner (sorgu APPROVED filtreler)',
      async () => {
        // Fake, filtreyi uygulamaz; PENDING icin DB'nin null dondugu varsayilir.
        const prisma = makeFakePrisma({ record: null })
        const result = await isApprovedCorporateUser(prisma as never, 'user-1')
        assertEqual(result, false, 'sonuc')
      }
    )

    await check(
      '8) REJECTED basvuru false doner (sorgu APPROVED filtreler)',
      async () => {
        const prisma = makeFakePrisma({ record: null })
        const result = await isApprovedCorporateUser(prisma as never, 'user-1')
        assertEqual(result, false, 'sonuc')
      }
    )

    await check('9) DB hatasi durumunda false doner (akis kesilmez)', async () => {
      const prisma = makeFakePrisma({
        findFirstThrows: true,
      })
      const result = await isApprovedCorporateUser(prisma as never, 'user-1')
      assertEqual(result, false, 'sonuc')
    })
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
