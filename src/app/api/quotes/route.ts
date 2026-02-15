import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Kullanıcının kendi tekliflerini listele
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 })
  }

  const quotes = await (prisma as any).quoteRequest.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: { include: { images: { take: 1 }, brand: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(quotes)
}

// POST: Yeni teklif talebi oluştur
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Teklif isteyebilmek için giriş yapmalısınız.' }, { status: 401 })
  }

  const body = await req.json()
  const { items, message } = body

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'En az bir ürün eklemelisiniz.' }, { status: 400 })
  }

  // Validate items
  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity < 1) {
      return NextResponse.json({ error: 'Geçersiz ürün veya miktar.' }, { status: 400 })
    }
  }

  // Generate quote number
  const count = await (prisma as any).quoteRequest.count()
  const quoteNumber = `TKL-${String(count + 1).padStart(5, '0')}`

  const quote = await (prisma as any).quoteRequest.create({
    data: {
      quoteNumber,
      userId: session.user.id,
      message: message || null,
      status: 'PENDING',
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      items: { include: { product: true } },
    },
  })

  return NextResponse.json(quote, { status: 201 })
}
