<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  @page { margin: 20mm 15mm; size: A4 portrait; }
  
  body { 
    font-family: 'Inter', sans-serif; 
    color: #1f2937; 
    line-height: 1.6; 
    background-color: #ffffff;
    padding: 0;
    margin: 0;
  }
  .header {
    text-align: center;
    border-bottom: 3px solid #2563eb;
    padding-bottom: 15px;
    margin-bottom: 25px;
  }
  h1 { 
    color: #1e3a8a; 
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
  }
  .subtitle { 
    font-size: 16px; 
    color: #4b5563; 
    font-weight: 500;
  }
  h2 { 
    color: #1d4ed8; 
    margin-top: 15px; 
    margin-bottom: 10px;
    padding-bottom: 5px; 
    font-size: 17px; 
    font-weight: 600;
    border-bottom: 1px solid #e5e7eb;
  }
  p, li { 
    font-size: 12.5px; 
    color: #374151;
    margin-bottom: 6px;
    text-align: justify;
  }
  ul { 
    padding-left: 20px; 
    margin-top: 8px;
    margin-bottom: 8px;
  }
  li {
    margin-bottom: 8px;
  }
  li::marker {
    color: #2563eb;
  }
  strong {
    color: #111827;
    font-weight: 600;
  }
  .highlight { 
    background-color: #eff6ff; 
    padding: 15px; 
    border-left: 4px solid #2563eb; 
    border-radius: 4px; 
    margin: 15px 0; 
    page-break-inside: avoid;
  }
  .bar-container { 
    background-color: #e5e7eb; 
    border-radius: 8px; 
    height: 18px; 
    width: 100%; 
    margin: 8px 0; 
    overflow: hidden; 
  }
  .bar-fill { 
    background-color: #2563eb; 
    height: 100%; 
    width: 65%; 
    text-align: right; 
    padding-right: 10px; 
    color: white; 
    font-size: 10px; 
    line-height: 18px; 
    font-weight: 600; 
  }
  .section-box { 
    background: #ffffff; 
    border: 1px solid #e5e7eb; 
    padding: 15px 20px; 
    border-radius: 6px; 
    margin-bottom: 15px; 
    page-break-inside: avoid;
  }
  .intro-text {
    font-size: 13.5px;
    color: #4b5563;
    text-align: justify;
    margin-bottom: 25px;
  }
</style>

<div class="header">
  <h1>MEKANİK PARÇA DEPOSU</h1>
  <div class="subtitle">Hibrit (B2B & B2C) E-Ticaret Sistemi Dönüşüm ve Kurumsal Mimari Raporu</div>
</div>

<div class="intro-text">
Mevcut e-ticaret altyapımız, standart perakende (B2C) satışları için sağlam ve modern bir temele sahiptir. İşletmenin ticari büyüme hedefleri doğrultusunda, sistemi kurumsal müşterilere, ustalara ve bayilere (B2B) kusursuz hizmet verecek şekilde genişletmek zorunludur. B2B müşterileri siteye vitrin gezmek için değil, hızlı sipariş vermek, cari işlemlerini yürütmek ve ticari süreçlerini kolaylaştırmak için girerler. Bu bağlamda, sistemin profesyonel, hıza dayalı ve finansal entegrasyonu yüksek bir yapıya bürünmesi için aşağıdaki vizyon planı ve teknik özellik seti detaylandırılmıştır.
</div>

<div class="section-box">
<h2>1. Kullanıcı Mimarisi ve Kurumsal Kayıt Süreci</h2>
Sistemin temeli, müşterinin kimliğini doğru tanımaya dayanacaktır.
<ul>
  <li><strong>İkili Kayıt ve Dinamik Onay Mekanizması:</strong> Kayıt ekranı "Bireysel (Perakende)" ve "Kurumsal/Bayi Başvurusu" olarak iki farklı akışa ayrılacaktır. Kurumsal kayıtlar anında alışverişe açılmayacak; yöneticinin vergi levhası/firma incelemesi ve onayından sonra (Manuel Onay) bayi statüsü aktifleşerek toptan fiyatları görebileceklerdir.</li>
  <li><strong>E-Fatura Ön Hazırlığı ve Kalıcı Veriler:</strong> B2B profillerine vergi numarası, vergi dairesi ve ticari unvan alanları eklenecek, bu veriler kalıcı olarak şifrelenerek saklanacaktır. Her siparişte fatura bilgisi sorma zorunluluğu kalkacak, ilerideki e-fatura/ön muhasebe (Logo, Paraşüt vb.) entegrasyonlarına API bazında kusursuz altyapı sağlanacaktır.</li>
