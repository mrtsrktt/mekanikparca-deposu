import Link from 'next/link'

export default function GizlilikPolitikasiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Gizlilik Politikası</h1>

      <div className="card p-8">
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">Son güncelleme: 02/05/2026</p>

          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Giriş</h2>
              <p className="mb-4">
                İKİ M İKLİMLENDİRME SİSTEMLERİ TİCARET LİMİTED ŞİRKETİ (Mekanik Parça Deposu) olarak,
                gizliliğinize ve kişisel verilerinizin güvenliğine büyük önem veriyoruz. Şirketimiz,
                6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında &quot;veri sorumlusu&quot;
                sıfatıyla hareket etmektedir. Bu Gizlilik Politikası, mekanikparcadeposu.com web sitesini
                ziyaret ettiğinizde veya hizmetlerimizi kullandığınızda kişisel verilerinizin nasıl
                toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
              </p>
              <p>
                KVKK kapsamındaki veri işleme süreçleri, hukuki sebepleri ve detaylı haklarınız için{' '}
                <Link href="/kvkk-aydinlatma-metni" className="text-primary-600 hover:underline">
                  KVKK Aydınlatma Metni
                </Link>{' '}
                sayfamızı inceleyiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Toplanan Bilgiler</h2>
              <p className="mb-3">Topladığımız bilgiler şunları içerebilir:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Adınız, soyadınız, e-posta adresiniz, telefon numaranız</li>
                <li>Fatura ve teslimat adresiniz</li>
                <li>Ödeme bilgileri (kredi kartı bilgileri güvenli ödeme sistemleri aracılığıyla işlenir)</li>
                <li>Sipariş geçmişiniz</li>
                <li>İletişim tercihleriniz</li>
                <li>Teknik veriler (IP adresi, tarayıcı türü, cihaz bilgileri)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Bilgilerin Kullanım Amacı</h2>
              <p className="mb-3">Kişisel verileriniz aşağıdaki amaçlarla kullanılır:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Siparişlerinizi işlemek ve teslim etmek</li>
                <li>Hesabınızı yönetmek</li>
                <li>Müşteri hizmetleri sağlamak</li>
                <li>Yasal yükümlülüklerimizi yerine getirmek</li>
                <li>Size özel teklifler ve promosyonlar sunmak (izin verirseniz)</li>
                <li>Web sitemizi geliştirmek</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Veri Güvenliği</h2>
              <p className="mb-3">
                Kişisel verilerinizin güvenliği bizim için önemlidir. Verilerinizi yetkisiz erişime,
                değiştirilmeye, ifşa edilmeye veya imhaya karşı korumak için uygun fiziksel, elektronik
                ve yönetsel prosedürler uyguluyoruz.
              </p>
              <p>
                Ödeme işlemleri PayTR ödeme altyapısı üzerinden 256-bit SSL ile güvenli şekilde
                gerçekleştirilir; kredi kartı bilgileriniz Satıcı sistemlerinde saklanmaz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Çerezler (Cookies)</h2>
              <p className="mb-3">
                Web sitemiz çerezler kullanır. Çerezler, web sitemizi ziyaretiniz sırasında
                tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır.
              </p>
              <p>
                Çerezleri, web sitemizin düzgün çalışması, güvenliğin sağlanması, site trafiğinin
                analiz edilmesi ve kullanıcı deneyimini iyileştirmek için kullanıyoruz. Çerez türleri,
                kullanım amaçları ve yönetim seçenekleri için{' '}
                <Link href="/cerez-politikasi" className="text-primary-600 hover:underline">
                  Çerez Politikası
                </Link>{' '}
                sayfamızı inceleyiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Veri Paylaşımı</h2>
              <p className="mb-3">
                Kişisel verilerinizi, aşağıdaki durumlar dışında üçüncü taraflarla paylaşmıyoruz:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <strong>Hizmet sağlayıcılarımız:</strong> anlaşmalı kargo firmaları (sipariş teslimatı için ad, adres, telefon), PayTR ödeme altyapısı (ödeme işlemi için kart sahibi adı ve tutar bilgisi), e-arşiv fatura altyapısı sağlayıcısı (faturalandırma için fatura bilgileri), bulut barındırma altyapısı (teknik kayıt verileri).
                </li>
                <li>
                  <strong>Yasal yükümlülükler kapsamında</strong> yetkili kamu kurum ve kuruluşlarına bilgi talepleri.
                </li>
              </ul>
              <p>
                Hizmet sağlayıcılarımız, KVKK&apos;ya uygun veri işleme/aktarım sözleşmeleri ile bağlıdır
                ve verilerinizi yalnızca hizmet ifası amacıyla işlerler.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Haklarınız</h2>
              <p className="mb-3">
                6698 sayılı KVKK Madde 11 kapsamında kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Verilerinize erişim hakkı</li>
                <li>Düzeltme hakkı</li>
                <li>Silinme / yok edilme hakkı</li>
                <li>İşleme itiraz hakkı</li>
                <li>Veri taşınabilirliği hakkı</li>
                <li>Hatalı işleme nedeniyle ortaya çıkan zararın giderilmesi hakkı</li>
              </ul>
              <p>
                Detaylı bilgi ve başvuru süreçleri için{' '}
                <Link href="/kvkk-aydinlatma-metni" className="text-primary-600 hover:underline">
                  KVKK Aydınlatma Metni
                </Link>{' '}
                sayfamızı inceleyiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Veri Saklama Süresi</h2>
              <p>
                Kişisel verileriniz, ilgili mevzuatın öngördüğü süreler boyunca saklanır (Türk Borçlar
                Kanunu, Vergi Usul Kanunu ve Türk Ticaret Kanunu kapsamında en az 10 yıl). Saklama
                süresi sona eren veriler silinir, yok edilir veya anonim hale getirilir. Saklama
                süreleri ve yöntemleri hakkında detaylı bilgi için{' '}
                <Link href="/kvkk-aydinlatma-metni" className="text-primary-600 hover:underline">
                  KVKK Aydınlatma Metni
                </Link>{' '}
                sayfamızı inceleyiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Yurt Dışı Veri Aktarımı</h2>
              <p>
                Sitemizin barındırma altyapısı ve bazı teknik servisler (CDN, e-posta) sebebiyle
                teknik kayıt verileriniz (IP adresi, oturum verisi vb.) yurt dışı sunuculardan
                geçebilir. Bu aktarımlar KVKK Madde 9 kapsamında yeterli koruma sağlanan ülkelerde
                veya sözleşme güvencesiyle gerçekleştirilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. İletişim</h2>
              <p className="mb-3">
                Gizlilik politikamızla ilgili sorularınız veya haklarınızı kullanmak istiyorsanız bize ulaşın:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1.5">
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

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Politika Değişiklikleri</h2>
              <p>
                Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Değişiklikler yayınlandığında
                bu sayfayı güncelleyeceğiz. Değişikliklerden haberdar olmak için bu politikayı düzenli
                olarak kontrol etmenizi öneririz.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
