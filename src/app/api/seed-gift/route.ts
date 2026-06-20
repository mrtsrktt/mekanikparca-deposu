import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CAMPAIGNS = [
  {
    name: 'Testo 760-1 Multimetre Kampanyası',
    slug: 'testo-760-1-hediye',
    description: 'Fernox ürünlerinden belirli adette alım yapın, Testo 760-1 Multimetre hediye kazanın!',
    giftName: 'Testo 760-1 Multimetre',
    giftStockCode: '0590 7601',
    giftValue: 8164,
    giftQuantity: 1,
    thresholds: { A: 100, B: 100, C: 100, D: 25 },
  },
]

const GROUP_DEFS = [
  { name: 'Grup A - 500ml', sortOrder: 0, match: (name: string) => /F[1349]\b/i.test(name) && /500\s*ml/i.test(name) && !/express/i.test(name) },
  { name: 'Grup B - Express 400ml', sortOrder: 1, match: (name: string) => /F[1349]\s+Express/i.test(name) && /400\s*ml/i.test(name) },
  { name: 'Grup C - 265ml & 20 Litre', sortOrder: 2, match: (name: string) => (/F[139]\b/i.test(name) && /265\s*ml/i.test(name)) || (/HP-5C|HP-15C|HP-EG/i.test(name) && /20\s*L/i.test(name)) },
  { name: 'Grup D - Yalnızca 20 Litre', sortOrder: 3, match: (name: string) => (/HP-5C|HP-15C|HP-EG|ALPHI\s*11/i.test(name) && /20\s*L/i.test(name)) },
]

export async function GET() {
  try {
    const fernox = await prisma.brand.findFirst({ where: { slug: 'fernox' } })
    if (!fernox) return NextResponse.json({ error: 'Fernox markası bulunamadı' }, { status: 400 })

    const allProducts = await prisma.product.findMany({
      where: { brandId: fernox.id, isActive: true },
      select: { id: true, name: true, sku: true },
    })

    const groupProductIds: string[][] = GROUP_DEFS.map(def => {
      return allProducts.filter(p => def.match(p.name)).map(p => p.id)
    })

    // Delete existing gift campaigns
    await prisma.giftCampaignGroup.deleteMany()
    await prisma.giftCampaign.deleteMany()

    const startDate = new Date('2026-06-01')
    const endDate = new Date('2026-12-31')

    const results = []
    for (const c of CAMPAIGNS) {
      const campaign = await prisma.giftCampaign.create({
        data: {
          name: c.name,
          slug: c.slug,
          description: c.description,
          giftName: c.giftName,
          giftStockCode: c.giftStockCode,
          giftValue: c.giftValue,
          giftQuantity: c.giftQuantity,
          isActive: true,
          startDate,
          endDate,
          groups: {
            create: GROUP_DEFS.map((def, idx) => ({
              name: def.name,
              productIds: groupProductIds[idx],
              threshold: c.thresholds[['A', 'B', 'C', 'D'][idx] as keyof typeof c.thresholds],
              sortOrder: def.sortOrder,
            })),
          },
        },
      })
      results.push({ id: campaign.id, slug: campaign.slug, name: campaign.name })
    }

    return NextResponse.json({ success: true, campaigns: results, groupCounts: groupProductIds.map((ids, i) => `${GROUP_DEFS[i].name}: ${ids.length} ürün`) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 })
  }
}
