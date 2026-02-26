'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { FiCheckCircle } from 'react-icons/fi'

export default function BasariliPage() {
  useEffect(() => {
    localStorage.removeItem('cart')
    window.dispatchEvent(new Event('cartUpdated'))
  }, [])

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
