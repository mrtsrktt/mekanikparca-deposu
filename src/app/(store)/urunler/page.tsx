import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'
import { getBrandContent } from '@/lib/brand-content'
import BrandLandingPage from '@/components/brand-landing/BrandLandingPage'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: { q?: string; category?: string; brand?: string; page?: string; sort?: string }
}

export async function generateMetadata({ searchParams }: Props) {
  // Sıralama/sayfalama varyantları için noindex: aynı içeriğin yeniden
  // düzenlenmiş kopyalarıdır, canonical zaten ana versiyona işaret ediyor;
  // ama noindex Google'a daha güçlü bir sinyaldir ve crawl budget'ı korur.
  const isFilterVariant =
    !!searchParams.sort ||
    (searchParams.page ? parseInt(searchParams.page) > 1 : false)
  const robotsMeta = isFilterVariant
    ? { robots: { index: false, follow: true } }
    : {}

  if (searchParams.category) {
    const category = await prisma.category.findUnique({
      where: { slug: searchParams.category },
    })
    if (category) {
      return {
        ...robotsMeta,
        title: category.metaTitle || `${category.name} Ürünleri`,
        description: category.metaDesc || category.description || `${category.name} kategorisindeki tüm ürünleri inceleyin. Orijinal ürünler, uygun fiyat, hızlı kargo.`,
        alternates: { canonical: `/urunler?category=${searchParams.category}` },
      }
    }
  }

  if (searchParams.brand) {
    const brandContent = getBrandContent(searchParams.brand)
    if (brandContent) {
      const description = brandContent.tagline.length > 160
        ? brandContent.tagline.slice(0, 157) + '...'
        : brandContent.tagline
      return {
        ...robotsMeta,
        title: `${brandContent.fullName} | Mekanik Parça Deposu`,
        description,
        alternates: { canonical: `/urunler?brand=${searchParams.brand}` },
      }
    }
    const brand = await prisma.brand.findUnique({
      where: { slug: searchParams.brand },
    })
    if (brand) {
      return {
        ...robotsMeta,
        title: `${brand.name} Ürünleri`,
        description: `${brand.name} markalı tüm ürünleri inceleyin. Orijinal, garantili ürünler. Hızlı kargo, uygun fiyat.`,
        alternates: { canonical: `/urunler?brand=${searchParams.brand}` },
      }
    }
  }

  if (searchParams.q) {
    return {
      // Arama sonuç sayfaları genelde dizine eklenmez — varyant olsun olmasın.
      robots: { index: false, follow: true },
      title: `"${searchParams.q}" için Arama Sonuçları`,
      description: `"${searchParams.q}" araması için bulunan ürünler. Mekanik Parça Deposu'nda orijinal tesisat ve ısıtma ürünleri.`,
      alternates: { canonical: `/urunler?q=${encodeURIComponent(searchParams.q!)}` },
    }
  }

  return {
    ...robotsMeta,
    title: 'Tüm Ürünler',
    description: 'Fernox, Lega, MRU, REGEN ve Testo markalı ısıtma, soğutma ve tesisat ürünlerini inceleyin. Orijinal ürünler, uygun fiyat, hızlı kargo.',
    alternates: { canonical: '/urunler' },
  }
}

export default async function ProductsPage({ searchParams }: Props) {
  // Brand-specific landing page (Lega, Fernox, ...) — render only when brand
  // is in BRAND_CONTENT and no other filter/search/sort/pagination is active.
  const brandContent = getBrandContent(searchParams.brand)
  const isPlainBrandRequest =
    !!brandContent &&
    !searchParams.q &&
    !searchParams.category &&
    !searchParams.page &&
    !searchParams.sort
  if (isPlainBrandRequest && brandContent) {
    const brandRecord = await prisma.brand.findUnique({
      where: { slug: brandContent.slug },
    })
    if (brandRecord) {
      const brandProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          brandId: brandRecord.id,
          OR: [{ category: { isActive: true } }, { categoryId: null }],
        },
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          priceTiers: { orderBy: { unitPriceTRY: 'asc' } },
        },
        orderBy: { name: 'asc' },
      })
      const productsWithTRY = brandProducts.map((p) => {
        const priceTRY = p.priceTRY
        const cheapestTierPrice = p.priceTiers?.length > 0
          ? Math.min(...p.priceTiers.map(t => t.unitPriceTRY))
          : null
        const displayPrice = cheapestTierPrice && cheapestTierPrice < priceTRY
          ? cheapestTierPrice
          : priceTRY
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          priceTRY: displayPrice,
          retailPriceTRY: priceTRY,
          stock: p.stock,
          trackStock: p.trackStock,
          images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
        }
      })
      // Sort by capacity ascending; VA values are normalized to KVA (1 KVA = 1000 VA).
      // Products without a parsable capacity fall to the end, name-asc among themselves.
      const getCapacityKva = (name: string): number | null => {
        const kva = name.match(/(\d+(?:[.,]\d+)?)\s*KVA/i)
        if (kva) return parseFloat(kva[1].replace(',', '.'))
        const va = name.match(/(\d+(?:[.,]\d+)?)\s*VA\b/i)
        if (va) return parseFloat(va[1].replace(',', '.')) / 1000
        return null
      }
      productsWithTRY.sort((a, b) => {
        const ca = getCapacityKva(a.name)
        const cb = getCapacityKva(b.name)
        if (ca === null && cb === null) return a.name.localeCompare(b.name, 'tr')
        if (ca === null) return 1
        if (cb === null) return -1
        return ca - cb
      })
      return (
        <BrandLandingPage
          brand={brandContent}
          brandRecord={{
            id: brandRecord.id,
            name: brandRecord.name,
            slug: brandRecord.slug,
            logo: brandRecord.logo,
          }}
          products={productsWithTRY}
        />
      )
    }
  }

  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const sort = searchParams.sort || 'newest'

  const where: any = { isActive: true, OR: [{ category: { isActive: true } }, { categoryId: null }] }
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: 'insensitive' } },
      { description: { contains: searchParams.q, mode: 'insensitive' } },
      { sku: { contains: searchParams.q, mode: 'insensitive' } },
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
      include: { brand: true, category: true, images: { orderBy: { sortOrder: 'asc' }, take: 1 }, priceTiers: { orderBy: { unitPriceTRY: 'asc' }, take: 1 } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ])

  // Saklı priceTRY tek doğru fiyat kaynağıdır (kur güncellemesinde recalculateProductPrices ile güncellenir).
  const productsWithConvertedPrices = products.map(product => ({
    ...product,
    priceTRY: product.priceTRY,
  }))

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
              {productsWithConvertedPrices.map((product) => (
                <ProductCard key={product.id} product={product} hasCampaign={hasCampaign(product)} campaignLowestPrice={getCampaignLowestPrice(product)} tierLowestPrice={(product as any).priceTiers?.[0]?.unitPriceTRY || null} />
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
