/**
 * GET /api/corporate/dealer-info
 *
 * Oturumdaki kullanicinin bayi bilgisini doner:
 *   { dealer: { dealerType, discountPercent, creditLimit, usedCredit, availableCredit } | null }
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
import { calculateCreditStatus } from '@/lib/corporateCreditService'

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
  if (!dealer) {
    return NextResponse.json({ dealer: null }, { status: 200 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { creditLimit: true },
    })

    const unpaid = await prisma.order.aggregate({
      where: {
        userId: session.user.id,
        paymentMethod: 'CARI',
        paymentStatus: 'PENDING',
        status: { not: 'CANCELLED' },
      },
      _sum: { totalAmount: true },
    })

    const creditLimit = user?.creditLimit ?? 0
    const usedCredit = unpaid._sum.totalAmount ?? 0
    const creditStatus = calculateCreditStatus(creditLimit, usedCredit, 0)

    return NextResponse.json(
      {
        dealer: {
          ...dealer,
          creditLimit: creditStatus.creditLimit,
          usedCredit: creditStatus.usedCredit,
          availableCredit: creditStatus.availableCredit,
        },
      },
      { status: 200 }
    )
  } catch {
    return NextResponse.json({ dealer }, { status: 200 })
  }
}
