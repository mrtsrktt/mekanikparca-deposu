import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateB2BPrice, formatPrice } from '@/lib/pricing'
import { getActiveCampaignsForProduct } from '@/lib/campaignPricing'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductDetailClient from './ProductDetailClient'
import ProductMediaGallery from '@/components/ProductMediaGallery'

export const dynamic = 'force-dynamic'

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
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { 
      category: true, 
      brand: true, 
      images: { orderBy: { sortOrder: 'asc' } },
      videos: { orderBy: { sortOrder: 'asc' } },
      documents: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!product) notFound()

  const session = await getServerSession(authOptions)
  let b2bPrice: number | null = null

  if (session?.user?.role === 'B2B') {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (user && user.b2bStatus === 'APPROVED') {
      b2bPrice = await calculateB2BPrice(product)
    }
  }

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
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/urunler?category=${product.category.slug}`} className="hover:text-primary-500">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-800">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Media Gallery */}
        <ProductMediaGallery 
          images={product.images.map(img => ({ url: img.url, alt: img.alt || product.name }))}
          productName={product.name}
        />

        {/* Product Info */}
        <div>
          {product.brand && (
            <Link href={`/urunler?brand=${product.brand.slug}`} className="text-sm text-primary-500 font-medium uppercase tracking-wide hover:underline">
              {product.brand.name}
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mt-1 mb-4">{product.name}</h1>

          {product.sku && (
            <p className="text-sm text-gray-500 mb-4">Stok Kodu: {product.sku}</p>
          )}

          {/* Pricing */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            {b2bPrice && b2bPrice < product.priceTRY ? (
              <div>
                <span className="badge badge-warning mb-2">Bayi Özel Fiyat</span>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-primary-500">{formatPrice(b2bPrice)}</span>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.priceTRY)}</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  %{Math.round((1 - b2bPrice / product.priceTRY) * 100)} bayi indirimi
                </p>
              </div>
            ) : (
              <span className="text-3xl font-bold text-primary-500">{formatPrice(product.priceTRY)}</span>
            )}
            {product.priceCurrency !== 'TRY' && (
              <p className="text-xs text-gray-400 mt-1">
                Para birimi: {product.priceCurrency}
              </p>
            )}
          </div>

          {/* Stock */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {(product as any).trackStock === false ? (
              <span className="badge badge-success">Stokta Var</span>
            ) : product.stock > 0 ? (
              <span className="badge badge-success">Stokta Var ({product.stock} {product.unit})</span>
            ) : (
              <span className="badge badge-danger">Stokta Yok</span>
            )}
            {(product as any).freeShipping ? (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">🚚 Ücretsiz Kargo</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">📦 Kargo: Alıcı Öder</span>
            )}
          </div>

          <ProductDetailClient
            productId={product.id}
            productName={product.name}
            stock={product.stock}
            trackStock={(product as any).trackStock}
            priceTRY={product.priceTRY}
            campaigns={campaignsData}
          />

          {/* Technical Details */}
          {product.technicalDetails && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-3">Teknik Detaylar</h2>
              <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: product.technicalDetails }} />
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-3">Ürün Açıklaması</h2>
              <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}
        </div>
      </div>

      {/* Videos Section */}
      {(product as any).videos?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Ürün Videoları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(product as any).videos.map((video: any) => (
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
      {(product as any).documents?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Teknik Dökümanlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(product as any).documents.map((doc: any) => (
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
