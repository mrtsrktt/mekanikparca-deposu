'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { FiMenu, FiX, FiShoppingCart, FiPhone, FiMail, FiSearch, FiChevronDown, FiFileText, FiUser } from 'react-icons/fi'

interface Category { id: string; name: string; slug: string }
interface Brand { id: string; name: string; slug: string }

export default function Header() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [catOpen, setCatOpen] = useState(false)
  const [brandOpen, setBrandOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [quoteCount, setQuoteCount] = useState(0)
  const [mobileCatOpen, setMobileCatOpen] = useState(false)
  const [mobileBrandOpen, setMobileBrandOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const catRef = useRef<HTMLLIElement>(null)
  const brandRef = useRef<HTMLLIElement>(null)

  const isB2B = session?.user?.role === 'B2B'

  useEffect(() => {
    fetch('/api/public/categories').then(r => r.json()).then(setCategories).catch(() => {})
    fetch('/api/public/brands').then(r => r.json()).then(setBrands).catch(() => {})
    const updateQuoteCount = () => {
      const qc = JSON.parse(localStorage.getItem('quoteCart') || '[]')
      setQuoteCount(qc.length)
    }
    updateQuoteCount()
    window.addEventListener('quote-cart-updated', updateQuoteCount)

    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('quote-cart-updated', updateQuoteCount)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false)
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) setBrandOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-corporate-dark via-corporate-gray to-corporate-dark text-gray-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="tel:02162324052" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <FiPhone className="w-3 h-3" /> 0216 232 40 52
            </a>
            <a href="mailto:info@2miklimlendirme.com.tr" className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors">
              <FiMail className="w-3 h-3" /> info@2miklimlendirme.com.tr
            </a>
          </div>
          <div className="flex items-center gap-3">
            {isB2B && <span className="badge badge-warning text-[10px]">Bayi</span>}
            {session ? (
              <div className="flex items-center gap-3">
                <Link href="/hesabim" className="flex items-center gap-1 hover:text-white transition-colors">
                  <FiUser className="w-3 h-3" /> {session.user.name}
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="text-accent-400 hover:text-accent-500 transition-colors font-medium">Admin</Link>
                )}
                <button onClick={() => signOut()} className="hover:text-white transition-colors">Çıkış</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/giris" className="hover:text-white transition-colors">Giriş</Link>
                <span className="text-gray-600">|</span>
                <Link href="/kayit" className="hover:text-white transition-colors">Kayıt</Link>
                <span className="text-gray-600">|</span>
                <Link href="/b2b-basvuru" className="text-accent-400 hover:text-accent-500 font-semibold transition-colors">Bayi Ol</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className={`bg-white transition-all duration-300 ${scrolled ? 'shadow-lg' : 'shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-6">
            <Link href="/" className="flex-shrink-0 flex items-center gap-3">
              <Image src="/images/logo.png" alt="Mekanik Parça Deposu" width={180} height={50} className="h-12 w-auto" priority />
              <div className="hidden sm:block">
                <div className="text-base font-extrabold text-gray-800 leading-tight">Mekanik Parça Deposu</div>
                <div className="text-xs text-gray-400">Isıtma Sistemleri Uzmanı</div>
              </div>
            </Link>

            {/* Search */}
            <form action="/urunler" method="GET" className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full group">
                <input type="text" name="q" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ürün, marka veya parça numarası ara..."
                  className="w-full pl-5 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm
                  focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 
                  outline-none transition-all duration-300 placeholder:text-gray-400" />
                <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors">
                  <FiSearch className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Icons */}
            <div className="flex items-center gap-1">
              <Link href="/teklif" className="relative p-2.5 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-all duration-200" title="Teklif Listem">
                <FiFileText className="w-5 h-5" />
                {quoteCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {quoteCount}
                  </span>
                )}
              </Link>
              <Link href="/sepet" className="relative p-2.5 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-all duration-200" title="Sepet">
                <FiShoppingCart className="w-5 h-5" />
              </Link>
              <button className="md:hidden p-2.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menü">
                {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex items-center">
              {[
                { href: '/', label: 'Ana Sayfa' },
                { href: '/urunler', label: 'Ürünler' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="relative block px-4 py-3 text-white/90 text-sm font-medium hover:text-white hover:bg-white/10 transition-all duration-200 group">
                    {item.label}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-accent-400 group-hover:w-3/4 transition-all duration-300 rounded-full" />
                  </Link>
                </li>
              ))}

              {/* Kategoriler Dropdown */}
              <li ref={catRef} className="relative">
                <button
                  onClick={() => { setCatOpen(!catOpen); setBrandOpen(false) }}
                  className="relative flex items-center gap-1 px-4 py-3 text-white/90 text-sm font-medium hover:text-white hover:bg-white/10 transition-all duration-200 group"
                >
                  Kategoriler <FiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-accent-400 group-hover:w-3/4 transition-all duration-300 rounded-full" />
                </button>
                {catOpen && (
                  <div className="absolute top-full left-0 bg-white rounded-b-xl shadow-2xl border border-gray-100 min-w-[320px] z-50 py-2 max-h-[70vh] overflow-y-auto animate-fade-in">
                    {categories.map((cat) => (
                      <Link key={cat.id} href={`/urunler?category=${cat.slug}`}
                        className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                        onClick={() => setCatOpen(false)}>
                        {cat.name}
                      </Link>
                    ))}
                    <div className="border-t mt-1 pt-1">
                      <Link href="/kategoriler" className="block px-5 py-2.5 text-sm text-primary-500 font-semibold hover:bg-primary-50" onClick={() => setCatOpen(false)}>
                        Tüm Kategorileri Gör →
                      </Link>
                    </div>
                  </div>
                )}
              </li>

              {/* Markalar Dropdown */}
              <li ref={brandRef} className="relative">
                <button
                  onClick={() => { setBrandOpen(!brandOpen); setCatOpen(false) }}
                  className="relative flex items-center gap-1 px-4 py-3 text-white/90 text-sm font-medium hover:text-white hover:bg-white/10 transition-all duration-200 group"
                >
                  Markalar <FiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${brandOpen ? 'rotate-180' : ''}`} />
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-accent-400 group-hover:w-3/4 transition-all duration-300 rounded-full" />
                </button>
                {brandOpen && (
                  <div className="absolute top-full left-0 bg-white rounded-b-xl shadow-2xl border border-gray-100 min-w-[240px] z-50 py-2 animate-fade-in">
                    {brands.map((brand) => (
                      <Link key={brand.id} href={`/urunler?brand=${brand.slug}`}
                        className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                        onClick={() => setBrandOpen(false)}>
                        {brand.name}
                      </Link>
                    ))}
                    <div className="border-t mt-1 pt-1">
                      <Link href="/markalar" className="block px-5 py-2.5 text-sm text-primary-500 font-semibold hover:bg-primary-50" onClick={() => setBrandOpen(false)}>
                        Tüm Markaları Gör →
                      </Link>
                    </div>
                  </div>
                )}
              </li>

              <li>
                <Link href="/kampanyalar" className="relative block px-4 py-3 text-white text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200">
                  🎁 Kampanyalar
                </Link>
              </li>
              {[
                { href: '/blog', label: 'Blog' },
                { href: '/hakkimizda', label: 'Hakkımızda' },
                { href: '/iletisim', label: 'İletişim' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="relative block px-4 py-3 text-white/90 text-sm font-medium hover:text-white hover:bg-white/10 transition-all duration-200 group">
                    {item.label}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-accent-400 group-hover:w-3/4 transition-all duration-300 rounded-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t shadow-2xl max-h-[80vh] overflow-y-auto animate-fade-in">
          <form action="/urunler" method="GET" className="p-4">
            <div className="relative">
              <input type="text" name="q" placeholder="Ürün ara..." className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary-500/20" />
              <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-primary-500 text-white rounded-full">
                <FiSearch className="w-4 h-4" />
              </button>
            </div>
          </form>
          <nav className="pb-4">
            <Link href="/" className="block px-5 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors" onClick={() => setMobileOpen(false)}>Ana Sayfa</Link>
            <Link href="/urunler" className="block px-5 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors" onClick={() => setMobileOpen(false)}>Ürünler</Link>

            <button onClick={() => setMobileCatOpen(!mobileCatOpen)} className="w-full flex items-center justify-between px-5 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors">
              Kategoriler
              <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileCatOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileCatOpen && (
              <div className="bg-gray-50">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/urunler?category=${cat.slug}`} className="block px-7 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors" onClick={() => setMobileOpen(false)}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            <button onClick={() => setMobileBrandOpen(!mobileBrandOpen)} className="w-full flex items-center justify-between px-5 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors">
              Markalar
              <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileBrandOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileBrandOpen && (
              <div className="bg-gray-50">
                {brands.map((brand) => (
                  <Link key={brand.id} href={`/urunler?brand=${brand.slug}`} className="block px-7 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors" onClick={() => setMobileOpen(false)}>
                    {brand.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="border-t mt-3 pt-3 mx-4">
              <Link href="/kampanyalar" className="block px-5 py-3 text-red-500 hover:bg-red-50 font-semibold rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>🎁 Kampanyalar</Link>
              <Link href="/blog" className="block px-5 py-3 text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setMobileOpen(false)}>Blog</Link>
              <Link href="/hakkimizda" className="block px-5 py-3 text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setMobileOpen(false)}>Hakkımızda</Link>
              <Link href="/iletisim" className="block px-5 py-3 text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setMobileOpen(false)}>İletişim</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
