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
        <p className="text-sm text-gray-400 mb-10">Son Güncelleme: 22/03/2026</p>

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
              <p><strong>Vergi Dairesi / No:</strong> Ümraniye / 4701462561</p>
              <p>
                <strong>E-posta:</strong>{' '}
                <a href="mailto:info@2miklimlendirme.com.tr" className="text-primary-600 hover:underline">
                  info@2miklimlendirme.com.tr
                </a>
              </p>
              <p>
                <strong>Telefon:</strong>{' '}
                <a href="tel:02162324052" className="text-primary-600 hover:underline">0216 232 40 52</a>
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
              Siparişler anlaşmalı kargo firmaları aracılığıyla gönderilir. Kargo firması: <strong>Aras Kargo.</strong>
            </p>
            <p className="mt-2">
              Kargo takip bilgileri, sipariş kargoya verildiğinde müşteriye iletilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">4. Hazırlama ve Kargoya Teslim Süresi</h2>
            <p>
              Siparişler, ödeme onayı alındıktan sonra <strong>1–3 iş günü</strong> içerisinde kargoya teslim edilir.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Resmî tatiller ve hafta sonları iş günü değildir.</li>
              <li>Yoğun kampanya dönemlerinde teslimat süreleri uzayabilir; bu durumda müşteriye bilgi verilir.</li>
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
              Kargo ücreti sepet tutarına göre hesaplanır. Kargo ücretleri sipariş özetinde gösterilir.
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
              Tutanaksız teslim alınan hasarlı paketlerde sorumluluk kargo firması ile ispat açısından güçleşebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">9. Eksik / Yanlış Ürün Teslimi</h2>
            <p>
              Eksik veya yanlış ürün tesliminde müşteri, teslimat tarihinden itibaren <strong>48 saat</strong> içinde{' '}
              <a href="mailto:info@2miklimlendirme.com.tr" className="text-primary-600 hover:underline">
                info@2miklimlendirme.com.tr
              </a>{' '}
              üzerinden sipariş numarası ile bildirim yapmalıdır.
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
