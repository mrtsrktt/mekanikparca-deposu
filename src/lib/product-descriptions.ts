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
  'lega-500-va-kombi-voltaj-regulatoru': {
    productSlug: 'lega-500-va-kombi-voltaj-regulatoru',
    hero: {
      title: 'LEGA 500 VA Kombi Voltaj Regülatörü',
      subtitle: 'Kombinizi Voltaj Dalgalanmalarına Karşı Koruyun',
      intro:
        "Türkiye'de kombi yanmalarının en büyük sebebi voltaj dalgalanmalarıdır. Tek bir voltaj atağı yeni bir kombi maliyetine ulaşır. Lega 500 VA Kombi Regülatörü, sadece kombiniz için tasarlanmış kompakt ve uzun ömürlü bir koruyucudur. Otomatik çalışan bu regülatör, voltajı 130-260V aralığından alır, kombinize sabit 220V (±3V) çıkış verir. %98 verimlilik ile elektrik faturanıza ek yük getirmez.",
    },
    trustBadges: [
      { icon: 'ShieldCheck', text: 'Kombi Garantinizi Korur' },
      { icon: 'BadgeCheck', text: 'CE Belgeli, %100 Türk Üretimi' },
      { icon: 'Truck', text: 'Aynı Gün Kargo (en geç 2 iş günü)' },
      { icon: 'Zap', text: '%98 Yüksek Verim, Düşük Tüketim' },
    ],
    whyThisModel: {
      title: 'Neden Lega 500 VA Kombi Regülatörü?',
      features: [
        {
          icon: 'Flame',
          title: 'Kombiye Özel Tasarım',
          description:
            'Yalnızca kombi yükünü taşıyacak şekilde optimize edilmiştir. 500 VA güç, doğalgaz kombilerinin elektrik ihtiyacını rahatlıkla karşılar. Kompakt yapısı sayesinde kombinin yanına kolayca monte edilir.',
        },
        {
          icon: 'Shield',
          title: '4 Katmanlı Koruma',
          description:
            'Aşırı gerilim, aşırı akım, aşırı ısı ve düşük gerilim koruması bir arada. Kombiniz hangi voltaj saldırısıyla karşılaşırsa karşılaşsın güvende kalır. Sigorta atması yerine devre korumaya geçer.',
        },
        {
          icon: 'Activity',
          title: 'Geniş Voltaj Aralığı',
          description:
            "130V ile 260V arasında çalışır — Türkiye'nin elektrik altyapısı zayıf bölgelerinde bile sorunsuz hizmet verir. Kombinize sabit 220V (±3V) çıkış garantilenir.",
        },
        {
          icon: 'Gauge',
          title: '%98 Verimlilik',
          description:
            'Otomatik çalışma sistemi minimum enerji tüketimi sağlar. Cihaz arka planda sessizce çalışır, elektrik faturanıza fark etmez bir yük getirir.',
        },
      ],
    },
    whoIsItFor: {
      title: 'Bu Model Kimler İçin?',
      cases: [
        { icon: 'Home', label: 'Kombili daireler' },
        { icon: 'Building', label: 'Müstakil evler ve villalar' },
        { icon: 'Building2', label: 'Küçük işyeri kombileri' },
        { icon: 'Mountain', label: 'Kırsal ve voltajı zayıf bölgeler' },
      ],
      summary:
        '500 VA güç kapasitesi sadece kombi yükü için tasarlanmıştır. Tüm ev cihazlarınızı korumak istiyorsanız 5 KVA veya üzeri servo regülatör modellerimizi inceleyebilirsiniz. Sadece kombinizi koruyacak ekonomik bir çözüm arıyorsanız bu model size en uygun seçimdir.',
    },
    techSpecs: {
      title: 'Teknik Özellikler',
      specs: [
        { label: 'Güç Kapasitesi', value: '500 VA' },
        { label: 'Tip', value: 'Kombi Regülatörü' },
        { label: 'Çalışma Şekli', value: 'Otomatik' },
        { label: 'Giriş Voltajı', value: '130V – 260V' },
        { label: 'Çıkış Voltajı', value: '220V (±3V)' },
        { label: 'Verim', value: '%98' },
        { label: 'Aşırı Gerilim Koruması', value: 'Var' },
        { label: 'Aşırı Akım Koruması', value: 'Var' },
        { label: 'Aşırı Sıcaklık Koruması', value: 'Var' },
        { label: 'Düşük Gerilim Koruması', value: 'Var' },
        { label: 'Sertifika', value: 'CE belgeli' },
        { label: 'Üretim Yeri', value: 'Türkiye' },
        { label: 'Garanti', value: '2 yıl üretici garantisi' },
      ],
    },
    faq: {
      title: 'Sıkça Sorulan Sorular',
      items: [
        {
          question: 'Bu regülatör tüm evimi koruyacak mı?',
          answer:
            'Hayır, bu model yalnızca kombiniz için tasarlanmıştır. 500 VA güç kapasitesi sadece kombi yükünü taşır. Tüm evi korumak için 5 KVA veya daha yüksek servo regülatör modellerimizden birini tercih etmelisiniz.',
        },
        {
          question: 'Kurulumu kim yapar?',
          answer:
            'Kurulum yetkili bir elektrikçi tarafından yapılmalıdır. Cihaz, kombinin elektrik bağlantısı ile şebeke arasına monte edilir. Kombinizin servisi de bu kurulumu yapabilir.',
        },
        {
          question: 'Kombimde sigorta zaten var, regülatöre neden ihtiyacım var?',
          answer:
            'Sigorta yalnızca kısa devreyi keser. Voltaj dalgalanmaları ise sigortaya etki etmeden kombi elektroniğini yakar. Regülatör, voltaj dalgalanmalarını dengeler ve sigortanın koruyamadığı durumlarda devreye girer.',
        },
        {
          question: 'Stokta var mı?',
          answer:
            'Evet, ürün stoklarımızda mevcuttur. Aynı gün kargoya verilir, en geç 2 iş günü içinde kapınızda olur.',
        },
        {
          question: 'Garanti süresi içinde sorun yaşarsam?',
          answer:
            'Tüm Lega ürünleri 2 yıl üretici garantilidir. WhatsApp veya telefonla ulaşmanız yeterli — kargo dahil tüm süreci biz yönetiriz.',
        },
      ],
    },
  },
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
