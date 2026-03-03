import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Çerez Politikası | Mekanik Parça Deposu',
  description: 'Çerezlerin kullanımı ve yönetimi hakkında bilgilendirme.',
}

export default function CerezPolitikasiPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-2 text-corporate-dark">Çerez (Cookie) Politikası</h1>
      <p className="text-sm text-gray-500 mb-10">Son Güncelleme: 03.03.2026</p>

      <p className="mb-8 text-gray-700 leading-relaxed">
        Bu politika, mekanikparcadeposu.com (&quot;Site&quot;) üzerinden kullanılan çerezlere ilişkin açıklamaları içerir.
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
              <p className="text-gray-700">Site&apos;nin temel işlevleri (oturum açma, sepet, güvenlik) için gereklidir. Bu çerezler kapatılamaz.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">(b) İşlevsellik Çerezleri</h3>
              <p className="text-gray-700">Dil/tercih hatırlama gibi işlevleri sağlar.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">(c) Performans / Analitik Çerezleri (Varsa)</h3>
              <p className="text-gray-700">Site performansını ve kullanım istatistiklerini ölçmeye yarar (ör. sayfa görüntüleme, ziyaret süresi). Bu çerezler için izin gerekebilir.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">(d) Pazarlama / Reklam Çerezleri (Varsa)</h3>
              <p className="text-gray-700">Kampanya ölçümü ve ilgi alanına uygun reklam gösterimi için kullanılabilir. Bu çerezler için açık rıza/izin alınır.</p>
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
            <li>(Varsa) Analiz/istatistik üretmek</li>
            <li>(Varsa) Reklam/kampanya performansını ölçmek</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">5. Çerezleri Nasıl Yönetebilirsiniz?</h2>
          <p className="text-gray-700">
            Tarayıcı ayarlarınızdan çerezleri silebilir, engelleyebilir veya izin tercihi belirleyebilirsiniz. Zorunlu çerezleri engellemeniz halinde Site&apos;nin bazı bölümleri çalışmayabilir.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">6. Üçüncü Taraf Çerezleri (Varsa)</h2>
          <p className="text-gray-700">
            Site&apos;de; ödeme (PayTR), analiz (ör. Google Analytics), reklam (ör. Meta/Google) gibi üçüncü taraf hizmetler kullanılabilir. Bu hizmetlerin çerez kullanımına ilişkin sorumlulukları ilgili sağlayıcılara aittir.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">7. Veri Sorumlusu ve İletişim</h2>
          <ul className="space-y-1 text-gray-700">
            <li><strong>Veri sorumlusu:</strong> İKİ M İKLİMLENDİRME SİSTEMLERİ TİC. LTD. ŞTİ.</li>
            <li>
              <strong>E-posta:</strong>{' '}
              <a href="mailto:2miklimlendirmesistemleri@gmail.com" className="text-primary-600 hover:underline">
                2miklimlendirmesistemleri@gmail.com
              </a>
            </li>
            <li>
              <strong>Telefon:</strong>{' '}
              <a href="tel:02162324052" className="text-primary-600 hover:underline">0 (216) 232 40 52</a>
            </li>
          </ul>
        </div>

      </section>
    </main>
  )
}
