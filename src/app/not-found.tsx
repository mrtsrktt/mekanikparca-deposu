import Link from 'next/link'
import { FiHome, FiSearch, FiPhone } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-8xl font-extrabold text-primary-500/20 mb-2">404</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Sayfa Bulunamadı</h1>
        <p className="text-gray-500 mb-8">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary gap-2">
            <FiHome className="w-4 h-4" /> Ana Sayfa
          </Link>
          <Link href="/urunler" className="btn-secondary gap-2">
            <FiSearch className="w-4 h-4" /> Ürünleri İncele
          </Link>
          <Link href="/iletisim" className="btn-secondary gap-2">
            <FiPhone className="w-4 h-4" /> İletişim
          </Link>
        </div>
      </div>
    </div>
  )
}
