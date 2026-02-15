import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const users = await prisma.user.findMany({
    where: { role: 'B2B' },
    include: {
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(users)
}
