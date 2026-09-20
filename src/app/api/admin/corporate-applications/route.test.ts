/**
 * GET /api/admin/corporate-applications icin DB'ye BAGLANMAYAN birim testleri.
 *
 * Gercek veritabani, PayTR veya sepet akislarina DOKUNULMAZ. `getServerSession`,
 * `@/lib/prisma` ve `@/lib/featureFlags` modulleri mock'lanir; boylece endpoint'in
 * HTTP durum eslemesi, rol kontrolu, query filtresi ve govde bicimi izole dogrulanir.
 *
 * Calistirma:
 *   npx --no-install tsx --conditions=react-server src/app/api/admin/corporate-applications/route.test.ts
 */

import Module from 'module'

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

// --- Mock durumu (her testte sifirlanir) ---
let mockSession: unknown = { user: { id: 'admin-1', role: 'ADMIN' } }
let mockFlagEnabled = true
let mockFindManyResult: unknown[] = []
let mockFindManyThrows = false
let lastFindManyArgs: unknown = null

// --- Modul mock'lari: Module._load uzerinden yerlestirme ---
interface MockModuleMap {
  [key: string]: unknown
}

const nextAuthMock: MockModuleMap = {
  getServerSession: async () => mockSession,
}

const authMock: MockModuleMap = {
  authOptions: {},
}

const prismaMock: MockModuleMap = {
  prisma: {
    __fake: true,
    corporateApplication: {
      findMany: async (args: unknown) => {
        lastFindManyArgs = args
        if (mockFindManyThrows) throw new Error('test: db kontrollu hata')
        return mockFindManyResult
      },
    },
  },
}

const featureFlagsMock: MockModuleMap = {
  isCorporateApplicationEnabled: () => mockFlagEnabled,
}

const transitionsMock: MockModuleMap = {
  CORPORATE_APPLICATION_STATUSES: ['PENDING', 'APPROVED', 'REJECTED', 'REVOKED'],
  isValidStatus: (status: unknown): boolean =>
    typeof status === 'string' &&
    ['PENDING', 'APPROVED', 'REJECTED', 'REVOKED'].includes(status),
}

const originalLoad = (Module as unknown as { _load: (req: string, parent: unknown, isMain: boolean) => unknown })._load
;(Module as unknown as { _load: (req: string, parent: unknown, isMain: boolean) => unknown })._load =
  function (request: string, parent: unknown, isMain: boolean): unknown {
    if (request === 'next-auth') return nextAuthMock
    if (request === '@/lib/auth') return authMock
    if (request === '@/lib/prisma') return prismaMock
    if (request === '@/lib/featureFlags') return featureFlagsMock
    if (request === '@/lib/corporateApplicationTransitions') return transitionsMock
    return originalLoad(request, parent, isMain)
  }

// Mock'lar kurulduktan SONRA route dinamik olarak yuklenir.
const route = require('./route') as {
  GET: (req: Request) => Promise<Response>
}

function makeRequest(url: string): Request {
  return { url } as unknown as Request
}

async function readJson(res: Response): Promise<Record<string, unknown>> {
  return (await res.json()) as Record<string, unknown>
}

const BASE_URL = 'http://localhost/api/admin/corporate-applications'

async function main(): Promise<void> {
  const originalFlag = process.env.ENABLE_CORPORATE_APPLICATION
  const hadFlag = Object.prototype.hasOwnProperty.call(
    process.env,
    'ENABLE_CORPORATE_APPLICATION'
  )

  try {
    process.env.ENABLE_CORPORATE_APPLICATION = 'true'

    await check('oturum yokken 401 ve Yetkisiz doner', async () => {
      mockSession = null
      const res = await route.GET(makeRequest(BASE_URL))
      assertEqual(res.status, 401, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Yetkisiz', 'error')
    })

    await check('CUSTOMER roluyle 403 ve Yetkisiz erişim doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      const res = await route.GET(makeRequest(BASE_URL))
      assertEqual(res.status, 403, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Yetkisiz erişim', 'error')
    })

    await check('feature flag kapaliyken 404 ve Bulunamadi doner', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = false
      const res = await route.GET(makeRequest(BASE_URL))
      assertEqual(res.status, 404, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Bulunamadı', 'error')
    })

    await check('ADMIN ile 200 ve applications listesi doner', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = true
      mockFindManyThrows = false
      const now = new Date('2026-01-01T00:00:00Z')
      mockFindManyResult = [
        {
          id: 'app-1',
          userId: 'user-1',
          status: 'PENDING',
          submittedAt: now,
          decidedAt: null,
          createdAt: now,
          updatedAt: now,
          user: { id: 'user-1', name: 'Ali', email: 'ali@example.com', phone: '555' },
        },
      ]
      const res = await route.GET(makeRequest(BASE_URL))
      assertEqual(res.status, 200, 'status')
      const json = await readJson(res)
      const apps = json.applications as unknown[]
      assertTrue(Array.isArray(apps), 'applications dizi')
      assertEqual(apps.length, 1, 'applications uzunluk')
      const app = apps[0] as Record<string, unknown>
      assertEqual(app.id, 'app-1', 'application.id')
      assertEqual(app.status, 'PENDING', 'application.status')
      assertTrue(typeof app.user === 'object' && app.user !== null, 'application.user nesne')
      // Filtre yoksa where undefined olmali.
      const args = lastFindManyArgs as { where?: unknown; orderBy?: { createdAt?: string } }
      assertEqual(args?.where, undefined, 'where filtresiz')
      assertEqual(args?.orderBy?.createdAt, 'desc', 'orderBy.createdAt')
    })

    await check('?status=PENDING ile filtre uygulanir', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = true
      mockFindManyThrows = false
      mockFindManyResult = []
      const res = await route.GET(makeRequest(`${BASE_URL}?status=PENDING`))
      assertEqual(res.status, 200, 'status')
      const args = lastFindManyArgs as { where?: { status?: string } }
      assertEqual(args?.where?.status, 'PENDING', 'where.status')
    })

    await check('gecersiz ?status degeri filtre uygulamaz', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = true
      mockFindManyThrows = false
      mockFindManyResult = []
      const res = await route.GET(makeRequest(`${BASE_URL}?status=HACK`))
      assertEqual(res.status, 200, 'status')
      const args = lastFindManyArgs as { where?: unknown }
      assertEqual(args?.where, undefined, 'gecersiz status filtrelenmemeli')
    })

    await check('veritabani hatasinda 500 doner', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = true
      mockFindManyThrows = true
      const res = await route.GET(makeRequest(BASE_URL))
      assertEqual(res.status, 500, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Sunucu hatası', 'error')
      mockFindManyThrows = false
    })
  } finally {
    if (hadFlag) {
      process.env.ENABLE_CORPORATE_APPLICATION = originalFlag
    } else {
      delete process.env.ENABLE_CORPORATE_APPLICATION
    }
    ;(Module as unknown as { _load: unknown })._load = originalLoad
  }

  console.log(`\nSONUC: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    process.exitCode = 1
  }
}

main().catch((e) => {
  console.error('BEKLENMEYEN HATA:', e instanceof Error ? e.message : String(e))
  process.exitCode = 1
})