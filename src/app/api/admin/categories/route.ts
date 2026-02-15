import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const categories = await prisma.category.findMany({
    include: { parent: true, _count: { select: { products: true } } },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const category = await prisma.category.create({ data: body })
  return NextResponse.json(category)
}
