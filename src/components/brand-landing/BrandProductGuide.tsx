'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/pricing'
import type { ProductGuideStage } from '@/lib/brand-content'
import BrandAddToCartButton from './BrandAddToCartButton'

export type GuideProduct = {
  id: string
  name: string
  slug: string
  priceTRY: number
  imageUrl: string
  outOfStock: boolean
}

type Props = {
  title: string
  description: string
  stages: ProductGuideStage[]
  productsByKva: Record<string, GuideProduct>
  brandName: string
}

export default function BrandProductGuide({
  title,
  description,
  stages,
  productsByKva,
  brandName,
}: Props) {
  const [stageId, setStageId] = useState<string | null>(null)
  const [optionId, setOptionId] = useState<string | null>(null)

  const stage = stages.find((s) => s.id === stageId) || null
  const option = stage?.options?.find((o) => o.id === optionId) || null
  const recommendedProduct = option?.recommendedKva
    ? productsByKva[option.recommendedKva]
    : null

  const reset = () => {
    setStageId(null)
    setOptionId(null)
  }

  const back = () => {
    if (optionId) setOptionId(null)
    else setStageId(null)
  }

  const currentStep = optionId ? 3 : stageId ? 2 : 1

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/5 p-6 md:p-10 lg:p-14">
      <div className="text-center mb-8 md:mb-10">
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full mb-4">
          <svg className="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 1.5l1.7 5.3h5.6l-4.5 3.3 1.7 5.3-4.5-3.3-4.5 3.3 1.7-5.3-4.5-3.3h5.6L10 1.5z" />
          </svg>
          Ürün Seçim Rehberi
        </div>
        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
          {title}
        </h2>
        <p className="mt-3 text-sm md:text-base text-slate-600 max-w-xl mx-auto">{description}</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8 md:mb-10" aria-hidden>
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep >= n
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border-2 border-slate-200 text-slate-400'
              }`}
            >
              {n}
            </div>
            {n < 3 && (
              <div
                className={`w-10 md:w-16 h-0.5 transition-colors ${
                  currentStep > n ? 'bg-slate-900' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {!stageId && (
        <div>
          <div className="text-xs uppercase tracking-wider font-bold text-slate-400 text-center mb-4">
            Adım 1 — Kullanım alanınız nedir?
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stages.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStageId(s.id)}
                className="group relative bg-white rounded-2xl border-2 border-slate-200 p-7 text-center hover:border-amber-500 hover:bg-amber-50/40 hover:shadow-xl hover:-translate-y-1 transition-all focus:outline-none focus:ring-4 focus:ring-amber-500/20"
              >
                <div className="text-5xl mb-4">{s.icon}</div>
                <div className="text-lg md:text-xl font-bold text-slate-900">{s.label}</div>
                {s.description && (
                  <div className="mt-1.5 text-xs md:text-sm text-slate-500">{s.description}</div>
                )}
                <div className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-slate-700 group-hover:text-amber-700 group-hover:gap-2 transition-all">
                  Seç
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {stage && !optionId && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={back}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Geri
            </button>
            <div className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Adım 2 — Detay
            </div>
          </div>
          <div className="text-sm text-slate-600 mb-5 text-center">
            <span className="text-2xl mr-1">{stage.icon}</span>
            <span className="font-bold text-slate-900">{stage.label}</span> · ihtiyacınızı
            seçin
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {stage.options?.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setOptionId(o.id)}
                className="group bg-white rounded-2xl border-2 border-slate-200 p-5 md:p-6 text-left hover:border-amber-500 hover:bg-amber-50/40 hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-amber-500/20"
              >
                <div className="text-base md:text-lg font-bold text-slate-900 leading-snug">
                  {o.label}
                </div>
                {o.description && (
                  <div className="mt-1 text-xs md:text-sm text-slate-500">{o.description}</div>
                )}
                {o.recommendedKva && (
                  <div className="mt-3 inline-flex items-baseline gap-1 bg-slate-900 text-white px-2.5 py-1 rounded-md">
                    <span className="text-xs font-semibold opacity-70">→</span>
                    <span className="text-sm font-bold tabular-nums">{o.recommendedKva}</span>
                    <span className="text-[10px] font-semibold tracking-wider opacity-80">KVA</span>
                  </div>
                )}
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-slate-700 group-hover:text-amber-700 group-hover:gap-2 transition-all">
                  Sonucu Gör
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {option && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={back}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Geri
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-xs font-medium text-slate-400 hover:text-slate-700 underline-offset-2 hover:underline"
            >
              Yeniden başla
            </button>
          </div>

          {recommendedProduct ? (
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border-2 border-slate-900 overflow-hidden shadow-xl">
              <div className="bg-slate-900 px-5 md:px-7 py-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-sm font-bold text-white">
                  Size en uygun model:{' '}
                  <span className="text-amber-400 tabular-nums">{option.recommendedKva} KVA</span>
                </div>
              </div>
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                <Link
                  href={`/urun/${recommendedProduct.slug}`}
                  className="flex-shrink-0 w-44 h-44 md:w-52 md:h-52 bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-slate-200 group"
                >
                  <img
                    src={recommendedProduct.imageUrl}
                    alt={recommendedProduct.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
                  />
                </Link>
                <div className="flex-1 text-center md:text-left">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
                    {brandName}
                  </div>
                  <Link
                    href={`/urun/${recommendedProduct.slug}`}
                    className="block mt-1 text-lg md:text-xl font-bold text-slate-900 hover:text-amber-700 leading-snug transition-colors"
                  >
                    {recommendedProduct.name}
                  </Link>
                  <ul className="mt-3 space-y-1.5">
                    {[
                      `${option.description || option.label} için ideal`,
                      '±%2 hassasiyetli regülasyon',
                      'TSE belgeli, 2 yıl garantili',
                    ].map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2 text-xs md:text-sm text-slate-600 justify-center md:justify-start"
                      >
                        <svg
                          className="flex-shrink-0 w-3.5 h-3.5 mt-0.5 text-emerald-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex items-baseline gap-3 justify-center md:justify-start">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        Fiyat
                      </div>
                      <div className="text-3xl md:text-4xl font-bold text-slate-900 tabular-nums leading-tight">
                        {formatPrice(recommendedProduct.priceTRY)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
                    <BrandAddToCartButton
                      productId={recommendedProduct.id}
                      productName={recommendedProduct.name}
                      priceTRY={recommendedProduct.priceTRY}
                      outOfStock={recommendedProduct.outOfStock}
                      fullWidth
                    />
                    <Link
                      href={`/urun/${recommendedProduct.slug}`}
                      className="inline-flex items-center justify-center gap-1 text-sm font-bold py-2.5 px-5 rounded-lg border-2 border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900 transition-colors"
                    >
                      Detayları Gör
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 p-8 text-center">
              <div className="text-base md:text-lg font-bold text-amber-900">
                Bu ihtiyaç için özel teklif sunuyoruz
              </div>
              <p className="mt-2 text-sm text-amber-800">
                {option.recommendedKva ? `${option.recommendedKva} KVA ` : ''}modeli için
                stok ve fiyat bilgisi almak üzere bize ulaşın.
              </p>
              <a
                href={`https://wa.me/905326404086?text=${encodeURIComponent(`Merhaba, ${brandName} ${option.recommendedKva || ''} KVA için teklif almak istiyorum.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-3 px-6 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                WhatsApp&apos;tan Teklif Al
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
