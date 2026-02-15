import { FiTarget, FiEye, FiAward } from 'react-icons/fi'

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Hakkımızda</h1>

      <div className="card p-8 mb-8">
        <p className="text-lg text-gray-600 leading-relaxed">
          Mekanik Parça Deposu olarak, mekanik tesisat, HVAC, ısıtma-soğutma sistemleri ve
          teknik servis ekipmanları alanında sektörün güvenilir tedarikçisi olarak hizmet vermekteyiz.
          Geniş ürün yelpazemiz ve uzman kadromuzla hem bireysel hem de kurumsal müşterilerimize
          en kaliteli ürünleri en uygun fiyatlarla sunmaktayız.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: FiTarget, title: 'Misyonumuz', desc: 'Mekanik tesisat sektöründe müşterilerimize en kaliteli ürünleri, en hızlı ve güvenilir şekilde ulaştırmak.' },
          { icon: FiEye, title: 'Vizyonumuz', desc: 'Türkiye\'nin lider mekanik tesisat ve HVAC yedek parça tedarikçisi olmak.' },
          { icon: FiAward, title: 'Değerlerimiz', desc: 'Güvenilirlik, kalite, müşteri memnuniyeti ve sürekli gelişim ilkelerimizin temelini oluşturur.' },
        ].map((item, i) => (
          <div key={i} className="card p-6 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <item.icon className="w-8 h-8 text-primary-500" />
            </div>
            <h2 className="font-semibold text-lg mb-2">{item.title}</h2>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
