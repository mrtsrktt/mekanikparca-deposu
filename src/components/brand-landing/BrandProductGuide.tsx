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
    <section className="bg-gradient-to-br from-primary-50 via-white to-blue-50 rounded-3xl border border-primary-100/60 p-6 md:p-10 shadow-sm">
      <div className="text-center mb-6 md:mb-8">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary-600 bg-white border border-primary-200 px-3 py-1 rounded-full mb-3">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Ürün Seçim Rehberi
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm md:text-base text-gray-600 max-w-xl mx-auto">{description}</p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-8" aria-hidden>
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep >= n
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-400'
              }`}
            >
              {n}
            </div>
            {n < 3 && (
              <div
                className={`w-8 md:w-12 h-0.5 ${currentStep > n ? 'bg-primary-500' : 'bg-gray-200'}`}
              />
            )}
          </div>
        ))}
      </div>

      {!stageId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stages.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStageId(s.id)}
              className="group relative bg-white rounded-2xl border-2 border-gray-100 p-6 text-left hover:border-primary-400 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="text-4xl mb-3">{s.icon}</div>
              <div className="text-lg font-bold text-gray-900">{s.label}</div>
              {s.description && (
                <div className="mt-1 text-sm text-gray-500">{s.description}</div>
              )}
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 group-hover:gap-2 transition-all">
                Seç
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {stage && !optionId && (
        <div>
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Geri
          </button>
          <div className="text-sm text-gray-500 mb-3">
            {stage.icon} <span className="font-semibold text-gray-700">{stage.label}</span> — Kullanım türü
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {stage.options?.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setOptionId(o.id)}
                className="group bg-white rounded-2xl border-2 border-gray-100 p-5 text-left hover:border-primary-400 hover:shadow-md transition-all"
              >
                <div className="text-base font-semibold text-gray-900 leading-snug">
                  {o.label}
                </div>
                {o.recommendedKva && (
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                    Önerilen: {o.recommendedKva} KVA
                  </div>
                )}
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 group-hover:gap-2 transition-all">
                  Sonucu Gör
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={back}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Geri
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Baştan Başla
            </button>
          </div>

          {recommendedProduct ? (
            <div className="bg-white rounded-2xl border-2 border-primary-200 overflow-hidden shadow-md">
              <div className="bg-primary-50 px-5 py-3 border-b border-primary-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <div className="text-sm font-semibold text-primary-900">
                  Sizin için önerimiz: <span className="font-bold">{option.recommendedKva} KVA</span>
                </div>
              </div>
              <div className="p-5 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                <Link
                  href={`/urun/${recommendedProduct.slug}`}
                  className="flex-shrink-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-b from-gray-50 to-white rounded-xl overflow-hidden border border-gray-100"
                >
                  <img
                    src={recommendedProduct.imageUrl}
                    alt={recommendedProduct.name}
                    className="w-full h-full object-contain p-3"
                  />
                </Link>
                <div className="flex-1 text-center sm:text-left">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    {brandName}
                  </div>
                  <Link
                    href={`/urun/${recommendedProduct.slug}`}
                    className="block mt-1 text-base md:text-lg font-semibold text-gray-900 hover:text-primary-500"
                  >
                    {recommendedProduct.name}
                  </Link>
                  <div className="mt-2 text-2xl font-bold text-primary-600">
                    {formatPrice(recommendedProduct.priceTRY)}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    5.000 TL ve Üzeri Kargo Bedava
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <BrandAddToCartButton
                      productId={recommendedProduct.id}
                      productName={recommendedProduct.name}
                      priceTRY={recommendedProduct.priceTRY}
                      outOfStock={recommendedProduct.outOfStock}
                      fullWidth
                    />
                    <Link
                      href={`/urun/${recommendedProduct.slug}`}
                      className="inline-flex items-center justify-center gap-1 text-sm font-medium py-2.5 px-4 rounded-lg border border-gray-200 text-gray-600 hover:border-primary-500 hover:text-primary-500"
                    >
                      Detayları Gör
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/40 p-6 text-center">
              <div className="text-base font-semibold text-amber-900">
                Bu ihtiyaç için özel teklif sunuyoruz
              </div>
              <p className="mt-1 text-sm text-amber-800">
                {option.recommendedKva ? `${option.recommendedKva} KVA ` : ''}modeli için stok ve fiyat bilgisi almak üzere bize ulaşın.
              </p>
              <a
                href="https://wa.me/905326404086?text=Merhaba%2C+Lega+regul%C3%A2t%C3%B6rler+i%C3%A7in+teklif+almak+istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 px-5 rounded-lg"
              >
                WhatsApp&apos;tan Teklif Al
              </a>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
