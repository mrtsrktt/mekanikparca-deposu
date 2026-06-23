import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  // slug veya id ile arama yap
  let product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { sortOrder: 'asc' } },
      priceTiers: { orderBy: { unitPriceTRY: 'asc' } },
    },
  })

  // Slug ile bulunamazsa ID ile dene
  if (!product) {
    product = await prisma.product.findUnique({
      where: { id: params.slug },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        priceTiers: { orderBy: { unitPriceTRY: 'asc' } },
      },
    })
  }

  if (!product) return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 })

  // Saklı priceTRY tek doğru fiyat kaynağıdır. Kur güncellendiğinde
  // recalculateProductPrices, priceTRY ve kademe unitPriceTRY değerlerini birlikte günceller.
  // NOT: Eskiden burada canlı kur ile yeniden hesap yapılıyordu; ancak kurlar self-fetch ile
  // localhost'tan çekiliyordu ve production'da bu istek başarısız olup yanlış fallback kura
  // (EUR 55) düşüyordu. Sonuç: ürün sayfası fiyatı sepet/ödeme fiyatından farklı çıkıyordu.
  // Artık doğrudan saklı priceTRY kullanılıyor; sepet, ödeme ve PayTR ile birebir aynı.
  const retailPriceTRY = product.priceTRY
  const cheapestTierPrice = product.priceTiers?.length > 0
    ? Math.min(...product.priceTiers.map(t => t.unitPriceTRY))
    : null
  const displayPrice = cheapestTierPrice && cheapestTierPrice < retailPriceTRY
    ? cheapestTierPrice
    : retailPriceTRY

  return NextResponse.json({
    ...product,
    priceTRY: displayPrice,
    retailPriceTRY,
    hasTierDiscount: cheapestTierPrice !== null && cheapestTierPrice < retailPriceTRY,
  })
}
