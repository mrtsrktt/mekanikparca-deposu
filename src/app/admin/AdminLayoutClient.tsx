'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  FiGrid, FiPackage, FiFolder, FiTag, FiShoppingCart, FiUsers,
  FiPercent, FiDollarSign, FiFileText, FiSettings, FiArrowLeft, FiSearch, FiGift
} from 'react-icons/fi'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: FiGrid },
  { href: '/admin/urunler', label: 'Ürünler', icon: FiPackage },
  { href: '/admin/kategoriler', label: 'Kategoriler', icon: FiFolder },
  { href: '/admin/markalar', label: 'Markalar', icon: FiTag },
  { href: '/admin/siparisler', label: 'Siparişler', icon: FiShoppingCart },
  { href: '/admin/b2b-musteriler', label: 'Bayi Müşteriler', icon: FiUsers },
  { href: '/admin/kampanyalar', label: 'Kampanyalar', icon: FiGift },
  { href: '/admin/teklifler', label: 'Teklif Talepleri', icon: FiFileText, badgeKey: 'pendingQuotes' },
  { href: '/admin/indirimler', label: 'İndirimler', icon: FiPercent },
  { href: '/admin/doviz', label: 'Döviz Kurları', icon: FiDollarSign },
  { href: '/admin/blog', label: 'Blog', icon: FiFileText },
  { href: '/admin/seo', label: 'SEO', icon: FiSearch },
  { href: '/admin/kullanicilar', label: 'Kullanıcılar', icon: FiUsers },
  { href: '/admin/ayarlar', label: 'Ayarlar', icon: FiSettings },
]

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [pendingQuotes, setPendingQuotes] = useState(0)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(data => {
        if (data?.stats?.pendingQuotes) setPendingQuotes(data.stats.pendingQuotes)
      })
      .catch(() => {})
  }, [pathname])

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>
  }

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/giris')
  }

  const badgeValues: Record<string, number> = { pendingQuotes }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-corporate-dark text-white flex-shrink-0 fixed h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-700">
          <Image src="/images/logo.png" alt="Mekanik Parça Deposu" width={140} height={40} className="h-9 w-auto brightness-0 invert mb-1" />
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
        <nav className="py-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            const badgeCount = item.badgeKey ? badgeValues[item.badgeKey] || 0 : 0
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-primary-500 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {badgeCount > 0 && (
                  <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5">
                    {badgeCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <FiArrowLeft className="w-4 h-4" />
            Siteye Dön
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
