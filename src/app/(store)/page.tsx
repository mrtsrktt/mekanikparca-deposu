import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateB2BPrice } from '@/lib/pricing'
import ProductCard from '@/components/ProductCard'
import HeroSlider from '@/components/HeroSlider'
import { FiTruck, FiShield, FiHeadphones, FiAward } from 'react-icons/fi'

export const dynamic = 'force-dynamic'

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
  const [featuredProducts, categories, brandsWithProducts] = await Promise.all([
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
  const homeCampaignProducts = allCampaignProducts.slice(0, 6)

  const session = await getServerSession(authOptions)
  const isB2B = session?.user && (session.user as any).role === 'B2B'
  let b2bPriceMap: Record<string, number> = {}
  if (isB2B) {
    const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } })
    if (user && user.b2bStatus === 'APPROVED') {
      const allProducts = [...featuredProducts, ...homeCampaignProducts, ...brandsWithProducts.flatMap(b => b.products)]
      const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.id, p])).values())
      const prices = await Promise.all(uniqueProducts.map(async (p) => ({ id: p.id, b2bPrice: await calculateB2BPrice(p), originalPrice: p.priceTRY })))
      for (const p of prices) { if (p.b2bPrice < p.originalPrice) b2bPriceMap[p.id] = p.b2bPrice }
    }
  }

  return (
    <div>
      <HeroSlider />

      {/* Features Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: FiTruck, title: 'Hızlı Kargo', desc: 'Aynı gün kargo', color: 'from-blue-500 to-blue-600' },
              { icon: FiShield, title: 'Güvenli Alışveriş', desc: '256-bit SSL', color: 'from-emerald-500 to-emerald-600' },
              { icon: FiHeadphones, title: 'Teknik Destek', desc: 'Uzman ekip', color: 'from-purple-500 to-purple-600' },
              { icon: FiAward, title: 'Orijinal Parça', desc: 'Garantili ürünler', color: 'from-amber-500 to-amber-600' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className={`p-3 bg-gradient-to-br ${f.color} rounded-xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-800">{f.title}</h3>
                  <p className="text-xs text-gray-400">{f.desc}</p>
                </div>
              </div>
            ))}
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
            {categories.map((cat, i) => (
              <Link key={cat.id} href={`/urunler?category=${cat.slug}`}
                className="group bg-white rounded-2xl p-6 text-center border border-gray-100 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:from-primary-100 group-hover:to-primary-200 transition-all duration-300">
                  <span className="text-xl">🔧</span>
                </div>
                <h3 className="font-semibold text-sm text-gray-700 group-hover:text-primary-600 transition-colors">{cat.name}</h3>
              </Link>
            ))}
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
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} hasCampaign={hasCampaign(product)} campaignLowestPrice={getCampaignLowestPrice(product)} b2bUserPrice={b2bPriceMap[product.id]} showB2B={isB2B} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Marka Bölümleri */}
      {brandsWithProducts.filter(b => b.products.length > 0).map((brand, idx) => {
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
