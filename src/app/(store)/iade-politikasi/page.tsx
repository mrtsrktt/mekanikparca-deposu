export default function IadePolitikasiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">İade ve Değişim Politikası</h1>
      
      <div className="card p-8">
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">Son güncelleme: 02/05/2026</p>
          
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
                <li>Ambalajı açılmış kimyasal ürünler (inhibitör, koruyucu, temizleyici, kaçak gidericiler, ısı transfer sıvıları, solar sıvılar vb.) — hijyen ve karışım/bütünlük güvenliği nedeniyle.</li>
                <li>Müşteri talebiyle özel olarak tedarik edilmiş, standart stok dışı ürünler.</li>
                <li>Kullanım izi bulunan, fiziksel hasar görmüş veya orijinal ambalajı tahrip edilmiş ürünler.</li>
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
                      Hesabınızda &quot;Siparişlerim&quot; bölümünden iade etmek istediğiniz siparişi seçin 
                      ve &quot;İade Talebi Oluştur&quot; butonuna tıklayın.
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
                      İade onayı sonrası tarafımızca MDP anlaşmalı kargo firmasına ait kargo etiketi size iletilir. Etiketi paketin üzerine yapıştırın ve ilgili kargo firmasının en yakın şubesine teslim edin. Anlaşmalı kanal dışında yapılan gönderimler kabul edilmeyebilir.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 text-primary-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-semibold">İade Onayı ve Ödeme</h3>
                    <p className="text-sm text-gray-600">
                      Ürün kontrol edildikten sonra iadeniz onaylanır ve ödemeniz 7 iş günü içinde yapmış olduğunuz ödeme yöntemine iade edilir. Kredi kartı iadelerinin hesabınıza yansıma süresi bankanıza göre 1–3 iş günü daha sürebilir.
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
                İadeniz onaylandıktan sonra, ödemeniz 7 iş günü içinde yapmış olduğunuz ödeme yöntemine iade edilir:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Kredi kartı ile yapılan ödemeler kartınıza iade edilir; iadenin hesabınıza yansıma süresi bankanıza göre 1–3 iş günü daha sürebilir.</li>
                <li>Havale/EFT ile yapılan ödemeler banka hesabınıza iade edilir.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Değişim</h2>
              <p className="mb-3">
                Ürün değişimi için önce iade işlemi yapılır, ardından yeni ürün siparişi verilir. Üründen kaynaklı bir hata yoksa ve sipariş doğru sevk edilmişse, değişim işleminde hem giden hem dönen kargo ücreti alıcıya aittir. Üründen kaynaklı kusur veya hatalı sevkiyat durumunda kargo ücretleri firmamız tarafından karşılanır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Arızalı veya Kusurlu Ürünler</h2>
              <p className="mb-3">
                Teslim aldığınız üründe arıza veya kusur tespit ederseniz <strong>48 saat</strong> içinde{' '}
                <a href="mailto:info@2miklimlendirme.com.tr" className="text-primary-600 hover:underline">info@2miklimlendirme.com.tr</a>{' '}
                veya{' '}
                <a href="tel:05326404086" className="text-primary-600 hover:underline">0532 640 40 86</a>{' '}
                WhatsApp üzerinden bize ulaşın. Arızalı ürünler için:
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
                Yetkili satıcı olduğumuz tüm ürünler üretici garantisi kapsamındadır (genelde 2 yıl, model bazında değişebilir; ürün sayfasında belirtilir). Garanti süreci içinde sorun yaşadığınızda WhatsApp veya telefonla bize ulaşmanız yeterlidir; üretici servis koordinasyonu, kargolama ve değişim süreçlerini biz yönetiriz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. İletişim</h2>
              <p className="mb-3">
                İade ve değişim ile ilgili sorularınız için bize ulaşın:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-1.5 text-sm">
                <p className="font-semibold text-base">İKİ M İKLİMLENDİRME SİSTEMLERİ TİCARET LİMİTED ŞİRKETİ</p>
                <p><strong>Adres:</strong> Atatürk Mah. Alemdağ Cad. No:140-144 İç Kapı No:19, Ümraniye, İstanbul – Türkiye</p>
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
                  <a href="mailto:info@2miklimlendirme.com.tr" className="text-primary-600 hover:underline">info@2miklimlendirme.com.tr</a>
                </p>
                <p><strong>KEP:</strong> ikimiklimlendirme@hs01.kep.tr</p>
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