import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const campaign = await prisma.giftCampaign.findUnique({
    where: { slug: params.slug },
    include: {
      groups: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!campaign || !campaign.isActive) {
    return NextResponse.json({ error: 'Kampanya bulunamadı.' }, { status: 404 })
  }

  const now = new Date()
  if (now < new Date(campaign.startDate) || now > new Date(campaign.endDate)) {
    return NextResponse.json({ error: 'Kampanya aktif değil.' }, { status: 404 })
  }

  // Fetch product details for all products in all groups
  const allProductIds = campaign.groups.flatMap(g => g.productIds)
  const uniqueIds = Array.from(new Set(allProductIds))

  const products = await prisma.product.findMany({
    where: { id: { in: uniqueIds }, isActive: true },
    include: {
      brand: true,
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      priceTiers: { orderBy: { unitPriceTRY: 'asc' }, take: 1 },
    },
  })

  const productMap = Object.fromEntries(products.map(p => [p.id, p]))

  // Enrich groups with product data
  // Use cheapest price tier (bulk/toptan) instead of product-level retail price
  const enrichedGroups = campaign.groups.map(group => ({
    ...group,
    products: group.productIds
      .map(pid => {
        const product = productMap[pid]
        if (!product) return null
        const cheapestTierPrice = product.priceTiers?.[0]?.unitPriceTRY
        return {
          ...product,
          priceTRY: cheapestTierPrice ?? product.priceTRY,
        }
      })
      .filter(Boolean),
  }))

  return NextResponse.json({
    ...campaign,
    groups: enrichedGroups,
  })
}
