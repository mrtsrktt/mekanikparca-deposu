import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateB2BPrice, calculateTRYPrice } from '@/lib/pricing'
import ProductCard from '@/components/ProductCard'
import HeroSlider from '@/components/HeroSlider'

export const dynamic = 'force-dynamic'

async function getExchangeRates() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/exchange-rates`, {
      next: { revalidate: 3600 } // 1 saat cache
    })
    if (!response.ok) {
      throw new Error('Exchange rates fetch failed')
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    // Fallback rates
    return { USD: 44.0, EUR: 55.0, TRY: 1 }
  }
}

const catColors = [
  { bg: 'from-blue-500 to-blue-700', hover: 'hover:shadow-blue-200', icon: '🧪' },
  { bg: 'from-emerald-500 to-emerald-700', hover: 'hover:shadow-emerald-200', icon: '🔍' },
  { bg: 'from-orange-500 to-orange-700', hover: 'hover:shadow-orange-200', icon: '🌡️' },
  { bg: 'from-purple-500 to-purple-700', hover: 'hover:shadow-purple-200', icon: '🔧' },
  { bg: 'from-red-500 to-red-700', hover: 'hover:shadow-red-200', icon: '💧' },
  { bg: 'from-cyan-500 to-cyan-700', hover: 'hover:shadow-cyan-200', icon: '❄️' },
  { bg: 'from-amber-500 to-amber-700', hover: 'hover:shadow-amber-200', icon: '⚡' },
  { bg: 'from-pink-500 to-pink-700', hover: 'hover:shadow-pink-200', icon: '🛡️' },
]

const brandColors: Record<string, { bg: string; text: string; dot: string; accent: string }> = {
  'taifu': { bg: 'from-blue-600 to-blue-800', text: 'text-blue-700', dot: 'bg-blue-500', accent: 'from-blue-500 to-blue-600' },
  'general-life-west-therm': { bg: 'from-orange-500 to-orange-700', text: 'text-orange-700', dot: 'bg-orange-500', accent: 'from-orange-500 to-orange-600' },
  'black-diamond': { bg: 'from-gray-800 to-gray-950', text: 'text-gray-800', dot: 'bg-gray-800', accent: 'from-gray-700 to-gray-800' },
  'vente': { bg: 'from-purple-600 to-purple-800', text: 'text-purple-700', dot: 'bg-purple-500', accent: 'from-purple-500 to-purple-600' },
  'wipcool': { bg: 'from-yellow-500 to-yellow-700', text: 'text-yellow-700', dot: 'bg-yellow-500', accent: 'from-yellow-500 to-yellow-600' },
  'testo': { bg: 'from-red-600 to-red-800', text: 'text-red-700', dot: 'bg-red-500', accent: 'from-red-500 to-red-600' },
  'fernox': { bg: 'from-blue-500 to-blue-700', text: 'text-blue-600', dot: 'bg-blue-500', accent: 'from-blue-500 to-blue-600' },
  'regen': { bg: 'from-green-600 to-green-800', text: 'text-green-700', dot: 'bg-green-500', accent: 'from-green-500 to-green-600' },
}

export default async function HomePage() {
  const [exchangeRates, featuredProducts, categories, brandsWithProducts] = await Promise.all([
    getExchangeRates(),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { brand: true, category: true, images: { take: 1 } },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 8,
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        products: {
          where: { isActive: true },
          include: { images: { take: 1 }, brand: true, category: true },
          take: 6,
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
  ])

  // Fiyatları TL'ye çevir
  const convertProductPrices = (products: any[]) => {
    return products.map(product => {
      const priceTRY = calculateTRYPrice(
        product.priceOriginal,
        product.priceCurrency,
        exchangeRates
      )
      return {
        ...product,
        priceTRY
      }
    })
  }

  const featuredProductsConverted = convertProductPrices(featuredProducts)

  const now = new Date()
  const activeCampaigns = await (prisma as any).campaign.findMany({
    where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
    select: { scopeType: true, productId: true, brandId: true, categoryId: true, type: true, tiers: { select: { minQuantity: true, value: true } } },
  })
  const cpIds = new Set(activeCampaigns.filter((c: any) => c.scopeType === 'PRODUCT' && c.productId).map((c: any) => c.productId as string))
  const cbIds = new Set(activeCampaigns.filter((c: any) => c.scopeType === 'BRAND' && c.brandId).map((c: any) => c.brandId as string))
  const ccIds = new Set(activeCampaigns.filter((c: any) => c.scopeType === 'CATEGORY' && c.categoryId).map((c: any) => c.categoryId as string))
  const hasCampaign = (p: any) => cpIds.has(p.id) || (p.brandId && cbIds.has(p.brandId)) || (p.categoryId && ccIds.has(p.categoryId))

  const getCampaignLowestPrice = (p: any): number | null => {
    const matching = activeCampaigns.filter((c: any) =>
      (c.scopeType === 'PRODUCT' && c.productId === p.id) ||
      (c.scopeType === 'BRAND' && c.brandId === p.brandId) ||
      (c.scopeType === 'CATEGORY' && c.categoryId === p.categoryId)
    )
    if (matching.length === 0) return null
    let lowest = p.priceTRY
    for (const c of matching) {
      for (const t of c.tiers) {
        const price = c.type === 'PERCENTAGE' ? p.priceTRY * (1 - t.value / 100) : t.value
        if (price < lowest) lowest = price
      }
    }
    return lowest < p.priceTRY ? lowest : null
  }

  const campaignProductIds = new Set<string>()
  const allCampaignProducts: any[] = []
  if (cpIds.size > 0) {
    const prods = await prisma.product.findMany({ where: { id: { in: Array.from(cpIds) as string[] }, isActive: true }, include: { brand: true, category: true, images: { take: 1 } } })
    prods.forEach(p => { if (!campaignProductIds.has(p.id)) { campaignProductIds.add(p.id); allCampaignProducts.push(p) } })
  }
  if (cbIds.size > 0) {
    const prods = await prisma.product.findMany({ where: { brandId: { in: Array.from(cbIds) as string[] }, isActive: true }, include: { brand: true, category: true, images: { take: 1 } }, take: 12 })
    prods.forEach(p => { if (!campaignProductIds.has(p.id)) { campaignProductIds.add(p.id); allCampaignProducts.push(p) } })
  }
  if (ccIds.size > 0) {
    const prods = await prisma.product.findMany({ where: { categoryId: { in: Array.from(ccIds) as string[] }, isActive: true }, include: { brand: true, category: true, images: { take: 1 } }, take: 12 })
    prods.forEach(p => { if (!campaignProductIds.has(p.id)) { campaignProductIds.add(p.id); allCampaignProducts.push(p) } })
  }
  const homeCampaignProducts = convertProductPrices(allCampaignProducts.slice(0, 6))

  const session = await getServerSession(authOptions)
  const isB2B = session?.user && (session.user as any).role === 'B2B'
  let b2bPriceMap: Record<string, number> = {}
  if (isB2B) {
    const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } })
    if (user && user.b2bStatus === 'APPROVED') {
      const allProducts = [...featuredProductsConverted, ...homeCampaignProducts, ...brandsWithProducts.flatMap(b => b.products)]
      const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.id, p])).values())
      const prices = await Promise.all(uniqueProducts.map(async (p) => ({ id: p.id, b2bPrice: await calculateB2BPrice(p), originalPrice: p.priceTRY })))
      for (const p of prices) { if (p.b2bPrice < p.originalPrice) b2bPriceMap[p.id] = p.b2bPrice }
    }
  }

  // Marka ürünlerini de döviz kurlarına göre düzelt
  const brandsWithProductsConverted = brandsWithProducts.map(brand => ({
    ...brand,
    products: convertProductPrices(brand.products)
  }))

  return (
    <div>
      <HeroSlider />

      {/* Features Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {/* Hızlı Kargo */}
            <div className="group flex flex-col items-center text-center gap-3 p-4 rounded-2xl hover:bg-blue-50 transition-all duration-300 cursor-default">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                <defs>
                  <linearGradient id="truckGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#1d4ed8"/>
                  </linearGradient>
                  <linearGradient id="truckBodyGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#60a5fa"/>
                    <stop offset="100%" stopColor="#2563eb"/>
                  </linearGradient>
                </defs>
                {/* Speed lines — static position, pulse opacity */}
                <line x1="4" y1="30" x2="18" y2="30" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round">
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0s"/>
                </line>
                <line x1="4" y1="38" x2="14" y2="38" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round">
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.25s"/>
                </line>
                <line x1="4" y1="46" x2="20" y2="46" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round">
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.5s"/>
                </line>
                {/* Truck group — drives left to right */}
                <g>
                  <animateTransform attributeName="transform" type="translate" from="-20 0" to="20 0" dur="1.5s" repeatCount="indefinite" additive="sum"/>
                  {/* Cargo box */}
                  <rect x="20" y="24" width="26" height="28" rx="2" fill="url(#truckGrad)"/>
                  {/* Cab */}
                  <path d="M46 32 L58 32 L62 40 L62 52 L46 52 Z" fill="url(#truckBodyGrad)"/>
                  {/* Window */}
                  <path d="M48 34 L57 34 L60 40 L48 40 Z" fill="#bfdbfe" opacity="0.9"/>
                  {/* Headlight pulse */}
                  <circle cx="62" cy="48" r="3" fill="#fbbf24">
                    <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
                  </circle>
                  {/* Wheel back — static */}
                  <circle cx="30" cy="54" r="7" fill="#1e3a8a" stroke="#93c5fd" strokeWidth="1.5"/>
                  <circle cx="30" cy="54" r="3.5" fill="#60a5fa"/>
                  {/* Wheel front — static */}
                  <circle cx="54" cy="54" r="7" fill="#1e3a8a" stroke="#93c5fd" strokeWidth="1.5"/>
                  <circle cx="54" cy="54" r="3.5" fill="#60a5fa"/>
                </g>
              </svg>
              <div>
                <h3 className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">Hızlı Kargo</h3>
                <p className="text-xs text-gray-400 mt-0.5">Aynı gün kargo</p>
              </div>
            </div>

            {/* Güvenli Alışveriş */}
            <div className="group flex flex-col items-center text-center gap-3 p-4 rounded-2xl hover:bg-emerald-50 transition-all duration-300 cursor-default">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                <defs>
                  <linearGradient id="shieldGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#10b981"/>
                    <stop offset="100%" stopColor="#047857"/>
                  </linearGradient>
                </defs>
                {/* Outer ring expand */}
                <circle cx="40" cy="40" r="34" stroke="#6ee7b7" strokeWidth="1.5" fill="none">
                  <animate attributeName="r" values="30;36;30" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/>
                </circle>
                {/* Shield */}
                <path d="M40 12 L62 22 L62 42 C62 54 52 63 40 68 C28 63 18 54 18 42 L18 22 Z" fill="url(#shieldGrad)"/>
                <path d="M40 16 L58 25 L58 42 C58 52 50 60 40 64 C30 60 22 52 22 42 L22 25 Z" fill="#34d399" opacity="0.3"/>
                {/* Checkmark draw animation */}
                <polyline points="29,40 37,49 52,32" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"
                  strokeDasharray="35" strokeDashoffset="35">
                  <animate attributeName="strokeDashoffset" values="35;0;35" dur="2.5s" repeatCount="indefinite" begin="0.3s"/>
                </polyline>
                {/* Sparkle dots */}
                <circle cx="16" cy="20" r="2.5" fill="#6ee7b7">
                  <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="0s"/>
                </circle>
                <circle cx="64" cy="18" r="2" fill="#6ee7b7">
                  <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="0.6s"/>
                </circle>
                <circle cx="68" cy="50" r="2.5" fill="#6ee7b7">
                  <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="1.2s"/>
                </circle>
              </svg>
              <div>
                <h3 className="font-semibold text-sm text-gray-800 group-hover:text-emerald-600 transition-colors">Güvenli Alışveriş</h3>
                <p className="text-xs text-gray-400 mt-0.5">256-bit SSL</p>
              </div>
            </div>

            {/* Teknik Destek */}
            <div className="group flex flex-col items-center text-center gap-3 p-4 rounded-2xl hover:bg-purple-50 transition-all duration-300 cursor-default">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                <defs>
                  <linearGradient id="headsetGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#a855f7"/>
                    <stop offset="100%" stopColor="#7c3aed"/>
                  </linearGradient>
                </defs>
                {/* Sound waves */}
                <path d="M14 36 Q10 40 14 44" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" fill="none">
                  <animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite" begin="0s"/>
                </path>
                <path d="M9 30 Q3 40 9 50" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" fill="none">
                  <animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite" begin="0.2s"/>
                </path>
                <path d="M66 36 Q70 40 66 44" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" fill="none">
                  <animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite" begin="0.1s"/>
                </path>
                <path d="M71 30 Q77 40 71 50" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" fill="none">
                  <animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite" begin="0.3s"/>
                </path>
                {/* Headband arc */}
                <path d="M20 42 C20 24 60 24 60 42" stroke="url(#headsetGrad)" strokeWidth="5" strokeLinecap="round" fill="none"/>
                {/* Left ear cup */}
                <rect x="14" y="40" width="12" height="18" rx="6" fill="url(#headsetGrad)"/>
                {/* Right ear cup */}
                <rect x="54" y="40" width="12" height="18" rx="6" fill="url(#headsetGrad)"/>
                {/* Mic arm */}
                <path d="M20 56 Q20 66 30 68" stroke="url(#headsetGrad)" strokeWidth="3" strokeLinecap="round" fill="none"/>
                <circle cx="30" cy="68" r="4" fill="#a855f7"/>
                {/* Bouncing dots */}
                <circle cx="33" cy="16" r="3" fill="#c4b5fd">
                  <animate attributeName="cy" values="16;10;16" dur="1s" repeatCount="indefinite" begin="0s"/>
                  <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" begin="0s"/>
                </circle>
                <circle cx="40" cy="14" r="3" fill="#a855f7">
                  <animate attributeName="cy" values="14;8;14" dur="1s" repeatCount="indefinite" begin="0.15s"/>
                  <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" begin="0.15s"/>
                </circle>
                <circle cx="47" cy="16" r="3" fill="#c4b5fd">
                  <animate attributeName="cy" values="16;10;16" dur="1s" repeatCount="indefinite" begin="0.3s"/>
                  <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" begin="0.3s"/>
                </circle>
              </svg>
              <div>
                <h3 className="font-semibold text-sm text-gray-800 group-hover:text-purple-600 transition-colors">Teknik Destek</h3>
                <p className="text-xs text-gray-400 mt-0.5">Uzman ekip</p>
              </div>
            </div>

            {/* Orijinal Parça */}
            <div className="group flex flex-col items-center text-center gap-3 p-4 rounded-2xl hover:bg-amber-50 transition-all duration-300 cursor-default">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                <defs>
                  <linearGradient id="medalGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f59e0b"/>
                    <stop offset="100%" stopColor="#d97706"/>
                  </linearGradient>
                  <linearGradient id="medalShine" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fde68a"/>
                    <stop offset="100%" stopColor="#f59e0b"/>
                  </linearGradient>
                </defs>
                {/* Outer glow ring */}
                <circle cx="40" cy="48" r="26" stroke="#fcd34d" strokeWidth="1.5" fill="none">
                  <animate attributeName="r" values="24;28;24" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
                </circle>
                {/* Radiating light lines — staggered */}
                {[0,45,90,135,180,225,270,315].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180
                  const x1 = 40 + Math.cos(rad) * 28
                  const y1 = 48 + Math.sin(rad) * 28
                  const x2 = 40 + Math.cos(rad) * 34
                  const y2 = 48 + Math.sin(rad) * 34
                  return (
                    <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fcd34d" strokeWidth="2" strokeLinecap="round">
                      <animate attributeName="opacity" values="0;1;0" dur="1.6s" repeatCount="indefinite" begin={`${i * 0.2}s`}/>
                    </line>
                  )
                })}
                {/* Ribbon left */}
                <path d="M32 30 L28 14 L36 20 L40 12 L44 20 L52 14 L48 30" fill="#f59e0b"/>
                {/* Medal circle */}
                <circle cx="40" cy="48" r="22" fill="url(#medalGrad)"/>
                <circle cx="40" cy="48" r="18" fill="url(#medalShine)" opacity="0.6"/>
                {/* Star */}
                <path d="M40 32 L42.9 41.1 L52.4 41.1 L44.8 46.8 L47.6 55.9 L40 50.2 L32.4 55.9 L35.2 46.8 L27.6 41.1 L37.1 41.1 Z" fill="white" opacity="0.95"/>
              </svg>
              <div>
                <h3 className="font-semibold text-sm text-gray-800 group-hover:text-amber-600 transition-colors">Orijinal Parça</h3>
                <p className="text-xs text-gray-400 mt-0.5">Garantili ürünler</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Kategoriler</h2>
              <div className="section-title-underline" />
            </div>
            <Link href="/kategoriler" className="text-primary-500 hover:text-primary-600 text-sm font-semibold transition-colors">
              Tümünü Gör →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => {
              const color = catColors[i % catColors.length]
              return (
                <Link key={cat.id} href={`/urunler?category=${cat.slug}`}
                  className={`group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl ${color.hover} hover:-translate-y-1 transition-all duration-300`}>
                  <div className={`h-24 bg-gradient-to-br ${color.bg} flex items-center justify-center`}>
                    <span className="text-4xl group-hover:scale-125 transition-transform duration-300">{color.icon}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm text-gray-800 group-hover:text-gray-900 leading-snug text-center">{cat.name}</h3>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Kampanyalı Ürünler */}
      {homeCampaignProducts.length > 0 && (
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-gradient-to-r from-red-500 via-red-600 to-orange-500 rounded-2xl p-5 md:p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg shadow-red-500/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">🔥</span>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Kampanyalı Ürünler</h2>
                  <p className="text-red-100 text-sm">Adet arttıkça fiyat düşer</p>
                </div>
              </div>
              <Link href="/kampanyalar"
                className="inline-flex items-center gap-1 bg-white text-red-600 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-50 hover:shadow-md transition-all duration-200 self-start md:self-auto">
                Tüm Kampanyaları Gör →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {homeCampaignProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} hasCampaign campaignLowestPrice={getCampaignLowestPrice(product)} b2bUserPrice={b2bPriceMap[product.id]} showB2B={isB2B} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Öne Çıkan Ürünler */}
      {featuredProducts.length > 0 && (
        <section className="bg-gray-50/80 py-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">Öne Çıkan Ürünler</h2>
                <div className="section-title-underline" />
              </div>
              <Link href="/urunler" className="text-primary-500 hover:text-primary-600 text-sm font-semibold transition-colors">Tümünü Gör →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProductsConverted.map((product) => (
                <ProductCard key={product.id} product={product} hasCampaign={hasCampaign(product)} campaignLowestPrice={getCampaignLowestPrice(product)} b2bUserPrice={b2bPriceMap[product.id]} showB2B={isB2B} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Marka Bölümleri */}
      {brandsWithProductsConverted.filter(b => b.products.length > 0).map((brand, idx) => {
        const colors = brandColors[brand.slug] || { bg: 'from-gray-600 to-gray-800', text: 'text-gray-700', dot: 'bg-gray-500', accent: 'from-gray-500 to-gray-600' }
        const isEven = idx % 2 === 0

        return (
          <section key={brand.id} className={isEven ? 'bg-white py-14' : 'bg-gray-50/80 py-14'}>
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-8 rounded-full bg-gradient-to-b ${colors.accent}`} />
                  <div>
                    <h2 className={`text-xl md:text-2xl font-extrabold ${colors.text} tracking-tight`}>{brand.name}</h2>
                    {brand.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{brand.description}</p>
                    )}
                  </div>
                </div>
                <Link href={`/urunler?brand=${brand.slug}`}
                  className={`text-sm font-semibold ${colors.text} hover:underline underline-offset-4 transition-colors`}>
                  Tüm Ürünleri →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {brand.products.map((product) => (
                  <ProductCard key={product.id} product={product} hasCampaign={hasCampaign(product)} campaignLowestPrice={getCampaignLowestPrice(product)} b2bUserPrice={b2bPriceMap[product.id]} showB2B={isB2B} />
                ))}
              </div>
            </div>
          </section>
        )
      })}

      {/* Bayi CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-corporate-dark" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(245,158,11,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(59,130,246,0.2) 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Toptan Alım İçin <span className="text-accent-400">Bayi Hesabı</span> Açın
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Bayi müşterilerimize özel indirimli fiyatlar, toptan alım avantajları ve
            öncelikli teknik destek hizmetimizden yararlanın.
          </p>
          <Link href="/b2b-basvuru" className="btn-accent text-lg px-10 py-3.5 rounded-xl shadow-lg shadow-accent-500/25 hover:shadow-xl hover:shadow-accent-500/30">
            Bayi Başvuru Yap
          </Link>
        </div>
      </section>
    </div>
  )
}
