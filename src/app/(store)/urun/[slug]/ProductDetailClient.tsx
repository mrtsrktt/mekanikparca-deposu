'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FiShoppingCart, FiMessageCircle, FiFileText, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import CampaignTierTable from '@/components/CampaignTierTable'
import PriceTierTable from '@/components/PriceTierTable'
import { getStorageArray } from '@/lib/safeStorage'
import { formatPrice } from '@/lib/pricing'
import { calculateB2BPrice } from '@/lib/b2bPricing'
import { DEALER_BADGE_LABELS, type DealerType } from '@/lib/dealerTypeShared'
import { validateAndAdjustQuantity } from '@/lib/orderQuantityValidation'
import { trackAddToCart, trackWhatsAppClick } from '@/lib/gtm'
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

interface PriceTierInfo {
  minQuantity: number
  unitPriceTRY: number
}

interface Props {
  productId: string
  productName: string
  stock: number
  trackStock?: boolean
  priceTRY: number
  retailPriceTRY?: number
  campaigns?: CampaignInfo[]
  boxQuantity?: number | null
  priceTiers?: PriceTierInfo[]
  minOrder?: number
}

export default function ProductDetailClient({ productId, productName, stock, trackStock = true, priceTRY, retailPriceTRY, campaigns = [], boxQuantity, priceTiers = [], minOrder = 1 }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const minQty = minOrder && minOrder > 0 ? minOrder : 1
  const [quantity, setQuantity] = useState(minQty)

  // Adet degisimlerinde minimum siparis adedi ve koli kati kurallarini uygular.
  const applyQuantityRules = (requested: number): number => {
    const adjusted = validateAndAdjustQuantity(requested, minQty, boxQuantity, true)
    return adjusted.validQuantity
  }
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  // Onaylı bayi bilgisi: tür + güncel indirim oranı. null ise bayi değil.
  const [dealer, setDealer] = useState<{ dealerType: DealerType; discountPercent: number } | null>(null)
  const isCorporateApproved = dealer !== null

  // Bayi ise şeffaf depo stoğu ve bayi fiyatı gösterilir. Oran SiteSetting'ten
  // okunur; admin değiştirince sayfa yenilendiğinde yeni oran görünür.
  useEffect(() => {
    if (!session?.user) {
      setDealer(null)
      return
    }
    let active = true
    fetch('/api/corporate/dealer-info')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { dealer?: { dealerType: DealerType; discountPercent: number } | null } | null) => {
        if (active) setDealer(data?.dealer ?? null)
      })
      .catch(() => {
        if (active) setDealer(null)
      })
    return () => {
      active = false
    }
  }, [session])

  // Tier tabloları için perakende baz fiyat (karşılaştırma amaçlı)
  const basePriceForTiers = retailPriceTRY ?? priceTRY

  const handleAddToCart = () => {
    if (isAddingToCart || isAdded) return

    // Sepete eklemeden once minimum siparis / koli kati kurallarini uygula.
    const adjusted = validateAndAdjustQuantity(quantity, minQty, boxQuantity, true)
    const finalQuantity = adjusted.validQuantity
    if (adjusted.wasAdjusted) setQuantity(finalQuantity)

    setIsAddingToCart(true)
    
    // Sepete ekle
    const cart = getStorageArray('cart')
    const existing = cart.find((item: any) => item.productId === productId)
    if (existing) {
      existing.quantity += finalQuantity
    } else {
      cart.push({ productId, quantity: finalQuantity })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    trackAddToCart(productName, productId, priceTRY)

    // Sepet güncelleme event'i
    window.dispatchEvent(new Event('cart-updated'))

    // Sepete ekledikten sonra direkt sepet sayfasına git
    setIsAdded(true)
    router.push('/sepet')
  }

  const handleAddToQuoteList = () => {
    if (!session) {
      toast.error('Teklif isteyebilmek için giriş yapmalısınız.')
      router.push('/giris')
      return
    }
    const quoteCart = getStorageArray('quoteCart')
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

  // B2B çifte fiyat: perakende liste fiyatı ve bayi özel fiyatı
  const basePrice = retailPriceTRY ?? priceTRY
  const b2bResult = calculateB2BPrice(basePrice, dealer?.discountPercent ?? 0)
  return (
    <div>
      {/* B2B Çifte Fiyat — yalnızca onaylı kurumsal müşterilere gösterilir */}
      {isCorporateApproved && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-5">
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide w-full">Bayi Özel Alış Fiyatı</span>
            <span className="text-3xl md:text-4xl font-black text-blue-600">
              {formatPrice(b2bResult.b2bPrice)}
            </span>
            <span className="text-sm font-semibold text-gray-500">+ KDV</span>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            {DEALER_BADGE_LABELS[dealer?.dealerType ?? 'WHOLESALER']} Kazancınız: {formatPrice(b2bResult.savings)} (%{b2bResult.discountPercent} İskonto)
          </div>
        </div>
      )}

      {/* Quick Box Selection */}
      {priceTiers.length > 0 && boxQuantity && boxQuantity > 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs text-gray-500 self-center mr-1">Hızlı Seçim:</span>
          <button type="button" onClick={() => setQuantity(minQty)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${quantity === minQty ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 hover:border-blue-400 text-gray-600'}`}>
            {minQty} Adet
          </button>
          <button type="button" onClick={() => setQuantity(boxQuantity)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${quantity === boxQuantity ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 hover:border-blue-400 text-gray-600'}`}>
            1 Koli ({boxQuantity} adet)
          </button>
          {priceTiers.some(t => t.minQuantity >= boxQuantity * 10) && (
            <button type="button" onClick={() => setQuantity(boxQuantity * 10)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${quantity === boxQuantity * 10 ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 hover:border-blue-400 text-gray-600'}`}>
              10 Koli ({boxQuantity * 10} adet)
            </button>
          )}
        </div>
      )}

      {/* Stok durumu: B2B musteriye seffaf depo stogu, B2C'ye var/tukendi rozeti */}
      {trackStock && (
        isCorporateApproved ? (
          stock > 0 ? (
            <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Depo Stoğu: {stock} Adet
            </div>
          ) : (
            <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Tükendi
            </div>
          )
        ) : (
          stock > 0 ? (
            <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Stokta Var
            </div>
          ) : (
            <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Tükendi
            </div>
          )
        )
      )}

      {/* Minimum sipariş uyarısı */}
      {minQty > 1 && (
        <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
          ⚠️ Bu ürün minimum <strong>{minQty} adet</strong> sipariş edilebilir.
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => setQuantity(applyQuantityRules(quantity - 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-50"
            aria-label="Azalt"
          >-</button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(applyQuantityRules(parseInt(e.target.value, 10)))}
            className="w-16 text-center border-x py-2"
            min={minQty}
          />
          <button
            onClick={() => setQuantity(applyQuantityRules(quantity + 1))}
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
          Toplu Alımlar için Teklif İsteyin
        </button>
        <a
          href={`https://wa.me/905326404086?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick('product_detail')}
          className="bg-green-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-600 transition-colors inline-flex items-center"
        >
          <FiMessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </a>
      </div>

      {/* Price Tier Table */}
      {priceTiers.length > 0 && (
        <PriceTierTable
          tiers={priceTiers}
          boxQuantity={boxQuantity || null}
          basePriceTRY={basePriceForTiers}
          currentQuantity={quantity}
        />
      )}

      {/* Campaign Tier Tables */}
      {campaigns.length > 0 && campaigns.map(campaign => (
        <CampaignTierTable
          key={campaign.id}
          tiers={campaign.tiers}
          type={campaign.type}
          campaignName={campaign.name}
          basePriceTRY={basePriceForTiers}
          currentQuantity={quantity}
        />
      ))}
    </div>
  )
}
