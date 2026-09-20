/**
 * POST /api/corporate/application icin DB'ye BAGLANMAYAN birim testleri.
 *
 * Gercek veritabani, PayTR veya sepet akislarina DOKUNULMAZ. `getServerSession`,
 * `@/lib/prisma` ve `createCorporateApplication` modulleri mock'lanir; boylece
 * endpoint'in HTTP durum eslemesi ve govde bicimi izole dogrulanir.
 *
 * Calistirma:
 *   npx --no-install tsx --conditions=react-server src/app/api/corporate/application/route.test.ts
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
let mockSession: unknown = { user: { id: 'user-1', role: 'CUSTOMER' } }
let mockFlagEnabled = true
let mockResult: unknown = { ok: true, application: { id: 'app-1', status: 'PENDING', createdAt: new Date(), submittedAt: new Date() } }
let mockResultThrows = false
let lastServiceArgs: unknown = null

// --- Modul mock'lari: require.cache'e elle yerlestirme ---
interface MockModuleMap {
  [key: string]: unknown
}

function installMocks(): void {
  const requireFn = Module.prototype.require as unknown as (
    id: string
  ) => unknown
  void requireFn
}

// next-auth mock
const nextAuthMock: MockModuleMap = {
  getServerSession: async () => mockSession,
}

const authMock: MockModuleMap = {
  authOptions: {},
}

let mockFindFirstResult: unknown = null
let mockFindFirstThrows = false
let lastFindFirstArgs: unknown = null

const prismaMock: MockModuleMap = {
  prisma: {
    __fake: true,
    corporateApplication: {
      findFirst: async (args: unknown) => {
        lastFindFirstArgs = args
        if (mockFindFirstThrows) throw new Error('test: db kontrollu hata')
        return mockFindFirstResult
      },
    },
  },
}

const featureFlagsMock: MockModuleMap = {
  isCorporateApplicationEnabled: () => mockFlagEnabled,
}

const serviceMock: MockModuleMap = {
  createCorporateApplication: async (_prisma: unknown, args: unknown) => {
    lastServiceArgs = args
    if (mockResultThrows) throw new Error('test: servis kontrollu hata')
    return mockResult
  },
}

const originalLoad = (Module as unknown as { _load: (req: string, parent: unknown, isMain: boolean) => unknown })._load
;(Module as unknown as { _load: (req: string, parent: unknown, isMain: boolean) => unknown })._load =
  function (request: string, parent: unknown, isMain: boolean): unknown {
    if (request === 'next-auth') return nextAuthMock
    if (request === '@/lib/auth') return authMock
    if (request === '@/lib/prisma') return prismaMock
    if (request === '@/lib/featureFlags') return featureFlagsMock
    if (request === '@/lib/corporateApplicationService') return serviceMock
    return originalLoad(request, parent, isMain)
  }

// Mock'lar kurulduktan SONRA route dinamik olarak yuklenir.
const route = require('./route') as {
  GET: () => Promise<Response>
  POST: (req: Request) => Promise<Response>
}

function makeRequest(body: string, invalidJson = false): Request {
  return {
    json: async () => {
      if (invalidJson) throw new SyntaxError('Unexpected token')
      return JSON.parse(body)
    },
  } as unknown as Request
}

async function readJson(res: Response): Promise<Record<string, unknown>> {
  return (await res.json()) as Record<string, unknown>
}

async function main(): Promise<void> {
  const originalFlag = process.env.ENABLE_CORPORATE_APPLICATION
  const hadFlag = Object.prototype.hasOwnProperty.call(
    process.env,
    'ENABLE_CORPORATE_APPLICATION'
  )

  try {
    process.env.ENABLE_CORPORATE_APPLICATION = 'true'

    // --- GET /api/corporate/application ---

    await check('GET: oturum yokken 401 ve Yetkisiz doner', async () => {
      mockSession = null
      const res = await route.GET()
      assertEqual(res.status, 401, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Yetkisiz', 'error')
    })

    await check('GET: feature flag kapaliyken 404 ve Bulunamadi doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = false
      const res = await route.GET()
      assertEqual(res.status, 404, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Bulunamadı', 'error')
    })

    await check('GET: basvuru yokken 200 ve application null', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = true
      mockFindFirstThrows = false
      mockFindFirstResult = null
      const res = await route.GET()
      assertEqual(res.status, 200, 'status')
      const json = await readJson(res)
      assertTrue('application' in json, 'application alani var')
      assertEqual(json.application, null, 'application')
    })

    await check('GET: basvuru varken 200 ve yalnizca izinli alanlar', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = true
      mockFindFirstThrows = false
      const now = new Date('2026-01-01T00:00:00Z')
      mockFindFirstResult = {
        id: 'app-1',
        status: 'PENDING',
        submittedAt: now,
        decidedAt: null,
        createdAt: now,
        updatedAt: now,
      }
      const res = await route.GET()
      assertEqual(res.status, 200, 'status')
      const json = await readJson(res)
      const app = json.application as Record<string, unknown>
      assertTrue(typeof app === 'object' && app !== null, 'application nesne')
      assertEqual(app.id, 'app-1', 'application.id')
      assertEqual(app.status, 'PENDING', 'application.status')
      assertTrue('submittedAt' in app, 'application.submittedAt')
      assertTrue('decidedAt' in app, 'application.decidedAt')
      assertTrue('createdAt' in app, 'application.createdAt')
      assertTrue('updatedAt' in app, 'application.updatedAt')
      // Sifreli/hassas alanlar SIZMAMALI.
      assertTrue(!('taxNumber' in app), 'taxNumber sizmamali')
      assertTrue(!('taxNumberEncrypted' in app), 'taxNumberEncrypted sizmamali')
      // findFirst dogru filtre/select ile cagrilmali.
      const args = lastFindFirstArgs as {
        where?: { userId?: string }
        orderBy?: { createdAt?: string }
        select?: Record<string, boolean>
      }
      assertEqual(args?.where?.userId, 'user-1', 'findFirst where.userId')
      assertEqual(args?.orderBy?.createdAt, 'desc', 'findFirst orderBy.createdAt')
      assertTrue(args?.select?.id === true, 'select.id')
      assertTrue(!('taxNumber' in (args?.select ?? {})), 'select taxNumber icermemeli')
    })

    await check('GET: veritabani hatasinda 500 doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = true
      mockFindFirstThrows = true
      const res = await route.GET()
      assertEqual(res.status, 500, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Sunucu hatası', 'error')
      mockFindFirstThrows = false
    })

    // --- POST /api/corporate/application ---

    await check('oturum yokken 401 ve Yetkisiz doner', async () => {
      mockSession = null
      const res = await route.POST(makeRequest('{}'))
      assertEqual(res.status, 401, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Yetkisiz', 'error')
    })

    await check('session.user.id yokken 401 doner', async () => {
      mockSession = { user: {} }
      const res = await route.POST(makeRequest('{}'))
      assertEqual(res.status, 401, 'status')
    })

    await check('feature flag kapaliyken 404 ve Bulunamadi doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = false
      const res = await route.POST(makeRequest('{}'))
      assertEqual(res.status, 404, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Bulunamadı', 'error')
    })

    await check('gecersiz formda 400 ve details doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = true
      mockResult = {
        ok: false,
        reason: 'INVALID_INPUT',
        errors: { companyName: ['zorunlu'] },
      }
      const res = await route.POST(makeRequest('{}'))
      assertEqual(res.status, 400, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Geçersiz form verisi', 'error')
      assertTrue(typeof json.details === 'object', 'details nesne')
    })

    await check('bozuk JSON govdesinde 400 doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = true
      const res = await route.POST(makeRequest('', true))
      assertEqual(res.status, 400, 'status')
    })

    await check('CUSTOMER disi rolde 403 doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = true
      mockResult = { ok: false, reason: 'USER_NOT_CUSTOMER' }
      const res = await route.POST(makeRequest('{}'))
      assertEqual(res.status, 403, 'status')
      const json = await readJson(res)
      assertEqual(
        json.error,
        'Yalnızca bireysel müşteriler kurumsal başvuru yapabilir',
        'error'
      )
    })

    await check('USER_NOT_FOUND icin 404 doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = true
      mockResult = { ok: false, reason: 'USER_NOT_FOUND' }
      const res = await route.POST(makeRequest('{}'))
      assertEqual(res.status, 404, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Kullanıcı bulunamadı', 'error')
    })

    await check('aktif basvuru varken 409 doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = true
      mockResult = { ok: false, reason: 'ACTIVE_APPLICATION_EXISTS' }
      const res = await route.POST(makeRequest('{}'))
      assertEqual(res.status, 409, 'status')
      const json = await readJson(res)
      assertEqual(
        json.error,
        'Zaten aktif (beklemede veya onaylanmış) bir başvurunuz bulunmaktadır',
        'error'
      )
    })

    await check('UNEXPECTED_ERROR icin 500 doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = true
      mockResult = { ok: false, reason: 'UNEXPECTED_ERROR' }
      const res = await route.POST(makeRequest('{}'))
      assertEqual(res.status, 500, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Sunucu hatası', 'error')
    })

    await check('servis firlatirsa 500 doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = true
      mockResultThrows = true
      const res = await route.POST(makeRequest('{}'))
      assertEqual(res.status, 500, 'status')
    })

    await check('basarili durumda 201 ve application alanlari', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = true
      mockResultThrows = false
      const now = new Date('2026-01-01T00:00:00Z')
      mockResult = {
        ok: true,
        application: {
          id: 'app-1',
          status: 'PENDING',
          createdAt: now,
          submittedAt: now,
        },
      }
      const res = await route.POST(makeRequest(JSON.stringify({ companyName: 'X' })))
      assertEqual(res.status, 201, 'status')
      const json = await readJson(res)
      const app = json.application as Record<string, unknown>
      assertTrue(typeof app === 'object' && app !== null, 'application nesne')
      assertEqual(app.id, 'app-1', 'application.id')
      assertEqual(app.status, 'PENDING', 'application.status')
      assertTrue('createdAt' in app, 'application.createdAt')
      assertTrue('submittedAt' in app, 'application.submittedAt')
      // Servise dogru userId ve form iletilmeli.
      const args = lastServiceArgs as { userId?: string; form?: unknown }
      assertEqual(args?.userId, 'user-1', 'servis userId')
      assertTrue(typeof args?.form === 'object', 'servis form')
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
