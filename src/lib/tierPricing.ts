import { prisma } from './prisma'

// --- Types ---

export interface PriceTierData {
  id: string
  minQuantity: number
  unitPrice: number
  unitPriceTRY: number
}

export interface TierPriceResult {
  originalPriceTRY: number
  tierUnitPriceTRY: number
  appliedTier: PriceTierData | null
  hasTiers: boolean
  boxQuantity: number | null
}

// --- Functions ---

/** Verilen miktara uygun en iyi kademeyi bul */
export function findMatchingPriceTier(
  tiers: PriceTierData[],
  quantity: number
): PriceTierData | null {
  const sorted = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity)
  return sorted.find(t => quantity >= t.minQuantity) || null
}

/** Kademe bazlı birim fiyat hesapla */
export function calculateTierPrice(
  basePriceTRY: number,
  quantity: number,
  tiers: PriceTierData[],
  boxQuantity: number | null
): TierPriceResult {
  const tier = findMatchingPriceTier(tiers, quantity)

  return {
    originalPriceTRY: basePriceTRY,
    tierUnitPriceTRY: tier ? tier.unitPriceTRY : basePriceTRY,
    appliedTier: tier,
    hasTiers: tiers.length > 0,
    boxQuantity,
  }
}

/** Ürüne ait fiyat kademelerini veritabanından getir */
export async function getPriceTiersForProduct(
  productId: string
): Promise<{ tiers: PriceTierData[]; boxQuantity: number | null }> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      boxQuantity: true,
      priceTiers: { orderBy: { minQuantity: 'asc' } },
    },
  })
  if (!product) return { tiers: [], boxQuantity: null }

  return {
    tiers: product.priceTiers,
    boxQuantity: product.boxQuantity,
  }
}
