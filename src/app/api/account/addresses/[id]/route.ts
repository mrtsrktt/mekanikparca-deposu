import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const addr = await prisma.address.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!addr) return NextResponse.json({ error: 'Adres bulunamadı' }, { status: 404 })

  const body = await req.json()
  const { title, fullName, phone, city, district, address, zipCode, isDefault } = body

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } })
  }

  const updated = await prisma.address.update({
    where: { id: params.id },
    data: { title, fullName, phone, city, district, address, zipCode, isDefault },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const addr = await prisma.address.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!addr) return NextResponse.json({ error: 'Adres bulunamadı' }, { status: 404 })

  await prisma.address.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
