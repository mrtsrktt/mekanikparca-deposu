import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const { b2bStatus } = body

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      b2bStatus: b2bStatus || undefined,
    },
  })

  return NextResponse.json(user)
}
