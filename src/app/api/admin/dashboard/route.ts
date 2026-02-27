import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Tüm istatistikleri paralel olarak al
    const [
      totalProducts,
      totalOrders,
      totalRevenueResult,
      totalUsers,
      totalB2BUsers,
      pendingB2B,
      pendingOrders,
      pendingQuotes,
      recentOrders,
      recentQuotes
    ] = await Promise.all([
      // Toplam ürün
      (prisma as any).product.count({ where: { isActive: true } }),
      
      // Toplam sipariş (sadece ödenmiş)
      (prisma as any).order.count({ where: { paymentStatus: 'PAID' } }),
      
      // Toplam gelir (sadece ödenmiş siparişler)
      (prisma as any).order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true }
      }),
      
      // Toplam B2C müşteri
      (prisma as any).user.count({ where: { role: 'CUSTOMER' } }),
      
      // Toplam B2B müşteri
      (prisma as any).user.count({ where: { role: 'B2B', b2bStatus: 'APPROVED' } }),
      
      // Bekleyen B2B başvuruları
      (prisma as any).user.count({ where: { role: 'B2B', b2bStatus: 'PENDING' } }),
      
      // Bekleyen siparişler (PENDING status)
      (prisma as any).order.count({ where: { status: 'PENDING', paymentStatus: 'PAID' } }),
      
      // Bekleyen teklif talepleri
      (prisma as any).quoteRequest.count({ where: { status: 'PENDING' } }),
      
      // Son 10 sipariş (sadece ödenmiş)
      (prisma as any).order.findMany({
        where: { paymentStatus: 'PAID' },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Son 10 bekleyen teklif talebi
      (prisma as any).quoteRequest.findMany({
        where: { status: 'PENDING' },
        include: {
          user: {
            select: { id: true, name: true, email: true, companyName: true }
          },
          items: {
            select: { id: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ])

    const stats = {
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenueResult._sum.totalAmount || 0,
      totalUsers,
      totalB2BUsers,
      pendingB2B,
      pendingOrders,
      pendingQuotes
    }

    return NextResponse.json({
      stats,
      recentOrders,
      recentQuotes
    })
  } catch (error: any) {
    console.error('Dashboard data fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}