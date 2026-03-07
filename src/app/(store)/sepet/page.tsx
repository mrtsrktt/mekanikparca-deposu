'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FiTrash2, FiShoppingBag } from 'react-icons/fi'
import { formatPrice } from '@/lib/pricing'

interface CartItem {
  productId: string
  quantity: number
  product?: any
  campaignPrice?: any
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadCart = useCallback(async () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    if (cart.length === 0) { setItems([]); setLoading(false); return }

    // Fetch product details
    const enriched = await Promise.all(
      cart.map(async (item: CartItem) => {
        try {
          const res = await fetch(`/api/products/${item.productId}`)
          if (res.ok) {
            const product = await res.json()
            return { ...item, product }
          }
        } catch {}
        return item
      })
    )
    const validItems = enriched.filter((i: CartItem) => i.product)

    // Fetch campaign prices
    if (validItems.length > 0) {
      try {
        const res = await fetch('/api/campaigns/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: validItems.map(i => ({ productId: i.productId, quantity: i.quantity }))
          }),
        })
        if (res.ok) {
          const prices = await res.json()
          for (const item of validItems) {
            const price = prices.find((p: any) => p.productId === item.productId)
            if (price) item.campaignPrice = price
          }
        }
      } catch {}
    }

    setItems(validItems)
    setLoading(false)
  }, [])

  useEffect(() => { loadCart() }, [loadCart])

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return removeItem(productId)
    const updated = items.map(i => i.productId === productId ? { ...i, quantity } : i)
    setItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated.map(({ productId, quantity }) => ({ productId, quantity }))))

    // Recalculate campaign prices
    try {
      const res = await fetch('/api/campaigns/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: updated.map(i => ({ productId: i.productId, quantity: i.quantity }))
        }),
      })
      if (res.ok) {
        const prices = await res.json()
        setItems(prev => prev.map(item => {
          const price = prices.find((p: any) => p.productId === item.productId)
          return price ? { ...item, campaignPrice: price } : item
        }))
      }
    } catch {}
  }

  const removeItem = (productId: string) => {
    const updated = items.filter(i => i.productId !== productId)
    setItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated.map(({ productId, quantity }) => ({ productId, quantity }))))
  }

  const getUnitPrice = (item: CartItem) => {
    if (item.campaignPrice?.discountedPrice && item.campaignPrice.discountedPrice < (item.product?.priceTRY || Infinity)) {
      return item.campaignPrice.discountedPrice
    }
    return item.product?.priceTRY || 0
  }

  const getDiscountLabel = (item: CartItem): { type: 'campaign' | 'tier' | null; label: string } => {
    if (!item.campaignPrice || item.campaignPrice.source === 'base') return { type: null, label: '' }

    if (item.campaignPrice.source === 'tier' && item.campaignPrice.appliedPriceTier) {
      return {
        type: 'tier',
        label: `📦 Toplu Alım (${item.campaignPrice.appliedPriceTier.minQuantity}+ adet)`,
      }
    }

    if (item.campaignPrice.source === 'campaign' && item.campaignPrice.appliedCampaign) {
      return {
        type: 'campaign',
        label: `🎁 ${item.campaignPrice.appliedCampaign.name}${item.campaignPrice.appliedTier ? ` (${item.campaignPrice.appliedTier.minQuantity}+ adet)` : ''}`,
      }
    }

    return { type: null, label: '' }
  }

  const subtotal = items.reduce((sum, item) => sum + getUnitPrice(item) * item.quantity, 0)
  const originalTotal = items.reduce((sum, item) => sum + (item.product?.priceTRY || 0) * item.quantity, 0)
  const totalDiscount = originalTotal - subtotal

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16 text-center">Yükleniyor...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sepetim</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">Sepetiniz boş.</p>
          <Link href="/urunler" className="btn-primary">Alışverişe Başla</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const unitPrice = getUnitPrice(item)
              const discount = getDiscountLabel(item)
              const hasDiscount = discount.type !== null
              return (
                <div key={item.productId} className="card p-4 flex gap-4">
                  <img
                    src={item.product?.images?.[0]?.url || '/placeholder.jpg'}
                    alt={item.product?.name}
                    className="w-20 h-20 object-contain bg-gray-50 rounded"
                  />
                  <div className="flex-1">
                    <Link href={`/urun/${item.product?.slug}`} className="font-medium hover:text-primary-500">
                      {item.product?.name}
                    </Link>
                    <p className="text-sm text-gray-500">{item.product?.brand?.name}</p>
                    <div className="mt-1">
                      {hasDiscount ? (
                        <div>
                          <span className="text-sm text-gray-400 line-through mr-2">
                            {formatPrice(item.product?.priceTRY || 0)}
                          </span>
                          <span className={`font-semibold ${discount.type === 'campaign' ? 'text-red-500' : discount.type === 'tier' ? 'text-blue-600' : 'text-primary-500'}`}>
                            {formatPrice(unitPrice)}
                          </span>
                          <p className={`text-xs mt-0.5 ${discount.type === 'campaign' ? 'text-red-500' : discount.type === 'tier' ? 'text-blue-600' : 'text-orange-500'}`}>
                            {discount.label}
                          </p>
                        </div>
                      ) : (
                        <span className="font-semibold text-primary-500">{formatPrice(unitPrice)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-2 py-1">-</button>
                      <span className="px-3 py-1 border-x">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-2 py-1">+</button>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="p-2 text-red-500 hover:bg-red-50 rounded" aria-label="Sil">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="card p-6 h-fit sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Sipariş Özeti</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Ara Toplam</span>
                <span>{formatPrice(originalTotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>İndirim</span>
                  <span>-{formatPrice(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Kargo</span>
                <span className="text-green-600">Ücretsiz</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Toplam</span>
                <span className="text-primary-500">{formatPrice(subtotal)}</span>
              </div>
            </div>
            <Link href="/odeme" className="btn-primary w-full mt-6 block text-center">Siparişi Tamamla</Link>
          </div>
        </div>
      )}
    </div>
  )
}
