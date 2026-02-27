export default function GizlilikPolitikasiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Gizlilik Politikası</h1>
      
      <div className="card p-8">
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Giriş</h2>
              <p className="mb-4">
                İKİ M İKLİMLENDİRME SİSTEMLERİ TİCARET LİMİTED ŞİRKETİ (Mekanik Parça Deposu) olarak, 
                gizliliğinize ve kişisel verilerinizin güvenliğine büyük önem veriyoruz. Bu Gizlilik Politikası, 
                mekanikparcadeposu.com web sitesini ziyaret ettiğinizde veya hizmetlerimizi kullandığınızda 
                kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
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
                Ödeme işlemleri için güvenli ödeme ağ geçitleri kullanıyoruz ve kredi kartı bilgileriniz 
                asla sistemlerimizde saklanmaz.
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
                analiz edilmesi ve kullanıcı deneyimini iyileştirmek için kullanıyoruz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Veri Paylaşımı</h2>
              <p className="mb-3">
                Kişisel verilerinizi, aşağıdaki durumlar dışında üçüncü taraflarla paylaşmıyoruz:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Yasal zorunluluklar gereği</li>
                <li>Hizmet sağlayıcılarımız (kargo firmaları, ödeme işlemcileri)</li>
                <li>Yasal yetkili makamlara yasal zorunluluklar gereği</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Haklarınız</h2>
              <p className="mb-3">Kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Verilerinize erişim hakkı</li>
                <li>Düzeltme hakkı</li>
                <li>Silinme hakkı</li>
                <li>İşleme itiraz hakkı</li>
                <li>Veri taşınabilirliği hakkı</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. İletişim</h2>
              <p className="mb-3">
                Gizlilik politikamızla ilgili sorularınız veya haklarınızı kullanmak istiyorsanız, 
                lütfen bizimle iletişime geçin:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>İKİ M İKLİMLENDİRME SİSTEMLERİ TİCARET LİMİTED ŞİRKETİ</strong></p>
                <p>E-posta: info@2miklimlendirme.com.tr</p>
                <p>Telefon: 0216 232 40 52</p>
                <p>GSM: 0532 640 40 86</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Politika Değişiklikleri</h2>
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