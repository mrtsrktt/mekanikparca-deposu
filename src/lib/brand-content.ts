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

export type HeroBadge = {
  value: string
  label: string
}

export type TechSpec = {
  iconKey:
    | 'cpu'
    | 'shield'
    | 'target'
    | 'monitor'
    | 'badge'
    | 'shield-check'
    | 'zap'
    | 'globe'
  title: string
  description: string
}

export type FinalCta = {
  title: string
  subtitle: string
  primaryLabel: string
  secondaryLabel: string
}

export type BrandContent = {
  slug: string
  name: string
  fullName: string
  heroSubtitle: string
  tagline: string
  heroBadges: HeroBadge[]
  productHighlights: string[]
  techSpecsTitle: string
  techSpecsSubtitle: string
  techSpecs: TechSpec[]
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
  finalCta: FinalCta
}

export const BRAND_CONTENT: Record<string, BrandContent | null> = {
  lega: {
    slug: 'lega',
    name: 'Lega',
    fullName: 'Lega Servo Voltaj Regülatörleri',
    heroSubtitle: 'Lega Yetkili Satıcısı',
    tagline:
      "Türkiye'nin en uygun fiyatlarıyla, Mekanik Parça Deposu güvencesinde.",
    heroBadges: [
      { value: '22', label: 'Ülkeye İhracat' },
      { value: '32', label: 'Yıl Sektör Tecrübesi' },
      { value: '±%2', label: 'Hassasiyet' },
      { value: '2 Yıl', label: 'Üretici Garantisi' },
    ],
    productHighlights: [
      '±%2 hassasiyetli regülasyon',
      '2 yıl üretici garantisi',
      'Aynı gün kargo',
    ],
    techSpecsTitle: 'Neden Lega?',
    techSpecsSubtitle: 'Türk mühendisliğinin uluslararası standardı',
    techSpecs: [
      {
        iconKey: 'cpu',
        title: 'Mikroişlemci Kontrol',
        description: 'Hızlı tepki süresi, anlık voltaj düzeltme.',
      },
      {
        iconKey: 'shield',
        title: 'Aşırı Voltaj Koruma',
        description: 'Cihazlarınızı yüksek voltaja karşı korur.',
      },
      {
        iconKey: 'target',
        title: '±%2 Hassasiyet',
        description: 'Profesyonel sınıf regülasyon kalitesi.',
      },
      {
        iconKey: 'monitor',
        title: 'Dijital Gösterge',
        description: 'Anlık voltaj, akım ve durum takibi.',
      },
      {
        iconKey: 'badge',
        title: 'TSE Belgeli',
        description: 'Türk Standartları Enstitüsü onaylı.',
      },
      {
        iconKey: 'shield-check',
        title: '2 Yıl Garanti',
        description: 'Üretici tarafından tam garanti.',
      },
    ],
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
      title: 'Hangi Lega Modeli Sizin İçin Uygun?',
      description:
        '3 soruda size en uygun KVA değerini bulalım.',
      stages: [
        {
          id: 'konut',
          label: 'Konut',
          icon: '🏠',
          description: 'Daire, müstakil ev, villa',
          options: [
            { id: 'konut-kucuk', label: 'Daire / Küçük ev', description: 'Kombi + 3-4 beyaz eşya', recommendedKva: '5' },
            { id: 'konut-orta', label: 'Tüm daire elektriği', description: 'Kombi + klima + tüm eşyalar', recommendedKva: '10' },
            { id: 'konut-buyuk', label: 'Villa', description: 'Klima sistemleri dahil', recommendedKva: '15' },
          ],
        },
        {
          id: 'ticari',
          label: 'Ticari',
          icon: '🏢',
          description: 'Ofis, mağaza, küçük işletme',
          options: [
            { id: 'ticari-kucuk', label: 'Küçük ofis', description: '5-10 bilgisayar, yazıcı', recommendedKva: '10' },
            { id: 'ticari-orta', label: 'Mağaza', description: 'Kasa, vitrin, soğutma', recommendedKva: '20' },
            { id: 'ticari-buyuk', label: 'Otel / Restoran', description: 'Resepsiyon, mutfak', recommendedKva: '25' },
          ],
        },
        {
          id: 'endustriyel',
          label: 'Endüstriyel',
          icon: '🏭',
          description: 'Atölye, fabrika, üretim',
          options: [
            { id: 'end-kucuk', label: 'Atölye', description: 'Motorlu makineler', recommendedKva: '30' },
            { id: 'end-orta', label: 'Mağaza zinciri', description: 'Market, depo', recommendedKva: '40' },
            { id: 'end-buyuk', label: 'Fabrika', description: 'Üretim hatları (özel teklif)', recommendedKva: '40' },
          ],
        },
      ],
    },
    productLabels: {
      '5': 'Daire / Küçük ev için',
      '7.5': 'Orta büyüklükte ev için',
      '10': 'Büyük ev / Küçük ofis için',
      '15': 'Villa / Ofis için',
      '20': 'Atölye / Mağaza için',
      '25': 'Küçük fabrika için',
      '30': 'Endüstriyel kullanım için',
      '40': 'Endüstriyel büyük tesisler için',
    },
    faq: [
      {
        question: 'Hangi KVA modelini seçmeliyim?',
        answer:
          "Kullanım alanınız ve toplam yükünüze göre değişir. Sayfanın üst kısmındaki seçim rehberi size doğru modeli önerir. Emin değilseniz WhatsApp'tan ulaşın, uzman ekibimiz yardımcı olur.",
      },
      {
        question: 'Kargo ücreti ne kadar, ne kadar sürede gelir?',
        answer:
          'Kargo bedeli alıcıya aittir. Aynı gün kargoya verilir, 1-2 iş günü içinde teslim edilir.',
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
    finalCta: {
      title: 'Lega Voltaj Regülatörü mü Arıyorsunuz?',
      subtitle: 'Aynı gün kargo · 2 yıl üretici garantisi · Profesyonel teknik destek',
      primaryLabel: 'Modelleri İncele',
      secondaryLabel: "WhatsApp'tan Sor",
    },
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
