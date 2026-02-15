import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: { include: { images: { take: 1 } } } } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}
