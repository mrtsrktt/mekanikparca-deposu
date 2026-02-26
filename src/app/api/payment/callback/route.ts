import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const merchantOid = formData.get('merchant_oid') as string
  const status = formData.get('status') as string
  const totalAmount = formData.get('total_amount') as string
  const hash = formData.get('hash') as string

  const merchantKey = process.env.PAYTR_MERCHANT_KEY!
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT!

  const hashStr = `${merchantOid}${merchantSalt}${status}${totalAmount}`
  const expectedHash = crypto.createHmac('sha256', merchantKey).update(hashStr).digest('base64')

  if (hash !== expectedHash) {
    return new NextResponse('FAILED', { status: 400 })
  }

  const order = await (prisma as any).order.findUnique({ where: { paytrMerchantOid: merchantOid } })
  if (!order) return new NextResponse('OK')

  if (status === 'success') {
    await (prisma as any).order.update({ where: { id: order.id }, data: { paymentStatus: 'PAID', status: 'CONFIRMED' } })
  } else {
    await (prisma as any).order.update({ where: { id: order.id }, data: { paymentStatus: 'FAILED', status: 'CANCELLED' } })
  }

  return new NextResponse('OK')
}
