import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Çerez Politikası | Mekanik Parça Deposu',
  description: 'Çerezlerin kullanımı ve yönetimi hakkında bilgilendirme.',
}

export default function CerezPolitikasiPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-2 text-corporate-dark">Çerez (Cookie) Politikası</h1>
      <p className="text-sm text-gray-500 mb-10">Son Güncelleme: 02/05/2026</p>

      <p className="mb-8 text-gray-700 leading-relaxed">
        Bu politika, mekanikparcadeposu.com (&quot;Site&quot;) üzerinden kullanılan çerezlere ilişkin açıklamaları içerir. Çerezler aracılığıyla işlenen kişisel veriler hakkında detaylı bilgi için{' '}
        <Link href="/kvkk-aydinlatma-metni" className="text-primary-600 hover:underline">KVKK Aydınlatma Metni</Link>{' '}
        ve{' '}
        <Link href="/gizlilik-politikasi" className="text-primary-600 hover:underline">Gizlilik Politikası</Link>{' '}
        sayfalarımızı inceleyiniz.
      </p>

      <section className="space-y-8 leading-relaxed">

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">1. Çerez Nedir?</h2>
          <p className="text-gray-700">
            Çerezler, Site&apos;yi ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır. Site&apos;nin çalışması, güvenliği ve kullanıcı deneyimi için kullanılır.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">2. Hangi Tür Çerezleri Kullanıyoruz?</h2>
          <p className="mb-4 text-gray-700">Site&apos;de kullanılan çerezler genel olarak şunlardır:</p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">(a) Zorunlu Çerezler</h3>
              <p className="text-gray-700">
                Site&apos;nin temel işlevleri (oturum açma, sepet, güvenlik, CSRF koruması) için gereklidir. Bu kategoride NextAuth tarafından oluşturulan oturum ve CSRF çerezleri (next-auth.session-token, next-auth.csrf-token vb.) ile sepet ve oturum yönetimi için kullanılan tarayıcı saklama mekanizmaları yer alır. Bu çerezler kapatılamaz; aksi halde Site&apos;de oturum açma, sepete ürün ekleme ve ödeme adımları çalışmaz.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">(b) İşlevsellik Çerezleri</h3>
              <p className="text-gray-700">Dil/tercih hatırlama gibi işlevleri sağlar.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">(c) Performans / Analitik Çerezleri</h3>
              <p className="text-gray-700">
                Site performansını ve kullanım istatistiklerini ölçmeye yarar (sayfa görüntüleme, ziyaret süresi, e-ticaret etkileşimleri vb.). Sitemizde Google Tag Manager (GTM) altyapısı kullanılır; GTM container&apos;ı üzerinden Google Analytics ve benzeri analiz araçları çalıştırılabilir. Bu çerezler için açık rıza/onay gerekir.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">(d) Pazarlama / Reklam Çerezleri</h3>
              <p className="text-gray-700">
                Kampanya ölçümü ve ilgi alanına uygun reklam gösterimi için kullanılır. Sitemizde Google Tag Manager (GTM) container&apos;ı üzerinden Google Ads dönüşüm ölçümü, yeniden pazarlama (remarketing) ve sosyal medya pazarlama pikselleri çalıştırılabilir. Bu çerezler için açık rıza/onay gerekir.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">3. Hangi Bilgiler Toplanır?</h2>
          <p className="text-gray-700">
            Çerezler yoluyla; IP adresi, cihaz ve tarayıcı bilgisi, oturum bilgileri, sayfa etkileşimleri gibi veriler toplanabilir. Kredi kartı bilgileri çerezlerle saklanmaz.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">4. Çerezlerin Kullanım Amaçları</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Site&apos;nin çalışmasını sağlamak (sepet/oturum)</li>
            <li>Güvenliği sağlamak ve suistimali önlemek</li>
            <li>Kullanıcı tercihlerini hatırlamak</li>
            <li>Analiz/istatistik üretmek</li>
            <li>Reklam/kampanya performansını ölçmek</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">5. Saklama Süreleri</h2>
          <p className="mb-3 text-gray-700">Çerez saklama süreleri kategori bazında değişir:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li><strong>Oturum çerezleri (NextAuth dahil):</strong> tarayıcı oturumu kapatıldığında veya kullanıcı çıkış yaptığında silinir.</li>
            <li><strong>Kalıcı çerezler (tercih hatırlama vb.):</strong> işleve göre 1 oturumdan 24 aya kadar saklanır.</li>
            <li><strong>Üçüncü taraf analitik/pazarlama çerezleri (GTM aracılığıyla bağlananlar dahil):</strong> ilgili hizmet sağlayıcısının saklama politikasına bağlıdır.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">6. Çerezleri Nasıl Yönetebilirsiniz?</h2>
          <p className="mb-3 text-gray-700">
            Tarayıcı ayarlarınızdan çerezleri silebilir, engelleyebilir veya izin tercihlerinizi belirleyebilirsiniz. Yaygın tarayıcılarda çerez yönetim yolları:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li><strong>Chrome:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler</li>
            <li><strong>Firefox:</strong> Tercihler → Gizlilik ve Güvenlik → Çerezler ve Site Verileri</li>
            <li><strong>Safari:</strong> Tercihler → Gizlilik</li>
            <li><strong>Edge:</strong> Ayarlar → Çerezler ve Site İzinleri</li>
          </ul>
          <p className="mt-3 text-gray-700">
            Zorunlu çerezleri engellemeniz halinde Site&apos;nin oturum açma, sepet ve ödeme bölümleri çalışmayabilir.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">7. Üçüncü Taraf Çerezleri</h2>
          <p className="mb-3 text-gray-700">Site&apos;de üçüncü taraf hizmet sağlayıcılara ait çerezler kullanılır:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <strong>Ödeme süreci:</strong> PayTR ödeme altyapısı (paytr.com domain&apos;inde) — ödeme adımı süresince kart işlemi için kullanılan 3rd-party çerezler.
            </li>
            <li>
              <strong>Etiket yönetimi:</strong> Google Tag Manager (GTM) — site üzerinden tetiklenen analiz/pazarlama araçlarının kontrol katmanı.
            </li>
            <li>
              <strong>GTM aracılığıyla bağlanan üçüncü taraf araçlar:</strong> Google Analytics, Google Ads (dönüşüm ölçümü ve yeniden pazarlama) ve sosyal medya pazarlama pikselleri gibi araçlar GTM container&apos;ı üzerinden çalıştırılabilir.
            </li>
          </ul>
          <p className="mt-3 text-gray-700">
            Üçüncü taraf hizmetlerin kendi gizlilik politikalarına ilgili sağlayıcıların web sitelerinden ulaşabilirsiniz:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 mt-2">
            <li>
              Google:{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                policies.google.com/privacy
              </a>
            </li>
            <li>
              PayTR:{' '}
              <a href="https://www.paytr.com/kvkk" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                paytr.com/kvkk
              </a>
            </li>
          </ul>
          <p className="mt-3 text-gray-700">
            Bu hizmetlerin çerez kullanımına ilişkin sorumlulukları ilgili sağlayıcılara aittir.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">8. Veri Sorumlusu ve İletişim</h2>
          <ul className="space-y-1 text-gray-700">
            <li className="font-semibold text-base text-gray-800">İKİ M İKLİMLENDİRME SİSTEMLERİ TİC. LTD. ŞTİ.</li>
            <li><strong>Adres:</strong> Atatürk Mah. Alemdağ Cad. No:140-144 İç Kapı No:19, Ümraniye, İstanbul – Türkiye</li>
            <li><strong>Mersis No:</strong> 0470146256100001</li>
            <li><strong>Ticaret Sicil No:</strong> 1020432</li>
            <li><strong>Vergi Dairesi/No:</strong> Ümraniye / 4701462561</li>
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
          </ul>
        </div>

      </section>
    </main>
  )
}
