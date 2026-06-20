import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice } from '@/lib/pricing'
import ProductCard from '@/components/ProductCard'

export const revalidate = 3600

export const metadata = {
  title: 'Kampanyalar | Mekanik Parça Deposu',
  description: 'Aktif kampanyalar. Toplu alımlarda özel fiyat avantajlarından yararlanın.',
  alternates: { canonical: '/kampanyalar' },
}

export default async function CampaignsPage() {
  const now = new Date()

  // Regular campaigns
  const campaigns = await (prisma as any).campaign.findMany({
    where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
    include: { tiers: { orderBy: { minQuantity: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })

  // Gift campaigns
  const giftCampaigns = await (prisma as any).giftCampaign.findMany({
    where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
    include: { groups: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })

  const campaignDetails = await Promise.all(
    campaigns.map(async (campaign: any) => {
      let products: any[] = []
      let scopeLabel = ''

      if (campaign.scopeType === 'PRODUCT' && campaign.productId) {
        const product = await prisma.product.findUnique({
          where: { id: campaign.productId },
          include: { brand: true, category: true, images: { orderBy: { sortOrder: 'asc' }, take: 1 }, priceTiers: { orderBy: { unitPriceTRY: 'asc' }, take: 1 } },
        })
        if (product && product.isActive) products = [product]
        scopeLabel = product?.name || ''
      } else if (campaign.scopeType === 'BRAND' && campaign.brandId) {
        const brand = await prisma.brand.findUnique({ where: { id: campaign.brandId } })
        products = await prisma.product.findMany({
          where: { brandId: campaign.brandId, isActive: true },
          include: { brand: true, category: true, images: { orderBy: { sortOrder: 'asc' }, take: 1 }, priceTiers: { orderBy: { unitPriceTRY: 'asc' }, take: 1 } },
          take: 12, orderBy: { createdAt: 'desc' },
        })
        scopeLabel = brand?.name || ''
      } else if (campaign.scopeType === 'CATEGORY' && campaign.categoryId) {
        const cat = await prisma.category.findUnique({ where: { id: campaign.categoryId } })
        products = await prisma.product.findMany({
          where: { categoryId: campaign.categoryId, isActive: true },
          include: { brand: true, category: true, images: { orderBy: { sortOrder: 'asc' }, take: 1 }, priceTiers: { orderBy: { unitPriceTRY: 'asc' }, take: 1 } },
          take: 12, orderBy: { createdAt: 'desc' },
        })
        scopeLabel = cat?.name || ''
      }
      return { ...campaign, products, scopeLabel }
    })
  )

  const activeCampaigns = campaignDetails.filter((c: any) => c.products.length > 0)
  const scopeMap: Record<string, string> = { PRODUCT: 'Ürün', BRAND: 'Marka', CATEGORY: 'Kategori' }
  const fmt = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-500">Ana Sayfa</Link>
        <span>/</span>
        <span className="text-gray-800">Kampanyalar</span>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl mb-10 bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 p-8 md:p-10">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/20">
            <span className="text-3xl md:text-4xl">🔥</span>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">Kampanyalar</h1>
            <p className="text-white/60 text-sm md:text-base mt-1">Adet arttıkça fiyat düşer. Özel fırsatları ve hediyeleri kaçırmayın.</p>
          </div>
        </div>
      </div>

      {activeCampaigns.length === 0 && giftCampaigns.length === 0 ? (
        <div className="text-center py-20 card">
          <span className="text-5xl block mb-4">📦</span>
          <p className="text-gray-500 text-lg mb-4">Şu anda aktif kampanya bulunmuyor.</p>
          <Link href="/urunler" className="btn-primary">Ürünleri İncele</Link>
        </div>
      ) : (
        <div className="space-y-10">
          {activeCampaigns.map((campaign: any) => (
            <div key={campaign.id} className="rounded-2xl border-2 border-red-200 overflow-hidden bg-white shadow-lg shadow-red-100/50 hover:shadow-xl transition-shadow duration-300">
              {/* Kampanya bandı */}
              <div className="bg-gradient-to-r from-red-50 via-red-50 to-orange-50 border-b border-red-200 px-5 md:px-7 py-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md shadow-red-200">
                        <span className="text-white text-sm">🔥</span>
                      </span>
                      <h2 className="text-lg font-extrabold text-gray-800">{campaign.name}</h2>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500 text-white">
                        {campaign.type === 'PERCENTAGE' ? '% İNDİRİM' : 'SABİT FİYAT'}
                      </span>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {scopeMap[campaign.scopeType]}: {campaign.scopeLabel}
                      </span>
                    </div>
                    {campaign.description && (
                      <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{campaign.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1.5">📅 {fmt(campaign.startDate)} — {fmt(campaign.endDate)}</p>
                  </div>

                  {/* Kademe bilgileri */}
                  <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                    {campaign.tiers.map((tier: any, idx: number) => (
                      <div key={idx} className="bg-white border-2 border-red-300 rounded-xl px-4 py-2.5 text-center min-w-[100px] shadow-sm">
                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{tier.minQuantity}+ adet</div>
                        <div className="text-lg font-black text-red-600">
                          {campaign.type === 'PERCENTAGE' ? `%${tier.value}` : formatPrice(tier.value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ürünler */}
              <div className="p-5 md:p-7">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {campaign.products.map((product: any) => {
                    let lowest = product.priceTRY
                    for (const t of campaign.tiers) {
                      const price = campaign.type === 'PERCENTAGE' ? product.priceTRY * (1 - t.value / 100) : t.value
                      if (price < lowest) lowest = price
                    }
                    return (
                      <ProductCard key={product.id} product={product} hasCampaign campaignLowestPrice={lowest < product.priceTRY ? lowest : null} tierLowestPrice={(product as any).priceTiers?.[0]?.unitPriceTRY || null} />
                    )
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* === Hediye Kampanyaları === */}
          {giftCampaigns.map((gc: any) => (
            <div key={gc.id} className="relative rounded-2xl border-2 border-amber-300 overflow-hidden bg-white shadow-lg shadow-amber-100/50 hover:shadow-xl hover:shadow-amber-100/50 transition-shadow duration-300">
              {/* "HEDİYE" ribbon */}
              <div className="absolute top-0 right-0 z-10">
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-1.5 rounded-bl-xl shadow-lg">
                  🎁 Hediye
                </div>
              </div>

              <div className="p-5 md:p-7">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Gift image preview */}
                  <div className="flex-shrink-0 flex items-start">
                    <div className="relative w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-3 flex items-center justify-center border-2 border-amber-200 shadow-inner">
                      {gc.giftImage ? (
                        <img src={gc.giftImage} alt={gc.giftName} className="object-contain max-w-full max-h-full" />
                      ) : (
                        <div className="text-center">
                          <span className="text-3xl">🎁</span>
                          <p className="text-[9px] text-amber-400 font-bold mt-1">HEDİYE</p>
                        </div>
                      )}
                    </div>
                    {/* Value badge */}
                    <div className="absolute -bottom-2 left-4 bg-green-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
                      {formatPrice(gc.giftValue)}
                    </div>
                  </div>

                  {/* Campaign info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white">
                        HEDİYE KAMPANYASI
                      </span>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        ⏱ Sınırlı Süre
                      </span>
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-800 mt-1">{gc.name}</h2>
                    {gc.description && (
                      <p className="text-sm text-gray-500 mt-1.5 leading-relaxed max-w-2xl">{gc.description}</p>
                    )}

                    {/* Gift info highlight */}
                    <div className="mt-3 inline-flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-2.5">
                      <span className="text-xl">🎁</span>
                      <div>
                        <p className="text-sm font-bold text-amber-800">
                          {gc.giftName}
                          {gc.giftQuantity > 1 && (
                            <span className="text-xs font-normal text-amber-600 ml-1">({gc.giftQuantity} Adet)</span>
                          )}
                        </p>
                        <p className="text-xs text-amber-600">
                          <span className="text-green-600 font-bold">ÜCRETSİZ</span> — Değer: {formatPrice(gc.giftValue)}
                        </p>
                      </div>
                    </div>

                    {/* Group thresholds */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="text-xs text-gray-400 font-medium">📦 Gruplar:</span>
                      {gc.groups?.map((group: any, idx: number) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 bg-white border-2 border-amber-200 rounded-lg px-3 py-1.5 text-xs">
                          <span className="text-gray-500 font-medium">{group.name}</span>
                          <span className="font-bold text-amber-600 tabular-nums">{group.threshold}+</span>
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-gray-400 mt-3">📅 {fmt(gc.startDate)} — {fmt(gc.endDate)}</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
                  <Link
                    href={`/kampanyalar/hediye/${gc.slug}`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98]"
                  >
                    🎁 Hediye Kampanyasına Git
                    <span className="text-sm font-normal opacity-80">→ {gc.giftName} kazanın</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
