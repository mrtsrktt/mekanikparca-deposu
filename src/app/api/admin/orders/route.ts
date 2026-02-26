import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status')
  const paymentStatus = searchParams.get('paymentStatus')

  const where: any = {}
  if (status) where.status = status
  if (paymentStatus) where.paymentStatus = paymentStatus

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: { select: { name: true, email: true, role: true } }, items: { include: { product: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ])

  return NextResponse.json({ orders, total, pages: Math.ceil(total / limit) })
}