</ul>
</div>

<div class="section-box">
<h2>2. B2B Profesyonel Arayüzü ve Gelişmiş Kullanıcı Deneyimi (UX)</h2>
Kurumsal müşterilerin zamanı değerlidir; B2B arayüzü hız ve işlevsellik odaklı tasarlanacaktır.
<ul>
  <li><strong>Özelleştirilmiş Profesyonel B2B Arayüzü:</strong> B2B müşterileri giriş yaptığında sitenin tasarımı perakende görünümünden çıkarak daha profesyonel, daha sade ve işlem odaklı bir yapıya bürünecektir.</li>
  <li><strong>Hızlı Sipariş (SKU) ve Sıkıştırılmış Liste Görünümü:</strong> Bayiler için büyük görselli grid yapısı yerine; stok kodu, ürün adı, anlık stok miktarı ve adet giriş kutusunun yan yana olduğu excel benzeri "Sıkıştırılmış Liste" görünümü sunulacaktır. Arama çubuğundan sadece ürün kodu (SKU) yazılarak saniyeler içinde sepete atım sağlanacaktır.</li>
  <li><strong>Gerçek Zamanlı ve Şeffaf Stok Gösterimi:</strong> Bireysel müşteriler stoklar için sadece "Var / Yok" ibaresini görecekken; büyük miktarlarda alım planlayan bayiler, tedariklerini ayarlayabilmek adına stoktaki net sayıyı (Örn: "Depoda 42 Adet") şeffaf olarak görebilecektir.</li>
  <li><strong>B2B Özel Kısıtlamalar (Koli Bazlı Satış):</strong> Koli bazlı yedek parçalar, tamir setleri veya endüstriyel boy ürünler admin panelinden "Sadece B2B" olarak kısıtlanabilecek; perakende ziyaretçilerin bu ürünleri görüp kafa karışıklığı yaşaması engellenecektir. Ayrıca minimum sipariş miktarı (Örn: En az 10'lu alınabilir) kuralları sepette katı olarak uygulanacaktır.</li>
</ul>
</div>

<div class="section-box">
<h2>3. Psikolojik Fiyatlandırma, KDV ve İskonto Mekanizmaları</h2>
Fiyatların sunum şekli, B2B ticaretin satın alma kararındaki en büyük etkenidir.
<ul>
  <li><strong>Rol Bazlı KDV Mimarisi (Algı Yönetimi):</strong> Bireysel (B2C) ziyaretçiler tüm fiyatları "KDV Dahil" görerek perakende alışkanlıklarına devam ederken; B2B girişi yapan bayiler tüm fiyatları "KDV Hariç" görecektir. KDV tutarı sadece ödeme adımında sepet özeti kısmında resmi olarak eklenecektir.</li>
  <li><strong>Dinamik ve Bayi Bazlı İskonto Sistemi:</strong> Yönetici, güvendiği veya hacmi yüksek bayilere özel indirimler tanımlayabilecektir. Bu indirimler sabit oran (Tüm sitede %15) veya kategori bazlı (Klima Parçalarında %20, Kombi'de %10) olarak dinamik çalışacaktır.</li>
  <li><strong>Çifte Fiyat Gösterimi ile Kâr Vurgusu:</strong> B2B müşterisi giriş yaptığında ürün listesinde standart perakende liste fiyatını "üzeri çizili" şekilde; kendi iskontolu bayi alış fiyatını ise "vurgulu/renkli" görecektir. Bu, bayiye "ne kadar tasarruf ettiğini ve kâr marjını" sürekli hatırlatan güçlü bir satın alma motivasyonudur.</li>
  <li><strong>Kademeli Fiyat Tabloları (Toplu Alım Teşviki):</strong> "1-5 adet X TL, 6-20 adet Y TL, 20+ adet Z TL" şeklindeki çoklu alım teşvikleri ürün detay sayfalarında bayiler için net bir matris/tablo olarak sunulacaktır.</li>
</ul>
</div>

<div class="section-box">
<h2>4. Finans, Ödeme Akışları ve Cari Hesap (Kredi) Sistemi</h2>
Geleneksel ticaret ile dijital dünyanın finansal uyumu sağlanacaktır.
<ul>
  <li><strong>Yönetici Kontrollü Cari Limit (Açık Hesap):</strong> Yönetici, düzenli çalışan bayilere sistem üzerinden bir "Açık Hesap Limiti" (Örn: 100.000 TL) tahsis edebilecektir. Sistem, bayinin risk bakiyesini anlık takip edecektir.</li>
  <li><strong>Gelişmiş Checkout (B2B Ödeme Adımı):</strong> B2C müşterileri sadece Kredi Kartı veya standart Havale kullanırken; Cari Limit tanımlanmış B2B bayileri, kredi kartına ek olarak "Cari Hesabıma Yaz (Limitimden Düş)" seçeneğiyle ödeme adımını saniyeler içinde tamamlayabilecektir.</li>
  <li><strong>Finansal Onay ve Statü Mekanizması:</strong> Kredi kartı dışındaki ödemelerle geçilen siparişler sisteme "Ödeme Onayı Bekliyor" statüsü ile düşecek, yönetici mutabakatı sağladıktan sonra sipariş sevkiyat sürecine girecektir.</li>
</ul>
</div>

<div class="section-box">
<h2>5. Proje Bazlı Alımlar İçin "Özel Teklif İste" Modülü</h2>
Müteahhitlerin, projecilerin veya büyük ustaların toplu alımlarını dijitalleştiren özel yapı:
<ul>
  <li><strong>Büyük Çaplı Alımlarda Doğrudan Sepeti Teklife Çevirme:</strong> Yüksek tutarlı sepet oluşturan müşteriler doğrudan ödeme yapmak yerine, sepetteki ürünleri yöneticiye taslak bir teklif (pazarlık) talebi olarak gönderebilecektir.</li>
</ul>

<div class="highlight">
  <strong>Görsel Teşvik ve Minimum 100.000 TL Sepet Kuralı:</strong> 
  <p style="margin-top:5px;">Özel teklif/iskonto isteyebilmek için sepet tutarının minimum <strong>100.000 TL</strong> olması zorunlu tutulacaktır. Sepet sayfasında müşterinin bu hedefe ne kadar yaklaştığını gösteren ve sürekli daha fazla ürün eklemeye teşvik eden <strong>dinamik bir ilerleme (progress) çubuğu</strong> yer alacaktır.</p>
  <div style="font-size:11.5px; color:#4b5563; margin-bottom:5px; font-weight:600; margin-top:10px;">Özel proje teklifi isteyebilmek için 35.000 TL'lik ürün daha eklemelisiniz!</div>
  <div class="bar-container"><div class="bar-fill">65.000 TL</div></div>
</div>

<ul>
  <li><strong>İşleyişin Sonuçlanması:</strong> Sepet 100.000 TL'yi aştığında <strong>"Özel Teklif İste"</strong> butonu belirecek; müşteri bu butona bastığında sepet içeriği yöneticiye iletilecektir. Yönetici sepete özel toplam bir proje iskontosu uygulayıp fiyatı revize edecek; müşteri bayi panelinden gelen yeni fiyatı görüp tek tıkla onaylayarak doğrudan kredi kartı/cari ile ödemeye geçebilecektir.</li>
</ul>
</div>

<div class="section-box">
<h2>6. Müşteri Paneli (Hesabım) B2B Geliştirmeleri ve Kurumsal İş Takibi</h2>
Bayiler sipariş geçmişini basit bir alışveriş kaydından ziyade, kendi ticari operasyonlarının merkezi bir "İş Takip ve Muhasebe Ekranı" olarak kullanmaktadır:
<ul>
  <li><strong>Cari Hesap ve Ekstre Görüntüleme:</strong> Bayi, hesabım panelinden güncel kullanılabilir cari limitini, toplam borcunu/alacağını ve geçmişe dönük tüm ticari hareketlerini görebilecektir. İstediği zaman içerideki borcunu kredi kartı ile "Parçalı Tahsilat" şeklinde ödeyebilecektir.</li>
  <li><strong>Tek Tıkla Tekrar Sipariş (Quick Reorder):</strong> B2B'de genellikle periyodik olarak aynı parçalar istenir. Geçmiş siparişler sayfasından eski bir siparişteki 50 kalem ürünü "Tek Tıkla Tekrar Sepete At" özelliğiyle saniyeler içinde yenileyebilme kolaylığı sağlanacaktır.</li>
  <li><strong>Parçalı Teslimat (Backorder) Takibi:</strong> Kısmi kargolanan büyük siparişler için panelde "Teslim Edilenler" ve "Bekleyen (Stokta Olmayan) Ürünler" net bir şekilde tablo halinde ayrılarak bayinin operasyonel takip süreci kusursuzlaştırılacaktır.</li>
  <li><strong>Proforma Fatura İndirme:</strong> Kurumsal firmaların satınalma onay süreçleri için şarttır. Bayiler siparişi tamamladığı anda veya sepet aşamasında, kendi şirket yöneticilerine sunmak üzere sistemden PDF formatında, antetli "Proforma Fatura" indirebilecektir.</li>
</ul>
</div>
