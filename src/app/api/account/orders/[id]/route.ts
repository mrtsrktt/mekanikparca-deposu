import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderId = params.id

    const order = await prisma.order.findUnique({
      where: { 
        id: orderId,
        userId: session.user.id // Sadece kendi siparişini görebilir
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
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
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Sipariş detayı getirilirken hata:', error)
    return NextResponse.json(
      { error: 'Sipariş detayı alınamadı' },
      { status: 500 }
    )
  }
}