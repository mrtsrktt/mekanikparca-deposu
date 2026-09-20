/**
 * GET /api/b2b/quick-order/search icin DB ye BAGLANMAYAN birim testleri.
 *
 * Gercek veritabani, PayTR veya sepet/odeme akislarina DOKUNULMAZ. next-auth,
 * @/lib/prisma, @/lib/featureFlags ve @/lib/corporateUserHelper modulleri
 * mock lanir; boylece endpoint in HTTP durum eslemesi, erisim kontrolu ve govde
 * bicimi izole dogrulanir.
 *
 * Calistirma:
 *   npx --no-install tsx --conditions=react-server src/app/api/b2b/quick-order/search/route.test.ts
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
      `${label}: beklenen ${String(expected)}, gelen ${String(actual)}`
    )
  }
}

function assertTrue(value: boolean, label: string): void {
  if (!value) throw new Error(`${label}: true bekleniyordu`)
}

let mockSession: unknown = { user: { id: 'user-1', role: 'CUSTOMER' } }
let mockFlagEnabled = true
let mockApproved = false
let mockApprovedThrows = false
let lastApprovedArgs: unknown = null

let mockFindManyResult: unknown[] = []
let mockFindManyThrows = false
let lastFindManyArgs: unknown = null

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
    product: {
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

const corporateUserHelperMock: MockModuleMap = {
  isApprovedCorporateUser: async (_prisma: unknown, userId: string) => {
    lastApprovedArgs = { userId }
    if (mockApprovedThrows) throw new Error('test: helper kontrollu hata')
    return mockApproved
  },
}

const originalLoad = (Module as unknown as {
  _load: (req: string, parent: unknown, isMain: boolean) => unknown
})._load
;(Module as unknown as {
  _load: (req: string, parent: unknown, isMain: boolean) => unknown
})._load = function (request: string, parent: unknown, isMain: boolean): unknown {
  if (request === 'next-auth') return nextAuthMock
  if (request === '@/lib/auth') return authMock
  if (request === '@/lib/prisma') return prismaMock
  if (request === '@/lib/featureFlags') return featureFlagsMock
  if (request === '@/lib/corporateUserHelper') return corporateUserHelperMock
  return originalLoad(request, parent, isMain)
}

const route = require('./route') as { GET: (req: Request) => Promise<Response> }

function makeRequest(q: string | null): Request {
  const url =
    q === null
      ? 'http://localhost/api/b2b/quick-order/search'
      : `http://localhost/api/b2b/quick-order/search?q=${encodeURIComponent(q)}`
  return { url } as unknown as Request
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

    await check('1) oturum yokken 401 ve Yetkisiz doner', async () => {
      mockSession = null
      const res = await route.GET(makeRequest('vida'))
      assertEqual(res.status, 401, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Yetkisiz', 'error')
    })

    await check('2) feature flag kapaliyken 404 ve Bulunamadi doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = false
      const res = await route.GET(makeRequest('vida'))
      assertEqual(res.status, 404, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Bulunamadı', 'error')
    })

    await check('3) kurumsal onayi olmayan kullaniciya 403 doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = true
      mockApproved = false
      const res = await route.GET(makeRequest('vida'))
      assertEqual(res.status, 403, 'status')
      const json = await readJson(res)
      assertEqual(
        json.error,
        'Yalnızca onaylı kurumsal müşteriler erişebilir',
        'error'
      )
      const args = lastApprovedArgs as { userId?: string }
      assertEqual(args?.userId, 'user-1', 'helper userId')
    })

    await check('4) ADMIN rolundeki kullanici helper cagrilmadan gecer', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = true
      mockApproved = false
      lastApprovedArgs = null
      mockFindManyResult = []
      const res = await route.GET(makeRequest('vida'))
      assertEqual(res.status, 200, 'status')
      assertEqual(lastApprovedArgs, null, 'helper cagrilmamali')
    })

    await check('5) q 2 karakterden kisa ise bos liste ve DB sorgusu yok', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = true
      mockApproved = true
      lastFindManyArgs = null
      const res = await route.GET(makeRequest('v'))
      assertEqual(res.status, 200, 'status')
      const json = await readJson(res)
      const products = json.products as unknown[]
      assertTrue(Array.isArray(products), 'products dizi')
      assertEqual(products.length, 0, 'products uzunluk')
      assertEqual(lastFindManyArgs, null, 'DB sorgusu yapilmamali')
    })

    await check('6) q yoksa bos liste doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = true
      mockApproved = true
      lastFindManyArgs = null
      const res = await route.GET(makeRequest(null))
      assertEqual(res.status, 200, 'status')
      const json = await readJson(res)
      const products = json.products as unknown[]
      assertEqual(products.length, 0, 'products uzunluk')
      assertEqual(lastFindManyArgs, null, 'DB sorgusu yapilmamali')
    })

    await check(
      '7) onayli kurumsal kullanicida 200 ve urun listesi (stock dahil)',
      async () => {
        mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
        mockFlagEnabled = true
        mockApproved = true
        mockFindManyThrows = false
        mockFindManyResult = [
          {
            id: 'p-1',
            name: 'Vida M6',
            sku: 'VID-M6',
            slug: 'vida-m6',
            priceTRY: 100,
            stock: 42,
            brand: { name: 'Acme' },
            images: [{ url: 'https://cdn/x.jpg' }],
          },
        ]
        const res = await route.GET(makeRequest('vida'))
        assertEqual(res.status, 200, 'status')
        const json = await readJson(res)
        const products = json.products as Array<Record<string, unknown>>
        assertTrue(Array.isArray(products), 'products dizi')
        assertEqual(products.length, 1, 'products uzunluk')
        const p = products[0]
        assertEqual(p.id, 'p-1', 'id')
        assertEqual(p.name, 'Vida M6', 'name')
        assertEqual(p.sku, 'VID-M6', 'sku')
        assertEqual(p.slug, 'vida-m6', 'slug')
        assertEqual(p.priceTRY, 124.8, 'priceTRY')
        assertEqual(p.stock, 42, 'stock')
        const args = lastFindManyArgs as {
          where?: { isActive?: boolean; OR?: unknown[] }
          select?: Record<string, unknown>
          take?: number
          orderBy?: { name?: string }
        }
        assertEqual(args?.where?.isActive, true, 'where.isActive')
        assertTrue(Array.isArray(args?.where?.OR), 'where.OR')
        assertEqual(args?.take, 20, 'take')
        assertEqual(args?.orderBy?.name, 'asc', 'orderBy.name')
        const select = args?.select as { stock?: boolean; sku?: boolean }
        assertEqual(select?.stock, true, 'select.stock')
        assertEqual(select?.sku, true, 'select.sku')
      }
    )

    await check('8) DB hatasi durumunda 500 ve Sunucu hatasi doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = true
      mockApproved = true
      mockFindManyThrows = true
      const res = await route.GET(makeRequest('vida'))
      assertEqual(res.status, 500, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Sunucu hatası', 'error')
    })

    await check('9) helper hata firlatirsa 500 doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      mockFlagEnabled = true
      mockApprovedThrows = true
      const res = await route.GET(makeRequest('vida'))
      assertEqual(res.status, 500, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Sunucu hatası', 'error')
    })
  } finally {
    if (hadFlag) {
      process.env.ENABLE_CORPORATE_APPLICATION = originalFlag
    } else {
      delete process.env.ENABLE_CORPORATE_APPLICATION
    }
    ;(Module as unknown as { _load: unknown })._load = originalLoad
  }

  console.log(`
SONUC: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    process.exitCode = 1
  }
}

main().catch((e) => {
  console.error('BEKLENMEYEN HATA:', e instanceof Error ? e.message : String(e))
  process.exitCode = 1
})