'use client'

import Link from 'next/link'
import { formatPrice } from '@/lib/pricing'
import { FiShoppingCart, FiEye } from 'react-icons/fi'
import CampaignBadge from './CampaignBadge'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    priceTRY: number
    b2bPrice?: number | null
    images: { url: string; alt?: string | null }[]
    brand?: { name: string } | null
    category?: { name: string } | null
    stock: number
    trackStock?: boolean
  }
  b2bUserPrice?: number | null
  showB2B?: boolean
  hasCampaign?: boolean
  campaignLowestPrice?: number | null
}

export default function ProductCard({ product, b2bUserPrice, showB2B, hasCampaign, campaignLowestPrice }: ProductCardProps) {
  const imageUrl = product.images[0]?.url || '/placeholder.jpg'
  const hasB2BDiscount = showB2B && b2bUserPrice && b2bUserPrice < product.priceTRY
  const hasCampaignDiscount = hasCampaign && campaignLowestPrice && campaignLowestPrice < product.priceTRY

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover-lift">
      <Link href={`/urun/${product.slug}`}>
        <div className="relative aspect-square bg-gradient-to-b from-gray-50 to-white overflow-hidden">
          <img
            src={imageUrl}
            alt={product.images[0]?.alt || product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500 ease-out"
          />
          {product.trackStock !== false && product.stock === 0 && (
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-white font-semibold text-sm bg-black/40 px-4 py-1.5 rounded-full">Stokta Yok</span>
            </div>
          )}
          {hasCampaign && <CampaignBadge />}
          {hasB2BDiscount && (
            <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              Bayi Fiyat
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        {product.brand && (
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
            {product.brand.name}
          </span>
        )}
        <Link href={`/urun/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-800 mt-1 line-clamp-2 hover:text-primary-500 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3">
          <div>
            {hasCampaignDiscount ? (
              <>
                <span className="text-xs text-gray-400 line-through block">
                  {formatPrice(product.priceTRY)}
                </span>
                <span className="text-sm font-bold text-red-500">
                  {formatPrice(campaignLowestPrice)} <span className="text-[10px] font-normal text-red-400">&#39;den başlayan</span>
                </span>
              </>
            ) : hasB2BDiscount ? (
              <>
                <span className="text-xs text-gray-400 line-through block">
                  {formatPrice(product.priceTRY)}
                </span>
                <span className="text-lg font-bold text-primary-500">
                  {formatPrice(b2bUserPrice!)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary-500">
                {formatPrice(product.priceTRY)}
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <Link
              href={`/urun/${product.slug}`}
              className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-2 px-2 rounded-lg border border-gray-200 text-gray-500 hover:border-primary-500 hover:text-primary-500 hover:bg-primary-50/50 transition-all duration-200"
            >
              <FiEye className="w-3.5 h-3.5" />
              İncele
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault()
                const cart = JSON.parse(localStorage.getItem('cart') || '[]')
                const existing = cart.find((item: any) => item.productId === product.id)
                if (existing) { existing.quantity += 1 } else { cart.push({ productId: product.id, quantity: 1 }) }
                localStorage.setItem('cart', JSON.stringify(cart))
                window.dispatchEvent(new Event('cart-updated'))
              }}
              disabled={product.trackStock !== false && product.stock === 0}
              className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 px-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-md hover:shadow-primary-500/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <FiShoppingCart className="w-3.5 h-3.5" />
              Sepete Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
