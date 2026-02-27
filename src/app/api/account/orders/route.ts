import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
    }

    const orders = await (prisma as any).order.findMany({
      where: {
        userId: session.user.id,
        paymentStatus: 'PAID' // Sadece ödenmiş siparişleri göster
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
                images: {
                  take: 1,
                  select: { url: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error: any) {
    console.error('User orders fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}