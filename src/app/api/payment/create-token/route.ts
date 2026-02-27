import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
    }

    const { items, addressId, notes } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Sepet boş.' }, { status: 400 })
    }
    if (!addressId) {
      return NextResponse.json({ error: 'Adres seçiniz.' }, { status: 400 })
    }

    // Adresi çek
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    })
    if (!address) {
      return NextResponse.json({ error: 'Adres bulunamadı.' }, { status: 404 })
    }

    // Ürünleri ve fiyatları doğrula
    const productIds = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    })

    let totalAmount = 0
    const orderItems: { productId: string; quantity: number; unitPrice: number; total: number }[] = []

    // Kullanıcı B2B mi kontrol et
    const isB2B = session.user.role === 'B2B' && (session.user as any).b2bStatus === 'APPROVED'

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return NextResponse.json({ error: `Ürün bulunamadı: ${item.productId}` }, { status: 400 })
      
      // Fiyatı backend'de hesapla — frontend'den gelen unitPrice'a güvenme
      let unitPrice = product.priceTRY
      
      // B2B fiyatı varsa ve kullanıcı B2B ise
      if (isB2B && product.b2bPrice && product.b2bPrice < unitPrice) {
        unitPrice = product.b2bPrice
      }
      
      const total = unitPrice * item.quantity
      totalAmount += total
      orderItems.push({ productId: product.id, quantity: item.quantity, unitPrice, total })
    }

    // Sipariş numarası oluştur (PayTR için alfanumerik olmalı)
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    const orderNumber = `ORD${timestamp}${random}`
    const merchantOid = orderNumber // Zaten alfanumerik

    const shippingAddressStr = `${address.fullName}, ${address.address}, ${address.district}/${address.city} ${address.zipCode || ''} - ${address.phone}`

    // DB'ye PENDING sipariş kaydet
    const order = await (prisma as any).order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paytrMerchantOid: merchantOid,
        totalAmount,
        currency: 'TRY',
        shippingAddress: shippingAddressStr,
        notes: notes || null,
        items: {
          create: orderItems,
        },
      },
    })

    // PayTR token isteği
    const merchantId = process.env.PAYTR_MERCHANT_ID
    const merchantKey = process.env.PAYTR_MERCHANT_KEY
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT

    if (!merchantId || !merchantKey || !merchantSalt) {
      console.error('PayTR environment variables missing:', { merchantId: !!merchantId, merchantKey: !!merchantKey, merchantSalt: !!merchantSalt })
      return NextResponse.json({ error: 'Ödeme sistemi yapılandırma hatası.' }, { status: 500 })
    }

    const userIp = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    const email = session.user.email!
    // PayTR kuruş cinsinden integer bekler, nokta/ondalık olmamalı
    const paymentAmount = Math.round(totalAmount * 100)
    if (paymentAmount <= 0) {
      await (prisma as any).order.delete({ where: { id: order.id } })
      return NextResponse.json({ error: 'Geçersiz ödeme tutarı.' }, { status: 400 })
    }

    // Sepet içeriği (PayTR formatı) — [["Ürün Adı", "birim_fiyat_kuruş", "adet"], ...]
    const basketItems = orderItems.map((item) => {
      const product = products.find((p) => p.id === item.productId)!
      const unitPriceKurus = Math.round(item.unitPrice * 100)
      return [product.name, unitPriceKurus.toString(), item.quantity.toString()]
    })
    const userBasket = Buffer.from(JSON.stringify(basketItems)).toString('base64')
    console.log('Basket items:', basketItems, 'Base64:', userBasket)

    const noInstallment = '0'
    const maxInstallment = '0'
    const currency = 'TL'
    const testMode = process.env.PAYTR_TEST_MODE || '1'
    const lang = 'tr'

    const hashStr = `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}`
    const paytrToken = crypto
      .createHmac('sha256', merchantKey + merchantSalt)
      .update(hashStr)
      .digest('base64')

    const params = new URLSearchParams({
      merchant_id: merchantId,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email,
      payment_amount: paymentAmount.toString(),
      paytr_token: paytrToken,
      user_basket: userBasket,
      debug_on: '0',
      no_installment: noInstallment,
      max_installment: maxInstallment,
      user_name: session.user.name || '',
      user_address: shippingAddressStr,
      user_phone: address.phone,
      merchant_ok_url: `${process.env.NEXTAUTH_URL}/odeme/basarili`,
      merchant_fail_url: `${process.env.NEXTAUTH_URL}/odeme/basarisiz`,
      currency,
      test_mode: testMode,
      lang,
    })

    const paytrRes = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      body: params,
    })

    const responseText = await paytrRes.text()
    console.log('PayTR raw response:', responseText)
    
    let paytrData
    try {
      paytrData = JSON.parse(responseText)
    } catch (e) {
      console.error('PayTR response JSON parse error:', e, 'Raw:', responseText)
      await (prisma as any).order.delete({ where: { id: order.id } })
      return NextResponse.json({ error: 'PayTR yanıtı geçersiz JSON formatında.' }, { status: 500 })
    }

    if (paytrData.status !== 'success') {
      // Token alınamazsa siparişi sil
      await (prisma as any).order.delete({ where: { id: order.id } })
      return NextResponse.json({ error: paytrData.reason || 'PayTR token alınamadı.' }, { status: 500 })
    }

    return NextResponse.json({ token: paytrData.token, orderId: order.id })
  } catch (error: any) {
    console.error('Payment create-token error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 })
  }
}
