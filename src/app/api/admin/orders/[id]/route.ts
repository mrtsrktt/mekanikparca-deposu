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
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderId = params.id

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            companyName: true,
            taxNumber: true,
            taxOffice: true,
            role: true
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
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      )
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderId = params.id
    const body = await request.json()
    const { status, trackingNumber, adminNotes, cargoCompany } = body

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes
    if (cargoCompany !== undefined) updateData.cargoCompany = cargoCompany

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
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
                sku: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Sipariş güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Sipariş güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}