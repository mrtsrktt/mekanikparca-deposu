/**
 * Fernox Hediye Kampanyaları - Seed Script
 *
 * Kullanım: npx ts-node scripts/seed-gift-campaigns.ts
 *
 * 9 hediye cihaz kampanyasını, 4 ürün grubuyla birlikte oluşturur.
 * Önce Fernox markalı ürünleri listeler, sonra her gruba uygun ürünleri bulur.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Excel'den gelen kampanya verileri
const CAMPAIGNS = [
  {
    name: 'Testo 310 II Yazıcısız Set Kampanyası',
    slug: 'testo-310-ii-hediye',
    description: 'Fernox ürünlerinden belirli adette alım yapın, Testo 310 II Yazıcısız Set hediye kazanın!',
    giftName: 'Testo 310 II Yazıcısız Set',
    giftStockCode: '0563 3104',
    giftValue: 44432.64,
    giftQuantity: 1,
    thresholds: { A: 500, B: 500, C: 500, D: 60 },
  },
  {
    name: 'MRU Pompalı Doğalgaz Kaçak Dedektörü Kampanyası',
    slug: 'mru-gd500-hediye',
    description: 'Fernox ürünlerinden belirli adette alım yapın, MRU GD500 Doğalgaz Kaçak Dedektörü hediye kazanın!',
    giftName: 'MRU Pompalı Doğalgaz Kaçak Dedektörü',
    giftStockCode: 'MRUGD500',
    giftValue: 46805,
    giftQuantity: 1,
    thresholds: { A: 350, B: 350, C: 350, D: 50 },
  },
  {
    name: 'MRU Pompalı Soğutucu Gaz Kaçak Dedektörü Kampanyası',
    slug: 'mru-gd500hcf-hediye',
    description: 'Fernox ürünlerinden belirli adette alım yapın, MRU GD500HCF Soğutucu Gaz Kaçak Dedektörü hediye kazanın!',
    giftName: 'MRU Pompalı Soğutucu Gaz Kaçak Dedektörü',
    giftStockCode: 'MRUGD500HCF',
    giftValue: 47495,
    giftQuantity: 1,
    thresholds: { A: 350, B: 350, C: 350, D: 50 },
  },
  {
    name: 'Testo 550s Smart Set Dijital Manifold Kampanyası',
    slug: 'testo-550s-hediye',
    description: 'Fernox ürünlerinden belirli adette alım yapın, Testo 550s Smart Set Dijital Manifold hediye kazanın!',
    giftName: 'Testo 550s Smart Set Dijital Manifold',
    giftStockCode: '0564 5502',
    giftValue: 31775.88,
    giftQuantity: 1,
    thresholds: { A: 300, B: 300, C: 300, D: 40 },
  },
  {
    name: 'Testo 860i Termal Kamera Kampanyası',
    slug: 'testo-860i-hediye',
    description: 'Fernox ürünlerinden belirli adette alım yapın, Testo 860i Termal Kamera hediye kazanın!',
    giftName: 'Testo 860i Termal Kamera',
    giftStockCode: '0563 0860',
    giftValue: 30937.20,
    giftQuantity: 1,
    thresholds: { A: 300, B: 300, C: 300, D: 40 },
  },
  {
    name: 'Testo 316-3 Soğutucu Gazlar Kaçak Dedektörü Kampanyası',
    slug: 'testo-316-3-hediye',
    description: 'Fernox ürünlerinden belirli adette alım yapın, Testo 316-3 Soğutucu Gazlar Kaçak Dedektörü hediye kazanın!',
    giftName: 'Testo 316-3 Soğutucu Gazlar Kaçak Dedektörü',
    giftStockCode: '0563 3163',
    giftValue: 24652.32,
    giftQuantity: 1,
    thresholds: { A: 200, B: 200, C: 200, D: 30 },
  },
  {
    name: 'Lega Voltaj Regülatörü 500VA Kampanyası',
    slug: 'lega-voltaj-regulatoru-hediye',
    description: 'Fernox ürünlerinden belirli adette alım yapın, Lega Voltaj Regülatörü 500VA hediye kazanın! (8 Adet verilir)',
    giftName: 'Lega Voltaj Regülatörü 500VA',
    giftStockCode: '2MLEGA05',
    giftValue: 18945,
    giftQuantity: 8,
    thresholds: { A: 130, B: 130, C: 130, D: 30 },
  },
  {
    name: 'Regen Kombi Sirkülasyon Pompası Kampanyası',
    slug: 'regen-sirkulasyon-pompasi-hediye',
    description: 'Fernox ürünlerinden belirli adette alım yapın, Regen Kombi Sirkülasyon Pompası hediye kazanın! (8 Adet verilir)',
    giftName: 'Regen Kombi Sirkülasyon Pompası',
    giftStockCode: 'RGN 15/6',
    giftValue: 13000,
    giftQuantity: 8,
    thresholds: { A: 100, B: 100, C: 100, D: 25 },
  },
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

// Grup tanımları ve ürün eşleştirme kuralları
const GROUP_DEFS = [
  {
    name: 'Grup A - 500ml',
    sortOrder: 0,
    // F1 500ml, F3 500ml, F9 500ml, F4 500ml
    match: (name: string) =>
      /F[1349]\b/i.test(name) && /500\s*ml/i.test(name) && !/express/i.test(name),
  },
  {
    name: 'Grup B - Express 400ml',
    sortOrder: 1,
    // F1 Express 400ml, F3 Express 400ml, F9 Express 400ml, F4 Express 400ml
    match: (name: string) =>
      /F[1349]\s+Express/i.test(name) && /400\s*ml/i.test(name),
  },
  {
    name: 'Grup C - 265ml & 20 Litre',
    sortOrder: 2,
    // F1 265ml, F3 265ml, F9 265ml + HP-5C 20L, HP-15C 20L, HP-EG 20L
    match: (name: string) =>
      (/F[139]\b/i.test(name) && /265\s*ml/i.test(name)) ||
      (/HP-5C|HP-15C|HP-EG/i.test(name) && /20\s*L/i.test(name)),
  },
  {
    name: 'Grup D - Yalnızca 20 Litre',
    sortOrder: 3,
    // HP-5C 20L, HP-15C 20L, HP-EG 20L, ALPHI 11 20L
    match: (name: string) =>
      (/HP-5C|HP-15C|HP-EG|ALPHI\s*11/i.test(name) && /20\s*L/i.test(name)),
  },
]

async function main() {
  console.log('🔍 Fernox ürünleri aranıyor...')

  // Fernox markasını bul
  const fernox = await prisma.brand.findFirst({ where: { slug: 'fernox' } })
  if (!fernox) {
    console.error('❌ Fernox markası bulunamadı. Önce markayı ekleyin.')
    await prisma.$disconnect()
    return
  }

  // Tüm aktif Fernox ürünlerini çek
  const allProducts = await prisma.product.findMany({
    where: { brandId: fernox.id, isActive: true },
    select: { id: true, name: true, sku: true },
  })

  console.log(`📦 ${allProducts.length} aktif Fernox ürünü bulundu.\n`)

  // Ürünleri gruplara ayır
  const groupProductIds: string[][] = GROUP_DEFS.map(def => {
    const products = allProducts.filter(p => def.match(p.name))
    console.log(`  ${def.name}: ${products.length} ürün eşleşti`)
    products.forEach(p => console.log(`    - ${p.name}${p.sku ? ` (${p.sku})` : ''}`))
    return products.map(p => p.id)
  })

  console.log('\n⚠️  Eşleşmeyen ürünler:')
  const matchedIds = new Set(groupProductIds.flat())
  allProducts.forEach(p => {
    if (!matchedIds.has(p.id)) console.log(`  ❓ ${p.name}${p.sku ? ` (${p.sku})` : ''}`)
  })

  // Silinecek mevcut hediye kampanyaları
  const existingCount = await prisma.giftCampaign.count()
  if (existingCount > 0) {
    console.log(`\n⚠️  Zaten ${existingCount} hediye kampanyası var.`)
    console.log('Devam etmek için önce mevcut kampanyaları silin.')
    console.log('Veya admin panelinden yönetin.')
    await prisma.$disconnect()
    return
  }

  console.log('\n🚀 Kampanyalar oluşturuluyor...\n')

  const startDate = new Date('2026-06-01')
  const endDate = new Date('2026-12-31')

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

    console.log(`  ✅ ${campaign.name} → /kampanyalar/hediye/${campaign.slug}`)
  }

  console.log(`\n🎉 ${CAMPAIGNS.length} hediye kampanyası başarıyla oluşturuldu!`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('❌ Hata:', e)
  await prisma.$disconnect()
  process.exit(1)
})
