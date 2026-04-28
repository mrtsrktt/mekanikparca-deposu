export type TrustBadge = {
  icon: string
  text: string
}

export type FeatureCard = {
  icon: string
  title: string
  description: string
}

export type UseCase = {
  icon: string
  label: string
}

export type TechSpec = {
  label: string
  value: string
}

export type ProductFAQItem = {
  question: string
  answer: string
}

export type EnrichedProductDescription = {
  productSlug: string
  hero: {
    title: string
    subtitle: string
    intro: string
  }
  trustBadges: TrustBadge[]
  whyThisModel: {
    title: string
    features: FeatureCard[]
  }
  whoIsItFor: {
    title: string
    cases: UseCase[]
    summary: string
  }
  techSpecs: {
    title: string
    specs: TechSpec[]
  }
  faq: {
    title: string
    items: ProductFAQItem[]
  }
}

export const PRODUCT_DESCRIPTIONS: Record<string, EnrichedProductDescription> = {
  'lega-75-kva-monofaze-servo-voltaj-regulatoru': {
    productSlug: 'lega-75-kva-monofaze-servo-voltaj-regulatoru',
    hero: {
      title: 'LEGA 7,5 KVA Monofaze Servo Voltaj Regülatörü',
      subtitle: 'Hassas Cihazlarınızı Voltaj Dalgalanmalarına Karşı Koruyun',
      intro:
        "Türkiye'nin elektrik altyapısı her bölgede aynı kalitede değil. Voltaj dalgalanmaları kombi, klima ve beyaz eşyalarınızın ömrünü kısaltır, elektronik cihazlarınıza zarar verir. Lega 7,5 KVA servo regülatör, geniş voltaj aralığında çalışarak bu riski tamamen ortadan kaldırır. 22 ülkeye ihracat yapan Lega Energy mühendisliğinin güvencesinde, ±%2 hassasiyetle çıkış voltajını sabit 220V'da tutar.",
    },
    trustBadges: [
      { icon: 'ShieldCheck', text: '2 Yıl Üretici Garantisi' },
      { icon: 'BadgeCheck', text: 'TSE Belgeli, %100 Türk Üretimi' },
      { icon: 'Truck', text: 'Aynı Gün Kargo (en geç 2 iş günü)' },
      { icon: 'PackageCheck', text: '5.000 TL Üzeri Ücretsiz Kargo' },
    ],
    whyThisModel: {
      title: 'Neden Lega 7,5 KVA?',
      features: [
        {
          icon: 'Shield',
          title: 'Güvenilir Voltaj Koruması',
          description:
            "Servo motor ve toroidal trafo teknolojisi sayesinde, şebeke gerilimi 140V'a düşse veya 260V'a çıksa bile çıkışı sabit 220V'da tutar. Cihazlarınız hep doğru voltajda çalışır.",
        },
        {
          icon: 'Zap',
          title: 'Hızlı Tepki Süresi',
          description:
            'Mikroişlemci kontrollü servo motor, voltaj değişimine milisaniye seviyesinde tepki verir. Cihazlarınız regülasyonu fark bile etmez.',
        },
        {
          icon: 'Monitor',
          title: 'Dijital DM-07 Display',
          description:
            'Giriş voltajı, çıkış voltajı, akım, frekans ve sıcaklık değerlerini gerçek zamanlı görüntüler. Aşırı yük, aşırı voltaj ve aşırı sıcaklık durumlarında otomatik koruma devreye girer.',
        },
        {
          icon: 'Wrench',
          title: 'Kolay Kurulum',
          description:
            'Plug-and-play tasarım: prizden kolayca bağlanır, ek kurulum gerektirmez. Yer kaplamayan kompakt yapı, yatay veya dikey yerleştirilebilir.',
        },
      ],
    },
    whoIsItFor: {
      title: 'Bu Model Kimler İçin?',
      cases: [
        { icon: 'Home', label: 'Daireler ve müstakil evler' },
        { icon: 'Building2', label: 'Küçük ofisler, klinikler' },
        { icon: 'Store', label: 'Kafe, restoran, butik mağaza' },
        { icon: 'Hammer', label: 'Atölye ve laboratuvar' },
      ],
      summary:
        '7,5 KVA güç kapasitesi yaklaşık 6.000 watt yük taşıma anlamına gelir. Tipik kullanım: 1 kombi + 2 klima + buzdolabı + bulaşık makinesi + diğer ev/ofis elektroniği. Daha küçük alan için 5 KVA, daha büyük alan için 10 veya 15 KVA modellerimizi inceleyebilirsiniz.',
    },
    techSpecs: {
      title: 'Teknik Özellikler',
      specs: [
        { label: 'Güç Kapasitesi', value: '7,5 KVA' },
        { label: 'Faz Tipi', value: 'Monofaze' },
        { label: 'Teknoloji', value: 'Servo Motor + Toroidal Trafo' },
        { label: 'Giriş Voltajı', value: '140V – 260V' },
        { label: 'Çıkış Voltajı', value: '220V (±%2 hassasiyet)' },
        { label: 'Frekans', value: '50 Hz' },
        { label: 'Çalışma Sıcaklığı', value: '0°C – +40°C' },
        {
          label: 'Koruma Özellikleri',
          value: 'Aşırı yük, aşırı voltaj, aşırı sıcaklık, kısa devre koruması',
        },
        { label: 'Gösterge', value: 'DM-07 dijital multifunction display' },
        { label: 'Sertifika', value: 'TSE belgeli, TS EN 61558-1 standardı' },
        { label: 'Üretim Yeri', value: 'Türkiye / İstanbul' },
        { label: 'Garanti', value: '2 yıl üretici garantisi' },
      ],
    },
    faq: {
      title: 'Sıkça Sorulan Sorular',
      items: [
        {
          question: 'Hangi cihazları korur?',
          answer:
            'Kombi, klima, buzdolabı, bulaşık ve çamaşır makinesi, televizyon, bilgisayar, kasa sistemleri — voltaj dalgalanmasından etkilenebilecek tüm cihazları korur.',
        },
        {
          question: 'Kurulum yapmama gerek var mı?',
          answer:
            "Hayır. Prize takılır, cihazlarınızı regülatörün çıkışına bağlarsınız. Profesyonel kurulum istiyorsanız WhatsApp'tan bilgi alabilirsiniz.",
        },
        {
          question: 'Stokta var mı?',
          answer:
            'Evet, ürün stoklarımızda mevcuttur. Aynı gün kargoya verilir, en geç 2 iş günü içinde kapınızda olur.',
        },
        {
          question: 'Garanti süresi içinde sorun yaşarsam ne olur?',
          answer:
            'Tüm Lega ürünleri 2 yıl üretici garantilidir. WhatsApp veya telefonla ulaşmanız yeterli — kargo dahil tüm süreci biz yönetiriz.',
        },
      ],
    },
  },
}

export function getProductDescription(
  slug: string
): EnrichedProductDescription | null {
  return PRODUCT_DESCRIPTIONS[slug] || null
}
