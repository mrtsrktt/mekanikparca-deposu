/**
 * GET /api/corporate/dealer-info
 *
 * Oturumdaki kullanicinin bayi bilgisini doner:
 *   { dealer: { dealerType, discountPercent } | null }
 *
 * Kurallar:
 * - Ozellik bayragi kapaliysa 404 (varlik sizdirilmaz).
 * - Oturum yoksa 401.
 * - Onayli bayi degilse veya turu atanmamissa `{ dealer: null }` + 200.
 * - Indirim orani SiteSetting'ten okunur; admin degistirince bir sonraki
 *   istekte yeni deger doner (cache yok).
 * - Hata durumunda `{ dealer: null }` + 200 doner; musteri deneyimi kesilmez.
 */
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isCorporateApplicationEnabled } from '@/lib/featureFlags'
import { getDealerInfo } from '@/lib/dealerDiscount'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  if (!isCorporateApplicationEnabled()) {
    return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  }

  const dealer = await getDealerInfo(prisma, session.user.id)
  return NextResponse.json({ dealer }, { status: 200 })
}
