import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Geçici DB bağlantı hatalarına (örn. Neon serverless soğuk başlangıç /
 * "Can't reach database server") karşı kısa retry ile sarmalar.
 * Bağlantı dışındaki hatalarda (validation vb.) hemen yeniden fırlatır.
 */
export async function withDbRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 800): Promise<T> {
  let lastErr: unknown
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      lastErr = err
      const msg = String(err?.message || '')
      const code = err?.code
      const isConnError =
        code === 'P1001' || // Can't reach database server
        code === 'P1002' || // timed out
        code === 'P1017' || // connection closed
        /can't reach database server|connection|timed out|ECONNRESET|ETIMEDOUT/i.test(msg)
      if (!isConnError || attempt === retries - 1) throw err
      // Neon'un uyanması için kısa bekleme (her denemede artar)
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)))
    }
  }
  throw lastErr
}
