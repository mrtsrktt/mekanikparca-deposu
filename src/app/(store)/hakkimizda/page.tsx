import { FiTarget, FiEye, FiCheckCircle } from 'react-icons/fi'

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
    </div>
  )
}
