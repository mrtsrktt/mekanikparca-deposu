import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Teslimat Koşulları | Mekanik Parça Deposu',
  description: 'Mekanikparcadeposu.com teslimat, kargo ve gönderim koşulları.',
}

export default function TeslimatKosullariPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-primary-500">Ana Sayfa</Link>
        <span>/</span>
        <span className="text-gray-800">Teslimat Koşulları</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Teslimat Koşulları</h1>
        <p className="text-sm text-gray-400 mb-10">Son Güncelleme: 02/05/2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">1. Taraflar ve Kapsam</h2>
            <p>
              İşbu Teslimat Koşulları, <strong>İKİ M İKLİMLENDİRME SİSTEMLERİ TİC.LTD.ŞTİ.</strong> (&quot;Satıcı&quot;) tarafından işletilen{' '}
              <strong>mekanikparcadeposu.com</strong> alan adlı internet sitesi üzerinden verilen siparişlerin teslimat süreçlerine ilişkin şartları düzenler.
            </p>
            <div className="mt-4 bg-gray-50 rounded-xl p-5 text-sm space-y-1.5">
              <p><strong>Ünvan:</strong> İKİ M İKLİMLENDİRME SİSTEMLERİ TİC.LTD.ŞTİ.</p>
              <p><strong>Adres:</strong> Atatürk Mah. Alemdağ Cad. No:140-144 İç Kapı No:19, Ümraniye, İSTANBUL – Türkiye</p>
              <p><strong>Mersis No:</strong> 0470146256100001</p>
              <p><strong>Ticaret Sicil No:</strong> 1020432</p>
              <p><strong>Vergi Dairesi / No:</strong> Ümraniye / 4701462561</p>
              <p>
                <strong>Telefon:</strong>{' '}
                <a href="tel:02162324052" className="text-primary-600 hover:underline">0216 232 40 52</a>
              </p>
              <p>
                <strong>GSM / WhatsApp:</strong>{' '}
                <a href="tel:05326404086" className="text-primary-600 hover:underline">0532 640 40 86</a>
              </p>
              <p>
                <strong>E-posta:</strong>{' '}
                <a href="mailto:info@2miklimlendirme.com.tr" className="text-primary-600 hover:underline">
                  info@2miklimlendirme.com.tr
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">2. Teslimat Bölgesi</h2>
            <p>
              Teslimatlar Türkiye Cumhuriyeti sınırları içerisinde yapılır. Yurt dışı gönderim varsa şartlar ayrıca belirtilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">3. Kargo Şirketi ve Gönderim</h2>
            <p>
              Siparişler anlaşmalı kargo firmaları aracılığıyla gönderilir. Gönderim sırasında kargo firması ve takip kodu müşteriye WhatsApp veya SMS yoluyla iletilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">4. Hazırlama ve Kargoya Teslim Süresi</h2>
            <p>
              Stoktaki ürünler ödeme onayı sonrasında <strong>en geç 2 iş günü</strong> içinde kargoya teslim edilir.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Resmî tatiller ve hafta sonları iş günü değildir.</li>
              <li>Yoğun kampanya dönemlerinde teslimat süreleri uzayabilir; bu durumda müşteriye bilgi verilir.</li>
              <li>Stoğu olmayan ürünlerde tedarik süresi, sipariş öncesi WhatsApp üzerinden müşteriye bildirilir.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">5. Teslimat Süresi</h2>
            <p>
              Kargo firmasına bağlı olarak teslimat süresi ortalama <strong>1–5 iş günü</strong> içinde gerçekleşir. Uzak bölge/aktarma bölgelerinde süre uzayabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">6. Kargo Ücreti</h2>
            <p>
              Kargo bedeli alıcıya aittir ve sipariş tutarına dahil değildir. Sipariş onayı sonrasında kargo firması ve ödeme yöntemi (kapıda kargo ücreti tahsilatı veya gönderici hesabına aktarım) alıcıya bildirilir.
            </p>
            <p className="mt-2">
              Yetkili satıcı statümüz kapsamında ürünler orijinal ve faturalı olup, kargo ücreti dahil edilmemiş net ürün fiyatları ile satışa sunulmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">7. Teslimatın Yapılması</h2>
            <p>
              Teslimat, sipariş sırasında belirtilen adrese yapılır. Adres bilgisi hatalı veya eksik ise teslimat gecikebilir ya da yapılamayabilir. Bu durumda oluşabilecek ek kargo/lojistik masrafları müşteriye yansıtılabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">8. Teslim Anında Kontrol ve Hasarlı Ürün</h2>
            <p>
              Müşteri, paketi teslim alırken kargo görevlisi yanında kontrol etmeli; ezilme, yırtılma, ıslanma, kırık gibi hasar durumunda <strong>&quot;Hasar Tespit Tutanağı&quot;</strong> düzenlenmesini istemelidir.
            </p>
            <p className="mt-2">
              Hasarlı teslim alınan paketler için <strong>48 saat</strong> içinde fotoğraflarla{' '}
              <a href="mailto:info@2miklimlendirme.com.tr" className="text-primary-600 hover:underline">
                info@2miklimlendirme.com.tr
              </a>{' '}
              veya{' '}
              <a href="tel:05326404086" className="text-primary-600 hover:underline">0532 640 40 86</a>{' '}
              WhatsApp üzerinden bildirim yapılmalıdır. Tutanaksız teslim alınan hasarlı paketlerde sorumluluk kargo firması ile ispat açısından güçleşebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">9. Eksik / Yanlış Ürün Teslimi</h2>
            <p>
              Eksik veya yanlış ürün tesliminde müşteri, teslimat tarihinden itibaren <strong>48 saat</strong> içinde sipariş numarası ile{' '}
              <a href="mailto:info@2miklimlendirme.com.tr" className="text-primary-600 hover:underline">
                info@2miklimlendirme.com.tr
              </a>{' '}
              veya{' '}
              <a href="tel:05326404086" className="text-primary-600 hover:underline">0532 640 40 86</a>{' '}
              WhatsApp üzerinden bildirim yapmalıdır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">10. Teslim Edilemeyen Gönderiler</h2>
            <p>
              Müşterinin adreste bulunmaması, yanlış adres/telefon gibi nedenlerle teslim edilemeyen gönderiler kargo firması prosedürüne göre şubeye yönlendirilebilir veya iade edilebilir. İade halinde yeniden gönderim masrafı müşteriye ait olabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">11. Mücbir Sebepler</h2>
            <p>
              Doğal afet, savaş, salgın, grev, yoğun hava koşulları, kargo firması operasyonel aksaklıkları vb. mücbir sebeplerle teslimat gecikebilir. Satıcı bu durumlarda müşteriyi bilgilendirir.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
