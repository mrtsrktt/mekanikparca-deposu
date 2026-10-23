import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const merchantOid = formData.get('merchant_oid') as string
    const status = formData.get('status') as string
    const totalAmount = formData.get('total_amount') as string
    const hash = formData.get('hash') as string

    console.log('PayTR callback received:', { merchantOid, status, totalAmount, hash })

    const merchantKey = process.env.PAYTR_MERCHANT_KEY!
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT!

    // PayTR callback hash formülü: merchant_oid + merchant_salt + status + total_amount
    const hashStr = `${merchantOid}${merchantSalt}${status}${totalAmount}`
    const expectedHash = crypto.createHmac('sha256', merchantKey).update(hashStr).digest('base64')

    console.log('Hash verification:', { hashStr, expectedHash, receivedHash: hash })

    if (hash !== expectedHash) {
      console.error('PayTR callback hash mismatch')
      return new NextResponse('FAILED', { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { paytrMerchantOid: merchantOid } })
    if (!order) {
      console.error('Order not found for merchantOid:', merchantOid)
      return new NextResponse('OK')
    }

    console.log('Order found:', { orderId: order.id, currentPaymentStatus: order.paymentStatus })

    // İdempotensi kontrolü: İşlem zaten yapılmışsa doğrudan OK dön
    if (order.paymentStatus === 'PAID') {
      console.log('Order already marked as PAID (idempotent request):', order.id)
      return new NextResponse('OK')
    }

    // Ödeme tutar doğrulaması (tutar manipülasyonu engeli)
    const expectedAmountKurus = Math.round(order.totalAmount * 100)
    const receivedAmountKurus = Number(totalAmount)

    if (receivedAmountKurus !== expectedAmountKurus) {
      console.error('PayTR callback amount mismatch:', {
        orderId: order.id,
        expectedAmountKurus,
        receivedAmountKurus,
      })
      return new NextResponse('FAILED', { status: 400 })
    }

    if (status === 'success') {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
      })
      console.log('Order updated to PAID:', order.id)
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
      })
      console.log('Order updated to FAILED:', order.id)
    }

    return new NextResponse('OK')
  } catch (error: any) {
    console.error('PayTR callback error:', error)
    return new NextResponse('ERROR', { status: 500 })
  }
}
