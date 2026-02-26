'use client'

import Link from 'next/link'
import { FiXCircle } from 'react-icons/fi'

export default function BasarisizPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <FiXCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
      <h1 className="text-2xl font-bold mb-3">Ödeme Başarısız</h1>
      <p className="text-gray-500 mb-8">Ödeme işlemi tamamlanamadı. Sepetinizdeki ürünler korunmaktadır, tekrar deneyebilirsiniz.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/sepet" className="btn-primary">Sepete Dön</Link>
        <Link href="/iletisim" className="btn-secondary">Bize Ulaşın</Link>
      </div>
    </div>
  )
}
