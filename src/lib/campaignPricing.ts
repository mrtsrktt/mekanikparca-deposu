import { prisma } from './prisma'

// --- Types ---

export interface CampaignTierData {
  id: string
  minQuantity: number
  value: number
}

export interface CampaignWithTiers {
  id: string
  name: string
  description: string | null
  type: 'PERCENTAGE' | 'FIXED_PRICE'
  scopeType: 'PRODUCT' | 'BRAND' | 'CATEGORY'
  productId: string | null
  brandId: string | null
  categoryId: string | null
  startDate: Date
  endDate: Date
  isActive: boolean
  tiers: CampaignTierData[]
}

export interface CampaignPriceResult {
  originalPrice: number
  discountedPrice: number
  appliedCampaign: CampaignWithTiers | null
  appliedTier: CampaignTierData | null
  totalSavings: number
}

// --- Functions ---

export function getCampaignStatus(
  campaign: { startDate: Date; endDate: Date; isActive: boolean },
  now: Date = new Date()
): 'active' | 'inactive' | 'expired' {
  if (!campaign.isActive) return 'inactive'
  if (now < campaign.startDate) return 'inactive'
  if (now > campaign.endDate) return 'expired'
  return 'active'
}

export function findMatchingTier(
  tiers: CampaignTierData[],
  quantity: number
): CampaignTierData | null {
  const sorted = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity)
  return sorted.find(t => quantity >= t.minQuantity) || null
}

export function calculateCampaignPrice(
  basePriceTRY: number,
  quantity: number,
  campaigns: CampaignWithTiers[]
): CampaignPriceResult {
  let best: CampaignPriceResult = {
    originalPrice: basePriceTRY,
    discountedPrice: basePriceTRY,
    appliedCampaign: null,
    appliedTier: null,
    totalSavings: 0,
  }

  for (const campaign of campaigns) {
    const tier = findMatchingTier(campaign.tiers, quantity)
    if (!tier) continue

    let unitPrice: number
    if (campaign.type === 'PERCENTAGE') {
      unitPrice = basePriceTRY * (1 - tier.value / 100)
    } else {
      unitPrice = tier.value
    }

    if (unitPrice < best.discountedPrice) {
      best = {
        originalPrice: basePriceTRY,
        discountedPrice: unitPrice,
        appliedCampaign: campaign,
        appliedTier: tier,
        totalSavings: (basePriceTRY - unitPrice) * quantity,
      }
    }
  }

  return best
}

export async function getActiveCampaignsForProduct(
  productId: string
): Promise<CampaignWithTiers[]> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, brandId: true, categoryId: true },
  })
  if (!product) return []

  const now = new Date()

  const campaigns = await prisma.campaign.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
      OR: [
        { scopeType: 'PRODUCT', productId: product.id },
        ...(product.brandId ? [{ scopeType: 'BRAND', brandId: product.brandId }] : []),
        ...(product.categoryId ? [{ scopeType: 'CATEGORY', categoryId: product.categoryId }] : []),
      ],
    },
    include: {
      tiers: { orderBy: { minQuantity: 'asc' } },
    },
  })

  return campaigns as unknown as CampaignWithTiers[]
}
