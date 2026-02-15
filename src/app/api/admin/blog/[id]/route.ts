import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error
  const body = await req.json()
  const post = await prisma.blogPost.update({ where: { id: params.id }, data: body })
  return NextResponse.json(post)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error
  await prisma.blogPost.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Yazı silindi.' })
}
