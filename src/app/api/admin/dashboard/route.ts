import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const [
    totalProducts, totalOrders, totalUsers, totalB2BUsers,
    pendingB2B, pendingOrders, recentOrders, totalRevenue,
    pendingQuotes, recentQuotes,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'B2B' } }),
    prisma.user.count({ where: { role: 'B2B', b2bStatus: 'PENDING' } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, role: true } } },
    }),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    (prisma as any).quoteRequest.count({ where: { status: 'PENDING' } }),
    (prisma as any).quoteRequest.findMany({
      where: { status: { in: ['PENDING', 'REVIEWING'] } },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, companyName: true } },
        items: { select: { id: true } },
      },
    }),
  ])

  return NextResponse.json({
    stats: {
      totalProducts, totalOrders, totalUsers, totalB2BUsers,
      pendingB2B, pendingOrders, pendingQuotes,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    },
    recentOrders,
    recentQuotes,
  })
}
