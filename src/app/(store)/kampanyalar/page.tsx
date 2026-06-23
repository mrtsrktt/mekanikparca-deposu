import { prisma, withDbRetry } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice } from '@/lib/pricing'
import ProductCard from '@/components/ProductCard'

export const revalidate = 3600

export const metadata = {
  title: 'Kampanyalar | Mekanik Parça Deposu',
  description: 'Aktif kampanyalar. Toplu alımlarda özel fiyat avantajlarından yararlanın.',
  alternates: { canonical: '/kampanyalar' },
}

// Geçici DB kesintisinde (Neon soğuk başlangıç) çökmek yerine gösterilecek mesaj
function DbUnavailable() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <span className="text-5xl block mb-4">⏳</span>
      <h1 className="text-xl font-bold text-gray-800 mb-2">Kampanyalar şu anda yüklenemedi</h1>
      <p className="text-gray-500 mb-6">Geçici bir bağlantı sorunu oluştu. Lütfen birkaç saniye sonra sayfayı yenileyin.</p>
      <Link href="/kampanyalar" className="btn-primary">Yeniden Dene</Link>
    </div>
  )
}

export default async function CampaignsPage() {
  const now = new Date()

  let campaigns: any[]
  let giftCampaigns: any[]
  try {
    // Regular campaigns
    campaigns = await withDbRetry(() => (prisma as any).campaign.findMany({
      where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
      include: { tiers: { orderBy: { minQuantity: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    }))

    // Gift campaigns
    giftCampaigns = await withDbRetry(() => (prisma as any).giftCampaign.findMany({
      where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
      include: { groups: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    }))
  } catch (e) {
    console.error('Kampanyalar yüklenemedi (DB):', e)
    return <DbUnavailable />
  }

  let campaignDetails: any[]
  try {
    campaignDetails = await Promise.all(
      campaigns.map(async (campaign: any) => {
        let products: any[] = []
        let scopeLabel = ''

        if (campaign.scopeType === 'PRODUCT' && campaign.productId) {
          const product = await withDbRetry(() => prisma.product.findUnique({
            where: { id: campaign.productId },
            include: { brand: true, category: true, images: { orderBy: { sortOrder: 'asc' }, take: 1 }, priceTiers: { orderBy: { unitPriceTRY: 'asc' }, take: 1 } },
          }))
          if (product && product.isActive) products = [product]
          scopeLabel = product?.name || ''
        } else if (campaign.scopeType === 'BRAND' && campaign.brandId) {
          const brand = await withDbRetry(() => prisma.brand.findUnique({ where: { id: campaign.brandId } }))
          products = await withDbRetry(() => prisma.product.findMany({
            where: { brandId: campaign.brandId, isActive: true },
            include: { brand: true, category: true, images: { orderBy: { sortOrder: 'asc' }, take: 1 }, priceTiers: { orderBy: { unitPriceTRY: 'asc' }, take: 1 } },
            take: 12, orderBy: { createdAt: 'desc' },
          }))
          scopeLabel = brand?.name || ''
        } else if (campaign.scopeType === 'CATEGORY' && campaign.categoryId) {
          const cat = await withDbRetry(() => prisma.category.findUnique({ where: { id: campaign.categoryId } }))
          products = await withDbRetry(() => prisma.product.findMany({
            where: { categoryId: campaign.categoryId, isActive: true },
            include: { brand: true, category: true, images: { orderBy: { sortOrder: 'asc' }, take: 1 }, priceTiers: { orderBy: { unitPriceTRY: 'asc' }, take: 1 } },
            take: 12, orderBy: { createdAt: 'desc' },
          }))
          scopeLabel = cat?.name || ''
        }
        return { ...campaign, products, scopeLabel }
      })
    )
  } catch (e) {
    console.error('Kampanya ürünleri yüklenemedi (DB):', e)
    return <DbUnavailable />
  }

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

      {/* Hero Banner — Premium Kurumsal (Lacivert + Altın) */}
      <div className="relative overflow-hidden rounded-3xl mb-10 bg-gradient-to-br from-[#0c1829] via-[#112545] to-[#1a3a6b] shadow-2xl shadow-primary-900/30 ring-1 ring-white/5">
        {/* İnce grid dokusu */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />
        {/* Altın ışıma — sağ üst */}
        <div className="absolute -top-32 -right-24 w-96 h-96 bg-amber-400/20 rounded-full blur-[130px] pointer-events-none" />
        {/* Lacivert ışıma — sol alt */}
        <div className="absolute -bottom-32 -left-24 w-96 h-96 bg-primary-400/10 rounded-full blur-[130px] pointer-events-none" />
        {/* Diyagonal parlama */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/[0.04] to-transparent pointer-events-none" />

        <div className="relative p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            {/* İkon */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400/30 rounded-2xl blur-xl" />
                <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30 ring-1 ring-amber-300/30">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Metin */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300 text-[11px] font-semibold uppercase tracking-[0.2em]">Aktif Fırsatlar</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
                Kampanyalar
              </h1>
              <p className="text-slate-300/70 text-sm md:text-base mt-3 max-w-xl mx-auto md:mx-0 leading-relaxed">
                Hediyeli kampanyalar ve peşin fiyatına taksit fırsatlarını kaçırmayın.
              </p>
            </div>

            {/* Özellik rozetleri */}
            <div className="flex flex-col gap-3 justify-center flex-shrink-0 w-full md:w-auto">
              {/* Öne çıkan: Peşin Fiyatına 6 Taksit */}
              <div className="relative">
                <div className="absolute -inset-1 bg-green-400/30 rounded-2xl blur-lg" />
                <div className="relative inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-xl shadow-green-500/30 ring-1 ring-green-300/30 w-full md:w-auto justify-center">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-lg md:text-2xl font-black text-white leading-none tracking-tight">Peşin Fiyatına 6 Taksit</div>
                    <div className="text-[11px] md:text-xs text-green-50/90 font-medium mt-1">Faizsiz · Tüm hediye kampanyalarında</div>
                  </div>
                </div>
              </div>

              {/* İkincil rozetler */}
              <div className="flex flex-row flex-wrap gap-2.5 justify-center md:justify-start">
                {[
                  { icon: '🎁', text: 'Hediyeli Kampanyalar' },
                  { icon: '🚚', text: 'Aynı Gün Kargo' },
                ].map((f, i) => (
                  <div key={i} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/10 text-white/90 text-xs md:text-sm font-medium whitespace-nowrap">
                    <span>{f.icon}</span>
                    {f.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Altın alt çizgi */}
        <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-transparent" />
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
                  </div>

                  {/* Campaign info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white">
                        HEDİYE KAMPANYASI
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                        💳 PEŞİN FİYATINA 6 TAKSİT
                      </span>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        ⏱ Sınırlı Süre
                      </span>
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-800 mt-1">{gc.name}</h2>
                    {gc.description && (
                      <p className="text-sm text-gray-500 mt-1.5 leading-relaxed max-w-2xl">{gc.description}</p>
                    )}

                    {/* Hediye vurgusu + ikna edici pazarlama metni */}
                    <div className="mt-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-2xl p-4 md:p-5">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xl">🎁</span>
                        <h3 className="text-base md:text-lg font-extrabold text-gray-900">
                          {gc.giftName}
                          {gc.giftQuantity > 1 && (
                            <span className="text-sm font-bold text-amber-600 ml-1.5">× {gc.giftQuantity} Adet</span>
                          )}
                        </h3>
                        <span className="inline-flex items-center text-xs font-black px-2.5 py-1 rounded-full bg-green-500 text-white shadow-sm">
                          ÜCRETSİZ HEDİYE
                        </span>
                      </div>
                      <p className="text-sm md:text-[15px] text-gray-600 leading-relaxed">
                        Tam <strong className="text-amber-700">{formatPrice(gc.giftValue)}</strong> değerindeki bu
                        <strong className="text-gray-900"> profesyonel cihazı tamamen ücretsiz</strong> hediye ediyoruz!
                        Kampanyaya katılıp belirtilen ürünlerden alışverişinizi tamamladığınızda, bu değerli cihaz sizin oluyor.
                        Hem kazançlı alışveriş yapın hem de profesyonel ekipmanınızı hediye kazanın.
                      </p>
                    </div>

                    <p className="text-xs text-gray-400 mt-3">📅 Kampanya tarihleri: {fmt(gc.startDate)} — {fmt(gc.endDate)}</p>
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
