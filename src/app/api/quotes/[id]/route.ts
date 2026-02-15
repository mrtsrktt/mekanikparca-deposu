import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Tek teklif detayı (müşteri kendi teklifini görür)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 })
  }

  const quote = await (prisma as any).quoteRequest.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: { include: { images: { take: 1 }, brand: true, category: true } }
        }
      },
      user: { select: { name: true, email: true, phone: true, companyName: true } },
    },
  })

  if (!quote) {
    return NextResponse.json({ error: 'Teklif bulunamadı.' }, { status: 404 })
  }

  // Müşteri sadece kendi teklifini görebilir, admin hepsini görebilir
  if (quote.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkiniz yok.' }, { status: 403 })
  }

  return NextResponse.json(quote)
}
