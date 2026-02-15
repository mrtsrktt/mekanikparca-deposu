import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import bcrypt from 'bcryptjs'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, phone: true, role: true, b2bStatus: true, companyName: true, taxNumber: true, taxOffice: true, createdAt: true, _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const { name, email, password, phone, role, companyName, taxNumber, taxOffice, b2bStatus } = body

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Ad, e-posta ve şifre zorunludur' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: role || 'CUSTOMER',
      companyName: role === 'B2B' ? (companyName || null) : null,
      taxNumber: role === 'B2B' ? (taxNumber || null) : null,
      taxOffice: role === 'B2B' ? (taxOffice || null) : null,
      b2bStatus: role === 'B2B' ? (b2bStatus || 'APPROVED') : null,
    },
  })

  return NextResponse.json(user)
}
