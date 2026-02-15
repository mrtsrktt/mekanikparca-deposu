import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateB2BPrice, formatPrice } from '@/lib/pricing'
import { getActiveCampaignsForProduct } from '@/lib/campaignPricing'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductDetailClient from './ProductDetailClient'

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
    include: { category: true, brand: true, images: { orderBy: { sortOrder: 'asc' } } },
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
        {/* Images */}
        <div>
          <div className="card aspect-square flex items-center justify-center bg-gray-50 p-8">
            <img
              src={product.images[0]?.url || '/placeholder.jpg'}
              alt={product.images[0]?.alt || product.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {product.images.map((img) => (
                <div key={img.id} className="card aspect-square p-2 cursor-pointer hover:ring-2 ring-primary-500">
                  <img src={img.url} alt={img.alt || ''} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          )}
        </div>

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
                Orijinal fiyat: {formatPrice(product.priceOriginal, product.priceCurrency)}
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
    </div>
  )
}
