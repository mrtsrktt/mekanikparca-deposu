import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getActiveCampaignsForProduct } from '@/lib/campaignPricing'
import { getPriceTiersForProduct } from '@/lib/tierPricing'
import { resolveBestPrice } from '@/lib/bestPrice'
import { applySalePrice, convertToTRY } from '@/lib/pricing'
import { calculateB2BPrice, getB2BPriceForProduct } from '@/lib/b2bPricing'
import { getDealerInfo } from '@/lib/dealerDiscount'
import { calculateCreditStatus } from '@/lib/corporateCreditService'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { creditLimit: true },
  })

  const unpaidOrders = await prisma.order.aggregate({
    where: {
      userId: session.user.id,
      paymentMethod: 'CARI',
      paymentStatus: 'PENDING',
      status: { not: 'CANCELLED' },
    },
    _sum: { totalAmount: true },
  })

  const usedCredit = unpaidOrders._sum.totalAmount ?? 0
  const creditLimit = user?.creditLimit ?? 0
  const status = calculateCreditStatus(creditLimit, usedCredit, 0)

  return NextResponse.json({
    creditLimit: status.creditLimit,
    usedCredit: status.usedCredit,
    availableCredit: status.availableCredit,
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Lütfen giriş yapın.' }, { status: 401 })
    }

    const {
      items,
      addressId,
      notes,
      invoiceType,
      companyName,
      taxNumber,
      taxOffice,
      billingCity,
      billingDistrict,
      billingAddress,
      giftCampaign,
    } = await req.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Sepet boş.' }, { status: 400 })
    }

    if (!addressId) {
      return NextResponse.json({ error: 'Lütfen teslimat adresi seçiniz.' }, { status: 400 })
    }

    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    })
    if (!address) {
      return NextResponse.json({ error: 'Adres bulunamadı.' }, { status: 404 })
    }
    const shippingAddressStr = `${address.fullName}, ${address.address}, ${address.district}/${address.city} ${address.zipCode || ''} - ${address.phone}`

    // Ürünleri ve fiyatları doğrula
    const productIds = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    })

    const dealer = await getDealerInfo(prisma, session.user.id)
    const dealerDiscountPercent = dealer?.discountPercent ?? 0

    const quoteIds: string[] = Array.from(
      new Set<string>(
        items
          .map((i: any) => i.quoteId)
          .filter((v: any): v is string => typeof v === 'string' && v.length > 0)
      )
    )

    const acceptedQuotePrices = new Map<string, number>()
    if (quoteIds.length > 0) {
      const quotes = await prisma.quoteRequest.findMany({
        where: { id: { in: quoteIds }, userId: session.user.id, status: { in: ['QUOTED', 'ACCEPTED'] } },
        include: { items: true },
      })
      for (const q of quotes) {
        const rates = { USD: q.exchangeRateUSD, EUR: q.exchangeRateEUR }
        for (const qi of q.items) {
          if (qi.unitPrice == null) continue
          acceptedQuotePrices.set(
            `${q.id}:${qi.productId}`,
            convertToTRY(Number(qi.unitPrice), q.currency || 'TRY', rates)
          )
        }
      }
    }

    let totalAmount = 0
    const orderItems: { productId: string; quantity: number; unitPrice: number; total: number }[] = []

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        return NextResponse.json({ error: `Ürün bulunamadı: ${item.productId}` }, { status: 400 })
      }

      const minOrder = (product as any).minOrder && (product as any).minOrder > 0 ? (product as any).minOrder : 1
      if (item.quantity < minOrder) {
        return NextResponse.json(
          { error: `"${product.name}" ürününden en az ${minOrder} adet sipariş edebilirsiniz.` },
          { status: 400 }
        )
      }

      const campaigns = await getActiveCampaignsForProduct(product.id)
      const { tiers: priceTiers, boxQuantity } = await getPriceTiersForProduct(product.id)
      const bestPrice = resolveBestPrice(product.priceTRY, item.quantity, campaigns, priceTiers, boxQuantity)
      const retailSalePrice = applySalePrice(bestPrice.finalUnitPriceTRY)

      const quotedPrice = item.quoteId ? acceptedQuotePrices.get(`${item.quoteId}:${product.id}`) : undefined
      const unitPrice =
        quotedPrice != null
          ? quotedPrice
          : getB2BPriceForProduct(product, dealer?.dealerType, retailSalePrice).b2bPrice

      const total = unitPrice * item.quantity
      totalAmount += total
      orderItems.push({ productId: product.id, quantity: item.quantity, unitPrice, total })
    }

    // Hediye kampanyasını doğrula
    let validatedGift: {
      campaignId: string
      campaignName: string
      giftName: string
      giftStockCode: string
      giftValue: number
      giftQuantity: number
      groupName: string
      totalQuantity: number
    } | null = null

    if (giftCampaign?.campaignId) {
      const camp = await prisma.giftCampaign.findUnique({
        where: { id: giftCampaign.campaignId },
        include: { groups: { orderBy: { sortOrder: 'asc' } } },
      })
      const now = new Date()
      if (camp && camp.isActive && now >= new Date(camp.startDate) && now <= new Date(camp.endDate)) {
        const orderQtyById = new Map<string, number>()
        for (const it of orderItems) {
          orderQtyById.set(it.productId, (orderQtyById.get(it.productId) || 0) + it.quantity)
        }
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

    // Cari Limit Kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { creditLimit: true },
    })

    const unpaidOrders = await prisma.order.aggregate({
      where: {
        userId: session.user.id,
        paymentMethod: 'CARI',
        paymentStatus: 'PENDING',
        status: { not: 'CANCELLED' },
      },
      _sum: { totalAmount: true },
    })

    const usedCredit = unpaidOrders._sum.totalAmount ?? 0
    const creditLimit = user?.creditLimit ?? 0

    const creditStatus = calculateCreditStatus(creditLimit, usedCredit, totalAmount)

    if (!creditStatus.isEligible) {
      return NextResponse.json(
        { error: 'Cari limitiniz bu sipariş için yetersiz.' },
        { status: 400 }
      )
    }

    // Sipariş numarası oluştur (ORD-CARI-...)
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    const orderNumber = `ORD-CARI-${timestamp}${random}`

    // Siparişi CARI olarak kaydet
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'CARI',
        totalAmount,
        currency: 'TRY',
        shippingAddress: shippingAddressStr,
        invoiceType: invoiceType || 'PERSONAL',
        companyName: invoiceType === 'CORPORATE' ? (companyName || null) : null,
        taxNumber: invoiceType === 'CORPORATE' ? (taxNumber || null) : null,
        taxOffice: invoiceType === 'CORPORATE' ? (taxOffice || null) : null,
        billingAddress:
          invoiceType === 'CORPORATE'
            ? `${companyName}, ${billingAddress}, ${billingDistrict}/${billingCity}`
            : null,
        notes: notes || null,
        adminNotes: validatedGift
          ? `🎁 Hediye Kampanyası: ${validatedGift.giftName} (${validatedGift.giftStockCode}) — ${validatedGift.groupName}, ${validatedGift.totalQuantity} adet, ${validatedGift.giftQuantity} adet hediye`
          : null,
        items: {
          create: orderItems,
        },
      },
    })

    return NextResponse.json({ ok: true, orderId: order.id }, { status: 200 })
  } catch (error) {
    console.error('Cari order error:', error)
    return NextResponse.json({ error: 'Cari sipariş oluşturulurken bir hata oluştu.' }, { status: 500 })
  }
}
