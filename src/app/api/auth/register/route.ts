import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name, phone } = body

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı.' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, phone, role: 'CUSTOMER' }
    })

    return NextResponse.json({ message: 'Kayıt başarılı.', userId: user.id })
  } catch (error) {
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 })
  }
}
