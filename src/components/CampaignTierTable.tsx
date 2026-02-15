import { formatPrice } from '@/lib/pricing'

interface Tier {
  minQuantity: number
  value: number
}

interface Props {
  tiers: Tier[]
  type: 'PERCENTAGE' | 'FIXED_PRICE'
  campaignName: string
  basePriceTRY: number
  currentQuantity?: number
}

export default function CampaignTierTable({ tiers, type, campaignName, basePriceTRY, currentQuantity = 1 }: Props) {
  const sorted = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity)

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-red-500 text-lg">🎁</span>
        <h3 className="font-semibold text-gray-800">{campaignName}</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-red-200">
            <th className="text-left py-2">Min. Adet</th>
            <th className="text-left py-2">{type === 'PERCENTAGE' ? 'İndirim' : 'Birim Fiyat'}</th>
            <th className="text-left py-2">Birim Fiyat</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((tier, idx) => {
            const unitPrice = type === 'PERCENTAGE'
              ? basePriceTRY * (1 - tier.value / 100)
              : tier.value
            const isActive = currentQuantity >= tier.minQuantity &&
              (idx === sorted.length - 1 || currentQuantity < sorted[idx + 1].minQuantity)
            return (
              <tr key={idx} className={`border-b border-red-100 ${isActive ? 'bg-red-100 font-semibold' : ''}`}>
                <td className="py-2">{tier.minQuantity}+ adet</td>
                <td className="py-2">
                  {type === 'PERCENTAGE' ? `%${tier.value} indirim` : formatPrice(tier.value)}
                </td>
                <td className="py-2 text-red-600">{formatPrice(unitPrice)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
