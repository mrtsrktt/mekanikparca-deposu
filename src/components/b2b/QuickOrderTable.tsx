'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FiSearch,
  FiPlus,
  FiMinus,
  FiShoppingCart,
  FiPackage,
  FiAlertCircle,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/pricing'
import { getTaxExcludedPrice } from '@/lib/b2bPricing'
import { validateAndAdjustQuantity } from '@/lib/orderQuantityValidation'
import { getStorageArray } from '@/lib/safeStorage'

type QuickOrderProduct = {
  id: string
  name: string
  sku: string | null
  slug: string
  priceTRY: number
  stock: number
  minOrder?: number | null
  boxQuantity?: number | null
  brand: { name: string } | null
  images: { url: string }[]
}

type CartItem = { productId: string; quantity: number }

export default function QuickOrderTable() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<QuickOrderProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const handle = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const res = await fetch(
          `/api/b2b/quick-order/search?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        )
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setError('Bu sayfaya eriÅŸim yetkiniz yok.')
          } else if (res.status === 404) {
            setError('HÄ±zlÄ± sipariÅŸ Ã¶zelliÄŸi ÅŸu anda kullanÄ±lamÄ±yor.')
          } else {
            setError('Arama sÄ±rasÄ±nda bir hata oluÅŸtu.')
          }
          setResults([])
          return
        }
        const data = (await res.json()) as { products?: QuickOrderProduct[] }
        setResults(Array.isArray(data.products) ? data.products : [])
        setError(null)
      } catch (e) {
        if ((e as { name?: string })?.name === 'AbortError') return
        setError('Arama sÄ±rasÄ±nda bir hata oluÅŸtu.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(handle)
  }, [query])

  const setQty = useCallback(
    (
      id: string,
      value: number,
      max: number,
      minOrder?: number | null,
      boxQuantity?: number | null
    ) => {
      const adjusted = validateAndAdjustQuantity(value, minOrder ?? 1, boxQuantity)
      const clamped = Math.min(adjusted.validQuantity, Math.max(1, max))
      setQuantities((prev) => ({ ...prev, [id]: clamped }))
    },
    []
  )

  const addToCart = useCallback(
    (product: QuickOrderProduct) => {
      const maxStock = Math.max(1, product.stock)
      // Minimum siparis adedi ve koli kati kurallarini sepete eklemeden once uygula.
      const adjusted = validateAndAdjustQuantity(
        quantities[product.id] ?? 1,
        product.minOrder ?? 1,
        product.boxQuantity
      )
      const qty = Math.min(adjusted.validQuantity, maxStock)
      if (adjusted.wasAdjusted) {
        setQuantities((prev) => ({ ...prev, [product.id]: qty }))
      }

      const cart = getStorageArray('cart') as CartItem[]
      const existing = cart.find((item) => item?.productId === product.id)
      if (existing) {
        existing.quantity = (existing.quantity || 0) + qty
      } else {
        cart.push({ productId: product.id, quantity: qty })
      }
      localStorage.setItem('cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cart-updated'))

      toast.success(`${qty} adet "${product.name}" sepete eklendi`)
    },
    [quantities]
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SKU veya Ã¼rÃ¼n adÄ± ile arayÄ±n (en az 2 karakter)..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            AranÄ±yor...
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <FiAlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {query.trim().length >= 2 && !loading && !error && results.length === 0 && (
        <div className="text-center py-10 text-gray-500 text-sm">
          <FiPackage className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          SonuÃ§ bulunamadÄ±.
        </div>
      )}

      {results.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">SKU</th>
                <th className="px-3 py-2 text-left font-semibold">ÃœrÃ¼n</th>
                <th className="px-3 py-2 text-left font-semibold">Marka</th>
                <th className="px-3 py-2 text-right font-semibold">Depo StoÄŸu</th>
                <th className="px-3 py-2 text-right font-semibold">Birim Fiyat</th>
                <th className="px-3 py-2 text-center font-semibold">Adet</th>
                <th className="px-3 py-2 text-right font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((p) => {
                const maxStock = Math.max(1, p.stock)
                const qty = Math.max(1, Math.min(quantities[p.id] ?? 1, maxStock))
                const minOrder = p.minOrder ?? 1
                const boxQty = p.boxQuantity
                const outOfStock = p.stock <= 0
                const taxBreakdown = getTaxExcludedPrice(p.priceTRY)
                return (
                  <tr key={p.id} className="hover:bg-gray-50/70">
                    <td className="px-3 py-2 font-mono text-xs text-gray-700 whitespace-nowrap">
                      {p.sku || '-'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={p.images?.[0]?.url || '/placeholder.jpg'}
                          alt={p.name}
                          className="w-9 h-9 object-contain bg-gray-50 rounded border border-gray-100"
                        />
                        <span className="font-medium text-gray-800 line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                      {p.brand?.name || '-'}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <span className={outOfStock ? 'text-red-500 font-medium' : 'text-gray-700'}>
                        {p.stock} adet
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <div className="font-semibold text-primary-600">
                        {formatPrice(taxBreakdown.taxExcludedPrice)}{" "}
                        <span className="text-[10px] text-gray-500 font-normal">+ KDV</span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        KDV Dahil: {formatPrice(p.priceTRY)}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setQty(p.id, qty - 1, maxStock, minOrder, boxQty)}
                          disabled={outOfStock || qty <= 1}
                          className="p-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Azalt"
                        >
                          <FiMinus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={maxStock}
                          value={qty}
                          disabled={outOfStock}
                          onChange={(e) => setQty(p.id, parseInt(e.target.value, 10), maxStock, minOrder, boxQty)}
                          className="w-14 text-center border border-gray-200 rounded py-1 text-sm disabled:bg-gray-50"
                        />
                        <button
                          type="button"
                          onClick={() => setQty(p.id, qty + 1, maxStock, minOrder, boxQty)}
                          disabled={outOfStock || qty >= maxStock}
                          className="p-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="ArttÄ±r"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => addToCart(p)}
                        disabled={outOfStock}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <FiShoppingCart className="w-3.5 h-3.5" />
                        Sepete Ekle
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}