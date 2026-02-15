'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FiUser, FiShoppingCart, FiMapPin, FiFileText } from 'react-icons/fi'

export default function AccountPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div className="max-w-7xl mx-auto px-4 py-16 text-center">Yükleniyor...</div>
  if (!session) redirect('/giris')

  const isB2B = session.user.role === 'B2B'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Hesabım</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <FiUser className="w-8 h-8 text-primary-500 mb-3" />
          <h2 className="font-semibold">Profil Bilgileri</h2>
          <p className="text-sm text-gray-500 mt-1">{session.user.name}</p>
          <p className="text-sm text-gray-500">{session.user.email}</p>
          {isB2B && <span className="badge badge-warning mt-2">Bayi</span>}
        </div>
        <div className="card p-6">
          <FiShoppingCart className="w-8 h-8 text-green-500 mb-3" />
          <h2 className="font-semibold">Siparişlerim</h2>
          <p className="text-sm text-gray-500 mt-1">Sipariş geçmişinizi görüntüleyin</p>
        </div>
        <div className="card p-6">
          <FiMapPin className="w-8 h-8 text-blue-500 mb-3" />
          <h2 className="font-semibold">Adreslerim</h2>
          <p className="text-sm text-gray-500 mt-1">Teslimat adreslerinizi yönetin</p>
        </div>
        <div className="card p-6">
          <FiFileText className="w-8 h-8 text-orange-500 mb-3" />
          <h2 className="font-semibold">Teklif Taleplerim</h2>
          <p className="text-sm text-gray-500 mt-1">Teklif taleplerinizi takip edin</p>
          <Link href="/hesabim/teklifler" className="text-sm text-primary-500 hover:underline mt-2 inline-block">Tekliflerimi Gör →</Link>
        </div>
      </div>

      {isB2B && (
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-3">Bayi Hesap Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Hesap Durumu:</span>
              <span className={`ml-2 badge ${session.user.b2bStatus === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                {session.user.b2bStatus === 'APPROVED' ? 'Onaylı' : session.user.b2bStatus === 'PENDING' ? 'Beklemede' : session.user.b2bStatus}
              </span>
            </div>
          </div>
          {session.user.b2bStatus === 'APPROVED' && (
            <p className="text-sm text-green-600 mt-3">
              Bayi hesabınız aktif. Ürün sayfalarında size özel indirimli fiyatları görebilirsiniz.
            </p>
          )}
          {session.user.b2bStatus === 'PENDING' && (
            <p className="text-sm text-yellow-600 mt-3">
              Bayi başvurunuz inceleniyor. Onaylandığında özel fiyatlardan yararlanabileceksiniz.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
