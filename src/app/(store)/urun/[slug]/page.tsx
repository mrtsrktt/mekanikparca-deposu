import { prisma } from '@/lib/prisma'
import { formatPrice, calculateTRYPrice } from '@/lib/pricing'
import { getActiveCampaignsForProduct } from '@/lib/campaignPricing'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductDetailClient from './ProductDetailClient'
import ProductMediaGallery from '@/components/ProductMediaGallery'

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

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } })
  if (!product) return { title: 'Ürün Bulunamadı' }
  return {
    title: product.metaTitle || `${product.name} | Mekanik Parça Deposu`,
    description: product.metaDesc || product.description?.slice(0, 160),
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const [exchangeRates, product] = await Promise.all([
    getExchangeRates(),
    prisma.product.findUnique({
      where: { slug: params.slug },
      include: { 
        category: true, 
        brand: true, 
        images: { orderBy: { sortOrder: 'asc' } },
      },
    })
  ])

  if (!product || !product.category?.isActive) notFound()

  // Fiyatı TL'ye çevir
  const priceTRY = calculateTRYPrice(product.priceOriginal, product.priceCurrency, exchangeRates)
  const productWithConvertedPrice = {
    ...product,
    priceTRY
  }
  
  // Try to fetch videos and documents separately
  let videos: any[] = []
  let documents: any[] = []
  
  try {
    videos = await (prisma as any).productVideo.findMany({
      where: { productId: product.id },
      orderBy: { sortOrder: 'asc' }
    })
  } catch (e) {
    // Table doesn't exist yet
  }
  
  try {
    documents = await (prisma as any).productDocument.findMany({
      where: { productId: product.id },
      orderBy: { sortOrder: 'asc' }
    })
  } catch (e) {
    // Table doesn't exist yet
  }

  // Fetch price tiers for this product
  const priceTiers = await prisma.priceTier.findMany({
    where: { productId: product.id },
    orderBy: { minQuantity: 'asc' },
  })
  const priceTiersData = priceTiers.map(t => ({
    minQuantity: t.minQuantity,
    unitPriceTRY: t.unitPriceTRY,
  }))

  // Fetch active campaigns for this product
  const campaigns = await getActiveCampaignsForProduct(product.id)
  const campaignsData = campaigns.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    tiers: c.tiers.map(t => ({ minQuantity: t.minQuantity, value: t.value })),
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-500">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/urunler" className="hover:text-primary-500">Ürünler</Link>
        {productWithConvertedPrice.category && (
          <>
            <span>/</span>
            <Link href={`/urunler?category=${productWithConvertedPrice.category.slug}`} className="hover:text-primary-500">
              {productWithConvertedPrice.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-800">{productWithConvertedPrice.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Media Gallery */}
        <ProductMediaGallery 
          images={productWithConvertedPrice.images.map(img => ({ url: img.url, alt: img.alt || productWithConvertedPrice.name }))}
          productName={productWithConvertedPrice.name}
        />

        {/* Product Info */}
        <div>
          {productWithConvertedPrice.brand && (
            <Link href={`/urunler?brand=${productWithConvertedPrice.brand.slug}`} className="text-sm text-primary-500 font-medium uppercase tracking-wide hover:underline">
              {productWithConvertedPrice.brand.name}
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mt-1 mb-4">{productWithConvertedPrice.name}</h1>

          {productWithConvertedPrice.sku && (
            <p className="text-sm text-gray-500 mb-4">Stok Kodu: {productWithConvertedPrice.sku}</p>
          )}

          {/* Pricing */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <span className="text-3xl font-bold text-primary-500">{formatPrice(productWithConvertedPrice.priceTRY)}</span>
          </div>

          {/* Stock */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {(productWithConvertedPrice as any).trackStock === false ? (
              <span className="badge badge-success">Stokta Var</span>
            ) : productWithConvertedPrice.stock > 0 ? (
              <span className="badge badge-success">Stokta Var ({productWithConvertedPrice.stock} {productWithConvertedPrice.unit})</span>
            ) : (
              <span className="badge badge-danger">Stokta Yok</span>
            )}
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              5.000 TL ve Üzeri Kargo Bedava
            </span>
          </div>

          <ProductDetailClient
            productId={productWithConvertedPrice.id}
            productName={productWithConvertedPrice.name}
            stock={productWithConvertedPrice.stock}
            trackStock={(productWithConvertedPrice as any).trackStock}
            priceTRY={productWithConvertedPrice.priceTRY}
            campaigns={campaignsData}
            boxQuantity={product.boxQuantity}
            priceTiers={priceTiersData}
          />

          {/* Technical Details */}
          {productWithConvertedPrice.technicalDetails && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-3">Teknik Detaylar</h2>
              <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: productWithConvertedPrice.technicalDetails }} />
            </div>
          )}

          {/* Description */}
          {productWithConvertedPrice.description && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-3">Ürün Açıklaması</h2>
              <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: productWithConvertedPrice.description }} />
            </div>
          )}
        </div>
      </div>

      {/* Videos Section */}
      {videos?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Ürün Videoları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video: any) => (
              <div key={video.id} className="card p-4">
                <h3 className="font-semibold mb-3">{video.title}</h3>
                <video controls className="w-full rounded-lg bg-black" preload="metadata">
                  <source src={video.url} type="video/mp4" />
                  Tarayıcınız video oynatmayı desteklemiyor.
                </video>
                <a href={video.url} download className="btn-secondary text-sm mt-3 w-full text-center">
                  📥 Videoyu İndir
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Section */}
      {documents?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Teknik Dökümanlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc: any) => (
              <div key={doc.id} className="card p-4 flex items-center gap-3 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{doc.title}</h3>
                  {doc.fileSize && (
                    <p className="text-xs text-gray-500">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-500 hover:underline">
                      👁️ Görüntüle
                    </a>
                    <a href={doc.url} download className="text-xs text-blue-500 hover:underline">
                      📥 İndir
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
