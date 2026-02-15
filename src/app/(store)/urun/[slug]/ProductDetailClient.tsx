'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FiShoppingCart, FiMessageCircle, FiFileText } from 'react-icons/fi'
import toast from 'react-hot-toast'
import CampaignTierTable from '@/components/CampaignTierTable'

interface CampaignTier {
  minQuantity: number
  value: number
}

interface CampaignInfo {
  id: string
  name: string
  type: 'PERCENTAGE' | 'FIXED_PRICE'
  tiers: CampaignTier[]
}

interface Props {
  productId: string
  productName: string
  stock: number
  trackStock?: boolean
  priceTRY: number
  campaigns?: CampaignInfo[]
}

export default function ProductDetailClient({ productId, productName, stock, trackStock = true, priceTRY, campaigns = [] }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find((item: any) => item.productId === productId)
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.push({ productId, quantity })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    toast.success('Ürün sepete eklendi!')
    window.dispatchEvent(new Event('cart-updated'))
  }

  const handleAddToQuoteList = () => {
    if (!session) {
      toast.error('Teklif isteyebilmek için giriş yapmalısınız.')
      router.push('/giris')
      return
    }
    const quoteCart = JSON.parse(localStorage.getItem('quoteCart') || '[]')
    const existing = quoteCart.find((item: any) => item.productId === productId)
    if (existing) {
      existing.quantity = quantity
      toast.success('Teklif listesindeki miktar güncellendi!')
    } else {
      quoteCart.push({ productId, quantity })
      toast.success('Ürün teklif listesine eklendi!')
    }
    localStorage.setItem('quoteCart', JSON.stringify(quoteCart))
    window.dispatchEvent(new Event('quote-cart-updated'))
  }

  const whatsappMessage = encodeURIComponent(`Merhaba, "${productName}" ürünü hakkında bilgi almak istiyorum.`)

  return (
    <div>
      {/* Quantity & Add to Cart */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-50"
            aria-label="Azalt"
          >-</button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 text-center border-x py-2"
            min="1"
          />
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-2 text-gray-600 hover:bg-gray-50"
            aria-label="Artır"
          >+</button>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={trackStock && stock === 0}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiShoppingCart className="w-4 h-4 mr-2" />
          Sepete Ekle
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToQuoteList}
          className="btn-secondary flex-1"
        >
          <FiFileText className="w-4 h-4 mr-2" />
          Teklif Listesine Ekle
        </button>
        <a
          href={`https://wa.me/905326404086?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-600 transition-colors inline-flex items-center"
        >
          <FiMessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </a>
      </div>

      {/* Campaign Tier Tables */}
      {campaigns.length > 0 && campaigns.map(campaign => (
        <CampaignTierTable
          key={campaign.id}
          tiers={campaign.tiers}
          type={campaign.type}
          campaignName={campaign.name}
          basePriceTRY={priceTRY}
          currentQuantity={quantity}
        />
      ))}
    </div>
  )
}
