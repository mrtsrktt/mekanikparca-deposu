'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FiCheckCircle } from 'react-icons/fi'
import { trackPurchase } from '@/lib/gtm'

function BasariliContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    localStorage.removeItem('cart')
    window.dispatchEvent(new Event('cartUpdated'))

    const sendPurchaseEvent = async () => {
      if (!orderId) {
        trackPurchase(1500)
        return
      }
      try {
        const res = await fetch(`/api/account/orders/${orderId}`)
        if (!res.ok) {
          trackPurchase(1500)
          return
        }
        const data = await res.json()
        const amount = data.totalAmount || 1500
        const orderNumber = data.orderNumber || orderId
        trackPurchase(amount, orderNumber)
      } catch (err) {
        console.error('Purchase tracking failed:', err)
        trackPurchase(1500)
      }
    }

    sendPurchaseEvent()
  }, [orderId])

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <FiCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
      <h1 className="text-2xl font-bold mb-3">Odemeniz Alindi</h1>
      <p className="text-gray-500 mb-8">Siparisıniz basariyla olusturuldu.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/hesabim" className="btn-primary">Siparislerimi Gor</Link>
        <Link href="/urunler" className="btn-secondary">Alisverise Devam Et</Link>
      </div>
    </div>
  )
}

export default function BasariliPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto px-4 py-20 text-center">Yükleniyor...</div>}>
      <BasariliContent />
    </Suspense>
  )
}
