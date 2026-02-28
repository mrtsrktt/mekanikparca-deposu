'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/pricing'
import { FiShoppingCart, FiEye, FiCheck } from 'react-icons/fi'
import CampaignBadge from './CampaignBadge'
import toast from 'react-hot-toast'

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
    freeShipping?: boolean
  }
  b2bUserPrice?: number | null
  showB2B?: boolean
  hasCampaign?: boolean
  campaignLowestPrice?: number | null
}

export default function ProductCard({ product, b2bUserPrice, showB2B, hasCampaign, campaignLowestPrice }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)
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
          <div className="mt-1">
            {(product as any).freeShipping ? (
              <span className="text-[10px] font-semibold text-green-600">🚚 Ücretsiz Kargo</span>
            ) : (
              <span className="text-[10px] text-gray-400">Kargo: Alıcı Öder</span>
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
                if (isAdding || added) return
                
                setIsAdding(true)
                
                // Sepete ekle
                const cart = JSON.parse(localStorage.getItem('cart') || '[]')
                const existing = cart.find((item: any) => item.productId === product.id)
                if (existing) { 
                  existing.quantity += 1 
                } else { 
                  cart.push({ productId: product.id, quantity: 1 }) 
                }
                localStorage.setItem('cart', JSON.stringify(cart))
                window.dispatchEvent(new Event('cart-updated'))
                
                // Toast bildirimi göster
                toast.custom((t) => (
                  <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                    <div className="flex-1 w-0 p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <FiCheck className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">Ürün sepete eklendi!</p>
                          <p className="mt-1 text-sm text-gray-500">{product.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex border-l border-gray-200">
                      <Link
                        href="/sepet"
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none"
                      >
                        Sepete Git
                      </Link>
                    </div>
                  </div>
                ), {
                  duration: 3000,
                  position: 'top-right',
                })
                
                // Buton durumunu güncelle
                setTimeout(() => {
                  setIsAdding(false)
                  setAdded(true)
                  setTimeout(() => {
                    setAdded(false)
                  }, 1500)
                }, 300)
              }}
              disabled={product.trackStock !== false && product.stock === 0 || isAdding || added}
              className={`flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 px-2 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none ${
                added 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-md hover:shadow-primary-500/20'
              }`}
            >
              {isAdding ? (
                <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : added ? (
                <>
                  <FiCheck className="w-3.5 h-3.5" />
                  Eklendi
                </>
              ) : (
                <>
                  <FiShoppingCart className="w-3.5 h-3.5" />
                  Sepete Ekle
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
