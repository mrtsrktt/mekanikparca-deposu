import type { Metadata } from 'next'
import { FiTarget, FiEye, FiCheckCircle, FiFileText } from 'react-icons/fi'
import CertificateCard from '@/components/CertificateCard'
import { DEALERSHIP_CERTIFICATES } from '@/lib/dealership-certificates'

export const metadata: Metadata = {
  title: 'Hakkımızda — Yetkili Satıcı | Mekanik Parça Deposu',
  description:
    'İKİ M İklimlendirme bünyesinde faaliyet gösteren Mekanik Parça Deposu; Lega, REGEN, Testo ve MRU markalarının yetkili satıcısıdır. Kurumsal bilgiler ve bayilik belgeleri.',
}

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <a href="/" className="hover:text-primary-500">Ana Sayfa</a>
        <span>/</span>
        <span className="text-gray-800">Hakkımızda</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">Hakkımızda</h1>
      <p className="text-lg text-primary-600 font-semibold mb-8">Mekanik Tesisat ve HVAC Ürünlerinde Güvenilir Tedarik Noktası</p>

      {/* Ana Tanıtım */}
      <div className="card p-8 mb-8">
        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-4">
          <p>
            Mekanik Parça Deposu, 30 yılı aşkın sektör tecrübesine sahip kurucusunun bilgi birikimi ve saha deneyimi üzerine kurulmuş;
            ısıtma, soğutma ve mekanik tesisat alanında faaliyet gösteren profesyonel bir teknik tedarik firmasıdır.
          </p>
          <p>
            Sektörde uzun yıllar lider markalarla çalışmış olmanın verdiği deneyimle, servis firmalarının, ustaların ve proje satın alma
            ekiplerinin ihtiyaç duyduğu ürünleri güvenilir markalardan temin ederek doğru fiyat, güçlü stok ve hızlı sevkiyat avantajıyla
            müşterilerimize sunuyoruz.
          </p>

          <p className="font-semibold text-gray-700">Ana faaliyet alanımız;</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-600">
            <li>Isıtma sistemleri</li>
            <li>Tesisat kimyasalları</li>
            <li>Sirkülasyon pompaları</li>
            <li>Manyetik filtre sistemleri</li>
            <li>HVAC servis ekipmanları</li>
            <li>Ölçüm ve test cihazları</li>
          </ul>
          <p>gibi profesyonel ürün gruplarını kapsar.</p>
          <p>
            Biz yalnızca ürün satışı yapmıyoruz; doğru ürün seçimi ve teknik destek süreçlerinde de müşterilerimizin yanında yer alıyoruz.
          </p>
        </div>
      </div>

      {/* Vizyon & Misyon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Vizyon */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center">
              <FiEye className="w-6 h-6 text-primary-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Vizyonumuz</h2>
          </div>
          <div className="text-gray-600 leading-relaxed space-y-3">
            <p>
              Mekanik Parça Deposu olarak hedefimiz; mekanik tesisat ve HVAC sektöründe güvenilir, sürdürülebilir ve referans gösterilen
              bir teknik tedarik markası olmaktır.
            </p>
            <p>
              Gelişen teknolojiyi yakından takip ederek ürün portföyümüzü sürekli güncelliyor, sektördeki yenilikleri müşterilerimize
              hızlı ve doğru şekilde ulaştırmayı amaçlıyoruz.
            </p>
            <p>
              Uzun vadeli iş birlikleri kurmak, toptancı ve profesyonel müşterilerimiz için güçlü bir çözüm ortağı olmak vizyonumuzun
              temelini oluşturur.
            </p>
          </div>
        </div>

        {/* Misyon */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl flex items-center justify-center">
              <FiTarget className="w-6 h-6 text-accent-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Misyonumuz</h2>
          </div>
          <div className="text-gray-600 leading-relaxed space-y-3">
            <p>
              Misyonumuz; müşterilerimizin ihtiyaçlarını doğru analiz ederek, kaliteli ve güvenilir ürünleri rekabetçi fiyatlarla sunmak
              ve ticarette karşılıklı güveni esas alan kalıcı ilişkiler kurmaktır.
            </p>
            <ul className="space-y-2">
              {[
                'Müşteri memnuniyetini öncelik kabul ederiz.',
                'Ticarette saygı ve şeffaflık ilkesine bağlı kalırız.',
                'Sadece satış değil, çözüm sunarız.',
                'Sürekli gelişimi hedefleriz.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <FiCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              Profesyonel servis firmaları ve toptancı müşterilerimiz için güçlü stok yapımız, hızlı sevkiyat altyapımız ve teknik destek
              yaklaşımımız ile sürdürülebilir iş ortaklıkları kurmayı amaçlıyoruz.
            </p>
          </div>
        </div>
      </div>

      {/* Kurumsal Bilgiler */}
      <div className="card p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center">
            <FiFileText className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Kurumsal Bilgiler</h2>
        </div>

        <p className="text-gray-700 mb-6">
          Mekanik Parça Deposu, <strong>İKİ M İKLİMLENDİRME SİSTEMLERİ TİCARET LİMİTED ŞİRKETİ</strong> bünyesinde faaliyet gösteren bir e-ticaret markasıdır. Aşağıdaki kurumsal bilgilerimiz şeffaflık ve tüketici güvencesi amacıyla yayımlanmıştır.
        </p>

        <dl className="divide-y divide-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3">
            <dt className="text-sm font-semibold text-gray-600">Ticaret Unvanı</dt>
            <dd className="sm:col-span-2 text-sm text-gray-800">İKİ M İKLİMLENDİRME SİSTEMLERİ TİC. LTD. ŞTİ.</dd>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 bg-gray-50/50 -mx-2 px-2 rounded">
            <dt className="text-sm font-semibold text-gray-600">Marka</dt>
            <dd className="sm:col-span-2 text-sm text-gray-800">Mekanik Parça Deposu</dd>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3">
            <dt className="text-sm font-semibold text-gray-600">Mersis No</dt>
            <dd className="sm:col-span-2 text-sm text-gray-800 font-mono">0470146256100001</dd>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 bg-gray-50/50 -mx-2 px-2 rounded">
            <dt className="text-sm font-semibold text-gray-600">Ticaret Sicil No</dt>
            <dd className="sm:col-span-2 text-sm text-gray-800 font-mono">1020432</dd>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3">
            <dt className="text-sm font-semibold text-gray-600">Vergi Dairesi / No</dt>
            <dd className="sm:col-span-2 text-sm text-gray-800">Ümraniye / 4701462561</dd>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 bg-gray-50/50 -mx-2 px-2 rounded">
            <dt className="text-sm font-semibold text-gray-600">Adres</dt>
            <dd className="sm:col-span-2 text-sm text-gray-800">Atatürk Mah. Alemdağ Cad. No:140-144 İç Kapı No:19, Ümraniye / İstanbul / Türkiye</dd>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3">
            <dt className="text-sm font-semibold text-gray-600">Telefon</dt>
            <dd className="sm:col-span-2 text-sm text-gray-800">
              <a href="tel:02162324052" className="hover:text-primary-600">0216 232 40 52</a>
            </dd>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 bg-gray-50/50 -mx-2 px-2 rounded">
            <dt className="text-sm font-semibold text-gray-600">GSM / WhatsApp</dt>
            <dd className="sm:col-span-2 text-sm text-gray-800">
              <a href="tel:05326404086" className="hover:text-primary-600">0532 640 40 86</a>
            </dd>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3">
            <dt className="text-sm font-semibold text-gray-600">E-posta</dt>
            <dd className="sm:col-span-2 text-sm text-gray-800">
              <a href="mailto:info@2miklimlendirme.com.tr" className="hover:text-primary-600">info@2miklimlendirme.com.tr</a>
            </dd>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 bg-gray-50/50 -mx-2 px-2 rounded">
            <dt className="text-sm font-semibold text-gray-600">Çalışma Saatleri</dt>
            <dd className="sm:col-span-2 text-sm text-gray-800">Pazartesi – Cumartesi: 08:30 – 18:00 · Pazar: Kapalı</dd>
          </div>
        </dl>
      </div>

      {/* Yetkili Bayiliklerimiz */}
      <section id="bayilikler" className="py-12 md:py-16 bg-slate-50 -mx-4 px-4 rounded-2xl scroll-mt-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Yetkili Bayiliklerimiz
          </h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full" />
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
            Sektörün öncü markalarının resmi yetkili satıcısıyız. Tüm
            ürünlerimiz orijinal ve üretici garantilidir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEALERSHIP_CERTIFICATES.map((cert) => (
            <CertificateCard key={cert.brand} certificate={cert} />
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'İKİ M İKLİMLENDİRME SİSTEMLERİ TİC. LTD. ŞTİ.',
            alternateName: 'Mekanik Parça Deposu',
            url: 'https://mekanikparcadeposu.com',
            telephone: '+902162324052',
            email: 'info@2miklimlendirme.com.tr',
            address: {
              '@type': 'PostalAddress',
              streetAddress:
                'Atatürk Mah. Alemdağ Cad. No:140-144 İç Kapı No:19',
              addressLocality: 'Ümraniye',
              addressRegion: 'İstanbul',
              addressCountry: 'TR',
            },
            taxID: '4701462561',
            identifier: [
              { '@type': 'PropertyValue', propertyID: 'MERSIS', value: '0470146256100001' },
              { '@type': 'PropertyValue', propertyID: 'TicaretSicilNo', value: '1020432' },
            ],
            hasCredential: DEALERSHIP_CERTIFICATES.map((c) => ({
              '@type': 'EducationalOccupationalCredential',
              name: c.certificateTitle,
              credentialCategory: 'Yetkili Satıcı Belgesi',
              recognizedBy: { '@type': 'Organization', name: c.brandDisplayName },
              url: `https://mekanikparcadeposu.com${c.pdfPath}`,
            })),
          }),
        }}
      />
    </div>
  )
}
