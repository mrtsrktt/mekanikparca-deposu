'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiShoppingCart, FiCheck } from 'react-icons/fi'
import { getStorageArray } from '@/lib/safeStorage'
import { trackAddToCart } from '@/lib/gtm'
import toast from 'react-hot-toast'

type Props = {
  productId: string
  productName: string
  priceTRY: number
  outOfStock?: boolean
  className?: string
  size?: 'sm' | 'md'
  fullWidth?: boolean
}

export default function BrandAddToCartButton({
  productId,
  productName,
  priceTRY,
  outOfStock,
  className = '',
  size = 'md',
  fullWidth,
}: Props) {
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isAdding || added || outOfStock) return
    setIsAdding(true)

    const cart = getStorageArray('cart')
    const existing = cart.find((item: any) => item.productId === productId)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({ productId, quantity: 1 })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    trackAddToCart(productName, productId, priceTRY)

    toast.custom(
      (t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FiCheck className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Ürün sepete eklendi!</p>
                <p className="mt-1 text-sm text-gray-500">{productName}</p>
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
      ),
      { duration: 3000, position: 'top-right' }
    )

    setTimeout(() => {
      setIsAdding(false)
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    }, 300)
  }

  const sizeCls =
    size === 'sm'
      ? 'text-xs py-2 px-3'
      : 'text-sm py-2.5 px-4'

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!!outOfStock || isAdding || added}
      className={`${fullWidth ? 'w-full' : ''} inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${sizeCls} ${
        added
          ? 'bg-green-500 text-white'
          : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-md hover:shadow-primary-500/20'
      } ${className}`}
    >
      {isAdding ? (
        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : added ? (
        <>
          <FiCheck className="w-4 h-4" />
          Eklendi
        </>
      ) : outOfStock ? (
        'Stokta Yok'
      ) : (
        <>
          <FiShoppingCart className="w-4 h-4" />
          Sepete Ekle
        </>
      )}
    </button>
  )
}
