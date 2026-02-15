import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateB2BPrice } from '@/lib/pricing'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: { q?: string; category?: string; brand?: string; page?: string; sort?: string }
}

export default async function ProductsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const sort = searchParams.sort || 'newest'

  const where: any = { isActive: true }
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q } },
      { description: { contains: searchParams.q } },
      { sku: { contains: searchParams.q } },
    ]
  }
  if (searchParams.category) where.category = { slug: searchParams.category }
  if (searchParams.brand) where.brand = { slug: searchParams.brand }

  const orderBy: any = sort === 'price-asc' ? { priceTRY: 'asc' }
    : sort === 'price-desc' ? { priceTRY: 'desc' }
    : sort === 'name' ? { name: 'asc' }
    : { createdAt: 'desc' }

  const [products, total, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { brand: true, category: true, images: { take: 1 } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ])

  const totalPages = Math.ceil(total / limit)

  // Fetch active campaigns to determine which products have campaigns
  const now = new Date()
  const activeCampaigns = await (prisma as any).campaign.findMany({
    where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
    select: { scopeType: true, productId: true, brandId: true, categoryId: true, type: true, tiers: { select: { minQuantity: true, value: true } } },
  })

  const campaignProductIds = new Set<string>()
  const campaignBrandIds = new Set<string>()
  const campaignCategoryIds = new Set<string>()

  for (const c of activeCampaigns as any[]) {
    if (c.scopeType === 'PRODUCT' && c.productId) campaignProductIds.add(c.productId)
    if (c.scopeType === 'BRAND' && c.brandId) campaignBrandIds.add(c.brandId)
    if (c.scopeType === 'CATEGORY' && c.categoryId) campaignCategoryIds.add(c.categoryId)
  }

  const hasCampaign = (p: any) =>
    campaignProductIds.has(p.id) ||
    (p.brandId && campaignBrandIds.has(p.brandId)) ||
    (p.categoryId && campaignCategoryIds.has(p.categoryId))

  const getCampaignLowestPrice = (p: any): number | null => {
    const matching = (activeCampaigns as any[]).filter((c: any) =>
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

  // B2B fiyat hesaplama
  const session = await getServerSession(authOptions)
  const isB2B = session?.user && (session.user as any).role === 'B2B'
  let b2bPriceMap: Record<string, number> = {}

  if (isB2B) {
    const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } })
    if (user && user.b2bStatus === 'APPROVED') {
      const prices = await Promise.all(
        products.map(async (p) => ({
          id: p.id,
          b2bPrice: await calculateB2BPrice(p),
          originalPrice: p.priceTRY,
        }))
      )
      for (const p of prices) {
        if (p.b2bPrice < p.originalPrice) b2bPriceMap[p.id] = p.b2bPrice
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-500">Ana Sayfa</Link>
        <span>/</span>
        <span className="text-gray-800">Ürünler</span>
        {searchParams.q && <span className="text-gray-800">- &quot;{searchParams.q}&quot;</span>}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="card p-4 mb-4">
            <h3 className="font-semibold mb-3">Kategoriler</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/urunler" className={`text-sm block py-1 ${!searchParams.category ? 'text-primary-500 font-medium' : 'text-gray-600 hover:text-primary-500'}`}>
                  Tümü
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/urunler?category=${cat.slug}`}
                    className={`text-sm block py-1 ${searchParams.category === cat.slug ? 'text-primary-500 font-medium' : 'text-gray-600 hover:text-primary-500'}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold mb-3">Markalar</h3>
            <ul className="space-y-1">
              {brands.map((brand) => (
                <li key={brand.id}>
                  <Link
                    href={`/urunler?brand=${brand.slug}`}
                    className={`text-sm block py-1 ${searchParams.brand === brand.slug ? 'text-primary-500 font-medium' : 'text-gray-600 hover:text-primary-500'}`}
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{total} ürün bulundu</p>
            <div className="flex gap-1">
              {[
                { value: 'newest', label: 'Yeni' },
                { value: 'price-asc', label: 'Ucuz' },
                { value: 'price-desc', label: 'Pahalı' },
                { value: 'name', label: 'A-Z' },
              ].map((opt) => (
                <Link
                  key={opt.value}
                  href={`/urunler?sort=${opt.value}${searchParams.q ? `&q=${searchParams.q}` : ''}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.brand ? `&brand=${searchParams.brand}` : ''}`}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${sort === opt.value ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Ürün bulunamadı.</p>
              <Link href="/urunler" className="btn-primary mt-4">Tüm Ürünleri Gör</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} hasCampaign={hasCampaign(product)} campaignLowestPrice={getCampaignLowestPrice(product)} b2bUserPrice={b2bPriceMap[product.id]} showB2B={isB2B} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/urunler?page=${p}${searchParams.q ? `&q=${searchParams.q}` : ''}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.brand ? `&brand=${searchParams.brand}` : ''}&sort=${sort}`}
                  className={`px-3 py-1.5 rounded text-sm ${p === page ? 'bg-primary-500 text-white' : 'bg-white border hover:bg-gray-50'}`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
