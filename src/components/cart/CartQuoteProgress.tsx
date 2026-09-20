'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { FiCheck, FiFileText, FiLoader } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/pricing'

type QuoteItem = { productId: string; quantity: number }

interface CartQuoteProgressProps {
  subtotal: number
  items: QuoteItem[]
}

// Ozel proje teklifi isteyebilmek icin gereken minimum sepet tutari (TL).
const QUOTE_THRESHOLD = 100_000

export default function CartQuoteProgress({ subtotal, items }: CartQuoteProgressProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sepet bossa bileseni gosterme.
  if (items.length === 0) return null

  const isEligible = subtotal >= QUOTE_THRESHOLD
  const remaining = Math.max(QUOTE_THRESHOLD - subtotal, 0)
  const percent = Math.min(Math.round((subtotal / QUOTE_THRESHOLD) * 100), 100)

  const handleRequestQuote = async () => {
    if (isSubmitting) return

    if (!session?.user) {
      router.push('/giris?redirect=/sepet')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          message: 'Sepetten proje teklifi talebi',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        toast.error(data?.error || 'Teklif talebi olusturulamadi.')
        return
      }

      toast.success('Teklif talebiniz alindi!')
      router.push('/hesabim/teklifler')
    } catch {
      toast.error('Teklif talebi sirasinda bir hata olustu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card p-5 mb-6 border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white">
      <div className="flex items-center gap-2 mb-3">
        <FiFileText className="w-5 h-5 text-blue-600" />
        <h2 className="font-semibold text-gray-800">Ozel Proje Teklifi</h2>
      </div>

      {isEligible ? (
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-emerald-700">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white">
            <FiCheck className="w-3.5 h-3.5" />
          </span>
          %100 tamamlandi - Teklif icin uygunsunuz!
        </div>
      ) : (
        <p className="text-sm text-gray-600 mb-3">
          Ozel proje teklifi isteyebilmek icin {' '}
          <strong className="text-blue-700">{formatPrice(remaining)}</strong> tutarinda urun daha
          eklemelisiniz!
        </p>
      )}

      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-gray-500">
        <span>%{percent}</span>
        <span>{formatPrice(QUOTE_THRESHOLD)} hedef</span>
      </div>

      {isEligible && (
        <button
          type="button"
          onClick={handleRequestQuote}
          disabled={isSubmitting}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Gonderiliyor...
            </>
          ) : (
            <>
              <FiFileText className="w-4 h-4" />
              Ozel Proje Teklifi Iste
            </>
          )}
        </button>
      )}
    </div>
  )
}
