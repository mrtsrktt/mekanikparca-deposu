'use client'

import { formatPrice } from '@/lib/pricing'

interface Tier {
  minQuantity: number
  unitPriceTRY: number
}

interface Props {
  tiers: Tier[]
  boxQuantity: number | null
  basePriceTRY: number
  currentQuantity?: number
}

export default function PriceTierTable({ tiers, boxQuantity, basePriceTRY, currentQuantity = 1 }: Props) {
  const sorted = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity)

  const getActiveTierIndex = () => {
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (currentQuantity >= sorted[i].minQuantity) return i
    }
    return -1 // base price active
  }

  const activeTierIdx = getActiveTierIndex()

  return (
    <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📦</span>
        <h3 className="font-semibold text-gray-800">Toplu Alım Fiyatları</h3>
        {boxQuantity && <span className="text-xs text-gray-500">(1 koli = {boxQuantity} adet)</span>}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-blue-200">
            <th className="text-left py-2">Miktar</th>
            <th className="text-left py-2">Birim Fiyat</th>
            <th className="text-left py-2">Tasarruf</th>
          </tr>
        </thead>
        <tbody>
          {/* Base price row */}
          <tr className={`border-b border-blue-100 ${activeTierIdx === -1 ? 'bg-blue-100 font-semibold' : ''}`}>
            <td className="py-2">1 adet</td>
            <td className="py-2">{formatPrice(basePriceTRY)}</td>
            <td className="py-2 text-gray-400">—</td>
          </tr>
          {sorted.map((tier, idx) => {
            const savings = ((basePriceTRY - tier.unitPriceTRY) / basePriceTRY * 100).toFixed(0)
            const isActive = activeTierIdx === idx

            // Label: kolili ise "X koli (Y adet)", değilse "X adet"
            let label = `${tier.minQuantity} adet`
            if (boxQuantity && boxQuantity > 1) {
              const boxes = Math.round(tier.minQuantity / boxQuantity)
              label = `${boxes} koli (${tier.minQuantity} adet)`
            }

            return (
              <tr key={idx} className={`border-b border-blue-100 ${isActive ? 'bg-blue-100 font-semibold' : ''}`}>
                <td className="py-2">{label}</td>
                <td className="py-2 text-blue-600">{formatPrice(tier.unitPriceTRY)}</td>
                <td className="py-2 text-green-600">%{savings} indirim</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
