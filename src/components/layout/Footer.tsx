'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FiPhone, FiMail, FiMapPin, FiChevronRight } from 'react-icons/fi'
import { trackWhatsAppClick } from '@/lib/gtm'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-corporate-dark to-[#060d18] text-gray-400">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company */}
          <div>
            <div className="mb-5">
              <Image src="/images/logo.png" alt="Mekanik Parça Deposu" width={160} height={45} className="h-10 w-auto brightness-110" />
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              İKİ M İKLİMLENDİRME SİSTEMLERİ TİCARET LİMİTED ŞİRKETİ — Mekanik tesisat, HVAC, ısıtma-soğutma sistemleri ve teknik servis ekipmanları alanında güvenilir tedarikçiniz.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Hızlı Bağlantılar</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/urunler', label: 'Ürünler' },
                { href: '/kategoriler', label: 'Kategoriler' },
                { href: '/markalar', label: 'Markalar' },
                { href: '/kampanyalar', label: 'Kampanyalar', accent: true },
                { href: '/blog', label: 'Blog' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className={`flex items-center gap-1.5 text-sm hover:text-white transition-colors group ${item.accent ? 'text-red-400' : ''}`}>
                    <FiChevronRight className="w-3 h-3 text-primary-400 group-hover:translate-x-0.5 transition-transform" />
                    {item.accent && '🎁 '}{item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Müşteri Hizmetleri</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/hakkimizda', label: 'Hakkımızda' },
                { href: '/iletisim', label: 'İletişim' },
                { href: '/sikca-sorulan-sorular', label: 'S.S.S.' },
                { href: '/teslimat-kosullari', label: 'Teslimat Koşulları' },
                { href: '/iade-politikasi', label: 'İade Politikası' },
                { href: '/satis-politikasi', label: 'Satış Politikası' },
                { href: '/gizlilik-politikasi', label: 'Gizlilik Politikası' },
                { href: '/on-bilgilendirme-formu', label: 'Ön Bilgilendirme Formu' },
                { href: '/kvkk-aydinlatma-metni', label: 'KVKK Aydınlatma Metni' },
                { href: '/cerez-politikasi', label: 'Çerez Politikası' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="flex items-center gap-1.5 text-sm hover:text-white transition-colors group">
                    <FiChevronRight className="w-3 h-3 text-primary-400 group-hover:translate-x-0.5 transition-transform" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">İletişim</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="p-2 bg-white/5 rounded-lg mt-0.5">
                  <FiMapPin className="w-4 h-4 text-primary-400" />
                </div>
                <span className="text-sm leading-relaxed">Atatürk Mah. Alemdağ Cad. No:140-144 İç Kapı No:19, Ümraniye, İstanbul</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-2 bg-white/5 rounded-lg">
                  <FiPhone className="w-4 h-4 text-primary-400" />
                </div>
                <div className="flex flex-col text-sm gap-0.5">
                  <a href="tel:02162324052" className="hover:text-white transition-colors">0216 232 40 52</a>
                  <a href="tel:05326404086" className="hover:text-white transition-colors">0532 640 40 86</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-2 bg-white/5 rounded-lg">
                  <FiMail className="w-4 h-4 text-primary-400" />
                </div>
                <a href="mailto:info@2miklimlendirme.com.tr" className="text-sm hover:text-white transition-colors">info@2miklimlendirme.com.tr</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-600">&copy; 2026 İKİ M İKLİMLENDİRME SİSTEMLERİ TİC. LTD. ŞTİ. Tüm hakları saklıdır.</p>
        </div>
      </div>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/905326404086"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick('footer')}
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-xl hover:bg-green-600 hover:scale-110 transition-all duration-300 z-50 wa-pulse"
        aria-label="WhatsApp ile iletişime geçin"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </footer>
  )
}
