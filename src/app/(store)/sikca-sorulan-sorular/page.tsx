type FaqItem = { q: string; a: React.ReactNode }
type FaqCategory = { title: string; items: FaqItem[] }

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: 'Sipariş Süreci',
    items: [
      {
        q: 'Sipariş nasıl veririm?',
        a: 'Ürün sayfasındaki "Sepete Ekle" butonuyla ürünü sepetinize ekleyin, sepetten "Ödemeye Geç" diyerek bilgilerinizi girip ödemeyi tamamlayın. Sipariş takibi, iade süreci ve fatura görüntüleme için hesap açmanız gerekir; üyelik 1 dakika sürer.',
      },
      {
        q: 'Stok durumu nasıl kontrol edilir?',
        a: 'Tüm ürün sayfalarında stok durumu canlı gösterilir. "Stokta Var" ürünler aynı gün kargoya verilir. Stoğu görmediğiniz ürünler için WhatsApp\'tan ulaşıp tedarik süresini öğrenebilirsiniz.',
      },
      {
        q: 'Toplu / firma siparişlerinde özel süreç var mı?',
        a: 'Birden fazla ünite veya proje bazlı siparişlerde firma faturalı özel fiyatlandırma sunuyoruz. WhatsApp üzerinden teklif alabilirsiniz.',
      },
      {
        q: 'Faturamı nasıl alırım?',
        a: 'Tüm siparişlerde e-arşiv fatura sipariş onayı ile birlikte e-posta adresinize iletilir. Firma faturası için sipariş aşamasında firma unvanı ve vergi numaranızı girmeniz yeterlidir.',
      },
      {
        q: 'Siparişimi iptal edebilir miyim?',
        a: 'Henüz kargoya verilmemiş siparişlerinizi WhatsApp veya telefon üzerinden iptal edebilirsiniz. Kargoya verilmiş siparişler için iade süreci işler.',
      },
    ],
  },
  {
    title: 'Teslimat ve Kargo',
    items: [
      {
        q: 'Kargo ücreti ne kadar?',
        a: 'Kargo bedeli alıcıya aittir ve sipariş tutarına dahil değildir. Kargo firması ve ödeme yöntemi sipariş onayı sonrasında alıcıya bildirilir.',
      },
      {
        q: 'Sipariş kaç günde elime ulaşır?',
        a: 'Stoktaki ürünler aynı gün kargoya verilir, en geç 2 iş günü içinde teslim edilir. Hafta sonu ve resmi tatillerde kargolama yapılmaz.',
      },
      {
        q: 'Hangi kargo firması ile gönderiyorsunuz?',
        a: 'Anlaşmalı kargo firmalarımızla teslimat yapılır. Gönderim sonrası kargo firması ve takip kodu WhatsApp/SMS ile iletilir.',
      },
      {
        q: 'Kargo takibi nasıl yapılır?',
        a: 'Tarafınıza iletilen takip kodu ile ilgili kargo firmasının web sitesinden veya hesabınızdan sipariş detayı sayfasından takip edebilirsiniz.',
      },
      {
        q: 'Kargom hasarlı geldi, ne yapmalıyım?',
        a: 'Teslim alırken paketi kargo görevlisi ile birlikte kontrol edin; hasar varsa tutanak tutturun. Hasarlı teslim aldıysanız 48 saat içinde fotoğraflarla bize ulaşın, değişim sürecini başlatalım.',
      },
    ],
  },
  {
    title: 'Ödeme Seçenekleri',
    items: [
      {
        q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
        a: 'Kredi kartı (tek çekim ve taksit) ve banka havalesi/EFT ile ödeme alıyoruz.',
      },
      {
        q: 'Kredi kartı taksit imkanı var mı?',
        a: 'Mevcut taksit seçenekleri ödeme sayfasında bankanıza göre görüntülenir.',
      },
      {
        q: 'Havale/EFT bilgileri nedir?',
        a: 'Banka hesap bilgilerimiz ödeme sayfasında ve sipariş onay e-postasında yer alır. Havale/EFT ile ödenen siparişler ödeme onayı sonrası kargolanır.',
      },
      {
        q: 'Firma için açık fatura veya anlaşmalı ödeme var mı?',
        a: 'Düzenli çalıştığımız firmalarla anlaşmalı ödeme koşulları görüşülebilir. Detay için WhatsApp veya telefon üzerinden ulaşın.',
      },
    ],
  },
  {
    title: 'İade ve Değişim',
    items: [
      {
        q: 'İade hakkım kaç gün?',
        a: 'Tüketicinin Korunması Hakkında Kanun gereği teslim aldığınız tarihten itibaren 14 gün içinde cayma hakkınız bulunmaktadır. Detaylar İade Politikası sayfamızda.',
      },
      {
        q: 'İade kargo ücretini kim öder?',
        a: 'Ürün hasarlı, hatalı veya yanlış gönderildiyse iade kargosu tarafımıza aittir. Cayma hakkı kapsamındaki iadelerde kargo ücreti alıcıya aittir.',
      },
      {
        q: 'Açılmış / kullanılmış ürün iade edilir mi?',
        a: 'Hijyenik nedenlerle ambalajı açılmış kimyasal ürünler (inhibitör, koruyucu, temizleyici, ısı transfer sıvıları vb.) iade kapsamında değildir. Diğer ürünlerde orijinal ambalaj ve fatura ile iade alınır.',
      },
      {
        q: 'Para iadesi ne sürede yapılır?',
        a: 'İade kabul edildikten sonra 7 iş günü içinde ödeme yaptığınız yönteme iade yapılır. Kredi kartı iadelerinin hesabınıza yansıması bankanıza göre 1–3 iş günü daha sürebilir.',
      },
      {
        q: 'Ürün arızalı çıkarsa ne olur?',
        a: 'Üretici garantisi kapsamındaki arızalar için WhatsApp üzerinden bize ulaşın; süreci (kargolama, servis koordinasyonu, değişim) biz yönetiriz.',
      },
    ],
  },
  {
    title: 'Teknik Destek',
    items: [
      {
        q: 'Ürünlerin garanti süresi nedir?',
        a: 'Yetkili satıcı olduğumuz markaların ürünleri 2 yıl üretici garantisi ile sunulur (model bazında değişiklik olabilir, ürün sayfasında belirtilir). LEGA, FERNOX, REGEN, MRU ve TESTO ürünlerinde standart üretici garantisi uygulanır.',
      },
      {
        q: 'Hangi modeli almalıyım, nasıl seçim yaparım?',
        a: (
          <>
            <a href="/urunler?brand=lega" className="text-primary-600 hover:underline">Lega marka sayfasındaki</a> &quot;Hangi Model Bana Uygun?&quot; rehberini kullanabilir veya WhatsApp üzerinden bize ulaşıp uzman ekibimizden öneri alabilirsiniz. Tesisinizin yükü, kullanım amacı ve fiziksel koşullarına göre doğru modeli birlikte belirleriz.
          </>
        ),
      },
      {
        q: 'Kurulum hizmeti veriyor musunuz?',
        a: 'Kurulum, ürünün üretici yetkili teknik servisi tarafından yapılmalıdır. Mekanik Parça Deposu satış kanalı olduğundan kurulum hizmeti vermemekteyiz; modelinize uygun yetkili servis bilgisi için WhatsApp üzerinden bize ulaşabilirsiniz, sizi doğru kanala yönlendirelim.',
      },
      {
        q: 'WhatsApp üzerinden teknik destek nasıl çalışır?',
        a: '0532 640 40 86 numarasından WhatsApp ile bize ulaşabilirsiniz. Mesai saatleri (Pazartesi–Cumartesi 08:30–18:00) içinde aynı gün, dışında ertesi iş günü dönüş yapılır. Soru detayını ve varsa ürün/sipariş bilgisini paylaşmanız hızlı çözüme yardımcı olur.',
      },
      {
        q: 'Garanti süresinde sorun yaşarsam?',
        a: 'WhatsApp veya telefonla bize ulaşın. Üretici garantisi kapsamındaki tüm süreci (kargolama, servis koordinasyonu, değişim) biz yönetiriz.',
      },
    ],
  },
]

export default function SSSCikcaSorulanSorularPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Sıkça Sorulan Sorular</h1>

      <div className="card p-8">
        <p className="text-gray-600 text-center mb-8">
          Sipariş, teslimat, ödeme, iade ve teknik destek konularında en sık aldığımız sorular ve cevapları aşağıdadır. Cevabını bulamadığınız bir sorunuz varsa WhatsApp üzerinden bize ulaşabilirsiniz.
        </p>

        <div className="space-y-6">
          {FAQ_CATEGORIES.map((cat) => (
            <div key={cat.title} className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">{cat.title}</h2>
              <div className="space-y-4">
                {cat.items.map((item, i) => (
                  <div key={i}>
                    <h3 className="font-semibold text-gray-800 mb-1">{item.q}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-6">
            <h2 className="text-xl font-semibold mb-3">Daha Fazla Sorunuz Mu Var?</h2>
            <p className="text-gray-600 mb-4">
              Yukarıda cevabını bulamadığınız bir sorunuz varsa{' '}
              <a href="tel:05326404086" className="text-primary-600 hover:underline">0532 640 40 86</a> WhatsApp,{' '}
              <a href="tel:02162324052" className="text-primary-600 hover:underline">0216 232 40 52</a> telefon veya{' '}
              <a href="mailto:info@2miklimlendirme.com.tr" className="text-primary-600 hover:underline">info@2miklimlendirme.com.tr</a>{' '}
              üzerinden bize ulaşabilirsiniz.
            </p>
            <a
              href="/iletisim"
              className="inline-block btn-primary"
            >
              İletişim Sayfasına Git
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
