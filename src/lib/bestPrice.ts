import { CampaignPriceResult, calculateCampaignPrice, CampaignWithTiers } from './campaignPricing'
import { PriceTierData, TierPriceResult, calculateTierPrice } from './tierPricing'

// --- Types ---

export interface BestPriceResult {
  originalPriceTRY: number
  finalUnitPriceTRY: number
  source: 'base' | 'campaign' | 'tier' // Hangi sistem en iyi fiyatı verdi
  campaignResult: CampaignPriceResult | null
  tierResult: TierPriceResult | null
  totalSavingsPerUnit: number
}

// --- Functions ---

/**
 * Kampanya ve kademe fiyatlarını karşılaştırıp en düşük fiyatı döndürür.
 * Hem sepet hem ödeme endpoint'inde kullanılır.
 */
export function resolveBestPrice(
  basePriceTRY: number,
  quantity: number,
  campaigns: CampaignWithTiers[],
  priceTiers: PriceTierData[],
  boxQuantity: number | null
): BestPriceResult {
  // Kampanya fiyatını hesapla
  const campaignResult = calculateCampaignPrice(basePriceTRY, quantity, campaigns)

  // Kademe fiyatını hesapla
  const tierResult = calculateTierPrice(basePriceTRY, quantity, priceTiers, boxQuantity)

  // En düşük fiyatı belirle
  let finalPrice = basePriceTRY
  let source: 'base' | 'campaign' | 'tier' = 'base'

  const campaignPrice = campaignResult.appliedCampaign
    ? campaignResult.discountedPrice
    : basePriceTRY

  const tierPrice = tierResult.appliedTier
    ? tierResult.tierUnitPriceTRY
    : basePriceTRY

  if (campaignPrice <= tierPrice && campaignPrice < basePriceTRY) {
    finalPrice = campaignPrice
    source = 'campaign'
  } else if (tierPrice < basePriceTRY) {
    finalPrice = tierPrice
    source = 'tier'
  }

  return {
    originalPriceTRY: basePriceTRY,
    finalUnitPriceTRY: finalPrice,
    source,
    campaignResult: campaignResult.appliedCampaign ? campaignResult : null,
    tierResult: tierResult.appliedTier ? tierResult : null,
    totalSavingsPerUnit: basePriceTRY - finalPrice,
  }
}
