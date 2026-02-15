import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Tek teklif detayı (admin)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })
  }

  const quote = await (prisma as any).quoteRequest.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, companyName: true } },
      items: {
        include: {
          product: { include: { images: { take: 1 }, brand: true, category: true } }
        }
      },
    },
  })

  if (!quote) {
    return NextResponse.json({ error: 'Teklif bulunamadı.' }, { status: 404 })
  }

  return NextResponse.json(quote)
}

// PUT: Teklifi güncelle (admin — fiyat gir, durum değiştir, not ekle)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })
  }

  const body = await req.json()
  const { status, adminNote, items, markAsSent } = body

  const updateData: any = {}
  if (status) updateData.status = status
  if (adminNote !== undefined) updateData.adminNote = adminNote
  if (markAsSent) updateData.sentAt = new Date()

  const quote = await (prisma as any).quoteRequest.update({
    where: { id: params.id },
    data: updateData,
  })

  // Update item prices if provided
  if (items && Array.isArray(items)) {
    for (const item of items) {
      await (prisma as any).quoteItem.update({
        where: { id: item.id },
        data: {
          unitPrice: item.unitPrice ?? null,
          note: item.note ?? null,
        },
      })
    }
  }

  // Return updated quote
  const updated = await (prisma as any).quoteRequest.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, companyName: true } },
      items: {
        include: {
          product: { include: { images: { take: 1 }, brand: true } }
        }
      },
    },
  })

  return NextResponse.json(updated)
}
