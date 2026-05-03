import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ön Bilgilendirme Formu | Mekanik Parça Deposu',
  description: 'Sipariş öncesi tüketici bilgilendirme formu.',
}

export default function OnBilgilendirmeFormuPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-2 text-corporate-dark">Ön Bilgilendirme Formu</h1>
      <p className="text-sm text-gray-500 mb-10">Son Güncelleme: 02/05/2026</p>

      <p className="mb-8 text-gray-700 leading-relaxed">
        İşbu Ön Bilgilendirme Formu, mekanikparcadeposu.com üzerinden yapılacak mesafeli satışlar öncesinde 6502 sayılı Kanun ve ilgili mevzuat uyarınca müşterinin bilgilendirilmesi amacıyla hazırlanmıştır.
      </p>

      <section className="space-y-8 leading-relaxed">

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">1. Satıcı Bilgileri</h2>
          <ul className="space-y-1 text-gray-700">
            <li><strong>Ünvan:</strong> İKİ M İKLİMLENDİRME SİSTEMLERİ TİC. LTD. ŞTİ.</li>
            <li><strong>Adres:</strong> Atatürk Mah. Alemdağ Cad. No:140-144 İç Kapı No:19, Ümraniye, İstanbul – Türkiye</li>
            <li><strong>Mersis No:</strong> 0470146256100001</li>
            <li><strong>Ticaret Sicil No:</strong> 1020432</li>
            <li><strong>Vergi Dairesi / VKN:</strong> Ümraniye / 4701462561</li>
            <li>
              <strong>Telefon:</strong>{' '}
              <a href="tel:02162324052" className="text-primary-600 hover:underline">0216 232 40 52</a>
            </li>
            <li>
              <strong>GSM / WhatsApp:</strong>{' '}
              <a href="tel:05326404086" className="text-primary-600 hover:underline">0532 640 40 86</a>
            </li>
            <li>
              <strong>E-posta:</strong>{' '}
              <a href="mailto:info@2miklimlendirme.com.tr" className="text-primary-600 hover:underline">
                info@2miklimlendirme.com.tr
              </a>
            </li>
            <li><strong>KEP:</strong> ikimiklimlendirme@hs01.kep.tr</li>
            <li>
              <strong>Web:</strong>{' '}
              <a href="https://mekanikparcadeposu.com" className="text-primary-600 hover:underline">mekanikparcadeposu.com</a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">2. Sözleşme Konusu Ürün/Hizmet Bilgileri</h2>
          <p className="mb-2 text-gray-700">Siparişe konu ürün/hizmetin;</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>adı, temel nitelikleri, adedi</li>
            <li>satış bedeli (KDV dahil)</li>
            <li>kargo/teslimat bedeli (alıcıya aittir, sipariş tutarına dahil değildir)</li>
          </ul>
          <p className="mt-2 text-gray-700">bilgileri, siparişin son onay ekranında ve/veya fatura üzerinde yer alır.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">3. Toplam Fiyat</h2>
          <p className="text-gray-700">
            Toplam tutar; ürün bedeli + vergilerin toplamıdır ve ödeme adımında müşteriye açıkça gösterilir. Kargo bedeli sipariş tutarına dahil değildir; alıcıya aittir ve kargo firması tarafından ayrıca tahsil edilir.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">4. Ödeme Yöntemleri</h2>
          <p className="text-gray-700">
            Ödeme yöntemleri sitede sunulan seçeneklere göre değişebilir (kredi kartı, havale/EFT vb.). Kredi kartı işlemleri, PayTR ödeme altyapısı üzerinden güvenli şekilde yapılır.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">5. Teslimat ve İfa</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Teslimatlar Türkiye Cumhuriyeti sınırları içinde yapılır.</li>
            <li>Siparişler anlaşmalı kargo firmaları aracılığıyla gönderilir; kargo firması ve takip kodu gönderim sırasında müşteriye WhatsApp veya SMS ile iletilir.</li>
            <li>Stoktaki ürünler ödeme onayı sonrasında en geç 2 iş günü içinde kargoya teslim edilir.</li>
            <li>Kargo firmasına bağlı olarak teslimat süresi ortalama 1–5 iş günü içinde gerçekleşir.</li>
            <li>Kargo bedeli alıcıya aittir; sipariş tutarına dahil değildir.</li>
          </ul>
          <p className="mt-2 text-gray-700">
            Detaylar için{' '}
            <Link href="/teslimat-kosullari" className="text-primary-600 hover:underline">Teslimat Koşulları</Link>{' '}
            sayfasına bakınız.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">6. Cayma Hakkı (Tüketiciler için)</h2>
          <p className="mb-3 text-gray-700">
            Tüketici, ürünü teslim aldığı tarihten itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir.
          </p>
          <p className="mb-2 font-medium text-gray-800">Cayma hakkının kullanımı için:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>
              Sipariş numarası ile birlikte{' '}
              <a href="mailto:info@2miklimlendirme.com.tr" className="text-primary-600 hover:underline">
                info@2miklimlendirme.com.tr
              </a>{' '}
              adresine veya{' '}
              <a href="tel:05326404086" className="text-primary-600 hover:underline">0532 640 40 86</a>{' '}
              WhatsApp üzerinden yazılı bildirim yapılmalıdır.
            </li>
            <li>İade edilecek ürün kullanılmamış ve yeniden satılabilir durumda olmalıdır.</li>
          </ul>
          <p className="mt-3 text-gray-700">
            <strong>Cayma hakkı istisnaları:</strong> Ambalajı açılmış kimyasal ürünler (inhibitör, koruyucu, temizleyici, kaçak gidericiler, ısı transfer sıvıları, solar sıvılar vb.) hijyen ve karışım/bütünlük güvenliği nedeniyle cayma kapsamı dışındadır.
          </p>
          <p className="mt-2 text-gray-700">
            Detaylar için{' '}
            <Link href="/iade-politikasi" className="text-primary-600 hover:underline">İade Politikası</Link>{' '}
            sayfasına bakınız.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">7. Şikâyet ve Uyuşmazlık Çözümü</h2>
          <p className="mb-2 text-gray-700">Müşteri talepleri için:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>
              <strong>E-posta:</strong>{' '}
              <a href="mailto:info@2miklimlendirme.com.tr" className="text-primary-600 hover:underline">
                info@2miklimlendirme.com.tr
              </a>
            </li>
            <li>
              <strong>Telefon:</strong>{' '}
              <a href="tel:02162324052" className="text-primary-600 hover:underline">0216 232 40 52</a>
            </li>
            <li>
              <strong>GSM / WhatsApp:</strong>{' '}
              <a href="tel:05326404086" className="text-primary-600 hover:underline">0532 640 40 86</a>
            </li>
          </ul>
          <p className="mt-3 text-gray-700">
            Uyuşmazlıklarda, Ticaret Bakanlığı&apos;nca belirlenen parasal sınırlara göre tüketici hakem heyetleri ve tüketici mahkemeleri yetkilidir.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">8. Onay</h2>
          <p className="text-gray-700">
            Müşteri, sipariş onayı vermeden önce işbu Ön Bilgilendirme Formu&apos;nu okuduğunu ve bilgilendirildiğini kabul eder.
          </p>
        </div>

      </section>
    </main>
  )
}
