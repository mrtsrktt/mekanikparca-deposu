import { NextRequest, NextResponse } from 'next/server'
import { getActiveCampaignsForProduct, calculateCampaignPrice } from '@/lib/campaignPricing'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { items } = body // [{ productId, quantity }]

  if (!items || !Array.isArray(items)) {
    return NextResponse.json({ error: 'items alanı gerekli.' }, { status: 400 })
  }

  const results = await Promise.all(
    items.map(async (item: { productId: string; quantity: number }) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, priceTRY: true },
      })
      if (!product) return { productId: item.productId, error: 'Ürün bulunamadı' }

      const campaigns = await getActiveCampaignsForProduct(item.productId)
      const result = calculateCampaignPrice(product.priceTRY, item.quantity, campaigns)

      return {
        productId: item.productId,
        quantity: item.quantity,
        ...result,
      }
    })
  )

  return NextResponse.json(results)
}
