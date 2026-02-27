export default function IadePolitikasiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">İade ve Değişim Politikası</h1>
      
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
              <h2 className="text-2xl font-semibold mb-4">1. İade Hakkı</h2>
              <p className="mb-4">
                6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği 
                hükümlerine göre, satın aldığınız ürünleri teslim tarihinden itibaren 14 (ondört) 
                gün içinde herhangi bir gerekçe göstermeden ve cezai şart ödemeden iade etme hakkına sahipsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. İade Koşulları</h2>
              <p className="mb-3">İade kabul edilebilmesi için ürünlerin aşağıdaki koşulları sağlaması gerekmektedir:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Ürün orijinal ambalajında ve etiketleriyle birlikte olmalıdır</li>
                <li>Ürün kullanılmamış, hasar görmemiş ve temiz olmalıdır</li>
                <li>Ürünün tüm aksesuarları ve belgeleri eksiksiz olmalıdır</li>
                <li>Ürün üzerinde herhangi bir değişiklik yapılmamış olmalıdır</li>
                <li>İade süresi 14 günü geçmemiş olmalıdır</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. İade Edilemeyecek Ürünler</h2>
              <p className="mb-3">Aşağıdaki ürünler iade kapsamı dışındadır:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Müşteri isteğiyle kişiselleştirilmiş ürünler</li>
                <li>Hijyenik nedenlerle iade edilemeyen ürünler</li>
                <li>Açıldıktan sonra sağlık veya hijyen açısından iade edilemeyen ürünler</li>
                <li>Tek kullanımlık ürünler</li>
                <li>Gazete, dergi ve benzeri periyodik yayınlar</li>
                <li>Elektronik içerikler (yazılım, dijital ürünler)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. İade Süreci</h2>
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 text-primary-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold">İade Talebi Oluşturma</h3>
                    <p className="text-sm text-gray-600">
                      Hesabınızda "Siparişlerim" bölümünden iade etmek istediğiniz siparişi seçin 
                      ve "İade Talebi Oluştur" butonuna tıklayın.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 text-primary-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold">Ürünü Hazırlama</h3>
                    <p className="text-sm text-gray-600">
                      Ürünü orijinal ambalajına koyun, tüm aksesuarları ve belgeleri ekleyin. 
                      İade formunu paketin içine koyun.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 text-primary-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold">Kargoya Verme</h3>
                    <p className="text-sm text-gray-600">
                      Size gönderilecek kargo etiketini paketin üzerine yapıştırın ve en yakın 
                      kargo şubesine teslim edin.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 text-primary-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-semibold">İade Onayı ve Ödeme</h3>
                    <p className="text-sm text-gray-600">
                      Ürün kontrol edildikten sonra iadeniz onaylanır ve ödemeniz 7 iş günü 
                      içinde iade edilir.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. İade Ücretleri</h2>
              <p className="mb-3">
                Ürün kusurlu değilse ve iade 14 günlük yasal süre içinde yapılıyorsa, 
                iade kargo ücreti müşteriye aittir. Kusurlu ürün iadelerinde kargo ücreti 
                firmamız tarafından karşılanır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Para İadesi</h2>
              <p className="mb-3">
                İadeniz onaylandıktan sonra, ödemeniz aşağıdaki şekillerde iade edilir:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Kredi kartı ile yapılan ödemeler: Kartınıza iade edilir (7-10 iş günü)</li>
                <li>Havale/EFT ile yapılan ödemeler: Banka hesabınıza iade edilir (3-5 iş günü)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Değişim</h2>
              <p className="mb-3">
                Ürün değişimi için önce iade işlemi yapılır, ardından yeni ürün siparişi verilir. 
                Değişim işlemlerinde kargo ücretleri her iki yönde de müşteriye aittir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Arızalı veya Kusurlu Ürünler</h2>
              <p className="mb-3">
                Teslim aldığınız üründe herhangi bir arıza veya kusur tespit ederseniz, 
                lütfen 2 iş günü içinde bizimle iletişime geçin. Arızalı ürünler için:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Kargo ücreti firmamız tarafından karşılanır</li>
                <li>Ürün onarımı veya değişimi yapılır</li>
                <li>Onarım mümkün değilse para iadesi yapılır</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Garanti</h2>
              <p className="mb-3">
                Tüm ürünlerimiz üretici garantisi kapsamındadır. Garanti süreleri ürünlere göre değişiklik gösterebilir. 
                Garanti kapsamındaki ürünler için lütfen üretici firma ile iletişime geçin veya bizimle iletişim kurun.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. İletişim</h2>
              <p className="mb-3">
                İade ve değişim ile ilgili sorularınız için lütfen bizimle iletişime geçin:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>İKİ M İKLİMLENDİRME SİSTEMLERİ TİCARET LİMİTED ŞİRKETİ</strong></p>
                <p>E-posta: info@2miklimlendirme.com.tr</p>
                <p>Telefon: 0216 232 40 52</p>
                <p>GSM: 0532 640 40 86</p>
                <p className="text-sm text-gray-600 mt-2">
                  Çalışma saatleri: Pazartesi - Cuma 09:00 - 18:00
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Önemli Not</h2>
              <p>
                Bu iade politikası, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve ilgili 
                mevzuat hükümlerine uygun olarak hazırlanmıştır. Kanun ve yönetmeliklerde 
                değişiklik olması durumunda, bu politika da güncellenecektir.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}