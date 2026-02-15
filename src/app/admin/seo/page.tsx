'use client'

import { FiSearch, FiPackage, FiFolder, FiFileText } from 'react-icons/fi'
import Link from 'next/link'

export default function AdminSEOPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">SEO Yönetimi</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800">
          Her ürün, kategori ve blog yazısı için meta başlık, meta açıklama ve SEO-uyumlu slug tanımlayabilirsiniz.
          İlgili sayfaların düzenleme ekranlarından SEO alanlarını doldurun.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/urunler" className="card p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <FiPackage className="w-6 h-6 text-primary-500" />
            <h2 className="font-semibold">Ürün SEO</h2>
          </div>
          <p className="text-sm text-gray-500">Ürünlerin meta başlık, açıklama ve slug bilgilerini düzenleyin.</p>
        </Link>

        <Link href="/admin/kategoriler" className="card p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <FiFolder className="w-6 h-6 text-primary-500" />
            <h2 className="font-semibold">Kategori SEO</h2>
          </div>
          <p className="text-sm text-gray-500">Kategorilerin meta başlık ve açıklama bilgilerini düzenleyin.</p>
        </Link>

        <Link href="/admin/blog" className="card p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <FiFileText className="w-6 h-6 text-primary-500" />
            <h2 className="font-semibold">Blog SEO</h2>
          </div>
          <p className="text-sm text-gray-500">Blog yazılarının meta başlık ve açıklama bilgilerini düzenleyin.</p>
        </Link>
      </div>
    </div>
  )
}
