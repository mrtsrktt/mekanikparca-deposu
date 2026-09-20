/**
 * GET /api/admin/corporate-applications/[id] icin DB'ye BAGLANMAYAN birim testleri.
 *
 * Gercek veritabani, PayTR veya sepet akislarina DOKUNULMAZ. `getServerSession`,
 * `@/lib/prisma`, `@/lib/featureFlags` ve `@/lib/corporateCrypto` modulleri mock'lanir;
 * boylece endpoint'in HTTP durum eslemesi, rol kontrolu, kayit bulunamama durumu ve
 * sifre cozumleme davranisi izole dogrulanir.
 *
 * Calistirma:
 *   npx --no-install tsx --conditions=react-server "src/app/api/admin/corporate-applications/[id]/route.test.ts"
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
let mockFindUniqueResult: unknown = null
let mockFindUniqueThrows = false
let mockDecryptThrows = false
let lastFindUniqueArgs: unknown = null
let lastDecryptEnvelope: unknown = null
let mockDecisionResult: unknown = { ok: true, application: { id: 'app-1', status: 'APPROVED', decidedAt: new Date('2026-01-01T00:00:00Z') } }
let mockDecisionThrows = false
let lastDecisionInput: unknown = null
let lastDecisionPrisma: unknown = null

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
      findUnique: async (args: unknown) => {
        lastFindUniqueArgs = args
        if (mockFindUniqueThrows) throw new Error('test: db kontrollu hata')
        return mockFindUniqueResult
      },
    },
  },
}

const featureFlagsMock: MockModuleMap = {
  isCorporateApplicationEnabled: () => mockFlagEnabled,
}

const cryptoMock: MockModuleMap = {
  // decryptField SENKRON. Basarili durumda duz metin doner, hata durumunda firlatir.
  decryptField: (envelope: unknown) => {
    lastDecryptEnvelope = envelope
    if (mockDecryptThrows) {
      throw new Error('test: CORPORATE_ENC_KEY_V1 tanimli degil.')
    }
    const env = envelope as { plaintext?: string } | null
    return typeof env?.plaintext === 'string' ? env.plaintext : 'cozulmus-deger'
  },
}

const decisionServiceMock: MockModuleMap = {
  decideCorporateApplication: async (prisma: unknown, input: unknown) => {
    lastDecisionPrisma = prisma
    lastDecisionInput = input
    if (mockDecisionThrows) throw new Error('test: karar servisi kontrollu hata')
    return mockDecisionResult
  },
}
const originalLoad = (Module as unknown as { _load: (req: string, parent: unknown, isMain: boolean) => unknown })._load
;(Module as unknown as { _load: (req: string, parent: unknown, isMain: boolean) => unknown })._load =
  function (request: string, parent: unknown, isMain: boolean): unknown {
    if (request === 'next-auth') return nextAuthMock
    if (request === '@/lib/auth') return authMock
    if (request === '@/lib/prisma') return prismaMock
    if (request === '@/lib/featureFlags') return featureFlagsMock
    if (request === '@/lib/corporateCrypto') return cryptoMock
    if (request === '@/lib/corporateApplicationDecisionService') return decisionServiceMock
    return originalLoad(request, parent, isMain)  }

// Mock'lar kurulduktan SONRA route dinamik olarak yuklenir.
const route = require('./route') as {
  GET: (
    req: Request,
    ctx: { params: { id: string } }
  ) => Promise<Response>
  PATCH: (
    req: Request,
    ctx: { params: { id: string } }
  ) => Promise<Response>
}

function makeRequest(url: string): Request {
  return { url } as unknown as Request
}

/** PATCH icin req.json() saglayan sahte istek. body === null ise json() firlatir. */
function makeJsonRequest(url: string, body: unknown): Request {
  return {
    url,
    json: async () => {
      if (body === null) throw new Error('test: bozuk JSON')
      return body
    },
  } as unknown as Request
}
async function readJson(res: Response): Promise<Record<string, unknown>> {
  return (await res.json()) as Record<string, unknown>
}

const BASE_URL = 'http://localhost/api/admin/corporate-applications/app-1'

