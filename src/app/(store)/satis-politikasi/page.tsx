import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Satış Politikası | Mekanik Parça Deposu',
  description: 'Mekanikparcadeposu.com satış, ödeme, iade ve müşteri hizmetleri politikası.',
}

export default function SatisPolitikasiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-primary-500">Ana Sayfa</Link>
        <span>/</span>
        <span className="text-gray-800">Satış Politikası</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Satış Politikası</h1>
        <p className="text-sm text-gray-400 mb-10">Son Güncelleme: 02/03/2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">1. Amaç ve Kapsam</h2>
            <p>
              Bu Satış Politikası, <strong>mekanikparcadeposu.com</strong> üzerinden verilen siparişlerin oluşturulması, ödeme, fatura, iptal/iade ve müşteri hizmetleri süreçlerine ilişkin temel kuralları düzenler.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">2. Ürün Bilgileri ve Fiyatlandırma</h2>
            <p>
              Sitede yer alan ürün görselleri ve açıklamalar bilgilendirme amaçlıdır. Teknik özellikler üretici/tedarikçi güncellemelerine göre değişebilir.
            </p>
            <p className="mt-2">
              Ürün fiyatları ve stok durumu güncellenebilir. Siparişin onaylandığı anda ekranda görülen fiyat geçerlidir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">3. Sipariş Oluşturma ve Onay</h2>
            <p>
              Sipariş, müşteri tarafından sepetin onaylanması ve ödeme adımının tamamlanması ile oluşturulur. Ödeme onayı alınmadan sipariş işleme alınmaz.
            </p>
            <p className="mt-2">
              Satıcı, stok hatası/tedarik sorunu/şüpheli işlem gibi durumlarda siparişi iptal etme hakkını saklı tutar; müşteriye bilgi verilir ve tahsilat iade edilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">4. Ödeme Yöntemleri</h2>
            <p>
              Ödeme yöntemleri: Kredi Kartı / Havale-EFT.
            </p>
            <p className="mt-2">
              Kredi kartı işlemleri <strong>PayTR</strong> ödeme altyapısı üzerinden güvenli şekilde gerçekleştirilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">5. Faturalandırma</h2>
            <p>
              Fatura, sipariş sırasında girilen fatura bilgilerine göre düzenlenir. E-Fatura/E-Arşiv uygulanıyorsa müşteriye e-posta ile iletilebilir. Fatura bilgileri doğru girilmelidir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">6. İptal, İade ve Cayma Hakkı</h2>
            <p>
              Müşteri, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve ilgili Mesafeli Sözleşmeler Yönetmeliği çerçevesinde cayma hakkına sahiptir.
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Cayma süresi:</strong> Ürün tesliminden itibaren 14 gün.</li>
              <li>
                Cayma hakkının kullanımı için{' '}
                <a href="mailto:2miklimlendirmesistemleri@gmail.com" className="text-primary-600 hover:underline">
                  2miklimlendirmesistemleri@gmail.com
                </a>{' '}
                adresine sipariş numarası ile yazılı bildirim yapılmalıdır.
              </li>
              <li>İade edilecek ürün; kullanılmamış, zarar görmemiş, mümkünse orijinal ambalajında ve tüm aksesuarlarıyla gönderilmelidir.</li>
            </ul>
            <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
              <strong>Cayma hakkı istisnaları:</strong> Mevzuat gereği; müşterinin istekleri doğrultusunda özel olarak hazırlanan ürünler, ambalajı açılmış hijyenik ürünler, niteliği gereği iadesi uygun olmayan ürünler vb. ürünlerde cayma hakkı sınırlandırılabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">7. İade Süreci ve Ücret İadesi</h2>
            <p>
              İade onaylandığında ücret iadesi, ödeme yöntemine bağlı olarak <strong>1–10 iş günü</strong> içerisinde gerçekleştirilir. Kargo/komisyon iadeleri, mevzuat ve sözleşmeye göre değişebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">8. Garanti ve Teknik Destek</h2>
            <p>
              Garanti kapsamındaki ürünlerde üretici/ithalatçı garanti şartları geçerlidir. Teknik destek ve servis süreçlerinde müşteriden ürün seri numarası/fatura talep edilebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">9. Stok, Tedarik ve Bölünmüş Teslimat</h2>
            <p>
              Stok/tedarik durumuna göre siparişler bölünerek gönderilebilir. Bu durumda ek kargo ücreti alınacaksa müşteriye önceden bildirilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">10. Kampanya ve Kuponlar</h2>
            <p>
              Kampanyalar belirli süre ve stokla sınırlıdır. Yanlış fiyat, bariz yazım hatası veya sistemsel hata durumunda Satıcı siparişi iptal edebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">11. Dolandırıcılık Şüphesi ve Güvenlik</h2>
            <p>
              Güvenlik gerekçesiyle bazı siparişlerde ek doğrulama istenebilir. Şüpheli işlemlerde sipariş iptal edilerek ücret iade edilebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">12. İletişim ve Şikayet Yönetimi</h2>
            <div className="bg-gray-50 rounded-xl p-5 text-sm space-y-2">
              <p>
                <strong>E-posta:</strong>{' '}
                <a href="mailto:2miklimlendirmesistemleri@gmail.com" className="text-primary-600 hover:underline">
                  2miklimlendirmesistemleri@gmail.com
                </a>
              </p>
              <p>
                <strong>Telefon:</strong>{' '}
                <a href="tel:05326404086" className="text-primary-600 hover:underline">0532 640 40 86</a>
              </p>
              <p><strong>Adres:</strong> Atatürk Mah. Alemdağ Cad. No:140-144 İç Kapı No:19, Ümraniye, İSTANBUL – Türkiye</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
