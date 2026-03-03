import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni | Mekanik Parça Deposu',
  description: 'Kişisel verilerin işlenmesine ilişkin KVKK aydınlatma metni.',
}

export default function KvkkPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-2 text-corporate-dark">KVKK Aydınlatma Metni</h1>
      <p className="text-sm text-gray-500 mb-10">Son Güncelleme: 03.03.2026</p>

      <section className="space-y-8 leading-relaxed">

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">1. Veri Sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca veri sorumlusu:
          </p>
          <ul className="mt-3 space-y-1 text-gray-700">
            <li><strong>Ünvan:</strong> İKİ M İKLİMLENDİRME SİSTEMLERİ TİC. LTD. ŞTİ.</li>
            <li><strong>Adres:</strong> Atatürk Mah. Alemdağ Cad. No:140 144 İç Kapı No:19 Ümraniye, İstanbul – Türkiye</li>
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

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">2. İşlenen Kişisel Veriler</h2>
          <p className="mb-3">Site ve hizmetlerin kullanımı kapsamında işlenebilecek verileriniz, işlemin niteliğine göre değişmek üzere şunları içerebilir:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li><strong>Kimlik/iletişim:</strong> ad-soyad, telefon, e-posta, adres</li>
            <li><strong>Müşteri işlem:</strong> sipariş bilgisi, fatura bilgisi, talep/şikâyet kayıtları</li>
            <li><strong>Ödeme işlem:</strong> ödeme sağlayıcı tarafından alınan işlem bilgileri (kart bilgileri tarafımızca saklanmaz)</li>
            <li><strong>İşlem güvenliği:</strong> IP adresi, log kayıtları, cihaz/oturum bilgileri</li>
            <li><strong>Pazarlama (izin varsa):</strong> kampanya/iletişim tercihleri</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">3. Kişisel Verilerin İşlenme Amaçları</h2>
          <p className="mb-3">Kişisel verileriniz;</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Sipariş oluşturma, satış sözleşmesi süreçlerinin yürütülmesi</li>
            <li>Ürünlerin hazırlanması, kargolanması ve teslimatı</li>
            <li>Ödeme süreçlerinin yürütülmesi, sahtecilik/şüpheli işlem kontrolleri</li>
            <li>Faturalandırma ve muhasebe işlemlerinin yürütülmesi</li>
            <li>Müşteri hizmetleri, destek, talep/şikâyet yönetimi</li>
            <li>Site güvenliği, bilgi güvenliği ve hukuki yükümlülüklerin yerine getirilmesi</li>
            <li>Açık rızanız olması halinde pazarlama/duyuru iletişimlerinin yürütülmesi</li>
          </ul>
          <p className="mt-2 text-gray-700">amaçlarıyla işlenebilir.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">4. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebepler</h2>
          <p className="mb-3">
            Verileriniz; web sitesi formları, sipariş/üyelik ekranları, e-posta/telefon/WhatsApp iletişim kanalları, çerezler ve log kayıtları üzerinden otomatik veya kısmen otomatik yöntemlerle toplanabilir.
          </p>
          <p className="mb-2 font-medium">Hukuki sebepler:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Bir sözleşmenin kurulması/ifası için gerekli olması</li>
            <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi</li>
            <li>Meşru menfaat (site güvenliği, suistimal önleme vb.)</li>
            <li>Açık rıza (pazarlama iletileri, bazı çerezler vb.)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">5. Kişisel Verilerin Aktarılması</h2>
          <p className="mb-3">Kişisel verileriniz, amaçlarla sınırlı olmak üzere ve gerekli güvenlik önlemleri alınarak;</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Ödeme altyapısı sağlayıcısı (PayTR)</li>
            <li>Kargo/lojistik firması (Aras Kargo)</li>
            <li>E-fatura/e-arşiv, muhasebe ve finans süreçlerinde kullanılan hizmet sağlayıcıları</li>
            <li>Barındırma (hosting), altyapı ve teknik hizmet sağlayıcıları</li>
            <li>Yetkili kamu kurum ve kuruluşları (yasal yükümlülük halinde)</li>
          </ul>
          <p className="mt-2 text-gray-700">ile paylaşılabilir.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">6. Saklama Süreleri</h2>
          <p>
            Verileriniz, ilgili mevzuatta öngörülen süreler ve işleme amaçları için gerekli olan süre kadar saklanır. Süre bitiminde silinir, yok edilir veya anonim hale getirilir.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">7. KVKK Kapsamındaki Haklarınız</h2>
          <p className="mb-3">KVKK&apos;nın 11. maddesi kapsamında;</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse bilgi talep etme</li>
            <li>Amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde/yurt dışında aktarıldığı 3. kişileri bilme</li>
            <li>Eksik/yanlış işlenmişse düzeltilmesini isteme</li>
            <li>Silinmesini/yok edilmesini isteme</li>
            <li>Aktarılan 3. kişilere bildirilmesini isteme</li>
            <li>Otomatik sistemlerle analiz sonucu aleyhe sonuca itiraz etme</li>
            <li>Kanuna aykırı işlem nedeniyle zararın giderilmesini talep etme</li>
          </ul>
          <p className="mt-2 text-gray-700">haklarına sahipsiniz.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-corporate-dark">8. Başvuru</h2>
          <p>
            Haklarınıza ilişkin taleplerinizi, kimlik doğrulaması yapacak şekilde{' '}
            <a href="mailto:2miklimlendirmesistemleri@gmail.com" className="text-primary-600 hover:underline">
              2miklimlendirmesistemleri@gmail.com
            </a>{' '}
            adresine iletebilirsiniz.
          </p>
        </div>

      </section>
    </main>
  )
}
