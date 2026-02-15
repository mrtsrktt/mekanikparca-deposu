import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import bcrypt from 'bcryptjs'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const { name, email, password, phone, role, companyName, taxNumber, taxOffice, b2bStatus } = body

  if (!name || !email) {
    return NextResponse.json({ error: 'Ad ve e-posta zorunludur' }, { status: 400 })
  }

  // Check email uniqueness (exclude current user)
  const existing = await prisma.user.findFirst({ where: { email, NOT: { id: params.id } } })
  if (existing) {
    return NextResponse.json({ error: 'Bu e-posta adresi başka bir kullanıcıda kayıtlı' }, { status: 400 })
  }

  const data: any = {
    name,
    email,
    phone: phone || null,
    role: role || 'CUSTOMER',
    companyName: role === 'B2B' ? (companyName || null) : null,
    taxNumber: role === 'B2B' ? (taxNumber || null) : null,
    taxOffice: role === 'B2B' ? (taxOffice || null) : null,
    b2bStatus: role === 'B2B' ? (b2bStatus || 'PENDING') : null,
  }

  // Only update password if provided
  if (password && password.trim()) {
    data.password = await bcrypt.hash(password, 10)
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
  })

  return NextResponse.json(user)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error

  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
