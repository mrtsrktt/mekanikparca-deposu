'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FiTrash2, FiFileText, FiPlus, FiMinus, FiSend } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/pricing'

interface QuoteCartItem {
  productId: string
  quantity: number
  product?: any
}

export default function QuotePage() {
  const { data: session, status: authStatus } = useSession()
  const [items, setItems] = useState<QuoteCartItem[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<any>(null)

  const loadQuoteCart = useCallback(async () => {
    const cart = JSON.parse(localStorage.getItem('quoteCart') || '[]')
    if (cart.length === 0) { setItems([]); setLoading(false); return }

    const enriched = await Promise.all(
      cart.map(async (item: QuoteCartItem) => {
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
    setItems(enriched.filter(i => i.product))
    setLoading(false)
  }, [])

  useEffect(() => { loadQuoteCart() }, [loadQuoteCart])

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return removeItem(productId)
    const updated = items.map(i => i.productId === productId ? { ...i, quantity } : i)
    setItems(updated)
    localStorage.setItem('quoteCart', JSON.stringify(updated.map(({ productId, quantity }) => ({ productId, quantity }))))
    window.dispatchEvent(new Event('quote-cart-updated'))
  }

  const removeItem = (productId: string) => {
    const updated = items.filter(i => i.productId !== productId)
    setItems(updated)
    localStorage.setItem('quoteCart', JSON.stringify(updated.map(({ productId, quantity }) => ({ productId, quantity }))))
    window.dispatchEvent(new Event('quote-cart-updated'))
  }

  const handleSubmit = async () => {
    if (!session) {
      toast.error('Teklif isteyebilmek için giriş yapmalısınız.')
      return
    }
    if (items.length === 0) {
      toast.error('Teklif listeniz boş.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          message,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setSubmitted(data)
        localStorage.removeItem('quoteCart')
        window.dispatchEvent(new Event('quote-cart-updated'))
        toast.success('Teklif talebiniz başarıyla gönderildi!')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Bir hata oluştu.')
      }
    } catch {
      toast.error('Bir hata oluştu.')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16 text-center">Yükleniyor...</div>

  // Başarılı gönderim
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="card p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiSend className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Teklif Talebiniz Alındı</h1>
          <p className="text-gray-500 mb-4">
            Teklif numaranız: <span className="font-semibold text-primary-500">{submitted.quoteNumber}</span>
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Talebiniz en kısa sürede incelenecek ve size teklif iletilecektir.
            Tekliflerinizi hesabınızdan takip edebilirsiniz.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/hesabim/teklifler" className="btn-primary">Tekliflerimi Gör</Link>
            <Link href="/urunler" className="btn-secondary">Alışverişe Devam</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Teklif Listem</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">Teklif listeniz boş.</p>
          <p className="text-sm text-gray-400 mb-6">Ürün sayfalarından &ldquo;Teklif Listesine Ekle&rdquo; butonuyla ürün ekleyebilirsiniz.</p>
          <Link href="/urunler" className="btn-primary">Ürünlere Git</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ürün Listesi */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
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
                  <p className="text-sm text-primary-500 font-semibold mt-1">
                    {formatPrice(item.product?.priceTRY || 0)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-50">
                      <FiMinus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border-x py-1 text-sm"
                      min="1"
                    />
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-50">
                      <FiPlus className="w-3 h-3" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="p-2 text-red-500 hover:bg-red-50 rounded" aria-label="Sil">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Teklif Gönderim Paneli */}
          <div className="card p-6 h-fit sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Teklif Talebi</h2>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Ürün Sayısı</span>
                <span className="font-medium">{items.length} ürün</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Toplam Adet</span>
                <span className="font-medium">{items.reduce((s, i) => s + i.quantity, 0)} adet</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Not (opsiyonel)</label>
              <textarea
                rows={3}
                placeholder="Teklif ile ilgili notunuz..."
                className="input-field text-sm"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {!session ? (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Teklif isteyebilmek için giriş yapmalısınız.</p>
                <Link href="/giris" className="btn-primary w-full block text-center">Giriş Yap</Link>
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || items.length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <FiSend className="w-4 h-4" />
                    Teklif İste
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