/** Sifreli zarf taslagi: mock decryptField icin plaintext tasir. */
function envelope(plaintext: string): Record<string, unknown> {
  return {
    ciphertext: `ct-${plaintext}`,
    iv: 'aXY=',
    tag: 'dGFn',
    keyVersion: 'V1',
    plaintext,
  }
}

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
      const res = await route.GET(makeRequest(BASE_URL), { params: { id: 'app-1' } })
      assertEqual(res.status, 401, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Yetkisiz', 'error')
    })

    await check('CUSTOMER roluyle 403 ve Yetkisiz erişim doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      const res = await route.GET(makeRequest(BASE_URL), { params: { id: 'app-1' } })
      assertEqual(res.status, 403, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Yetkisiz erişim', 'error')
    })

    await check('feature flag kapaliyken 404 ve Bulunamadi doner', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = false
      const res = await route.GET(makeRequest(BASE_URL), { params: { id: 'app-1' } })
      assertEqual(res.status, 404, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Bulunamadı', 'error')
    })

    await check('bilinmeyen ID icin 404 ve Başvuru bulunamadı doner', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = true
      mockFindUniqueThrows = false
      mockFindUniqueResult = null
      const res = await route.GET(makeRequest(BASE_URL), { params: { id: 'yok' } })
      assertEqual(res.status, 404, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Başvuru bulunamadı', 'error')
      const args = lastFindUniqueArgs as { where?: { id?: string } }
      assertEqual(args?.where?.id, 'yok', 'where.id')
    })

    await check('gecersiz (bos) ID icin 404 ve Başvuru bulunamadı doner', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = true
      const res = await route.GET(makeRequest(BASE_URL), { params: { id: '   ' } })
      assertEqual(res.status, 404, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Başvuru bulunamadı', 'error')
    })

    await check('basarili durumda 200, cozulmus firma alanlari ve iliskili veriler doner', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = true
      mockFindUniqueThrows = false
      mockDecryptThrows = false
      const now = new Date('2026-01-01T00:00:00Z')
      mockFindUniqueResult = {
        id: 'app-1',
        userId: 'user-1',
        status: 'PENDING',
        submittedAt: now,
        decidedAt: null,
        decidedById: null,
        createdAt: now,
        updatedAt: now,
        companyName: envelope('ACME Ltd.'),
        taxNumber: envelope('1234567890'),
        taxOffice: envelope('Kadikoy'),
        companyAddress: envelope('Istanbul'),
        companyPhone: envelope('02121234567'),
        authorizedPerson: envelope('Ayse Yilmaz'),
        user: { id: 'user-1', name: 'Ali', email: 'ali@example.com', phone: '555' },
        decidedBy: null,
        events: [
          {
            id: 'ev-1',
            status: 'PENDING',
            createdAt: now,
            actor: { id: 'admin-1', name: 'Admin', email: 'admin@example.com' },
          },
        ],
      }
      const res = await route.GET(makeRequest(BASE_URL), { params: { id: 'app-1' } })
      assertEqual(res.status, 200, 'status')
      const json = await readJson(res)
      const app = json.application as Record<string, unknown>
      assertTrue(typeof app === 'object' && app !== null, 'application nesne')
      assertEqual(app.id, 'app-1', 'application.id')
      assertEqual(app.status, 'PENDING', 'application.status')
      // Cozulmus duz metin alanlar yerinde olmali.
      assertEqual(app.companyName, 'ACME Ltd.', 'companyName')
      assertEqual(app.taxNumber, '1234567890', 'taxNumber')
      assertEqual(app.taxOffice, 'Kadikoy', 'taxOffice')
      assertEqual(app.companyAddress, 'Istanbul', 'companyAddress')
      assertEqual(app.companyPhone, '02121234567', 'companyPhone')
      assertEqual(app.authorizedPerson, 'Ayse Yilmaz', 'authorizedPerson')
      // Sifreli zarflar SIZMAMALI.
      assertTrue(
        typeof app.companyName === 'string',
        'companyName duz metin olmali (zarf degil)'
      )
      // Iliskili kullanici ve olaylar donmeli.
      const user = app.user as Record<string, unknown>
      assertEqual(user.id, 'user-1', 'user.id')
      assertEqual(user.email, 'ali@example.com', 'user.email')
      const events = app.events as unknown[]
      assertTrue(Array.isArray(events), 'events dizi')
      assertEqual(events.length, 1, 'events uzunluk')
      // findUnique include ile dogru sekilde cagrilmali.
      const args = lastFindUniqueArgs as {
        where?: { id?: string }
        include?: { user?: unknown; decidedByUser?: unknown; events?: unknown }
      }
      assertEqual(args?.where?.id, 'app-1', 'where.id')
      assertTrue(args?.include?.user !== undefined, 'include.user')
      assertTrue(args?.include?.decidedByUser !== undefined, 'include.decidedByUser')
      assertTrue(args?.include?.events !== undefined, 'include.events')
      // decryptField cagrilmis olmali.
      assertTrue(lastDecryptEnvelope !== null, 'decryptField cagrildi')
    })

    await check('sifre cozme hatasinda 500 ve Sunucu hatası doner', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = true
      mockFindUniqueThrows = false
      mockDecryptThrows = true
      const now = new Date('2026-01-01T00:00:00Z')
      mockFindUniqueResult = {
        id: 'app-1',
        userId: 'user-1',
        status: 'PENDING',
        submittedAt: now,
        decidedAt: null,
        decidedById: null,
        createdAt: now,
        updatedAt: now,
        companyName: envelope('ACME Ltd.'),
        taxNumber: envelope('1234567890'),
        taxOffice: envelope('Kadikoy'),
        companyAddress: envelope('Istanbul'),
        companyPhone: envelope('02121234567'),
        authorizedPerson: envelope('Ayse Yilmaz'),
        user: { id: 'user-1', name: 'Ali', email: 'ali@example.com', phone: '555' },
        decidedBy: null,
        events: [],
      }
      const res = await route.GET(makeRequest(BASE_URL), { params: { id: 'app-1' } })
      assertEqual(res.status, 500, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Sunucu hatası', 'error')
      // Cozulmus veri donmemeli.
      assertTrue(!('application' in json), 'hata durumunda application donmemeli')
      mockDecryptThrows = false
    })

    await check('veritabani hatasinda 500 ve Sunucu hatası doner', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = true
      mockDecryptThrows = false
      mockFindUniqueThrows = true
      const res = await route.GET(makeRequest(BASE_URL), { params: { id: 'app-1' } })
      assertEqual(res.status, 500, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Sunucu hatası', 'error')
      mockFindUniqueThrows = false
    })

    // --- PATCH testleri ---

    await check('PATCH: oturum yokken 401 ve Yetkisiz doner', async () => {
      mockSession = null
      const res = await route.PATCH(
        makeJsonRequest(BASE_URL, { toStatus: 'APPROVED' }),
        { params: { id: 'app-1' } }
      )
      assertEqual(res.status, 401, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Yetkisiz', 'error')
    })

    await check('PATCH: CUSTOMER roluyle 403 ve Yetkisiz erişim doner', async () => {
      mockSession = { user: { id: 'user-1', role: 'CUSTOMER' } }
      const res = await route.PATCH(
        makeJsonRequest(BASE_URL, { toStatus: 'APPROVED' }),
        { params: { id: 'app-1' } }
      )
      assertEqual(res.status, 403, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Yetkisiz erişim', 'error')
    })

    await check('PATCH: feature flag kapaliyken 404 ve Bulunamadi doner', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = false
      const res = await route.PATCH(
        makeJsonRequest(BASE_URL, { toStatus: 'APPROVED' }),
        { params: { id: 'app-1' } }
      )
      assertEqual(res.status, 404, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Bulunamadı', 'error')
    })

    await check('PATCH: bozuk JSON icin 400 ve Geçersiz istek gövdesi doner', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = true
      const res = await route.PATCH(makeJsonRequest(BASE_URL, null), {
        params: { id: 'app-1' },
      })
      assertEqual(res.status, 400, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Geçersiz istek gövdesi', 'error')
    })

    await check('PATCH: gecersiz durum gecisinde 400 ve gecis/gerekce hatasi doner', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = true
      mockDecisionThrows = false
      mockDecisionResult = { ok: false, reason: 'INVALID_TRANSITION' }
      const res = await route.PATCH(
        makeJsonRequest(BASE_URL, { toStatus: 'APPROVED', reason: null }),
        { params: { id: 'app-1' } }
      )
      assertEqual(res.status, 400, 'status')
      const json = await readJson(res)
      assertEqual(
        json.error,
        'Geçersiz durum geçişi veya eksik gerekçe',
        'error'
      )
    })

    await check('PATCH: eszamanli cakismada 409 ve cakisma hatasi doner', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = true
      mockDecisionThrows = false
      mockDecisionResult = { ok: false, reason: 'CONFLICT' }
      const res = await route.PATCH(
        makeJsonRequest(BASE_URL, { toStatus: 'APPROVED' }),
        { params: { id: 'app-1' } }
      )
      assertEqual(res.status, 409, 'status')
      const json = await readJson(res)
      assertEqual(
        json.error,
        'Başvuru durumu eşzamanlı bir işlemle değişti',
        'error'
      )
    })

    await check('PATCH: basarili APPROVED kararinda 200 ve application doner', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = true
      mockDecisionThrows = false
      const decidedAt = new Date('2026-02-01T00:00:00Z')
      mockDecisionResult = {
        ok: true,
        application: { id: 'app-1', status: 'APPROVED', decidedAt },
      }
      lastDecisionInput = null
      lastDecisionPrisma = null
      const res = await route.PATCH(
        makeJsonRequest(BASE_URL, { toStatus: 'APPROVED', reason: null }),
        { params: { id: 'app-1' } }
      )
      assertEqual(res.status, 200, 'status')
      const json = await readJson(res)
      const app = json.application as Record<string, unknown>
      assertEqual(app.id, 'app-1', 'application.id')
      assertEqual(app.status, 'APPROVED', 'application.status')
      // Servis, prisma ve dogru girdiyle cagrilmis olmali.
      assertTrue(lastDecisionPrisma !== null, 'servis prisma ile cagrildi')
      const input = lastDecisionInput as {
        adminUserId?: string
        applicationId?: string
        toStatus?: unknown
        reason?: unknown
      }
      assertEqual(input?.adminUserId, 'admin-1', 'input.adminUserId')
      assertEqual(input?.applicationId, 'app-1', 'input.applicationId')
      assertEqual(input?.toStatus, 'APPROVED', 'input.toStatus')
      assertEqual(input?.reason, null, 'input.reason')
    })

    await check('PATCH: basarili REJECTED kararinda 200 ve gerekce servise iletilir', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = true
      mockDecisionThrows = false
      const decidedAt = new Date('2026-02-02T00:00:00Z')
      mockDecisionResult = {
        ok: true,
        application: { id: 'app-1', status: 'REJECTED', decidedAt },
      }
      lastDecisionInput = null
      const res = await route.PATCH(
        makeJsonRequest(BASE_URL, {
          toStatus: 'REJECTED',
          reason: 'Belgeler eksik',
        }),
        { params: { id: 'app-1' } }
      )
      assertEqual(res.status, 200, 'status')
      const json = await readJson(res)
      const app = json.application as Record<string, unknown>
      assertEqual(app.status, 'REJECTED', 'application.status')
      const input = lastDecisionInput as {
        toStatus?: unknown
        reason?: unknown
      }
      assertEqual(input?.toStatus, 'REJECTED', 'input.toStatus')
      assertEqual(input?.reason, 'Belgeler eksik', 'input.reason')
    })

    await check('PATCH: karar servisi beklenmeyen hata firlatirsa 500 ve Sunucu hatası doner', async () => {
      mockSession = { user: { id: 'admin-1', role: 'ADMIN' } }
      mockFlagEnabled = true
      mockDecisionThrows = true
      const res = await route.PATCH(
        makeJsonRequest(BASE_URL, { toStatus: 'APPROVED' }),
        { params: { id: 'app-1' } }
      )
      assertEqual(res.status, 500, 'status')
      const json = await readJson(res)
      assertEqual(json.error, 'Sunucu hatası', 'error')
      mockDecisionThrows = false
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