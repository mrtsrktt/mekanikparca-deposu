import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Veritabanı oluşturuluyor...')

  // ===================== KULLANICILAR =====================
  const adminPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@mekanikparcadeposu.com' }, update: {},
    create: { email: 'admin@mekanikparcadeposu.com', password: adminPassword, name: 'Admin', role: 'ADMIN' },
  })
  const b2bPassword = await bcrypt.hash('b2b123', 12)
  const b2bUser = await prisma.user.upsert({
    where: { email: 'b2b@test.com' }, update: {},
    create: { email: 'b2b@test.com', password: b2bPassword, name: 'Test B2B Kullanıcı', role: 'B2B', b2bStatus: 'APPROVED', companyName: 'Test Tesisat Ltd.', taxNumber: '1234567890', taxOffice: 'İstanbul' },
  })

  // ===================== DÖVİZ KURLARI =====================
  await prisma.currencyRate.upsert({ where: { currency: 'USD' }, update: { rate: 32.50 }, create: { currency: 'USD', rate: 32.50 } })
  await prisma.currencyRate.upsert({ where: { currency: 'EUR' }, update: { rate: 35.20 }, create: { currency: 'EUR', rate: 35.20 } })

  // ===================== MARKALAR =====================
  const brandData = [
    { name: 'FERNOX', slug: 'fernox', sortOrder: 0 },
    { name: 'REGEN', slug: 'regen', sortOrder: 1 },
    { name: 'TAİFU', slug: 'taifu', sortOrder: 2 },
    { name: 'GENERAL LIFE / WEST THERM', slug: 'general-life-west-therm', sortOrder: 3 },
    { name: 'BLACK DIAMOND', slug: 'black-diamond', sortOrder: 4 },
    { name: 'VENTE', slug: 'vente', sortOrder: 5 },
    { name: 'WIPCOOL', slug: 'wipcool', sortOrder: 6 },
    { name: 'TESTO', slug: 'testo', sortOrder: 7 },
  ]
  const brands: Record<string, any> = {}
  for (const b of brandData) {
    brands[b.slug] = await prisma.brand.upsert({ where: { slug: b.slug }, update: {}, create: { ...b, isActive: true } })
  }
  console.log('Markalar oluşturuldu.')

  // ===================== KATEGORİLER (HEPSİ DÜZ LİSTE) =====================
  const categoryData = [
    { name: 'İnhibitörler / Protectör ve Koruyucular', slug: 'inhibitorler-protektor-koruyucular', sortOrder: 0 },
    { name: 'Temizleyiciler', slug: 'temizleyiciler', sortOrder: 1 },
    { name: 'Sızıntı (Kaçak) Gidericiler', slug: 'sizinti-kacak-gidericiler', sortOrder: 2 },
    { name: 'Filtreler', slug: 'filtreler', sortOrder: 3 },
    { name: 'Filtre Paketleri', slug: 'filtre-paketleri', sortOrder: 4 },
    { name: 'Isı Pompaları Isı Transfer Sıvıları', slug: 'isi-pompalari-isi-transfer-sivilari', sortOrder: 5 },
    { name: 'Ticari Seri Sıvılar', slug: 'ticari-seri-sivilar', sortOrder: 6 },
    { name: 'Güneş Enerjisi Sistemleri Solar Sıvılar', slug: 'gunes-enerjisi-solar-sivilar', sortOrder: 7 },
    { name: 'Kazan Gürültü Azaltıcılar', slug: 'kazan-gurultu-azalticilar', sortOrder: 8 },
    { name: 'Test Kitleri', slug: 'test-kitleri', sortOrder: 9 },
    { name: 'Sirkülasyon Pompaları', slug: 'sirkulasyon-pompalari', sortOrder: 10 },
    { name: 'Akıllı Prob', slug: 'akilli-prob', sortOrder: 11 },
    { name: 'Akıllı Vakum Pompası', slug: 'akilli-vakum-pompasi', sortOrder: 12 },
    { name: 'Baca Gazı Analiz Cihazları', slug: 'baca-gazi-analiz-cihazlari', sortOrder: 13 },
    { name: 'Dijital Gaz Terazisi', slug: 'dijital-gaz-terazisi', sortOrder: 14 },
    { name: 'Dijital Manifold', slug: 'dijital-manifold', sortOrder: 15 },
    { name: 'Doğalgaz Kaçak Dedektörü', slug: 'dogalgaz-kacak-dedektoru', sortOrder: 16 },
    { name: 'Elektriksel Ölçüm Cihazları', slug: 'elektriksel-olcum-cihazlari', sortOrder: 17 },
    { name: 'Manometre / Basınç Ölçüm Cihazları', slug: 'manometre-basinc-olcum-cihazlari', sortOrder: 18 },
    { name: 'Termal Kameralar', slug: 'termal-kameralar', sortOrder: 19 },
    { name: 'Vakum Ölçüm Cihazları', slug: 'vakum-olcum-cihazlari', sortOrder: 20 },
    { name: 'Analog Manifold ve Şarj Hortumları', slug: 'analog-manifold-sarj-hortumlari', sortOrder: 21 },
    { name: 'Drenaj Pompaları', slug: 'drenaj-pompalari', sortOrder: 22 },
    { name: 'El Aletleri', slug: 'el-aletleri', sortOrder: 23 },
    { name: 'Klima Temizleme Aparatları', slug: 'klima-temizleme-aparatlari', sortOrder: 24 },
    { name: 'Klima Yıkama Makineleri', slug: 'klima-yikama-makineleri', sortOrder: 25 },
    { name: 'Vakum Pompaları ve Vakum Yağı', slug: 'vakum-pompalari-vakum-yagi', sortOrder: 26 },
    { name: 'Yağ Ekleme Pompaları', slug: 'yag-ekleme-pompalari', sortOrder: 27 },
    { name: 'Vakum Aksesuarları', slug: 'vakum-aksesuarlari', sortOrder: 28 },
    { name: 'Analog Manifold ve Hortumları', slug: 'analog-manifold-hortumlari', sortOrder: 29 },
    { name: 'Oda Termostatları', slug: 'oda-termostatlari', sortOrder: 30 },
  ]
  const cats: Record<string, any> = {}
  for (const c of categoryData) {
    cats[c.slug] = await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: { ...c, isActive: true } })
  }
  console.log(`${categoryData.length} kategori oluşturuldu.`)

  // ===================== ÜRÜNLER (Her marka için 6 demo ürün) =====================
  const products = [
    // FERNOX (inhibitörler, temizleyiciler, filtreler vb.)
    { name: 'Fernox Protector F1', slug: 'fernox-protector-f1', brand: 'fernox', cat: 'inhibitorler-protektor-koruyucular', price: 850, cur: 'TRY', sku: 'FRN-001' },
    { name: 'Fernox Cleaner F3', slug: 'fernox-cleaner-f3', brand: 'fernox', cat: 'temizleyiciler', price: 920, cur: 'TRY', sku: 'FRN-002' },
    { name: 'Fernox Leak Sealer F4', slug: 'fernox-leak-sealer-f4', brand: 'fernox', cat: 'sizinti-kacak-gidericiler', price: 780, cur: 'TRY', sku: 'FRN-003' },
    { name: 'Fernox TF1 Compact Filtre', slug: 'fernox-tf1-compact-filtre', brand: 'fernox', cat: 'filtreler', price: 2450, cur: 'TRY', sku: 'FRN-004' },
    { name: 'Fernox TF1 Filtre Paketi', slug: 'fernox-tf1-filtre-paketi', brand: 'fernox', cat: 'filtre-paketleri', price: 3200, cur: 'TRY', sku: 'FRN-005' },
    { name: 'Fernox Alphi-11 Antifriz', slug: 'fernox-alphi-11-antifriz', brand: 'fernox', cat: 'isi-pompalari-isi-transfer-sivilari', price: 1650, cur: 'TRY', sku: 'FRN-006' },
    // REGEN (sirkülasyon pompaları)
    { name: 'Regen RGN 25-60 Sirkülasyon Pompası', slug: 'regen-rgn-25-60', brand: 'regen', cat: 'sirkulasyon-pompalari', price: 3500, cur: 'TRY', sku: 'RGN-001' },
    { name: 'Regen RGN 25-40 Sirkülasyon Pompası', slug: 'regen-rgn-25-40', brand: 'regen', cat: 'sirkulasyon-pompalari', price: 2800, cur: 'TRY', sku: 'RGN-002' },
    { name: 'Regen RGN 32-60 Sirkülasyon Pompası', slug: 'regen-rgn-32-60', brand: 'regen', cat: 'sirkulasyon-pompalari', price: 4200, cur: 'TRY', sku: 'RGN-003' },
    { name: 'Regen RGN 25-80 Sirkülasyon Pompası', slug: 'regen-rgn-25-80', brand: 'regen', cat: 'sirkulasyon-pompalari', price: 5100, cur: 'TRY', sku: 'RGN-004' },
    { name: 'Regen RGN 32-80 Sirkülasyon Pompası', slug: 'regen-rgn-32-80', brand: 'regen', cat: 'sirkulasyon-pompalari', price: 5800, cur: 'TRY', sku: 'RGN-005' },
    { name: 'Regen RGN 40-60 Sirkülasyon Pompası', slug: 'regen-rgn-40-60', brand: 'regen', cat: 'sirkulasyon-pompalari', price: 6500, cur: 'TRY', sku: 'RGN-006' },

    // TAİFU (drenaj pompaları, sirkülasyon)
    { name: 'Taifu TPSP-250 Drenaj Pompası', slug: 'taifu-tpsp-250', brand: 'taifu', cat: 'drenaj-pompalari', price: 45, cur: 'USD', sku: 'TFU-001' },
    { name: 'Taifu TPSP-400 Drenaj Pompası', slug: 'taifu-tpsp-400', brand: 'taifu', cat: 'drenaj-pompalari', price: 65, cur: 'USD', sku: 'TFU-002' },
    { name: 'Taifu TSP-750 Dalgıç Pompa', slug: 'taifu-tsp-750', brand: 'taifu', cat: 'drenaj-pompalari', price: 85, cur: 'USD', sku: 'TFU-003' },
    { name: 'Taifu TGP-100 Sirkülasyon Pompası', slug: 'taifu-tgp-100', brand: 'taifu', cat: 'sirkulasyon-pompalari', price: 55, cur: 'USD', sku: 'TFU-004' },
    { name: 'Taifu TGP-200 Sirkülasyon Pompası', slug: 'taifu-tgp-200', brand: 'taifu', cat: 'sirkulasyon-pompalari', price: 72, cur: 'USD', sku: 'TFU-005' },
    { name: 'Taifu TPSP-550 Drenaj Pompası', slug: 'taifu-tpsp-550', brand: 'taifu', cat: 'drenaj-pompalari', price: 78, cur: 'USD', sku: 'TFU-006' },

    // GENERAL LIFE / WEST THERM (oda termostatları, el aletleri)
    { name: 'West Therm WTR-100 Oda Termostatı', slug: 'west-therm-wtr-100', brand: 'general-life-west-therm', cat: 'oda-termostatlari', price: 1200, cur: 'TRY', sku: 'GLW-001' },
    { name: 'West Therm WTR-200 Dijital Termostat', slug: 'west-therm-wtr-200', brand: 'general-life-west-therm', cat: 'oda-termostatlari', price: 1850, cur: 'TRY', sku: 'GLW-002' },
    { name: 'West Therm WTR-300 Kablosuz Termostat', slug: 'west-therm-wtr-300', brand: 'general-life-west-therm', cat: 'oda-termostatlari', price: 2400, cur: 'TRY', sku: 'GLW-003' },
    { name: 'General Life GL-Pense Seti', slug: 'general-life-gl-pense-seti', brand: 'general-life-west-therm', cat: 'el-aletleri', price: 950, cur: 'TRY', sku: 'GLW-004' },
    { name: 'General Life GL-Tornavida Seti', slug: 'general-life-gl-tornavida-seti', brand: 'general-life-west-therm', cat: 'el-aletleri', price: 750, cur: 'TRY', sku: 'GLW-005' },
    { name: 'West Therm WTR-400 Akıllı Termostat', slug: 'west-therm-wtr-400', brand: 'general-life-west-therm', cat: 'oda-termostatlari', price: 3200, cur: 'TRY', sku: 'GLW-006' },
    // BLACK DIAMOND (klima yıkama, temizleme)
    { name: 'Black Diamond BD-100 Klima Yıkama Makinesi', slug: 'bd-100-klima-yikama', brand: 'black-diamond', cat: 'klima-yikama-makineleri', price: 120, cur: 'EUR', sku: 'BD-001' },
    { name: 'Black Diamond BD-200 Pro Yıkama Makinesi', slug: 'bd-200-pro-yikama', brand: 'black-diamond', cat: 'klima-yikama-makineleri', price: 185, cur: 'EUR', sku: 'BD-002' },
    { name: 'Black Diamond BD-Clean Temizleme Aparatı', slug: 'bd-clean-temizleme', brand: 'black-diamond', cat: 'klima-temizleme-aparatlari', price: 65, cur: 'EUR', sku: 'BD-003' },
    { name: 'Black Diamond BD-Vac Vakum Pompası', slug: 'bd-vac-vakum-pompasi', brand: 'black-diamond', cat: 'vakum-pompalari-vakum-yagi', price: 210, cur: 'EUR', sku: 'BD-004' },
    { name: 'Black Diamond BD-300 Endüstriyel Yıkama', slug: 'bd-300-endustriyel-yikama', brand: 'black-diamond', cat: 'klima-yikama-makineleri', price: 320, cur: 'EUR', sku: 'BD-005' },
    { name: 'Black Diamond BD-Oil Vakum Yağı 1L', slug: 'bd-oil-vakum-yagi', brand: 'black-diamond', cat: 'vakum-pompalari-vakum-yagi', price: 28, cur: 'EUR', sku: 'BD-006' },

    // VENTE (vakum aksesuarları, analog manifold)
    { name: 'Vente VN-Manifold 2 Yollu', slug: 'vente-vn-manifold-2', brand: 'vente', cat: 'analog-manifold-sarj-hortumlari', price: 1800, cur: 'TRY', sku: 'VNT-001' },
    { name: 'Vente VN-Manifold 4 Yollu', slug: 'vente-vn-manifold-4', brand: 'vente', cat: 'analog-manifold-sarj-hortumlari', price: 2600, cur: 'TRY', sku: 'VNT-002' },
    { name: 'Vente VN-Hortum Seti 3lü', slug: 'vente-vn-hortum-seti', brand: 'vente', cat: 'analog-manifold-hortumlari', price: 950, cur: 'TRY', sku: 'VNT-003' },
    { name: 'Vente VN-Vakum Aksesuar Seti', slug: 'vente-vn-vakum-aksesuar', brand: 'vente', cat: 'vakum-aksesuarlari', price: 1400, cur: 'TRY', sku: 'VNT-004' },
    { name: 'Vente VN-Yağ Ekleme Pompası', slug: 'vente-vn-yag-ekleme', brand: 'vente', cat: 'yag-ekleme-pompalari', price: 2200, cur: 'TRY', sku: 'VNT-005' },
    { name: 'Vente VN-Şarj Hortumu 1.5m', slug: 'vente-vn-sarj-hortumu', brand: 'vente', cat: 'analog-manifold-sarj-hortumlari', price: 450, cur: 'TRY', sku: 'VNT-006' },

    // WIPCOOL (vakum pompaları, klima ekipmanları)
    { name: 'Wipcool VP-115 Vakum Pompası', slug: 'wipcool-vp-115', brand: 'wipcool', cat: 'vakum-pompalari-vakum-yagi', price: 95, cur: 'USD', sku: 'WPC-001' },
    { name: 'Wipcool VP-230 Vakum Pompası', slug: 'wipcool-vp-230', brand: 'wipcool', cat: 'vakum-pompalari-vakum-yagi', price: 145, cur: 'USD', sku: 'WPC-002' },
    { name: 'Wipcool VP-345 Pro Vakum Pompası', slug: 'wipcool-vp-345', brand: 'wipcool', cat: 'vakum-pompalari-vakum-yagi', price: 210, cur: 'USD', sku: 'WPC-003' },
    { name: 'Wipcool Akıllı Vakum Pompası', slug: 'wipcool-akilli-vakum', brand: 'wipcool', cat: 'akilli-vakum-pompasi', price: 320, cur: 'USD', sku: 'WPC-004' },
    { name: 'Wipcool Dijital Manifold WK-6889', slug: 'wipcool-dijital-manifold', brand: 'wipcool', cat: 'dijital-manifold', price: 280, cur: 'USD', sku: 'WPC-005' },
    { name: 'Wipcool Vakum Ölçüm Cihazı', slug: 'wipcool-vakum-olcum', brand: 'wipcool', cat: 'vakum-olcum-cihazlari', price: 175, cur: 'USD', sku: 'WPC-006' },
    // TESTO (ölçüm cihazları)
    { name: 'Testo 310 Baca Gazı Analiz Cihazı', slug: 'testo-310-baca-gazi', brand: 'testo', cat: 'baca-gazi-analiz-cihazlari', price: 450, cur: 'EUR', sku: 'TST-001' },
    { name: 'Testo 320 Baca Gazı Analiz Cihazı', slug: 'testo-320-baca-gazi', brand: 'testo', cat: 'baca-gazi-analiz-cihazlari', price: 680, cur: 'EUR', sku: 'TST-002' },
    { name: 'Testo 549i Akıllı Prob', slug: 'testo-549i-akilli-prob', brand: 'testo', cat: 'akilli-prob', price: 220, cur: 'EUR', sku: 'TST-003' },
    { name: 'Testo 552i Dijital Vakum Ölçer', slug: 'testo-552i-vakum-olcer', brand: 'testo', cat: 'vakum-olcum-cihazlari', price: 310, cur: 'EUR', sku: 'TST-004' },
    { name: 'Testo 316-2 Gaz Kaçak Dedektörü', slug: 'testo-316-2-gaz-kacak', brand: 'testo', cat: 'dogalgaz-kacak-dedektoru', price: 520, cur: 'EUR', sku: 'TST-005' },
    { name: 'Testo 872 Termal Kamera', slug: 'testo-872-termal-kamera', brand: 'testo', cat: 'termal-kameralar', price: 1850, cur: 'EUR', sku: 'TST-006' },
  ]

  // Döviz kurları
  const rates: Record<string, number> = { TRY: 1, USD: 32.50, EUR: 35.20 }

  for (const p of products) {
    const priceTRY = p.cur === 'TRY' ? p.price : p.price * rates[p.cur]
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        priceCurrency: p.cur,
        priceOriginal: p.price,
        priceTRY: Math.round(priceTRY * 100) / 100,
        stock: Math.floor(Math.random() * 50) + 5,
        brandId: brands[p.brand].id,
        categoryId: cats[p.cat].id,
        isActive: true,
        isFeatured: Math.random() > 0.6,
        description: `${p.name} - Profesyonel kullanım için tasarlanmış yüksek kaliteli ürün.`,
        minOrder: 1,
      },
    })
  }
  console.log(`${products.length} ürün oluşturuldu.`)

  // ===================== B2B İNDİRİMLER (GLOBAL) =====================
  // Genel bayi indirimi %10
  await (prisma as any).b2BDiscount.create({
    data: { scopeType: 'GENERAL', discount: 10 },
  })
  // Fernox markasına %20 indirim (tüm bayiler)
  await (prisma as any).b2BDiscount.create({
    data: { scopeType: 'BRAND', brandId: brands['fernox'].id, discount: 20 },
  })
  // Testo markasına %15 indirim (tüm bayiler)
  await (prisma as any).b2BDiscount.create({
    data: { scopeType: 'BRAND', brandId: brands['testo'].id, discount: 15 },
  })
  console.log('B2B indirimleri oluşturuldu.')

  // ===================== SİTE AYARLARI =====================
  const settings = [
    { key: 'site_name', value: 'Mekanik Parça Deposu' },
    { key: 'site_description', value: 'İKİ M İKLİMLENDİRME SİSTEMLERİ TİC. LTD. ŞTİ. - Isıtma sistemleri uzmanı' },
    { key: 'site_phone', value: '0216 232 40 52' },
    { key: 'site_mobile', value: '0532 640 40 86' },
    { key: 'site_email', value: 'info@2miklimlendirme.com.tr' },
    { key: 'site_address', value: 'Atatürk Mah. Alemdağ Cad. No:140-144 İç Kapı No:19, Ümraniye, İstanbul' },
    { key: 'whatsapp_number', value: '905326404086' },
    { key: 'company_name', value: 'İKİ M İKLİMLENDİRME SİSTEMLERİ TİCARET LİMİTED ŞİRKETİ' },
  ]
  for (const s of settings) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s })
  }
  console.log('Site ayarları oluşturuldu.')
  console.log('Seed tamamlandı!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
