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
        <p className="text-sm text-gray-400 mb-10">Son Güncelleme: 02/05/2026</p>

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
              Ödeme yöntemleri: Kredi kartı (tek çekim ve taksit), Banka Havalesi/EFT.
            </p>
            <p className="mt-2">
              Kredi kartı işlemleri <strong>PayTR</strong> ödeme altyapısı üzerinden 256-bit SSL ile güvenli şekilde gerçekleştirilir; kart bilgileriniz Satıcı tarafından saklanmaz.
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
                <a href="mailto:info@2miklimlendirme.com.tr" className="text-primary-600 hover:underline">
                  info@2miklimlendirme.com.tr
                </a>{' '}
                adresine veya{' '}
                <a href="tel:05326404086" className="text-primary-600 hover:underline">0532 640 40 86</a>{' '}
                WhatsApp üzerinden sipariş numarası ile bildirim yapılmalıdır.
              </li>
              <li>İade edilecek ürün; kullanılmamış, zarar görmemiş, mümkünse orijinal ambalajında ve tüm aksesuarlarıyla gönderilmelidir.</li>
            </ul>
            <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
              <strong>Cayma hakkı istisnaları:</strong> Ambalajı açılmış kimyasal ürünler (inhibitör, koruyucu, temizleyici, kaçak gidericiler, ısı transfer sıvıları, solar sıvılar vb.) hijyen ve karışım/bütünlük güvenliği nedeniyle cayma kapsamı dışındadır. Müşteri talebiyle özel tedarik edilen, standart stok dışı ürünlerde de cayma hakkı uygulanmaz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">7. İade Süreci ve Ücret İadesi</h2>
            <p>
              İade onaylandığında ücret iadesi <strong>7 iş günü içinde</strong> yapmış olduğunuz ödeme yöntemine gerçekleştirilir. Kredi kartı iadelerinin hesabınıza yansıma süresi bankanıza göre 1–3 iş günü daha sürebilir. Kargo/komisyon iadeleri, mevzuat ve sözleşmeye göre değişebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">8. Garanti ve Teknik Destek</h2>
            <p>
              Yetkili satıcı olduğumuz tüm ürünler üretici garantisi kapsamındadır (genelde 2 yıl, model bazında değişebilir; ürün sayfasında belirtilir). Garanti süreci içinde sorun yaşadığınızda WhatsApp veya telefonla bize ulaşmanız yeterlidir; üretici servis koordinasyonu, kargolama ve değişim süreçlerini biz yönetiriz. Teknik destek ve servis süreçlerinde müşteriden ürün seri numarası/fatura talep edilebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">9. Stok, Tedarik ve Bölünmüş Teslimat</h2>
            <p>
              Stok/tedarik durumuna göre siparişler bölünerek gönderilebilir. Birden fazla parçada gönderim yapıldığında her bir gönderim için kargo bedeli alıcıya aittir; durum siparişin işleme alındığı sırada müşteriye bildirilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">10. Kargo Bedeli</h2>
            <p>
              Sitede satılan tüm ürünlerde kargo bedeli alıcıya aittir ve sipariş tutarına dahil değildir. Sipariş onayı sonrasında MDP anlaşmalı kargo firması ve ödeme yöntemi (kapıda kargo ücreti tahsilatı veya gönderici hesabına aktarım) alıcıya bildirilir. Detaylı bilgi için{' '}
              <Link href="/teslimat-kosullari" className="text-primary-600 hover:underline">Teslimat Koşulları</Link>{' '}
              sayfamızı inceleyiniz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">11. Kampanya ve Kuponlar</h2>
            <p>
              Kampanyalar belirli süre ve stokla sınırlıdır. Yanlış fiyat, bariz yazım hatası veya sistemsel hata durumunda Satıcı siparişi iptal edebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">12. Dolandırıcılık Şüphesi ve Güvenlik</h2>
            <p>
              Güvenlik gerekçesiyle bazı siparişlerde ek doğrulama istenebilir. Şüpheli işlemlerde sipariş iptal edilerek ücret iade edilebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">13. İletişim ve Şikayet Yönetimi</h2>
            <div className="bg-gray-50 rounded-xl p-5 text-sm space-y-2">
              <p className="font-semibold text-base">İKİ M İKLİMLENDİRME SİSTEMLERİ TİC. LTD. ŞTİ.</p>
              <p><strong>Adres:</strong> Atatürk Mah. Alemdağ Cad. No:140-144 İç Kapı No:19, Ümraniye, İSTANBUL – Türkiye</p>
              <p><strong>Mersis No:</strong> 0470146256100001</p>
              <p><strong>Ticaret Sicil No:</strong> 1020432</p>
              <p><strong>Vergi Dairesi/No:</strong> Ümraniye / 4701462561</p>
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
              <p><strong>Çalışma Saatleri:</strong> Pazartesi – Cumartesi 08:30 – 18:00 · Pazar Kapalı</p>
              <p className="pt-2">
                <a
                  href="https://wa.me/905326404086?text=Merhaba%2C%20siteniz%20%C3%BCzerinden%20size%20ula%C5%9F%C4%B1yorum.%20Bilgi%20alabilirmiyim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp&apos;tan Yaz
                </a>
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
