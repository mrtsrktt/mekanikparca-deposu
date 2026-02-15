import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Tüm teklif taleplerini listele (admin)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })
  }

  const quotes = await (prisma as any).quoteRequest.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, companyName: true } },
      items: {
        include: {
          product: { include: { images: { take: 1 }, brand: true } }
        }
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(quotes)
}

// POST: Admin tarafından manuel teklif oluştur
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })
  }

  const body = await req.json()
  const { customerName, customerEmail, customerPhone, customerCompany, adminNote, items } = body

  if (!customerName) {
    return NextResponse.json({ error: 'Müşteri adı gerekli.' }, { status: 400 })
  }
  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'En az bir ürün ekleyin.' }, { status: 400 })
  }

  // Teklif numarası oluştur
  const count = await (prisma as any).quoteRequest.count()
  const quoteNumber = `TKL-${String(count + 1).padStart(5, '0')}`

  const quote = await (prisma as any).quoteRequest.create({
    data: {
      quoteNumber,
      customerName,
      customerEmail: customerEmail || null,
      customerPhone: customerPhone || null,
      customerCompany: customerCompany || null,
      adminNote: adminNote || null,
      status: 'QUOTED',
      isManual: true,
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice != null ? item.unitPrice : null,
          note: item.note || null,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: { include: { images: { take: 1 }, brand: true } }
        }
      },
    },
  })

  return NextResponse.json(quote)
}
