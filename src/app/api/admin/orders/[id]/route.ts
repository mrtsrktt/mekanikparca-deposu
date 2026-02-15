import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status: body.status },
    include: { user: true, items: { include: { product: true } } },
  })
  return NextResponse.json(order)
}
