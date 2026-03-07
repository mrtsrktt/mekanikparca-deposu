import { NextRequest, NextResponse } from 'next/server'
import { getActiveCampaignsForProduct } from '@/lib/campaignPricing'
import { getPriceTiersForProduct } from '@/lib/tierPricing'
import { resolveBestPrice } from '@/lib/bestPrice'
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
      const { tiers: priceTiers, boxQuantity } = await getPriceTiersForProduct(item.productId)

      const bestPrice = resolveBestPrice(
        product.priceTRY,
        item.quantity,
        campaigns,
        priceTiers,
        boxQuantity
      )

      return {
        productId: item.productId,
        quantity: item.quantity,
        originalPrice: bestPrice.originalPriceTRY,
        discountedPrice: bestPrice.finalUnitPriceTRY,
        source: bestPrice.source,
        // Kampanya bilgileri (geriye uyumlu)
        appliedCampaign: bestPrice.campaignResult?.appliedCampaign || null,
        appliedTier: bestPrice.campaignResult?.appliedTier || null,
        totalSavings: bestPrice.totalSavingsPerUnit * item.quantity,
        // Kademe bilgileri
        appliedPriceTier: bestPrice.tierResult?.appliedTier || null,
        boxQuantity: boxQuantity,
      }
    })
  )

  return NextResponse.json(results)
}
