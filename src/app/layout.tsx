import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: {
    default: 'Mekanik Parça Deposu | Isıtma & Soğutma Sistemleri Uzmanı',
    template: '%s | Mekanik Parça Deposu',
  },
  description: 'Kombi, ısıtma ve soğutma sistemleri, mekanik tesisat, HVAC ekipmanları ve yedek parça tedarikçiniz. Taifu, Testo, Fernox, Regen ve daha fazla marka. Toptan ve perakende satış.',
  keywords: 'mekanik tesisat, HVAC, ısıtma, soğutma, yedek parça, teknik servis, kombi parçası, taifu pompa, testo ölçüm, fernox kimyasal, radyatör, klima, sirkülasyon pompası',
  authors: [{ name: 'İKİ M İKLİMLENDİRME SİSTEMLERİ TİC. LTD. ŞTİ.' }],
  creator: 'Mekanik Parça Deposu',
  publisher: 'İKİ M İKLİMLENDİRME SİSTEMLERİ TİC. LTD. ŞTİ.',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Mekanik Parça Deposu',
    title: 'Mekanik Parça Deposu | Isıtma & Soğutma Sistemleri Uzmanı',
    description: 'Kombi, ısıtma ve soğutma sistemleri, mekanik tesisat, HVAC ekipmanları ve yedek parça. Toptan ve perakende satış.',
    images: [{ url: '/images/logo.png', width: 800, height: 400, alt: 'Mekanik Parça Deposu' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mekanik Parça Deposu | Isıtma & Soğutma Sistemleri Uzmanı',
    description: 'Kombi, ısıtma ve soğutma sistemleri, mekanik tesisat, HVAC ekipmanları ve yedek parça.',
    images: ['/images/logo.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: ['oCP8ySma0rw_QDZJpVoQz542bTHZwW1Izf_5MNX5MGU', 'MV27PRmz6zYkZhFWVbYk3zDSm1xQvohxnP80YDu8PoE'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-head" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-W8VT2W45');
          `}
        </Script>
        {/* End Google Tag Manager */}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W8VT2W45"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
