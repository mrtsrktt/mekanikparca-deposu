export type ProductGuideStage = {
  id: string
  label: string
  icon?: string
  description?: string
  recommendedKva?: string
  options?: ProductGuideStage[]
}

export type BrandFAQ = {
  question: string
  answer: string
}

export type BrandContent = {
  slug: string
  name: string
  fullName: string
  tagline: string
  aboutBrand: string
  aboutBrandLong: string
  productGuide: {
    title: string
    description: string
    stages: ProductGuideStage[]
  } | null
  productLabels: Record<string, string>
  faq: BrandFAQ[]
  trustBadges: string[]
}

export const BRAND_CONTENT: Record<string, BrandContent | null> = {
  lega: {
    slug: 'lega',
    name: 'Lega',
    fullName: 'Lega Servo Voltaj Regülatörleri',
    tagline:
      "Lega Yetkili Satıcısından Türkiye'nin En Uygun Fiyatlarıyla Satın Alın",
    aboutBrand:
      "Lega Energy, 1990'lardan beri Türkiye'nin önde gelen güç elektroniği üreticilerinden biridir.",
    aboutBrandLong: `Lega Energy, 1990'lardan beri Türkiye'nin önde gelen güç elektroniği üreticilerinden biridir. İstanbul Ümraniye'de üretim yapan firma; Tunus, Libya, Katar, Kenya, Kazakistan başta olmak üzere 22 ülkeye ihracat gerçekleştirmektedir.

Servo motor ve toroidal trafo (varyak) teknolojisi ile çalışan Lega regülatörleri:
- Mikroişlemci kontrollü
- Aşırı akım/voltaj koruma üniteli
- Dijital göstergeli
- ±%2 hassasiyetli regülasyon
- TSE belgeli ve 2 yıl tam garantili`,
    productGuide: {
      title: 'Hangi Model Sizin İçin Uygun?',
      description:
        'Kullanım alanınıza ve yük yoğunluğunuza göre size en uygun KVA değerini bulalım.',
      stages: [
        {
          id: 'konut',
          label: 'Konut',
          icon: '🏠',
          description: 'Daire, müstakil ev, villa',
          options: [
            { id: 'konut-kucuk', label: 'Kombi + 3-4 beyaz eşya', recommendedKva: '5' },
            { id: 'konut-orta', label: 'Tüm daire elektriği', recommendedKva: '10' },
            { id: 'konut-buyuk', label: 'Villa + klima sistemleri', recommendedKva: '15' },
          ],
        },
        {
          id: 'ticari',
          label: 'Ticari',
          icon: '🏢',
          description: 'Ofis, mağaza, küçük işletme',
          options: [
            { id: 'ticari-kucuk', label: 'Küçük ofis (5-10 bilgisayar)', recommendedKva: '10' },
            { id: 'ticari-orta', label: 'Mağaza (kasa + soğutma)', recommendedKva: '20' },
            { id: 'ticari-buyuk', label: 'Otel resepsiyon, restoran', recommendedKva: '25' },
          ],
        },
        {
          id: 'endustriyel',
          label: 'Endüstriyel',
          icon: '🏭',
          description: 'Atölye, fabrika, üretim hattı',
          options: [
            { id: 'end-kucuk', label: 'Atölye, motorlu makineler', recommendedKva: '30' },
            { id: 'end-orta', label: 'Mağaza zinciri, market', recommendedKva: '40' },
            { id: 'end-buyuk', label: 'Fabrika hatları (özel teklif)', recommendedKva: '40' },
          ],
        },
      ],
    },
    productLabels: {
      '5': 'Daire / Küçük ev',
      '7.5': 'Orta büyüklükte ev',
      '10': 'Büyük ev / Küçük ofis',
      '15': 'Villa / Ofis',
      '20': 'Atölye / Mağaza',
      '25': 'Küçük fabrika',
      '30': 'Endüstriyel',
      '40': 'Endüstriyel büyük',
    },
    faq: [
      {
        question: 'Hangi KVA modelini seçmeliyim?',
        answer:
          "Kullanım alanınız ve toplam yükünüze göre değişir. Yukarıdaki seçim rehberi size doğru modeli önerir. Emin değilseniz WhatsApp'tan ulaşın, uzman ekibimiz yardımcı olur.",
      },
      {
        question: 'Kargo ücreti ne kadar, ne kadar sürede gelir?',
        answer:
          '5.000 TL üzeri tüm siparişlerde kargo ücretsizdir. Aynı gün kargo, 1-2 iş günü içinde teslim.',
      },
      {
        question: 'Firma faturası verir misiniz?',
        answer: 'Evet, tüm siparişlerimiz için firma faturası ve e-fatura düzenliyoruz.',
      },
      {
        question: 'Garanti nasıl çalışıyor?',
        answer:
          'Tüm Lega ürünleri 2 yıl üretici garantilidir. Garanti süresi içinde her türlü üretim hatası ücretsiz onarılır veya değişim yapılır.',
      },
      {
        question: 'Montaj hizmeti veriyor musunuz?',
        answer:
          '10 KVA üzeri modellerde profesyonel montaj önerilir. İhtiyaç durumunda anlaşmalı teknik servis ekibimizden destek sağlanır.',
      },
      {
        question: 'Toplu alım için indirim var mı?',
        answer:
          "Evet, tesisatçı bayilerimiz ve toplu alım yapmak isteyen firmalar için özel fiyatlandırma sunuyoruz. WhatsApp'tan teklif alabilirsiniz.",
      },
      {
        question: 'Ödeme yöntemleri nelerdir?',
        answer:
          'Kredi kartı (taksit imkanı dahil), havale/EFT ve kapıda ödeme seçenekleri mevcuttur.',
      },
      {
        question: 'Ürün stokta mı?',
        answer:
          'Sayfada listelenen tüm ürünler stoklarımızda mevcuttur. Aynı gün kargoya verilir.',
      },
    ],
    trustBadges: [
      'Lega Yetkili Satıcısı',
      '32 Yıllık Sektör Tecrübesi',
      'Aynı Gün Kargo',
      '2 Yıl Üretici Garantisi',
      'Profesyonel Teknik Destek',
    ],
  },

  regen: null,
  fernox: null,
  mru: null,
}

export function getBrandContent(slug: string | undefined | null): BrandContent | null {
  if (!slug) return null
  return BRAND_CONTENT[slug.toLowerCase()] ?? null
}

export function parseKvaFromName(name: string): string | null {
  const match = name.match(/(\d+(?:[.,]\d+)?)\s*KVA/i)
  if (!match) return null
  return match[1].replace(',', '.')
}
