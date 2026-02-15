import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice } from '@/lib/pricing'
import ProductCard from '@/components/ProductCard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Kampanyalar | Mekanik Parça Deposu',
  description: 'Aktif kampanyalar. Toplu alımlarda özel fiyat avantajlarından yararlanın.',
}

export default async function CampaignsPage() {
  const now = new Date()

  const campaigns = await (prisma as any).campaign.findMany({
    where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
    include: { tiers: { orderBy: { minQuantity: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })

  const campaignDetails = await Promise.all(
    campaigns.map(async (campaign: any) => {
      let products: any[] = []
      let scopeLabel = ''

      if (campaign.scopeType === 'PRODUCT' && campaign.productId) {
        const product = await prisma.product.findUnique({
          where: { id: campaign.productId },
          include: { brand: true, category: true, images: { take: 1 } },
        })
        if (product && product.isActive) products = [product]
        scopeLabel = product?.name || ''
      } else if (campaign.scopeType === 'BRAND' && campaign.brandId) {
        const brand = await prisma.brand.findUnique({ where: { id: campaign.brandId } })
        products = await prisma.product.findMany({
          where: { brandId: campaign.brandId, isActive: true },
          include: { brand: true, category: true, images: { take: 1 } },
          take: 12, orderBy: { createdAt: 'desc' },
        })
        scopeLabel = brand?.name || ''
      } else if (campaign.scopeType === 'CATEGORY' && campaign.categoryId) {
        const cat = await prisma.category.findUnique({ where: { id: campaign.categoryId } })
        products = await prisma.product.findMany({
          where: { categoryId: campaign.categoryId, isActive: true },
          include: { brand: true, category: true, images: { take: 1 } },
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

      {/* Sayfa başlığı — kompakt banner */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🔥</span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Kampanyalar</h1>
            <p className="text-red-100 text-sm mt-1">Adet arttıkça fiyat düşer. Fırsatları kaçırmayın.</p>
          </div>
        </div>
      </div>

      {activeCampaigns.length === 0 ? (
        <div className="text-center py-20 card">
          <span className="text-5xl block mb-4">📦</span>
          <p className="text-gray-500 text-lg mb-4">Şu anda aktif kampanya bulunmuyor.</p>
          <Link href="/urunler" className="btn-primary">Ürünleri İncele</Link>
        </div>
      ) : (
        <div className="space-y-10">
          {activeCampaigns.map((campaign: any) => (
            <div key={campaign.id} className="rounded-xl border-2 border-red-200 overflow-hidden bg-white shadow-sm">
              {/* Kampanya üst bandı */}
              <div className="bg-red-50 border-b border-red-200 px-5 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl">🔥</span>
                      <h2 className="text-lg font-bold text-gray-800">{campaign.name}</h2>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500 text-white">
                        {campaign.type === 'PERCENTAGE' ? '% İNDİRİM' : 'SABİT FİYAT'}
                      </span>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {scopeMap[campaign.scopeType]}: {campaign.scopeLabel}
                      </span>
                    </div>
                    {campaign.description && (
                      <p className="text-sm text-gray-500 mt-1">{campaign.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">📅 {fmt(campaign.startDate)} — {fmt(campaign.endDate)}</p>
                  </div>

                  {/* Kademe bilgileri */}
                  <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                    {campaign.tiers.map((tier: any, idx: number) => (
                      <div key={idx} className="bg-white border-2 border-red-300 rounded-lg px-3 py-2 text-center min-w-[100px]">
                        <div className="text-xs text-gray-500 font-medium">{tier.minQuantity}+ adet</div>
                        <div className="text-base font-bold text-red-600">
                          {campaign.type === 'PERCENTAGE' ? `%${tier.value}` : formatPrice(tier.value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ürünler */}
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {campaign.products.map((product: any) => {
                    let lowest = product.priceTRY
                    for (const t of campaign.tiers) {
                      const price = campaign.type === 'PERCENTAGE' ? product.priceTRY * (1 - t.value / 100) : t.value
                      if (price < lowest) lowest = price
                    }
                    return (
                      <ProductCard key={product.id} product={product} hasCampaign campaignLowestPrice={lowest < product.priceTRY ? lowest : null} />
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
