'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiMinus, FiPlus, FiShoppingCart, FiCheck, FiCopy } from 'react-icons/fi'
import { formatPrice } from '@/lib/pricing'
import { getStorageArray } from '@/lib/safeStorage'

interface ProductInGroup {
  id: string
  name: string
  sku?: string
  priceTRY: number
  brand?: { name: string } | null
  images?: { url: string }[]
}

interface Group {
  id: string
  name: string
  threshold: number
  products: ProductInGroup[]
}

interface Campaign {
  id: string
  name: string
  slug: string
  description?: string
  giftName: string
  giftStockCode: string
  giftValue: number
  giftQuantity: number
  giftImage?: string
  groups: Group[]
}

export default function GiftCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeGroup, setActiveGroup] = useState(0)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [showPopup, setShowPopup] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  // Load campaign
  useEffect(() => {
    fetch(`/api/gift-campaigns/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return }
        setCampaign(data)

        // Restore saved quantities from localStorage
        const saved = localStorage.getItem(`gc_${data.id}`)
        if (saved) {
          try { setQuantities(JSON.parse(saved)) } catch {}
        }

        setLoading(false)
      })
      .catch(() => { setError('Kampanya yüklenirken hata oluştu.'); setLoading(false) })
  }, [slug])

  // Save quantities to localStorage on change
  useEffect(() => {
    if (campaign) {
      localStorage.setItem(`gc_${campaign.id}`, JSON.stringify(quantities))
    }
  }, [quantities, campaign])

  // Calculate totals per group
  const groupTotals = useMemo(() => {
    if (!campaign) return []
    return campaign.groups.map(group => {
      let total = 0
      let subtotal = 0
      group.products.forEach(p => {
        const qty = quantities[p.id] || 0
        if (qty > 0) {
          total += qty
          subtotal += qty * p.priceTRY
        }
      })
      return { total, subtotal, threshold: group.threshold }
    })
  }, [campaign, quantities])

  // Current active group total
  const currentTotal = groupTotals[activeGroup]?.total || 0
  const currentThreshold = campaign?.groups[activeGroup]?.threshold || 999999
  const currentSubtotal = groupTotals[activeGroup]?.subtotal || 0
  const thresholdReached = currentTotal >= currentThreshold
  const progressPercent = Math.min(100, Math.round((currentTotal / currentThreshold) * 100))

  // Calculate how many times threshold is reached
  const timesReached = Math.floor(currentTotal / currentThreshold)

  const updateQuantity = (productId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[productId] || 0
      const next = Math.max(0, current + delta)
      return { ...prev, [productId]: next }
    })
    setAddedToCart(false)
  }

  const handleQuantityInput = (productId: string, value: string) => {
    const num = parseInt(value) || 0
    setQuantities(prev => ({ ...prev, [productId]: Math.max(0, num) }))
    setAddedToCart(false)
  }

  // Add to cart and redirect to checkout
  const handleAddToCart = () => {
    if (!campaign) return

    // Get selected products
    const cartItems: { productId: string; quantity: number }[] = []
    campaign.groups[activeGroup].products.forEach(p => {
      const qty = quantities[p.id] || 0
      if (qty > 0) {
        cartItems.push({ productId: p.id, quantity: qty })
      }
    })

    if (cartItems.length === 0) return

    // Add to cart (merge with existing cart)
    const existingCart = getStorageArray('cart')
    const mergedCart = [...existingCart]

    cartItems.forEach(item => {
      const existingIdx = mergedCart.findIndex(ci => ci.productId === item.productId)
      if (existingIdx >= 0) {
        mergedCart[existingIdx].quantity += item.quantity
      } else {
        mergedCart.push(item)
      }
    })

    localStorage.setItem('cart', JSON.stringify(mergedCart))
    window.dispatchEvent(new Event('cart-updated'))

    // Save campaign gift info for checkout page
    localStorage.setItem('giftCampaign', JSON.stringify({
      campaignId: campaign.id,
      campaignName: campaign.name,
      campaignSlug: campaign.slug,
      giftName: campaign.giftName,
      giftStockCode: campaign.giftStockCode,
      giftValue: campaign.giftValue,
      giftQuantity: campaign.giftQuantity * timesReached,
      giftImage: campaign.giftImage,
      groupName: campaign.groups[activeGroup].name,
      totalQuantity: currentTotal,
      threshold: currentThreshold,
      products: cartItems.map(item => {
        const product = campaign.groups[activeGroup].products.find(p => p.id === item.productId)
        return { productId: item.productId, quantity: item.quantity, name: product?.name || '', priceTRY: product?.priceTRY || 0 }
      }),
    }))

    setAddedToCart(true)
    setShowPopup(true)
  }

  const goToCheckout = () => {
    router.push('/odeme')
  }

  // Copy share link
  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('Kampanya linki kopyalandı!'))
      .catch(() => {})
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
          <div className="h-64 bg-gray-200 rounded-xl max-w-4xl mx-auto" />
        </div>
      </div>
    )
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-4">🔍</span>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Kampanya Bulunamadı</h1>
        <p className="text-gray-500 mb-6">{error || 'Bu kampanya aktif değil veya bulunamadı.'}</p>
        <Link href="/kampanyalar" className="btn-primary">Tüm Kampanyalar</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-500">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/kampanyalar" className="hover:text-primary-500">Kampanyalar</Link>
        <span>/</span>
        <span className="text-gray-800">{campaign.giftName}</span>
      </div>

      {/* Gift Device Hero — Premium Tasarım */}
      <div className="relative overflow-hidden rounded-3xl mb-8 bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 text-white shadow-2xl shadow-indigo-900/20">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-indigo-400 rounded-full blur-3xl" />
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-400/10 to-transparent rounded-bl-full pointer-events-none" />

        <div className="relative p-6 md:p-10">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Gift Image — Premium Card */}
            <div className="flex-shrink-0">
              <div className="relative group">
                {/* Glow effect behind image */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-300/30 via-white/10 to-indigo-300/20 rounded-2xl blur-xl scale-110" />
                {campaign.giftImage ? (
                  <div className="relative w-44 h-44 md:w-52 md:h-52 bg-white rounded-2xl p-4 shadow-2xl flex items-center justify-center">
                    <Image
                      src={campaign.giftImage}
                      alt={campaign.giftName}
                      width={180}
                      height={180}
                      className="object-contain max-w-full max-h-full"
                    />
                  </div>
                ) : (
                  <div className="relative w-44 h-44 md:w-52 md:h-52 bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center gap-3 border border-white/50">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/30">
                      <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">GÖRSEL YAKINDA</span>
                  </div>
                )}
              </div>
            </div>

            {/* Gift Info */}
            <div className="flex-1 text-center lg:text-left">
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-400/20 uppercase tracking-wider">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  HEDİYE KAMPANYASI
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium rounded-full border border-white/10">
                  Sınırlı Süre
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-3 tracking-tight leading-tight">
                {campaign.giftName}
              </h1>

              {/* Key Info Pills */}
              <div className="flex flex-wrap items-center gap-2.5 justify-center lg:justify-start mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-sm text-white/90 border border-white/10">
                  <span className="text-white/50 text-xs">Stok Kodu</span>
                  <span className="font-mono font-bold text-white">{campaign.giftStockCode}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/20 backdrop-blur-sm rounded-lg text-sm border border-amber-400/30">
                  <span className="text-amber-300/70 text-xs">Değer</span>
                  <span className="font-bold text-amber-100">{formatPrice(campaign.giftValue)}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-sm text-white/90 border border-white/10">
                  <span className="text-white/50 text-xs">Adet</span>
                  <span className="font-bold text-white">{campaign.giftQuantity > 1 ? `${campaign.giftQuantity} Adet` : '1 Adet'}</span>
                </span>
              </div>

              {campaign.description && (
                <p className="text-white/60 text-sm leading-relaxed max-w-xl">{campaign.description}</p>
              )}
            </div>

            {/* Share Button */}
            <button
              onClick={copyShareLink}
              className="flex-shrink-0 self-start p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-105 border border-white/10"
              title="Kampanya linkini kopyala"
            >
              <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Product Groups & Selection */}
        <div className="lg:col-span-2">
          {/* Group Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {campaign.groups.map((group, idx) => {
              const gt = groupTotals[idx]
              const reached = gt.total >= gt.threshold
              return (
                <button
                  key={group.id}
                  onClick={() => { setActiveGroup(idx); setShowPopup(false); setAddedToCart(false) }}
                  className={`flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeGroup === idx
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                      : reached
                        ? 'bg-green-50 border-2 border-green-300 text-green-700 hover:bg-green-100'
                        : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xs opacity-70">{group.name}</div>
                  <div className="text-lg font-bold">
                    {gt.total} / {gt.threshold}
                  </div>
                  {reached && <div className="text-xs">✓ Ulaşıldı</div>}
                </button>
              )
            })}
          </div>

          {/* Active Group Products */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-800">
                {campaign.groups[activeGroup].name}
              </h3>
              <span className="text-sm text-gray-500">
                {campaign.groups[activeGroup].products.length} ürün
              </span>
            </div>

            {campaign.groups[activeGroup].products.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <span className="text-4xl block mb-3">📦</span>
                <p>Bu grupta henüz ürün bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {campaign.groups[activeGroup].products.map(product => {
                  const qty = quantities[product.id] || 0
                  return (
                    <div key={product.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        qty > 0 ? 'border-primary-300 bg-primary-50/50' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {/* Product Image */}
                      <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                        {product.images?.[0]?.url ? (
                          <Image src={product.images[0].url} alt={product.name} width={56} height={56}
                            className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">📦</div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{product.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {product.sku && <span>SKU: {product.sku}</span>}
                          {product.brand && <span>• {product.brand.name}</span>}
                        </div>
                        <p className="text-sm font-bold text-primary-600 mt-0.5">
                          {formatPrice(product.priceTRY)} / adet
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          disabled={qty === 0}
                          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center
                            hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <FiMinus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={qty || ''}
                          placeholder="0"
                          onChange={e => handleQuantityInput(product.id, e.target.value)}
                          className="w-16 h-8 text-center text-sm font-bold border border-gray-300 rounded-lg focus:border-primary-400 focus:ring-1 focus:ring-primary-200 outline-none"
                        />
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center
                            hover:bg-primary-50 hover:border-primary-300 transition-colors"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Total */}
                      {qty > 0 && (
                        <div className="hidden sm:block w-24 text-right flex-shrink-0">
                          <div className="text-sm font-bold text-gray-700">{formatPrice(qty * product.priceTRY)}</div>
                          <div className="text-xs text-gray-400">{qty} adet</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Progress & Checkout Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4">
            {/* Progress Card */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-800 mb-4">📊 İlerleme Durumu</h3>

              {/* Progress bar */}
              <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                    thresholdReached
                      ? 'bg-green-500'
                      : progressPercent > 50
                        ? 'bg-primary-500'
                        : 'bg-amber-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                  {currentTotal} / {currentThreshold}
                </span>
              </div>

              <div className="text-center mb-4">
                {thresholdReached ? (
                  <div className="text-green-600 font-bold text-lg animate-bounce">
                    🎉 Hedefe Ulaştınız!
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    Hedefe <strong>{currentThreshold - currentTotal}</strong> adet kaldı
                  </div>
                )}
              </div>

              {/* Gift preview — Premium Card */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 mb-4 text-center shadow-lg shadow-slate-900/10 border border-slate-700/30">
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                <div className="relative">
                  <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/20">
                    {campaign.giftImage ? (
                      <Image src={campaign.giftImage} alt={campaign.giftName} width={40} height={40}
                        className="object-contain rounded-lg" />
                    ) : (
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    )}
                  </div>
                  <p className="font-bold text-white text-sm leading-tight">{campaign.giftName}</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{campaign.giftStockCode}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/15 rounded-lg border border-amber-400/20">
                    <span className="text-amber-300 text-xs font-semibold">Değer: {formatPrice(campaign.giftValue)}</span>
                  </div>
                  {campaign.giftQuantity > 1 && (
                    <p className="text-xs text-amber-400/70 mt-2 font-medium">
                      ✦ Her kazanımda <strong className="text-amber-300">{campaign.giftQuantity} adet</strong> verilir
                    </p>
                  )}
                </div>
              </div>

              {/* Times reached */}
              {timesReached > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-center">
                  <p className="text-sm text-green-700">
                    Bu gruptan toplam <strong>{timesReached}x</strong> hediye kazanabilirsiniz!
                  </p>
                  {campaign.giftQuantity > 1 && (
                    <p className="text-xs text-green-600 mt-1">
                      Toplam {timesReached * campaign.giftQuantity} adet hediye cihaz
                    </p>
                  )}
                </div>
              )}

              {/* Subtotal */}
              <div className="border-t pt-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ürün Toplamı:</span>
                  <span className="font-bold text-gray-800">{formatPrice(currentSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1 text-green-600">
                  <span>Hediye:</span>
                  <span className="font-bold">ÜCRETSİZ 🎁</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              {thresholdReached ? (
                <div className="space-y-3">
                  {!addedToCart ? (
                    <button
                      onClick={handleAddToCart}
                      className="w-full btn-primary py-3 text-base font-bold flex items-center justify-center gap-2"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                      Sepete Ekle ve Ödemeye Geç
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600 justify-center">
                        <FiCheck className="w-5 h-5" />
                        <span className="font-medium">Sepete eklendi!</span>
                      </div>
                      <button
                        onClick={goToCheckout}
                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 text-base font-bold transition-colors"
                      >
                        Ödemeye Geç →
                      </button>
                      <button
                        onClick={() => setShowPopup(false)}
                        className="w-full btn-secondary text-sm"
                      >
                        Alışverişe Devam Et
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 rounded-lg py-3 text-base font-bold cursor-not-allowed"
                >
                  Hediye için {currentThreshold - currentTotal} adet daha ekleyin
                </button>
              )}
            </div>

            {/* How it works */}
            <div className="card p-4 text-sm">
              <h4 className="font-bold text-gray-800 mb-2">📋 Nasıl Çalışır?</h4>
              <ol className="space-y-1.5 text-gray-600 list-decimal list-inside">
                <li>Ürün grubu seçin (sekmelerden)</li>
                <li>İstediğiniz ürünlerden adet girin</li>
                <li>Toplam adet eşiğe ulaşınca hediye kazanın</li>
                <li>Sepete ekleyip ödemeye geçin</li>
              </ol>
              <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                💡 <strong>Unutmayın:</strong> Grup içi ürünleri karıştırabilirsiniz, farklı gruplar birleştirilmez.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup Modal — Premium */}
      {showPopup && thresholdReached && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-bounce-in">
            {/* Popup Header */}
            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-400/30">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-1">Tebrikler! 🎉</h2>
              <p className="text-white/70 text-sm">
                <strong>{currentThreshold}</strong> adet hedefine ulaştınız
              </p>
            </div>

            {/* Popup Body */}
            <div className="p-6">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 mb-4 text-center border border-slate-700/30">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
                <div className="relative">
                  <p className="font-bold text-white text-lg mb-1">{campaign.giftName}</p>
                  <p className="text-xs text-slate-400 font-mono">{campaign.giftStockCode}</p>
                  <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-xl border border-green-400/30">
                    <span className="text-green-300 text-sm font-bold">ÜCRETSİZ KAZANDINIZ!</span>
                  </div>
                  {campaign.giftQuantity > 1 && (
                    <p className="text-xs text-slate-400 mt-2">{campaign.giftQuantity} adet verilecek</p>
                  )}
                  {timesReached > 1 && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/15 rounded-lg border border-amber-400/20">
                      <span className="text-amber-300 text-xs font-bold">
                        Toplam {timesReached}x ({timesReached * campaign.giftQuantity} adet) hediye!
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center mb-4">
                Seçtiğiniz ürünler sepete eklenmiştir. Hediye cihazınız ödeme sayfasında belirtilecektir.
              </p>

              <div className="space-y-2">
                <button
                  onClick={goToCheckout}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl py-3.5 font-bold text-base transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
                >
                  🛒 Ödemeye Geç
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl py-2.5 text-sm font-medium transition-colors"
                >
                  Alışverişe Devam Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
