'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FiShoppingCart, FiMessageCircle, FiFileText, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import CampaignTierTable from '@/components/CampaignTierTable'
import Link from 'next/link'

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
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = () => {
    if (isAddingToCart || isAdded) return
    
    setIsAddingToCart(true)
    
    // Sepete ekle
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find((item: any) => item.productId === productId)
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.push({ productId, quantity })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    
    // Toast bildirimi göster
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">Ürün sepete eklendi!</p>
              <p className="mt-1 text-sm text-gray-500">{productName}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <Link
            href="/sepet"
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none"
          >
            Sepete Git
          </Link>
        </div>
      </div>
    ), {
      duration: 3000,
      position: 'top-right',
    })
    
    // Sepet güncelleme event'i
    window.dispatchEvent(new Event('cart-updated'))
    
    // Buton durumunu güncelle
    setIsAdded(true)
    setTimeout(() => {
      setIsAdded(false)
      setIsAddingToCart(false)
    }, 2000)
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
          disabled={trackStock && stock === 0 || isAddingToCart || isAdded}
          className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isAdded 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700'
          }`}
        >
          {isAddingToCart ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : isAdded ? (
            <>
              <FiCheck className="w-4 h-4 mr-2" />
              Eklendi
            </>
          ) : (
            <>
              <FiShoppingCart className="w-4 h-4 mr-2" />
              Sepete Ekle
            </>
          )}
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
