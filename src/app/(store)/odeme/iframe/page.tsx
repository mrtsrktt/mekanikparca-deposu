'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function IframeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  if (!token) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center min-h-[calc(100vh-200px)]">
        <p className="text-red-500 mb-4">Geçersiz ödeme oturumu.</p>
        <a href="/sepet" className="btn-primary">Sepete Dön</a>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      <h1 className="text-xl font-bold mb-6 text-center">Güvenli Ödeme</h1>
      <div className="card p-0 overflow-hidden">
        <iframe
          src={`https://www.paytr.com/odeme/guvenli/${token}`}
          id="paytriframe"
          frameBorder="0"
          scrolling="no"
          style={{ width: '100%', minHeight: '700px', border: 'none' }}
          title="PayTR Ödeme"
        />
      </div>
      <p className="text-sm text-gray-500 text-center mt-4">
        Ödeme işleminiz 256-bit SSL ile güvenli şekilde gerçekleştirilmektedir.
      </p>
    </div>
  )
}

export default function IframePage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-16 text-center min-h-[calc(100vh-200px)]">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-6"></div>
          <div className="h-[700px] bg-gray-100 rounded w-full"></div>
        </div>
      </div>
    }>
      <IframeContent />
    </Suspense>
  )
}
