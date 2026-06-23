'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiMinus, FiPlus, FiShoppingCart, FiCheck, FiClock, FiGift, FiShare2, FiTruck, FiPackage, FiChevronRight, FiStar, FiCreditCard, FiExternalLink } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { formatPrice } from '@/lib/pricing'
import { getStorageArray } from '@/lib/safeStorage'
import { trackWhatsAppClick } from '@/lib/gtm'

const WHATSAPP_NUMBER = '905326404086'

// ============================================================
// Types
// ============================================================
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
  giftProductSlug?: string | null
  installmentCount?: number
  startDate: string
  endDate: string
  groups: Group[]
}

// ============================================================
// Product Card
// ============================================================
function ProductCard({
  product,
  quantity,
  onIncrease,
  onDecrease,
  onInput,
}: {
  product: ProductInGroup
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  onInput: (val: string) => void
}) {
  const isSelected = quantity > 0
  return (
    <div
      className={`group relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
        isSelected
          ? 'border-amber-400 bg-amber-50/60 shadow-md shadow-amber-100'
          : 'border-gray-100 bg-white hover:border-amber-200 hover:shadow-md'
      }`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-200">
          <FiCheck className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Product Image */}
      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-xl flex-shrink-0 overflow-hidden transition-shadow duration-300 ${
        isSelected ? 'bg-white shadow-md' : 'bg-gray-50 group-hover:shadow-md'
      }`}>
        {product.images?.[0]?.url ? (
          <Image
            src={product.images[0].url}
            alt={product.name}
            width={80}
            height={80}
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
            <FiPackage />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 text-sm md:text-base leading-tight line-clamp-2">
          {product.name}
        </h4>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {product.brand && (
            <span className="text-xs text-gray-400 font-medium">{product.brand.name}</span>
          )}
          {product.sku && (
            <span className="text-[10px] text-gray-300 font-mono">{product.sku}</span>
          )}
        </div>
        <div className="mt-1.5">
          <span className="text-base md:text-lg font-extrabold text-gray-900">
            {formatPrice(product.priceTRY)}
          </span>
          <span className="text-xs text-gray-400 ml-1">/ adet</span>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-0.5">
          <button
            onClick={onDecrease}
            disabled={quantity === 0}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <FiMinus className="w-3.5 h-3.5" />
          </button>
          <input
            type="number"
            min={0}
            value={quantity || ''}
            placeholder="0"
            onChange={e => onInput(e.target.value)}
            className="w-12 h-8 text-center text-sm font-bold bg-transparent border-none outline-none tabular-nums"
          />
          <button
            onClick={onIncrease}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white hover:bg-amber-100 hover:text-amber-700 transition-colors shadow-sm"
          >
            <FiPlus className="w-3.5 h-3.5" />
          </button>
        </div>
        {quantity > 0 && (
          <span className="text-xs font-bold text-amber-600 tabular-nums">
            {formatPrice(quantity * product.priceTRY)}
          </span>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Main Page Component
// ============================================================
export default function GiftCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeGroup, setActiveGroup] = useState(0)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  // Load campaign
  useEffect(() => {
    fetch(`/api/gift-campaigns/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return }
        setCampaign(data)

        const saved = localStorage.getItem(`gc_${data.id}`)
        if (saved) {
          try { setQuantities(JSON.parse(saved)) } catch {}
        }

        setLoading(false)
      })
      .catch(() => { setError('Kampanya yüklenirken hata oluştu.'); setLoading(false) })
  }, [slug])

  // Save quantities to localStorage
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

  const currentTotal = groupTotals[activeGroup]?.total || 0
  const currentThreshold = campaign?.groups[activeGroup]?.threshold || 999999
  const currentSubtotal = groupTotals[activeGroup]?.subtotal || 0
  const thresholdReached = currentTotal >= currentThreshold
  const progressPercent = Math.min(100, Math.round((currentTotal / currentThreshold) * 100))
  const timesReached = Math.floor(currentTotal / currentThreshold)
  const remaining = Math.max(0, currentThreshold - currentTotal)

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[productId] || 0
      return { ...prev, [productId]: Math.max(0, current + delta) }
    })
    setAddedToCart(false)
    setShowSuccess(false)
  }, [])

  const handleQuantityInput = useCallback((productId: string, value: string) => {
    const num = parseInt(value) || 0
    setQuantities(prev => ({ ...prev, [productId]: Math.max(0, num) }))
    setAddedToCart(false)
    setShowSuccess(false)
  }, [])

  const handleAddToCart = useCallback(() => {
    if (!campaign || !thresholdReached) return

    const cartItems: { productId: string; quantity: number }[] = []
    campaign.groups[activeGroup].products.forEach(p => {
      const qty = quantities[p.id] || 0
      if (qty > 0) cartItems.push({ productId: p.id, quantity: qty })
    })

    if (cartItems.length === 0) return

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
    setShowSuccess(true)
  }, [campaign, thresholdReached, activeGroup, quantities, currentTotal, currentThreshold, timesReached])

  const goToCheckout = useCallback(() => {
    router.push('/odeme')
  }, [router])

  const copyShareLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        const el = document.getElementById('share-toast')
        if (el) { el.style.opacity = '1'; setTimeout(() => { el.style.opacity = '0' }, 2000) }
      })
      .catch(() => {})
  }, [])

  // ============================================================
  // Render: Loading
  // ============================================================
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded-xl w-1/4" />
          <div className="h-72 bg-gray-200 rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-2xl" />
              ))}
            </div>
            <div className="h-96 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // Render: Error / Not Found
  // ============================================================
  if (error || !campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <FiGift className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Kampanya Bulunamadı</h1>
        <p className="text-gray-500 mb-6">{error || 'Bu kampanya aktif değil veya sona ermiş olabilir.'}</p>
        <Link href="/kampanyalar" className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          <FiChevronRight className="w-5 h-5" />
          Tüm Kampanyaları Gör
        </Link>
      </div>
    )
  }

  // ============================================================
  // Render: Campaign Page
  // ============================================================
  // WhatsApp: kampanya adıyla hazır mesaj — kullanıcı sadece gönder'e basar
  const waMessage = encodeURIComponent(`Merhaba, "${campaign.giftName}" kampanyası için detaylı bilgi almak istiyorum.`)
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================================================================ */}
      {/* HERO SECTION */}
      {/* ================================================================ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Glow effects */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-16">
          {/* Top badge row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-full shadow-lg shadow-amber-500/30">
              <FiStar className="w-4 h-4 fill-white" />
              HEDİYE KAMPANYASI
            </div>
            {/* Peşin fiyatına taksit — BÜYÜK, animasyonlu, çok dikkat çekici */}
            <div className="relative animate-taksit-pop">
              <span className="absolute -inset-2 bg-green-400/60 rounded-2xl blur-lg animate-taksit-glow pointer-events-none" />
              <div className="relative inline-flex items-center gap-3 px-5 py-3 md:px-6 md:py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl shadow-green-500/40 ring-2 ring-green-300/50 overflow-hidden">
                {/* Parıltı süpürme */}
                <span
                  className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"
                  style={{ animation: 'shimmer 2.5s infinite' }}
                />
                <FiCreditCard className="relative w-6 h-6 md:w-7 md:h-7 flex-shrink-0" />
                <span className="relative text-base md:text-2xl font-black tracking-tight whitespace-nowrap leading-none">
                  PEŞİN FİYATINA {campaign.installmentCount || 6} TAKSİT
                </span>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500/20 backdrop-blur-sm text-red-200 text-xs font-bold rounded-full border border-red-400/30">
              <FiClock className="w-3.5 h-3.5" />
              Stoklarla Sınırlı
            </div>
            <button
              onClick={copyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/70 hover:text-white text-xs font-medium rounded-full border border-white/10 transition-all"
            >
              <FiShare2 className="w-3.5 h-3.5" />
              Paylaş
            </button>
          </div>

          {/* Main hero row */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Gift Image */}
            <div className="flex-shrink-0">
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute -inset-6 bg-amber-400/20 rounded-full blur-2xl" />
                {/* Image container */}
                <div className="relative w-40 h-40 md:w-56 md:h-56 bg-white rounded-3xl p-4 shadow-2xl shadow-black/30 flex items-center justify-center border border-white/20">
                  {campaign.giftImage ? (
                    <Image
                      src={campaign.giftImage}
                      alt={campaign.giftName}
                      width={200}
                      height={200}
                      className="object-contain max-w-full max-h-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-300">
                      <FiGift className="w-16 h-16" />
                      <span className="text-xs font-medium">GÖRSEL YAKINDA</span>
                    </div>
                  )}
                </div>
                {/* Value badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-xl shadow-green-500/30 whitespace-nowrap">
                  DEĞER: {formatPrice(campaign.giftValue)}
                </div>
              </div>
            </div>

            {/* Hero Text */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-3">
                {campaign.name}
              </h1>
              <p className="text-xl md:text-2xl text-amber-400 font-bold mb-4">
                🎁 {campaign.giftName} <span className="text-white/60 font-normal text-lg">Hediye!</span>
              </p>

              {/* Info pills */}
              <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-start mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-xl text-sm text-white/80 border border-white/10">
                  <span className="text-white/40 text-xs">Stok Kodu</span>
                  <span className="font-mono font-bold text-white">{campaign.giftStockCode}</span>
                </span>
                {campaign.giftQuantity > 1 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/20 backdrop-blur-sm rounded-xl text-sm border border-amber-400/30">
                    <span className="font-bold text-amber-200">{campaign.giftQuantity} Adet</span>
                    <span className="text-amber-300/60 text-xs">birden verilecek</span>
                  </span>
                )}
              </div>

              {/* Aciliyet — stoklarla sınırlı */}
              <div className="flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-3 bg-red-500/15 backdrop-blur-sm rounded-2xl px-5 py-3 border border-red-400/30">
                  <span className="text-2xl">🔥</span>
                  <div className="text-left">
                    <div className="text-base md:text-lg font-black text-white leading-tight">Kampanya Stoklarla Sınırlı</div>
                    <div className="text-xs text-red-200/90 font-medium">Hediye cihaz stoğu tükenmeden fırsatı kaçırmayın!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave/accent */}
        <div className="relative h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
      </div>

      {/* ================================================================ */}
      {/* MAIN CONTENT */}
      {/* ================================================================ */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-600 transition-colors">Ana Sayfa</Link>
          <FiChevronRight className="w-3 h-3" />
          <Link href="/kampanyalar" className="hover:text-gray-600 transition-colors">Kampanyalar</Link>
          <FiChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium truncate">{campaign.giftName}</span>
        </nav>

        {/* ============================================================ */}
        {/* BÜYÜK HEDİYE VİTRİNİ — Ne kazanacaksınız? */}
        {/* ============================================================ */}
        <div className="relative overflow-hidden rounded-3xl mb-8 bg-white border-2 border-amber-300 shadow-xl shadow-amber-100/50">
          {/* Üst şerit */}
          <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 px-6 py-2.5 flex items-center justify-center gap-2">
            <FiGift className="w-5 h-5 text-white" />
            <span className="text-white font-black text-sm md:text-base uppercase tracking-wider">Bu Kampanyada Kazanacağınız Hediye</span>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              {/* BÜYÜK GÖRSEL — tıklanabilir */}
              {(() => {
                const ShowcaseImage = (
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-br from-amber-200/40 to-orange-200/30 rounded-3xl blur-2xl" />
                    <div className="relative w-56 h-56 md:w-72 md:h-72 bg-gradient-to-br from-gray-50 to-white rounded-3xl p-5 flex items-center justify-center border border-gray-100 shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                      {campaign.giftImage ? (
                        <Image
                          src={campaign.giftImage}
                          alt={campaign.giftName}
                          width={280}
                          height={280}
                          className="object-contain max-w-full max-h-full group-hover:scale-105 transition-transform duration-300"
                          priority
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-gray-300">
                          <FiGift className="w-20 h-20" />
                          <span className="text-sm font-medium">Görsel Yakında</span>
                        </div>
                      )}
                    </div>
                    {/* ÜCRETSİZ damgası */}
                    <div className="absolute -top-2 -right-2 md:top-2 md:right-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs md:text-sm font-black px-4 py-2 rounded-2xl shadow-xl shadow-green-500/30 rotate-3">
                      ÜCRETSİZ 🎉
                    </div>
                  </div>
                )
                return campaign.giftProductSlug ? (
                  <Link href={`/urun/${campaign.giftProductSlug}`} className="flex-shrink-0">{ShowcaseImage}</Link>
                ) : (
                  <div className="flex-shrink-0">{ShowcaseImage}</div>
                )
              })()}

              {/* Bilgiler */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-2">
                  {campaign.giftName}
                </h2>
                {campaign.giftQuantity > 1 && (
                  <p className="text-base text-amber-600 font-bold mb-2">
                    🎁 {campaign.giftQuantity} Adet birden hediye!
                  </p>
                )}

                {/* Değer + Ücretsiz */}
                <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-400">Piyasa Değeri:</span>
                    <span className="text-2xl md:text-3xl font-black text-gray-900">{formatPrice(campaign.giftValue)}</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                    <FiCheck className="w-4 h-4" /> Tamamen Ücretsiz
                  </span>
                </div>

                {/* Peşin fiyatına 6 taksit — büyük vurgu */}
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl px-5 py-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiCreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-black text-green-700 leading-tight">Peşin Fiyatına {campaign.installmentCount || 6} Taksit</p>
                    <p className="text-xs text-green-600">Kampanya ürünlerinde faizsiz taksit imkanı</p>
                  </div>
                </div>

                {/* Ürünü incele butonu */}
                {campaign.giftProductSlug && (
                  <div>
                    <Link
                      href={`/urun/${campaign.giftProductSlug}`}
                      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg"
                    >
                      <FiExternalLink className="w-4 h-4" />
                      Hediye Ürünü İncele
                    </Link>
                    <p className="text-xs text-gray-400 mt-2">Stok Kodu: <span className="font-mono">{campaign.giftStockCode}</span></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* WHATSAPP CTA — Ana dönüşüm kanalı, büyük ve belirgin */}
        {/* ============================================================ */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick('kampanya-detay')}
          className="group block mb-8"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/40 transition-all duration-300 active:scale-[0.99] ring-2 ring-green-400/30">
            {/* Dekoratif */}
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-14 left-1/3 w-52 h-52 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            {/* Animasyonlu nabız halkası ikon arkasında */}
            <div className="relative flex flex-col md:flex-row items-center gap-5 p-6 md:p-8">
              <div className="flex-shrink-0 relative">
                <span className="absolute inset-0 rounded-2xl bg-white/40 animate-ping" />
                <div className="relative w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <FaWhatsapp className="w-10 h-10 md:w-12 md:h-12 text-green-500" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left text-white">
                <h2 className="text-xl md:text-2xl font-black leading-tight">
                  Kampanya karışık mı geldi? WhatsApp&apos;tan sorun!
                </h2>
                <p className="text-green-50/90 text-sm md:text-base mt-1.5 leading-relaxed">
                  Tek tıkla bize yazın, <strong className="text-white">{campaign.giftName}</strong> kampanyasının tüm detaylarını anında iletelim.
                  Mesajınız hazır — sadece <strong className="text-white">Gönder</strong>&apos;e basmanız yeterli.
                </p>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto">
                <span className="flex md:inline-flex items-center justify-center gap-2 bg-white text-green-600 font-black text-base md:text-lg px-6 md:px-8 py-4 rounded-2xl shadow-lg group-hover:scale-105 transition-transform whitespace-nowrap">
                  <FaWhatsapp className="w-5 h-5 md:w-6 md:h-6" />
                  WhatsApp&apos;tan Bilgi Al
                </span>
              </div>
            </div>
          </div>
        </a>

        {/* Description banner */}
        {campaign.description && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 p-5 mb-8">
            <div className="absolute top-0 right-0 text-6xl opacity-10">🎁</div>
            <div className="relative">
              <h2 className="text-lg font-bold text-amber-800 mb-1">📢 Kampanya Detayları</h2>
              <p className="text-sm text-amber-700 leading-relaxed">{campaign.description}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ============================================================ */}
          {/* LEFT: Product Selection */}
          {/* ============================================================ */}
          <div className="lg:col-span-2">
            {/* Group Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {campaign.groups.map((group, idx) => {
                const gt = groupTotals[idx]
                const reached = gt.total >= gt.threshold
                const isActive = activeGroup === idx
                return (
                  <button
                    key={group.id}
                    onClick={() => { setActiveGroup(idx); setShowSuccess(false); setAddedToCart(false) }}
                    className={`flex-shrink-0 px-5 py-3.5 rounded-2xl text-left transition-all duration-300 min-w-[140px] ${
                      isActive
                        ? 'bg-white shadow-xl shadow-amber-200/50 border-2 border-amber-400 scale-105'
                        : reached
                          ? 'bg-green-50 border-2 border-green-300 hover:bg-green-100'
                          : 'bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">{group.name}</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-xl font-black tabular-nums ${isActive ? 'text-gray-900' : reached ? 'text-green-700' : 'text-gray-700'}`}>
                        {gt.total}
                      </span>
                      <span className="text-xs text-gray-400">/ {gt.threshold} adet</span>
                    </div>
                    {reached && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-green-600 font-bold mt-1">
                        <FiCheck className="w-3 h-3" /> Ulaşıldı
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Products Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {campaign.groups[activeGroup].name}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Bu gruptan toplam <strong className="text-amber-600">{currentThreshold} adet</strong> ve üzeri alımda hediye kazanırsınız
                </p>
              </div>
              <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl">
                {campaign.groups[activeGroup].products.length} ürün
              </span>
            </div>

            {/* Progress bar (inline) */}
            <div className="mb-6">
              <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                {/* Progress fill */}
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${progressPercent}%`,
                    background: thresholdReached
                      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                      : progressPercent > 60
                        ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : 'linear-gradient(90deg, #f97316, #ea580c)',
                  }}
                />
                {/* Animated shine */}
                {!thresholdReached && (
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      style={{ animation: 'shimmer 2s infinite' }}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className={`font-bold ${thresholdReached ? 'text-green-600' : 'text-amber-600'}`}>
                  {currentTotal} adet
                </span>
                <span className="text-gray-400">{currentThreshold} adet hedef</span>
              </div>
              {thresholdReached && (
                <div className="text-center mt-2 text-green-600 font-bold animate-pulse">
                  🎉 Hedefe ulaştınız! Hediye kazanabilirsiniz.
                </div>
              )}
            </div>

            {/* Product list */}
            {campaign.groups[activeGroup].products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiPackage className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">Bu grupta henüz ürün bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {campaign.groups[activeGroup].products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={quantities[product.id] || 0}
                    onIncrease={() => updateQuantity(product.id, 1)}
                    onDecrease={() => updateQuantity(product.id, -1)}
                    onInput={val => handleQuantityInput(product.id, val)}
                  />
                ))}
              </div>
            )}

            {/* Group note */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">💡</span>
                <div className="text-sm text-blue-700">
                  <p className="font-bold mb-1">Nasıl Çalışır?</p>
                  <ol className="space-y-1 text-blue-600">
                    <li>1. Ürün grubu seçin ve istediğiniz ürünlerden adet belirleyin</li>
                    <li>2. Grup içi farklı ürünleri karıştırabilirsiniz</li>
                    <li>3. Toplam adet eşiğe ulaşınca hediye kazanırsınız</li>
                    <li>4. Sepete ekleyip ödemeye geçin — hediye ücretsiz eklenecek</li>
                  </ol>
                  <p className="text-xs text-blue-400 mt-2">⚠️ Farklı gruplardaki ürünler birleştirilmez, her grup kendi eşiğini takip eder.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT: Sidebar */}
          {/* ============================================================ */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-5">
              {/* Gift Preview Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 shadow-xl shadow-slate-900/10">
                {/* Subtle dot pattern */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-bl-full pointer-events-none" />

                <div className="relative p-6 text-center">
                  <span className="text-[10px] text-amber-400/70 font-bold uppercase tracking-[0.2em] mb-3 block">Hediye Cihaz</span>

                  {/* Gift image */}
                  <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white/5 p-3 flex items-center justify-center border border-white/10">
                    {campaign.giftImage ? (
                      <Image src={campaign.giftImage} alt={campaign.giftName} width={80} height={80} className="object-contain" />
                    ) : (
                      <FiGift className="w-10 h-10 text-white/20" />
                    )}
                  </div>

                  <h4 className="font-bold text-white text-lg mb-1">{campaign.giftName}</h4>
                  <p className="text-xs text-slate-400 font-mono mb-3">{campaign.giftStockCode}</p>

                  <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500/15 rounded-xl border border-green-400/20 mb-3">
                    <span className="text-green-300 text-sm font-black">ÜCRETSİZ</span>
                  </div>

                  <div className="flex items-center gap-2 justify-center text-xs text-slate-400">
                    <span>Yaklaşık Değer:</span>
                    <span className="font-bold text-amber-400">{formatPrice(campaign.giftValue)}</span>
                  </div>

                  {campaign.giftQuantity > 1 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-amber-400/80 font-medium">
                        ✦ Her kazanımda <strong className="text-amber-300">{campaign.giftQuantity} adet</strong> verilir
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiShoppingCart className="w-5 h-5 text-gray-400" />
                  Sipariş Özeti
                </h3>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">İlerleme</span>
                    <span className={`font-bold tabular-nums ${thresholdReached ? 'text-green-600' : 'text-amber-600'}`}>
                      {currentTotal}/{currentThreshold}
                    </span>
                  </div>
                  <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${
                        thresholdReached ? 'bg-green-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  {!thresholdReached && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      Hedefe <strong className="text-amber-600">{remaining}</strong> adet kaldı
                    </p>
                  )}
                </div>

                {/* Times reached */}
                {timesReached > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-green-700 font-bold text-center">
                      🎉 Toplam {timesReached}x hediye kazanabilirsiniz!
                    </p>
                    {campaign.giftQuantity > 1 && (
                      <p className="text-xs text-green-600 text-center mt-0.5">
                        = {timesReached * campaign.giftQuantity} adet {campaign.giftName}
                      </p>
                    )}
                  </div>
                )}

                {/* Subtotal */}
                <div className="border-t border-gray-100 pt-3 space-y-1.5 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ürün Toplamı</span>
                    <span className="font-bold text-gray-800 tabular-nums">{formatPrice(currentSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Hediye Cihaz</span>
                    <span className="font-bold text-green-600">ÜCRETSİZ 🎁</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                    <span className="font-semibold text-gray-800">Genel Toplam</span>
                    <span className="font-bold text-lg text-gray-900 tabular-nums">{formatPrice(currentSubtotal)}</span>
                  </div>
                  {currentSubtotal > 0 && (
                    <div className="flex items-center justify-between gap-2 mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700">
                        <FiCreditCard className="w-3.5 h-3.5" />
                        Peşin fiyatına {campaign.installmentCount || 6} taksit
                      </span>
                      <span className="text-xs font-bold text-green-700 tabular-nums">
                        {campaign.installmentCount || 6} x {formatPrice(currentSubtotal / (campaign.installmentCount || 6))}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                {thresholdReached ? (
                  <div className="space-y-3">
                    {!addedToCart ? (
                      <button
                        onClick={handleAddToCart}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                      >
                        <FiShoppingCart className="w-5 h-5" />
                        Sepete Ekle ve Hediye Kazan
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600 justify-center py-2">
                          <FiCheck className="w-5 h-5" />
                          <span className="font-bold">Sepete Eklendi!</span>
                        </div>
                        <button
                          onClick={goToCheckout}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-green-500/20"
                        >
                          🛒 Ödemeye Geç →
                        </button>
                        <button
                          onClick={() => setShowSuccess(false)}
                          className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl py-2.5 text-sm font-medium transition-colors"
                        >
                          Alışverişe Devam Et
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-200 text-gray-400 font-bold py-4 rounded-2xl cursor-not-allowed text-sm"
                  >
                    🔒 Hediye için {remaining} adet daha ekleyin
                  </button>
                )}
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h4 className="font-bold text-gray-800 text-sm mb-3">✅ Kampanya Avantajları</h4>
                <div className="space-y-2.5">
                  {[
                    { icon: FiGift, text: `${campaign.giftName} ücretsiz`, color: 'text-green-500' },
                    { icon: FiCreditCard, text: `Peşin fiyatına ${campaign.installmentCount || 6} taksit`, color: 'text-emerald-500' },
                    { icon: FiTruck, text: 'Aynı gün kargo', color: 'text-blue-500' },
                    { icon: FiPackage, text: 'Orijinal ürün garantisi', color: 'text-purple-500' },
                    { icon: FiStar, text: `${formatPrice(campaign.giftValue)} değerinde hediye`, color: 'text-amber-500' },
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm">
                      <benefit.icon className={`w-4 h-4 ${benefit.color} flex-shrink-0`} />
                      <span className="text-gray-600">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp — sidebar (kaydırırken hep görünür) */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('kampanya-detay-sidebar')}
                className="flex items-center justify-center gap-2.5 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all active:scale-[0.98]"
              >
                <FaWhatsapp className="w-6 h-6" />
                <div className="text-left leading-tight">
                  <div className="text-base font-black">WhatsApp&apos;tan Sor</div>
                  <div className="text-[11px] font-medium text-green-50/90">Kampanya detayını anında öğren</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SUCCESS MODAL */}
      {/* ================================================================ */}
      {showSuccess && thresholdReached && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-bounce-in">
            {/* Modal Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-amber-950 p-8 text-center">
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl" />

              <div className="relative">
                {/* Success icon */}
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-400/30">
                  <FiCheck className="w-9 h-9 text-white" strokeWidth={3} />
                </div>

                <h2 className="text-2xl font-black text-white mb-1">Tebrikler! 🎉</h2>
                <p className="text-white/60 text-sm mb-4">
                  <strong>{currentThreshold}</strong> adet hedefine ulaştınız
                </p>

                {/* Gift preview in modal */}
                <div className="inline-flex flex-col items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10">
                  <span className="text-[10px] text-amber-400/70 font-bold uppercase tracking-widest">Kazandığınız Hediye</span>
                  <div className="flex items-center gap-3">
                    {campaign.giftImage ? (
                      <Image src={campaign.giftImage} alt={campaign.giftName} width={48} height={48} className="object-contain rounded-lg bg-white/5 p-1" />
                    ) : (
                      <FiGift className="w-10 h-10 text-amber-400" />
                    )}
                    <div className="text-left">
                      <p className="font-bold text-white">{campaign.giftName}</p>
                      <p className="text-xs text-slate-400 font-mono">{campaign.giftStockCode}</p>
                    </div>
                  </div>
                </div>

                {timesReached > 1 && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400/20 rounded-xl border border-amber-400/20">
                    <FiStar className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-amber-200 text-sm font-bold">
                      {timesReached}x Kazandınız! ({timesReached * campaign.giftQuantity} adet hediye)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-sm text-gray-500 text-center mb-5">
                Seçtiğiniz ürünler sepete eklenmiştir. Hediye cihazınız ödeme sayfasında ücretsiz olarak eklenecektir.
              </p>

              <div className="space-y-2.5">
                <button
                  onClick={goToCheckout}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl py-4 font-bold text-base transition-all shadow-xl shadow-green-500/20 hover:shadow-green-500/30 active:scale-[0.98]"
                >
                  🛒 Hemen Ödemeye Geç
                </button>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-2xl py-3 text-sm font-medium transition-colors"
                >
                  Alışverişe Devam Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Toast */}
      <div
        id="share-toast"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium opacity-0 transition-opacity duration-300 pointer-events-none z-50"
      >
        🔗 Kampanya linki kopyalandı!
      </div>

      {/* Keyframe animations */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        /* Peşin fiyatına taksit rozeti — dikkat çekici nabız + parıltı */
        @keyframes taksit-pop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-taksit-pop {
          animation: taksit-pop 1.5s ease-in-out infinite;
        }
        @keyframes taksit-glow {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.9; }
        }
        .animate-taksit-glow {
          animation: taksit-glow 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
