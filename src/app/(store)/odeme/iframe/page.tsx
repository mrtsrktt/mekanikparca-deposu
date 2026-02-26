'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function IframeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  if (!token) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500">Gecersiz odeme oturumu.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6 text-center">Guvenli Odeme</h1>
      <iframe
        src={`https://www.paytr.com/odeme/guvenli/${token}`}
        id="paytriframe"
        frameBorder="0"
        scrolling="no"
        style={{ width: '100%', height: '600px' }}
        title="PayTR Odeme"
      />
    </div>
  )
}

export default function IframePage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-16 text-center">Yukleniyor...</div>}>
      <IframeContent />
    </Suspense>
  )
}
