import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/pricing'
import type { BrandContent } from '@/lib/brand-content'
import { parseKvaFromName } from '@/lib/brand-content'
import BrandAddToCartButton from './BrandAddToCartButton'
import BrandProductGuide, { type GuideProduct } from './BrandProductGuide'
import BrandFaqAccordion from './BrandFaqAccordion'
import BrandAboutToggle from './BrandAboutToggle'
import BrandStickyCta from './BrandStickyCta'

type BrandRecord = {
  id: string
  name: string
  slug: string
  logo: string | null
}

type ProductRecord = {
  id: string
  name: string
  slug: string
  priceTRY: number
  stock: number
  trackStock: boolean
  images: { url: string; alt: string | null }[]
}

interface Props {
  brand: BrandContent
  brandRecord: BrandRecord
  products: ProductRecord[]
}

export default function BrandLandingPage({ brand, brandRecord, products }: Props) {
  const productsByKva: Record<string, GuideProduct> = {}
  for (const p of products) {
    const kva = parseKvaFromName(p.name)
    if (!kva) continue
    if (productsByKva[kva]) continue
    productsByKva[kva] = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      priceTRY: p.priceTRY,
      imageUrl: p.images[0]?.url || '/placeholder.jpg',
      outOfStock: p.trackStock !== false && p.stock === 0,
    }
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@graph': products.map((p) => ({
      '@type': 'Product',
      '@id': `https://mekanikparcadeposu.com/urun/${p.slug}`,
      name: p.name,
      image: p.images[0]?.url,
      brand: { '@type': 'Brand', name: brandRecord.name },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'TRY',
        price: p.priceTRY,
        availability:
          p.trackStock !== false && p.stock === 0
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/InStock',
        url: `https://mekanikparcadeposu.com/urun/${p.slug}`,
      },
    })),
  }

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mekanik Parça Deposu',
    url: 'https://mekanikparcadeposu.com',
    logo: 'https://mekanikparcadeposu.com/images/logo.png',
    telephone: '+905326404086',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      <div className="bg-gradient-to-b from-white via-gray-50/50 to-white">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/40 via-white to-blue-50/40 pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-4 pt-6 pb-8 md:pt-10 md:pb-12">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <Link href="/" className="hover:text-primary-500">Ana Sayfa</Link>
              <span>/</span>
              <Link href="/urunler" className="hover:text-primary-500">Ürünler</Link>
              <span>/</span>
              <span className="text-gray-800">{brand.name}</span>
            </div>

            <div className="flex items-center gap-3 mb-5">
              {brandRecord.logo ? (
                <div className="relative h-10 md:h-12 w-24 md:w-32">
                  <Image
                    src={brandRecord.logo}
                    alt={brand.name}
                    fill
                    sizes="(max-width: 768px) 96px, 128px"
                    className="object-contain object-left"
                    priority
                  />
                </div>
              ) : (
                <div className="text-xl md:text-2xl font-bold text-gray-900">{brand.name}</div>
              )}
              <div className="h-8 w-px bg-gray-200" />
              <Image
                src="/images/logo.png"
                alt="Mekanik Parça Deposu"
                width={140}
                height={40}
                className="h-8 md:h-10 w-auto"
              />
            </div>

            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
              {brand.fullName}
            </h1>
            <p className="mt-2 text-sm md:text-base text-gray-600 max-w-2xl">
              {brand.tagline}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                '32 Yıllık Sektör Tecrübesi',
                'Aynı Gün Kargo',
                'Ücretsiz Kargo (5.000+ TL)',
                '2 Yıl Garanti',
              ].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 text-[11px] md:text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-2.5 py-1 rounded-full"
                >
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="max-w-6xl mx-auto px-4 py-6 md:py-10">
          <div className="flex items-end justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {brand.name} Ürünleri
            </h2>
            <span className="text-xs md:text-sm text-gray-500">{products.length} ürün</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500">Bu markada henüz ürün bulunmuyor.</p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {products.map((p) => {
                  const kva = parseKvaFromName(p.name)
                  const usage = kva ? brand.productLabels[kva] : null
                  const outOfStock = p.trackStock !== false && p.stock === 0
                  return (
                    <article
                      key={p.id}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex"
                    >
                      <Link
                        href={`/urun/${p.slug}`}
                        className="flex-shrink-0 w-28 bg-gradient-to-b from-gray-50 to-white relative"
                      >
                        <img
                          src={p.images[0]?.url || '/placeholder.jpg'}
                          alt={p.images[0]?.alt || p.name}
                          className="w-full h-full object-contain p-2"
                        />
                        {outOfStock && (
                          <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                            <span className="text-white text-[10px] font-semibold">Stokta Yok</span>
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 p-3 flex flex-col">
                        <Link href={`/urun/${p.slug}`}>
                          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-primary-500">
                            {p.name}
                          </h3>
                        </Link>
                        {usage && (
                          <span className="mt-1 inline-flex w-fit items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                            {usage}
                          </span>
                        )}
                        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
                          <div className="text-base font-bold text-primary-600">
                            {formatPrice(p.priceTRY)}
                          </div>
                          <BrandAddToCartButton
                            productId={p.id}
                            productName={p.name}
                            priceTRY={p.priceTRY}
                            outOfStock={outOfStock}
                            size="sm"
                          />
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="text-left px-4 py-3 w-24">Görsel</th>
                      <th className="text-left px-4 py-3">Ürün Adı</th>
                      <th className="text-left px-4 py-3 w-48">Kullanım Alanı</th>
                      <th className="text-right px-4 py-3 w-32">Fiyat</th>
                      <th className="text-right px-4 py-3 w-44">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((p) => {
                      const kva = parseKvaFromName(p.name)
                      const usage = kva ? brand.productLabels[kva] : null
                      const outOfStock = p.trackStock !== false && p.stock === 0
                      return (
                        <tr key={p.id} className="hover:bg-gray-50/60">
                          <td className="px-4 py-3">
                            <Link
                              href={`/urun/${p.slug}`}
                              className="block w-16 h-16 bg-gradient-to-b from-gray-50 to-white rounded-lg overflow-hidden border border-gray-100 relative"
                            >
                              <img
                                src={p.images[0]?.url || '/placeholder.jpg'}
                                alt={p.images[0]?.alt || p.name}
                                className="w-full h-full object-contain p-1.5"
                              />
                              {outOfStock && (
                                <div className="absolute inset-0 bg-gray-900/60" />
                              )}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/urun/${p.slug}`}
                              className="text-sm font-semibold text-gray-900 hover:text-primary-500 leading-snug"
                            >
                              {p.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {usage ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                                {usage}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-base font-bold text-primary-600 whitespace-nowrap">
                            {formatPrice(p.priceTRY)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <BrandAddToCartButton
                              productId={p.id}
                              productName={p.name}
                              priceTRY={p.priceTRY}
                              outOfStock={outOfStock}
                              size="sm"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        {/* Product Guide */}
        {brand.productGuide && (
          <section className="max-w-6xl mx-auto px-4 py-6 md:py-10">
            <BrandProductGuide
              title={brand.productGuide.title}
              description={brand.productGuide.description}
              stages={brand.productGuide.stages}
              productsByKva={productsByKva}
              brandName={brand.name}
            />
          </section>
        )}

        {/* About Brand */}
        <section className="max-w-6xl mx-auto px-4 py-6 md:py-10">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {brand.name} Hakkında
            </h2>
            <p className="mt-3 text-sm md:text-base text-gray-700 leading-relaxed">
              {brand.aboutBrand}
            </p>
            <BrandAboutToggle longText={brand.aboutBrandLong} />
          </div>
        </section>

        {/* About Mekanik Parça Deposu */}
        <section className="max-w-6xl mx-auto px-4 py-6 md:py-10">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 md:p-10 text-white">
            <h2 className="text-xl md:text-2xl font-bold">
              32 Yıllık Sektör Tecrübemizle Hizmetinizdeyiz
            </h2>
            <div className="mt-4 space-y-3 text-sm md:text-base text-white/90 leading-relaxed">
              <p>
                İKİ M İKLİMLENDİRME SİSTEMLERİ TİCARET LTD. ŞTİ. çatısı altında faaliyet
                gösteren <strong>Mekanik Parça Deposu</strong>, mekanik tesisat, HVAC,
                ısıtma-soğutma sistemleri ve teknik servis ekipmanları alanında
                Türkiye&apos;nin güvenilir tedarikçisidir.
              </p>
              <p>
                Lega, Fernox, REGEN, MRU gibi öncü markaların yetkili satıcısı olarak,
                profesyonel ve son kullanıcılara orijinal ürünleri en uygun fiyatlarla
                sunmaktayız.
              </p>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="max-w-6xl mx-auto px-4 py-6 md:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {brand.trustBadges.map((badge) => (
              <div
                key={badge}
                className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-gray-800">{badge}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        {brand.faq.length > 0 && (
          <section className="max-w-3xl mx-auto px-4 py-6 md:py-10">
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Sıkça Sorulan Sorular
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {brand.name} ürünleri ve siparişiniz hakkında bilmeniz gerekenler
              </p>
            </div>
            <BrandFaqAccordion faq={brand.faq} />
          </section>
        )}
      </div>

      <BrandStickyCta brandSlug={brand.slug} brandName={brand.name} />
    </>
  )
}
