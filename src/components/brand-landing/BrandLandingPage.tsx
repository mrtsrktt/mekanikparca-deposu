import Link from 'next/link'
import Image from 'next/image'
import { formatPrice, applySalePrice } from '@/lib/pricing'
import type { BrandContent } from '@/lib/brand-content'
import { parseKvaFromName } from '@/lib/brand-content'
import BrandAddToCartButton from './BrandAddToCartButton'
import BrandProductGuide, { type GuideProduct } from './BrandProductGuide'
import BrandFaqAccordion from './BrandFaqAccordion'
import BrandAboutToggle from './BrandAboutToggle'
import BrandStickyCta from './BrandStickyCta'
import BrandTechSpecs from './BrandTechSpecs'
import BrandFinalCta from './BrandFinalCta'
import DealershipCertificate from './DealershipCertificate'
import AnimatedNumber from './AnimatedNumber'

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
  retailPriceTRY?: number
  stock: number
  trackStock: boolean
  images: { url: string; alt: string | null }[]
}

interface Props {
  brand: BrandContent
  brandRecord: BrandRecord
  products: ProductRecord[]
}

function pickHeroProduct(products: ProductRecord[]): ProductRecord | null {
  if (products.length === 0) return null
  const withImage = products.find((p) => p.images[0]?.url)
  if (!withImage) return products[0]
  // prefer mid-size (10 KVA) for hero hero image; fallback to first with image
  const tenKva = products.find(
    (p) => parseKvaFromName(p.name) === '10' && p.images[0]?.url,
  )
  return tenKva ?? withImage
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

  const heroProduct = pickHeroProduct(products)

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
        price: applySalePrice(p.retailPriceTRY ?? p.priceTRY),
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

  const waLink = `https://wa.me/905326404086?text=${encodeURIComponent(
    `Merhaba, ${brand.name} regülatörleri hakkında bilgi almak istiyorum.`,
  )}`

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

      <div className="bg-white">
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden bg-[#0a0f1e]">
          {/* subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #fbbf24 1px, transparent 1px), linear-gradient(to bottom, #fbbf24 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
            aria-hidden
          />
          {/* corner gradient accent — electric glow */}
          <div
            className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-amber-400/40 via-amber-500/15 to-transparent blur-3xl pointer-events-none"
            aria-hidden
          />
          {/* sine wave — voltage curve */}
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 w-full h-24 opacity-[0.06] pointer-events-none"
            aria-hidden
          >
            <path
              d="M0,60 C180,20 360,100 540,60 C720,20 900,100 1080,60 C1260,20 1440,100 1440,60 L1440,120 L0,120 Z"
              fill="#f59e0b"
            />
          </svg>

          <div className="relative max-w-6xl mx-auto px-4 pt-8 md:pt-12 pb-10 md:pb-16">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left column: text */}
              <div className="lg:col-span-7 order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden />
                  {brand.heroSubtitle}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.05] tracking-tight">
                  {brand.fullName}
                </h1>

                <p className="mt-5 text-base md:text-lg text-slate-300 leading-relaxed max-w-xl">
                  {brand.tagline}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="#urunler"
                    className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-sm md:text-base py-3 px-6 rounded-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all"
                  >
                    Modelleri İncele
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </a>
                  <a
                    href="#secim-rehberi"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50 font-bold text-sm md:text-base py-3 px-6 rounded-lg transition-colors"
                  >
                    Hangi Model Bana Uygun?
                  </a>
                </div>

                {/* Stat cards */}
                <div className="mt-9 grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:gap-3 max-w-2xl">
                  {brand.heroBadges.map((b) => (
                    <div
                      key={b.label}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 md:py-4 text-center hover:border-amber-400/60 hover:bg-white/[0.07] transition-all"
                    >
                      <div className="text-xl md:text-2xl font-bold text-white tabular-nums leading-none">
                        <AnimatedNumber value={b.value} />
                      </div>
                      <div className="mt-1.5 text-[10px] md:text-xs font-medium text-slate-400 leading-tight">
                        {b.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column: hero image */}
              <div className="lg:col-span-5 order-1 lg:order-2">
                <div className="relative">
                  {/* backdrop gradient */}
                  <div
                    className="absolute inset-x-4 top-4 bottom-0 rounded-3xl bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent blur-2xl"
                    aria-hidden
                  />
                  <div className="relative aspect-square max-w-md mx-auto bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700 shadow-2xl shadow-black/50 overflow-hidden">
                    {heroProduct?.images[0]?.url ? (
                      <Image
                        src={heroProduct.images[0].url}
                        alt={heroProduct.images[0].alt || heroProduct.name}
                        fill
                        priority
                        sizes="(max-width: 1024px) 90vw, 480px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                        Lega ürün görseli
                      </div>
                    )}

                    {/* bottom amber accent line */}
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" aria-hidden />
                  </div>

                  {/* floating badge */}
                  <div className="hidden md:flex absolute -bottom-4 -left-4 lg:-left-6 bg-slate-900 text-white rounded-2xl px-4 py-3 shadow-xl items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                        Yetkili Satıcı
                      </div>
                      <div className="text-xs font-bold leading-tight">
                        Orijinal &amp; Garantili
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* breadcrumb */}
          <div className="relative max-w-6xl mx-auto px-4 pb-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/" className="hover:text-white">Ana Sayfa</Link>
              <span>/</span>
              <Link href="/urunler" className="hover:text-white">Ürünler</Link>
              <span>/</span>
              <span className="text-slate-300 font-medium">{brand.name}</span>
            </div>
          </div>
        </section>

        {/* ===== CONFIGURATOR ===== */}
        {brand.productGuide && (
          <section
            id="secim-rehberi"
            className="bg-slate-50 border-y border-slate-200 scroll-mt-20"
          >
            <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
              <BrandProductGuide
                title={brand.productGuide.title}
                description={brand.productGuide.description}
                stages={brand.productGuide.stages}
                productsByKva={productsByKva}
                brandName={brand.name}
              />
            </div>
          </section>
        )}

        {/* ===== PRODUCT GALLERY ===== */}
        <section id="urunler" className="bg-white scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <div className="flex items-end justify-between mb-8 md:mb-10">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">
                  <span className="w-6 h-px bg-slate-300" aria-hidden />
                  Ürün Yelpazesi
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">
                  Tüm {brand.name} Modellerini İnceleyin
                </h2>
                <p className="mt-2 text-sm md:text-base text-slate-600">
                  {products.length} model · Tümü stokta · Aynı gün kargo
                </p>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-slate-500">Bu markada henüz ürün bulunmuyor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map((p) => {
                  const kva = parseKvaFromName(p.name)
                  const usage = kva ? brand.productLabels[kva] : null
                  const outOfStock = p.trackStock !== false && p.stock === 0
                  return (
                    <article
                      key={p.id}
                      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-900/5 hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* Image area */}
                      <Link
                        href={`/urun/${p.slug}`}
                        className="relative aspect-square bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 overflow-hidden"
                      >
                        {/* status badge */}
                        <div className="absolute top-3 left-3 z-10">
                          {outOfStock ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-200 px-2 py-1 rounded-md">
                              Tükendi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
                              Stokta
                            </span>
                          )}
                        </div>
                        {kva && (
                          <div className="absolute top-3 right-3 z-10">
                            <span className="inline-flex items-baseline gap-0.5 bg-slate-900 text-white px-2.5 py-1 rounded-md">
                              <span className="text-sm font-bold tabular-nums">{kva}</span>
                              <span className="text-[10px] font-semibold tracking-wider opacity-80">KVA</span>
                            </span>
                          </div>
                        )}

                        <img
                          src={p.images[0]?.url || '/placeholder.jpg'}
                          alt={p.images[0]?.alt || p.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                        />

                        {outOfStock && (
                          <div className="absolute inset-0 bg-white/60 pointer-events-none" />
                        )}
                      </Link>

                      {/* Content */}
                      <div className="flex-1 flex flex-col p-5">
                        <Link href={`/urun/${p.slug}`} className="block">
                          <h3 className="text-base md:text-lg font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
                            {p.name}
                          </h3>
                        </Link>
                        {usage && (
                          <p className="mt-1 text-xs md:text-sm text-slate-500">{usage}</p>
                        )}

                        {brand.productHighlights.length > 0 && (
                          <ul className="mt-3 space-y-1.5">
                            {brand.productHighlights.map((h) => (
                              <li key={h} className="flex items-start gap-2 text-xs md:text-[13px] text-slate-600">
                                <svg className="flex-shrink-0 w-3.5 h-3.5 mt-0.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="mt-5 pt-4 border-t border-slate-100">
                          <div className="flex items-baseline justify-between gap-2 mb-3">
                            <div>
                              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                                Fiyat
                              </div>
                              <div className="text-2xl md:text-[1.75rem] font-bold text-slate-900 tabular-nums leading-tight">
                                {formatPrice(applySalePrice(p.priceTRY))}
                                <span className="text-[11px] font-normal text-slate-400 ml-1">KDV Dahil</span>
                                {p.retailPriceTRY && p.retailPriceTRY > p.priceTRY && (
                                  <>
                                    {' '}
                                    <span className="text-sm font-normal text-slate-400 line-through">
                                      {formatPrice(applySalePrice(p.retailPriceTRY))}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <BrandAddToCartButton
                            productId={p.id}
                            productName={p.name}
                            priceTRY={p.priceTRY}
                            outOfStock={outOfStock}
                            fullWidth
                          />
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* ===== TECH SPECS ===== */}
        <BrandTechSpecs
          title={brand.techSpecsTitle}
          subtitle={brand.techSpecsSubtitle}
          specs={brand.techSpecs}
        />

        {/* ===== ABOUT BRAND ===== */}
        <section className="bg-white">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700 mb-3">
                  <span className="w-6 h-px bg-amber-500/60" aria-hidden />
                  Lega Energy
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  1990&apos;lardan Beri Türk Üretici
                </h2>
                <p className="mt-4 text-sm md:text-base text-slate-700 leading-relaxed">
                  {brand.aboutBrand}
                </p>
                <BrandAboutToggle longText={brand.aboutBrandLong} />
              </div>

              <div className="relative">
                <div className="aspect-[4/3] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 rounded-2xl overflow-hidden p-8 md:p-10 text-white relative">
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 20% 50%, #fbbf24 1px, transparent 1px), radial-gradient(circle at 60% 30%, #fbbf24 1px, transparent 1px), radial-gradient(circle at 80% 70%, #fbbf24 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }}
                    aria-hidden
                  />
                  <div className="relative">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 mb-2">
                      İhracat Ağı
                    </div>
                    <div className="text-5xl md:text-6xl font-bold tabular-nums leading-none">
                      22
                    </div>
                    <div className="mt-2 text-sm md:text-base text-slate-300">
                      ülkeye ihracat
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs md:text-sm text-slate-300">
                      {[
                        'Tunus',
                        'Libya',
                        'Katar',
                        'Kenya',
                        'Kazakistan',
                        've 17 ülke daha',
                      ].map((c) => (
                        <div key={c} className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-amber-400" aria-hidden />
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== DEALERSHIP CERTIFICATE ===== */}
        <DealershipCertificate brand={brand.slug} />

        {/* ===== ABOUT COMPANY ===== */}
        <section className="bg-slate-50 border-y border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 text-center">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-3">
              <span className="w-6 h-px bg-slate-300" aria-hidden />
              32 Yıl Sektör Tecrübesi
              <span className="w-6 h-px bg-slate-300" aria-hidden />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Mekanik Parça Deposu Hakkında
            </h2>
            <div className="mt-5 space-y-4 text-sm md:text-base text-slate-700 leading-relaxed">
              <p>
                <strong>İKİ M İKLİMLENDİRME SİSTEMLERİ TİCARET LTD. ŞTİ.</strong> çatısı
                altında faaliyet gösteren Mekanik Parça Deposu, mekanik tesisat, HVAC,
                ısıtma-soğutma sistemleri ve teknik servis ekipmanları alanında
                Türkiye&apos;nin güvenilir tedarikçisidir.
              </p>
              <p>
                Lega, Fernox, REGEN, MRU gibi öncü markaların yetkili satıcısı olarak,
                profesyonel ve son kullanıcılara orijinal ürünleri en uygun fiyatlarla
                sunmaktayız.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {brand.trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-full"
                >
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        {brand.faq.length > 0 && (
          <section className="bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">
                  <span className="w-6 h-px bg-slate-300" aria-hidden />
                  Sıkça Sorulan Sorular
                  <span className="w-6 h-px bg-slate-300" aria-hidden />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  Aklınızdaki Soruları Yanıtlıyoruz
                </h2>
                <p className="mt-2 text-sm md:text-base text-slate-600">
                  {brand.name} ürünleri ve siparişiniz hakkında bilmeniz gerekenler
                </p>
              </div>
              <BrandFaqAccordion faq={brand.faq} />
            </div>
          </section>
        )}

        {/* ===== FINAL CTA ===== */}
        <BrandFinalCta
          title={brand.finalCta.title}
          subtitle={brand.finalCta.subtitle}
          primaryLabel={brand.finalCta.primaryLabel}
          secondaryLabel={brand.finalCta.secondaryLabel}
          waLink={waLink}
          brandSlug={brand.slug}
        />
      </div>

      <BrandStickyCta brandSlug={brand.slug} brandName={brand.name} />
    </>
  )
}
