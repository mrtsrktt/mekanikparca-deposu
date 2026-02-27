'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function PaymentIframe() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  if (!token) {
    return <div className="p-10 text-center text-red-500">Ödeme token bulunamadı.</div>
  }

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src={`https://www.paytr.com/odeme/guvenli/${token}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        frameBorder="0"
        scrolling="yes"
      />
    </div>
  )
}

export default function IframePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Yükleniyor...</div>}>
      <PaymentIframe />
    </Suspense>
  )
}
