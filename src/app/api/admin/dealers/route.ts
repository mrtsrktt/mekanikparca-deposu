import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { DEALER_DISCOUNT_KEYS, DEFAULT_DEALER_DISCOUNTS } from '@/lib/dealerDiscount'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/dealers
 *
 * Bayi (dealerType atanmis) kullanicilari listeler. Her kayit icin tur,
 * uygulanacak indirim orani ve siparis/teklif sayilari doner.
 *
 * - Yalnizca ADMIN erisir.
 * - Indirim oranlari SiteSetting'ten okunur; ayar yoksa varsayilan kullanilir.
 * - Turu olmayan (dealerType=null) kullanicilar listelenmez.
 */
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const users = await prisma.user.findMany({
    where: { dealerType: { not: null } },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      dealerType: true,
      createdAt: true,
      _count: { select: { orders: true, quotes: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Indirim oranlarini tek sorguda coz.
  const keys = [
    DEALER_DISCOUNT_KEYS.WHOLESALER,
    DEALER_DISCOUNT_KEYS.SERVICE,
  ]
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: keys } },
    select: { key: true, value: true },
  })
  const settingMap: Record<string, string | undefined> = {}
  for (const s of settings) settingMap[s.key] = s.value

  const parse = (raw: string | undefined, fallback: number): number => {
    if (raw === undefined || raw === null) return fallback
    const trimmed = String(raw).trim()
    if (trimmed.length === 0) return fallback
    const num = Number(trimmed)
    if (!Number.isFinite(num) || num < 0) return fallback
    return Math.min(num, 100)
  }

  const discountFor = (dealerType: 'WHOLESALER' | 'SERVICE'): number => {
    const key = DEALER_DISCOUNT_KEYS[dealerType]
    return parse(settingMap[key], DEFAULT_DEALER_DISCOUNTS[dealerType])
  }

  const result = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    dealerType: u.dealerType,
    discountPercent:
      u.dealerType === 'WHOLESALER' || u.dealerType === 'SERVICE'
        ? discountFor(u.dealerType)
        : 0,
    orderCount: u._count.orders,
    quoteCount: u._count.quotes,
    createdAt: u.createdAt,
  }))

  return NextResponse.json({ dealers: result })
}
