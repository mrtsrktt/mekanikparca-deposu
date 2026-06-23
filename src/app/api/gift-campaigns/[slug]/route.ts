import { NextResponse } from 'next/server'
import { prisma, withDbRetry } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
 try {
  const campaign = await withDbRetry(() => prisma.giftCampaign.findUnique({
    where: { slug: params.slug },
    include: {
      groups: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  }))

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

  const products = await withDbRetry(() => prisma.product.findMany({
    where: { id: { in: uniqueIds }, isActive: true },
    include: {
      brand: true,
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      priceTiers: { orderBy: { unitPriceTRY: 'asc' }, take: 1 },
    },
  }))

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

  // Hediye cihazı sitedeki ürünle eşleştir (stok kodu = SKU) → ürün sayfası linki + görsel
  const norm = (s: string) =>
    (s || '').toLowerCase().replace(/\s+/g, '')
      .replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ş/g, 's')
      .replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ç/g, 'c')

  // SKU normalize gerektirdiği için adayları çekip bellekte eşleştiriyoruz
  let giftProduct: { slug: string; image: string | null } | null = null
  if (campaign.giftStockCode) {
    const target = norm(campaign.giftStockCode)
    const candidates = await withDbRetry(() => prisma.product.findMany({
      where: { isActive: true, sku: { not: null } },
      select: { sku: true, slug: true, images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } } },
    }))
    const found = candidates.find(p => p.sku && norm(p.sku) === target) || null
    if (found) {
      giftProduct = { slug: found.slug, image: found.images?.[0]?.url || null }
    }
  }

  return NextResponse.json({
    ...campaign,
    giftImage: campaign.giftImage || giftProduct?.image || null,
    giftProductSlug: giftProduct?.slug || null,
    installmentCount: 6, // Hediye kampanyalarında peşin fiyatına 6 taksit
    groups: enrichedGroups,
  })
 } catch (e) {
    console.error('Hediye kampanyası yüklenemedi (DB):', e)
    return NextResponse.json({ error: 'Kampanya geçici olarak yüklenemedi. Lütfen tekrar deneyin.' }, { status: 503 })
 }
}
