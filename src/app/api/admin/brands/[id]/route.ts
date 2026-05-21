import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { revalidateStorefront } from '@/lib/revalidate'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error
  const body = await req.json()
  const brand = await prisma.brand.update({ where: { id: params.id }, data: body })
  revalidateStorefront()
  return NextResponse.json(brand)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error
  await prisma.brand.delete({ where: { id: params.id } })
  revalidateStorefront()
  return NextResponse.json({ message: 'Marka silindi.' })
}
