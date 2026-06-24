import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getActiveCampaignsForProduct } from '@/lib/campaignPricing'
import { getPriceTiersForProduct } from '@/lib/tierPricing'
import { resolveBestPrice } from '@/lib/bestPrice'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const { items, addressId, notes, invoiceType, companyName, taxNumber, taxOffice, billingCity, billingDistrict, billingAddress, giftCampaign, guest } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Sepet boş.' }, { status: 400 })
    }

    // PayTR yapılandırmasını DB'ye yazmadan önce doğrula (boş sipariş/hesap oluşmasın)
    const merchantId = process.env.PAYTR_MERCHANT_ID
    const merchantKey = process.env.PAYTR_MERCHANT_KEY
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT
    if (!merchantId || !merchantKey || !merchantSalt) {
      console.error('PayTR environment variables missing:', { merchantId: !!merchantId, merchantKey: !!merchantKey, merchantSalt: !!merchantSalt })
      return NextResponse.json({ error: 'Ödeme sistemi yapılandırma hatası.' }, { status: 500 })
    }

    // Sipariş sahibini belirle — üye girişi veya misafir
    let userId: string
    let buyerEmail: string
    let buyerName: string
    let buyerPhone: string
    let shippingAddressStr: string

    if (session?.user?.id) {
      // Üye girişi: kayıtlı adresi kullan
      if (!addressId) {
        return NextResponse.json({ error: 'Adres seçiniz.' }, { status: 400 })
      }
      const address = await prisma.address.findFirst({
        where: { id: addressId, userId: session.user.id },
      })
      if (!address) {
        return NextResponse.json({ error: 'Adres bulunamadı.' }, { status: 404 })
      }
      userId = session.user.id
      buyerEmail = session.user.email!
      buyerName = session.user.name || address.fullName
      buyerPhone = address.phone
      shippingAddressStr = `${address.fullName}, ${address.address}, ${address.district}/${address.city} ${address.zipCode || ''} - ${address.phone}`
    } else {
      // Misafir ödemesi: e-posta ile arka planda hesap aç/bul (kullanıcı şifre girmez)
      if (!guest?.fullName || !guest?.email || !guest?.phone || !guest?.address || !guest?.city || !guest?.district) {
        return NextResponse.json({ error: 'Lütfen iletişim ve teslimat bilgilerinizi eksiksiz doldurun.' }, { status: 400 })
      }
      const email = String(guest.email).trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 })
      }
      let user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        const randomPassword = await bcrypt.hash(`${crypto.randomUUID()}-${Date.now()}`, 10)
        user = await prisma.user.create({
          data: { email, name: guest.fullName, phone: guest.phone, password: randomPassword, role: 'CUSTOMER' },
        })
        // Adresi kaydet — sonraki siparişlerde hazır gelsin
        await prisma.address.create({
          data: {
            userId: user.id, title: 'Teslimat Adresi', fullName: guest.fullName, phone: guest.phone,
            city: guest.city, district: guest.district, address: guest.address, zipCode: guest.zipCode || null, isDefault: true,
          },
        })
      }
      userId = user.id
      buyerEmail = email
      buyerName = guest.fullName
      buyerPhone = guest.phone
      shippingAddressStr = `${guest.fullName}, ${guest.address}, ${guest.district}/${guest.city} ${guest.zipCode || ''} - ${guest.phone}`
    }

    // Ürünleri ve fiyatları doğrula
    const productIds = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    })

    let totalAmount = 0
    const orderItems: { productId: string; quantity: number; unitPrice: number; total: number }[] = []

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return NextResponse.json({ error: `Ürün bulunamadı: ${item.productId}` }, { status: 400 })

      // En iyi fiyatı sunucu tarafında hesapla (kampanya + kademe)
      const campaigns = await getActiveCampaignsForProduct(product.id)
      const { tiers: priceTiers, boxQuantity } = await getPriceTiersForProduct(product.id)
      const bestPrice = resolveBestPrice(product.priceTRY, item.quantity, campaigns, priceTiers, boxQuantity)
      const unitPrice = bestPrice.finalUnitPriceTRY

      const total = unitPrice * item.quantity
      totalAmount += total
      orderItems.push({ productId: product.id, quantity: item.quantity, unitPrice, total })
    }

    // Hediye kampanyasını SUNUCUDA doğrula — istemciden gelen değere asla körü körüne güvenme.
    // Bayat localStorage veya önbelleğe alınmış istemci JS yüzünden normal siparişe yanlışlıkla
    // taksit + bedava hediye uygulanmasını engeller. Sipariş gerçekten bir grubun eşiğini
    // karşılamıyorsa kampanya uygulanmaz (tek çekim, hediye yok).
    let validatedGift: {
      campaignId: string; campaignName: string; giftName: string; giftStockCode: string;
      giftValue: number; giftQuantity: number; groupName: string; totalQuantity: number;
    } | null = null
    if (giftCampaign?.campaignId) {
      const camp = await prisma.giftCampaign.findUnique({
        where: { id: giftCampaign.campaignId },
        include: { groups: { orderBy: { sortOrder: 'asc' } } },
      })
      const now = new Date()
      if (camp && camp.isActive && now >= new Date(camp.startDate) && now <= new Date(camp.endDate)) {
        const orderQtyById = new Map<string, number>()
        for (const it of orderItems) orderQtyById.set(it.productId, (orderQtyById.get(it.productId) || 0) + it.quantity)
        for (const g of camp.groups) {
          if (g.threshold <= 0) continue
          const groupTotal = g.productIds.reduce((s, pid) => s + (orderQtyById.get(pid) || 0), 0)
          if (groupTotal >= g.threshold) {
            const timesReached = Math.floor(groupTotal / g.threshold)
            validatedGift = {
              campaignId: camp.id,
              campaignName: camp.name,
              giftName: camp.giftName,
              giftStockCode: camp.giftStockCode,
              giftValue: camp.giftValue,
              giftQuantity: camp.giftQuantity * timesReached,
              groupName: g.name,
              totalQuantity: groupTotal,
            }
            break
          }
        }
      }
    }

    // Sipariş numarası oluştur (PayTR için alfanumerik olmalı)
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    const orderNumber = `ORD${timestamp}${random}`
    const merchantOid = orderNumber // Zaten alfanumerik

    // DB'ye PENDING sipariş kaydet
    const order = await (prisma as any).order.create({
      data: {
        orderNumber,
        userId,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paytrMerchantOid: merchantOid,
        totalAmount,
        currency: 'TRY',
        shippingAddress: shippingAddressStr,
        invoiceType: invoiceType || 'PERSONAL',
        companyName: invoiceType === 'CORPORATE' ? (companyName || null) : null,
        taxNumber: invoiceType === 'CORPORATE' ? (taxNumber || null) : null,
        taxOffice: invoiceType === 'CORPORATE' ? (taxOffice || null) : null,
        billingAddress: invoiceType === 'CORPORATE' ? `${companyName}, ${billingAddress}, ${billingDistrict}/${billingCity}` : null,
        notes: notes || null,
        adminNotes: validatedGift ? `🎁 Hediye Kampanyası: ${validatedGift.giftName} (${validatedGift.giftStockCode}) — ${validatedGift.groupName}, ${validatedGift.totalQuantity} adet, ${validatedGift.giftQuantity} adet hediye` : null,
        items: {
          create: orderItems,
        },
      },
    })

    // PayTR token isteği (config en başta doğrulandı)
    const userIp = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    const email = buyerEmail
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

    // Add gift campaign item to basket (0 TL) — yalnızca sunucu doğrulamasından geçen kampanya
    if (validatedGift) {
      basketItems.push([
        `🎁 HEDİYE: ${validatedGift.giftName} (${validatedGift.giftStockCode})`,
        '0',
        (validatedGift.giftQuantity || 1).toString(),
      ])
    }
    const userBasket = Buffer.from(JSON.stringify(basketItems)).toString('base64')

    // Tüm siparişlerde peşin fiyatına 6 taksit açık (kampanya/kampanya dışı fark etmez).
    // Not: PayTR mağaza paneli taksit kampanyasını zaten mağaza-geneli uyguladığı için
    // taksiti yalnızca kampanyada sınırlamak mümkün değildi; bu yüzden tüm ürünlerde açık.
    const noInstallment = '0' // taksit açık
    const maxInstallment = '6' // en fazla 6 taksit
    const currency = 'TL'
    const testMode = process.env.PAYTR_TEST_MODE || '0'
    const lang = 'tr'

    // PayTR hash oluşturma (dokümantasyon sırası: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode + merchant_salt)
    const hashStr = `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}${merchantSalt}`
    const paytrToken = crypto
      .createHmac('sha256', merchantKey)
      .update(hashStr)
      .digest('base64')

    // PayTR'ye application/x-www-form-urlencoded formatında istek
    const params = new URLSearchParams()
    params.append('merchant_id', merchantId)
    params.append('user_ip', userIp)
    params.append('merchant_oid', merchantOid)
    params.append('email', email)
    params.append('payment_amount', paymentAmount.toString())
    params.append('paytr_token', paytrToken)
    params.append('user_basket', userBasket)
    params.append('debug_on', process.env.PAYTR_DEBUG || '0')
    params.append('no_installment', noInstallment)
    params.append('max_installment', maxInstallment)
    params.append('user_name', buyerName || '')
    params.append('user_address', shippingAddressStr)
    params.append('user_phone', buyerPhone)
    params.append('merchant_ok_url', `${process.env.NEXTAUTH_URL || 'https://mekanikparcadeposu.com'}/odeme/basarili?orderId=${order.id}`)
    params.append('merchant_fail_url', `${process.env.NEXTAUTH_URL || 'https://mekanikparcadeposu.com'}/odeme/basarisiz`)
    params.append('timeout_limit', '30')
    params.append('currency', currency)
    params.append('test_mode', testMode)
    params.append('lang', lang)

    // Production'da hassas bilgileri loglama
    if (process.env.PAYTR_DEBUG === '1') {
      console.log('PayTR request params:', Object.fromEntries(params))
    }

    const paytrRes = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    const responseText = await paytrRes.text()
    console.log('PayTR raw response:', responseText)
    console.log('PayTR response status:', paytrRes.status)
    
    let paytrData
    try {
      paytrData = JSON.parse(responseText)
    } catch (e) {
      console.error('PayTR response JSON parse error:', e, 'Raw:', responseText)
      await (prisma as any).order.delete({ where: { id: order.id } })
      return NextResponse.json({ 
        error: 'PayTR yanıtı geçersiz JSON formatında.', 
        rawResponse: responseText,
        requestParams: Object.fromEntries(params)
      }, { status: 500 })
    }

    if (paytrData.status !== 'success') {
      // Token alınamazsa siparişi sil
      await (prisma as any).order.delete({ where: { id: order.id } })
      return NextResponse.json({ 
        error: paytrData.reason || 'PayTR token alınamadı.', 
        rawResponse: responseText,
        paytrData: paytrData
      }, { status: 500 })
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
