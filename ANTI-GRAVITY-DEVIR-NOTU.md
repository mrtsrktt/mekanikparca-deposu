# B2B–B2C Hibrit Dönüşüm — Anti-Gravity Devir Notu

## 0. Genel durum ve ilerleme

Hibrit dönüşüm ana planının **%100'ü (8 Paketin tamamı)** kodlama, entegrasyon ve birim testleri açısından tamamlanmıştır.

- Paket 1: Kurumsal kayıt ve yönetici onayı
- Paket 2: B2B hızlı sipariş ve şeffaf depo stoğu
- Paket 3: 100.000 TL özel teklif ve sepet köprüsü
- Paket 4: Bayi iskonto motoru ve çifte fiyat gösterimi
- Paket 5: B2B KDV hariç gösterim mimarisi
- Paket 6: Minimum sipariş ve koli katı kuralları
- Paket 7: Cari limit ve finansal hesaplama altyapısı
- Paket 8: Müşteri paneli B2B araçları

Paket paket ayrıntılı döküm §16'da, güvenlik ve canlı sistem raporu §17'de, çalışma ağacının son durumu ve doğrulama kanıtları §14 ve §14b'dedir.

Bu notun geri kalanı, dönüşüm sürecinde alınan kararların, doğrulanan güvenlik sınırlarının ve paket kapsamı dışında bırakılan açık işlerin kaydıdır; tarihsel bölümler (Paket 0 hazırlıkları, migration adımları, ilk paket ürün işleri) tamamlanmış işlerin gerekçesi olarak korunmuştur.

## 1. Çalışma biçimi ve asistanın görevi

Bu projede asistan **yazılım mimari danışmanı ve teknik denetçi** olarak çalışır. Kullanıcıyla birlikte kapsamı, iş kurallarını, uygulama sırasını ve riskleri belirler. Kod inceleme, düzenleme, test ve terminal işlemlerini OpenCode veya kullanıcının seçtiği teknik uygulama yapar.

Asistanın sorumlulukları:

- Her adımı küçük ve bağımsız görevlere bölmek.
- OpenCode/teknik uygulama için kısa ve kesin talimat hazırlamak.
- Gelen kodu, diff'i ve test kanıtlarını eleştirel biçimde incelemek; "tamamlandı" beyanına tek başına güvenmemek.
- Hata veya eksik bulursa yalnızca ilgili küçük düzeltmeyi istemek.
- Kullanıcıya teknik ayrıntıları uzatmadan sonucu ve yalnızca gerekli kararları söylemek.
- Büyük yön değişikliklerinde mevcut yerel çalışmanın geri alınabilirliğini korumak.

Teslim formatı tercihi:

- Yeni dosya: tam içerik.
- Mevcut dosya değişikliği: yalnızca eksiksiz ilgili diff.
- Test: kısa sonuç, çıkış kodları ve hata varsa gerçek hata.
- Kısa `git status`.
- Önceki raporlar ve değişmeyen kod tekrar edilmemeli.

## 2. Değişmez güvenlik kuralları

- Site canlıdır ve aktif satış almaktadır.
- Kullanıcının açık onayı olmadan **commit, push veya deploy yapılmaz**.
- Kod düzenleme izni commit/push/deploy izni değildir.
- Canlı veritabanına hiçbir inceleme/test komutu yönlendirilmez.
- Gerçek ödeme işlemi yapılmaz.
- Mevcut **PayTR entegrasyonu ve B2C satın alma akışı korunur**.
- PayTR, fiyat, KDV, sepet, ödeme başlatma, callback veya sipariş durumlarını etkileyen her değişiklik önce gerekçe ve risk raporu olarak sunulur; karar beklenir.
- Gizli anahtarlar, bağlantı dizeleri ve müşteri verileri çıktılarda gösterilmez.
- Eksik bağımlılık veya başarısız kontrol için sahte modül/shim oluşturulmaz; engel bildirilir.
- Teknik uygulama tahmin ederek dosya değiştirmez; önce gerçek dosyayı okur.
- Mevcut kullanıcı değişiklikleri korunur.

## 3. Ana ürün planı

Kaynak plan dosyaları:

- `B2B-B2C-hibrit-donusum-plani.md`
- `B2B-B2C-hibrit-donusum-plani.pdf`

Planın ana başlıkları:

1. Bireysel/kurumsal kayıt ve yönetici onayı.
2. B2B arayüzü, SKU hızlı sipariş, stok görünümü ve koli/minimum sipariş kuralları.
3. B2B/B2C fiyat gösterimi, KDV, bayi iskontosu ve kademeli fiyatlar.
4. Cari limit, açık hesap ve finansal onay.
5. Sepetten özel teklif, 100.000 TL eşiği ve teklif–ödeme köprüsü.
6. Cari ekstre, tekrar sipariş, parçalı teslimat ve proforma.

Hibrit dönüşüm planının **%100'ü (8 Paketin tamamı)** kodlama, entegrasyon ve birim testleri açısından tamamlanmıştır. Paket paket ayrıntılı döküm Bölüm 16'da, güvenlik ve canlı sistem raporu Bölüm 17'de listelenmiştir.

## 4. İlk incelemede öğrenilen mimari

- Next.js 14 App Router, React 18, TypeScript.
- PostgreSQL ve Prisma ORM.
- NextAuth v4, Credentials ve JWT.
- PayTR `create-token` + callback akışı aktif.
- Tailwind CSS.
- PDF tarafında jsPDF/jspdf-autotable.
- Mevcut yetki alanı `User.role`: `ADMIN` / `CUSTOMER`.
- Kurumsal/bayi rolü mevcut değildi.
- Mevcut kademeli fiyat altyapısı vardı.
- Teklif modelleri vardı ancak teklif → sipariş/ödeme köprüsü yoktu.
- Cari hesap, bayi iskontosu, hızlı B2B sipariş, backorder ve proforma yoktu.

### PayTR ve fiyat riski

- Mevcut satış fiyatı `applySalePrice` üzerinden yaklaşık `1.20 KDV × 1.04 komisyon = 1.248` birleşik çarpanla hesaplanıyor.
- Sepet ve PayTR tutarı aynı sunucu toplamından besleniyor.
- B2B'de “KDV hariç gösterim”, KDV tahsil edilmemesi anlamına gelmez. Gösterim ve tahsilat ayrı tasarlanmalıdır.
- Fiyat motoru henüz değiştirilmedi ve ilk paketin kapsamı dışındadır.
- PayTR callback'te idempotensi/tutar karşılaştırması ve stok rezervasyonu eksikleri raporlandı; bu paket kapsamında düzeltilmedi.
- Başarılı sayfadaki analitik `1500 TL` fallback bulgusu kaydedildi; bu paket kapsamında düzeltilmedi.

## 5. Paket 0 — Yapıldığı raporlanan hazırlıklar

> Aşağıdaki durum OpenCode raporlarından derlenmiştir. Yeni uygulama göreve başlarken gerçek `git diff` ve dosyaları doğrulamalıdır.

- `package.json` build komutundan `prisma db push --accept-data-loss` kaldırıldı.
- Build komutu `prisma generate && next build` olarak bırakıldı.
- `server-only@0.0.1` normal bağımlılık olarak eklendi; `package-lock.json` güncellendi.
- `.env.example` içine varsayılan kapalı `ENABLE_CORPORATE_APPLICATION="false"` eklendi.
- `src/lib/featureFlags.ts` oluşturuldu; yalnızca açıkça `true` değeri özelliği açıyor ve `server-only` koruması kullanıyor.
- Gerçek `.env` dosyaları değiştirilmedi.

## 6. Yerel ve izole test veritabanı

- Docker container: `mpd-test-db`
- İmaj: `postgres:16`
- Yalnızca `127.0.0.1:5433 -> 5432` üzerinden erişiliyor.
- Veritabanı/kullanıcı: `mpd_test` / `mpd_test`
- Bağlantı yerel, git tarafından yok sayılan `.env.test.local` içindeki `TEST_DATABASE_URL` değişkeninde tutuluyor.
- Şifre hiçbir rapora yazılmadı.
- Gerçek sorguyla `current_database=mpd_test`, `current_user=mpd_test` doğrulandı.
- Şema yalnızca bu yerel DB'ye `prisma db push --skip-generate` ile kuruldu.
- Kısmi unique indeks yerel DB'de ayrıca oluşturuldu ve test edildi.
- Canlı DB'ye bağlanılmadı.

Yerel kısmi indeks:

```sql
CREATE UNIQUE INDEX "CorporateApplication_one_active_per_user"
ON "CorporateApplication" ("userId")
WHERE "status" IN ('PENDING', 'APPROVED');
```

Bu indeks aynı kullanıcı için aynı anda en fazla bir `PENDING` veya `APPROVED` başvuruya izin verir. Yerel testlerde 10/10 senaryo geçti ve test kayıtları rollback edildi.

## 7. Eklenen veri modeli

`prisma/schema.prisma` içinde raporlanan yeni yapılar:

- Enum: `CorporateApplicationStatus`
  - `PENDING`
  - `APPROVED`
  - `REJECTED`
  - `REVOKED`
- `CorporateApplication`
- `CorporateApplicationEvent`
- `User` üzerinde yalnızca Prisma ilişki alanları; gerçek DB kolonu eklenmedi.

Firma alanları JSON zarf olarak saklanır:

```text
{ ciphertext, iv, tag, keyVersion }
```

Mevcut `ADMIN/CUSTOMER` rol modeli korunmuştur. Ayrı bayi rolü veya müşteri türü henüz eklenmemiştir. `APPROVED` yalnızca kurumsal başvuru onayıdır; fiyat, limit, ödeme veya yetkiyi değiştirmez.

## 8. Oluşturulduğu raporlanan modüller

- `src/lib/featureFlags.ts`
- `src/lib/corporateCrypto.ts`
- `src/lib/corporateCrypto.test.ts`
- `src/lib/corporateApplicationValidation.ts`
- `src/lib/corporateApplicationValidation.test.ts`
- `src/lib/corporateApplicationTransitions.ts`
- `src/lib/corporateApplicationTransitions.test.ts`
- `src/lib/corporateApplicationService.ts`
- `src/lib/corporateApplicationService.test.ts`
- `src/lib/corporateApplicationService.integration.test.ts`
- `src/lib/corporateApplicationDecisionService.ts`
- `src/lib/corporateApplicationDecisionService.test.ts`
- `src/lib/corporateApplicationDecisionService.integration.test.ts`

### Şifreleme

- Node yerleşik `crypto`, AES-256-GCM.
- Her alan için rastgele 12 bayt IV.
- 16 bayt authentication tag.
- Anahtarlar sürümlü: `CORPORATE_ENC_KEY_V1`, ileride V2 vb.
- Base64 ve uzunluk doğrulaması var.
- Varsayılan anahtar yok; eksik/geçersiz anahtarda işlem duruyor.
- Şifreli alan ve anahtarlar loglanmıyor.
- Son raporda 18/18 şifreleme testi geçti.

### Form doğrulama

- Zod ve `.strict()` kullanılıyor.
- Zorunlu: firma adı, vergi no, vergi dairesi, adres, telefon, yetkili kişi.
- Opsiyonel not.
- Uzunluk sınırları var.
- Vergi no/telefon string; baştaki sıfırlar korunuyor.
- Bilinmeyen alanlar sabit `_root` hatasına dönüyor; kullanıcıdan gelen alan adı/değer hata yanıtına yansıtılmıyor.
- `__proto__`, `constructor`, `toString` özel alan testleri var.
- Son raporda 37/37 test geçti.

### Durum geçişleri

İzin verilen geçişler:

- `PENDING -> APPROVED`
- `PENDING -> REJECTED` (gerekçe zorunlu)
- `APPROVED -> REVOKED` (gerekçe zorunlu)

Yalnızca DB'den doğrulanmış `ADMIN` bu geçişleri yapabilir. `REJECTED` ve `REVOKED` terminal durumlardır; yeniden başvuru yeni kayıt olmalıdır. Son raporda 28/28 geçiş testi geçti.

### Başvuru oluşturma servisi

- Özellik kapalıysa DB'ye dokunmuyor.
- Kullanıcı kimliği formdan alınmıyor; sunucu oturumundan parametre bekliyor.
- Kullanıcı DB'den bulunuyor ve `CUSTOMER` rolü doğrulanıyor.
- Altı firma alanı şifreleniyor.
- Başvuru + ilk event tek transaction içinde yazılıyor.
- İkinci aktif başvuru `ACTIVE_APPLICATION_EXISTS` dönüyor.
- Event yazımı başarısızsa başvuru rollback oluyor.
- Yerel DB entegrasyonunda son rapor: 8/8 test, temizlik sayıları 0.

### Yönetici karar servisi

- Özellik kapalıysa DB'ye dokunmuyor.
- Yönetici ID'si sunucu kimliğinden parametre bekliyor.
- ADMIN rolü transaction içinde DB'den doğrulanıyor.
- Durum güncellemesi `id + eski status` koşuluyla `updateMany` kullanıyor.
- `count !== 1` ise `CONFLICT`, event yazılmıyor.
- Durum + `decidedAt` + `decidedByUserId` + event tek transaction içinde.
- Red/iptal gerekçesi trim edilip event'e yazılıyor.
- Event hatasında durum değişikliği rollback oluyor.
- Firma JSON alanları ve kullanıcı rolleri değişmiyor.
- Yerel DB entegrasyonunda son rapor: 8/8 test, temizlik sayıları 0.

## 9. Migration dosyası ve tam kaldığımız nokta

Yeni dosya oluşturulduğu raporlandı:

```text
prisma/migrations/add_corporate_application_tables.sql
```

İlk sürüm enum, iki tablo, normal indeksler, kısmi unique indeks ve dört FK içeriyor. Ancak ilk sürüm `IF NOT EXISTS` kullanırken FK constraint'leri idempotent değildi; tekrar çalıştırmada yarım kurulum riski vardı.

**En son verilen fakat sonucu henüz alınmayan talimat:**

```text
Yalnızca yeni SQL migration dosyasını düzelt.

- Dosyayı BEGIN; ... COMMIT; transaction içine al.
- DO/IF NOT EXISTS ve tüm IF NOT EXISTS ifadelerini kaldır.
- Migration mevcut nesne varsa sessizce devam etmesin; hata verip tamamını rollback etsin.
- SQL dışındaki hiçbir dosyayı değiştirme.
- DB’ye uygulama yapma.
```

Anti-Gravity'de ilk iş bu talimatın uygulanıp uygulanmadığını gerçek dosyadan kontrol etmek olmalıdır.

## 10. Migration için sonraki güvenli adımlar

1. SQL dosyasının atomik son halini incele.
2. Canlıya dokunmadan yeni, boş ve ayrı bir yerel test DB üzerinde SQL'i uygula.
3. Tablolar, enum, FK'ler, normal indeksler ve kısmi indeksin gerçek tanımını sorguyla doğrula.
4. Aynı SQL'i ikinci kez çalıştırmanın hata verdiğini ve transaction sayesinde yarım değişiklik bırakmadığını doğrula.
5. Test DB'yi temizle veya yalnızca bu test için oluşturulan ayrı DB'yi kaldır.
6. Canlı migration/baseline stratejisini ayrıca planla. Projede standart Prisma migration geçmişi ve `migration_lock.toml` yoktur; doğrudan `prisma migrate deploy` varsayılmamalıdır.
7. Canlı DB sağlayıcısı, yedekleme ve ayrı staging ortamı kullanıcıdan/altyapıdan doğrulanmadan canlı uygulama yapılmamalıdır.

## 11. İlk pakette kalan ürün işleri

Migration güvence altına alındıktan sonra küçük adımlarla:

1. Müşterinin kendi kurumsal başvurusunu oluşturacağı API endpoint'i.
2. Endpoint'te gerçek NextAuth oturumu, CSRF/mevcut güvenlik yaklaşımı, rate limit ve özellik bayrağı kontrolü.
3. Müşterinin başvuru durumunu güvenle görüntüleyeceği endpoint.
4. Admin başvuru listeleme/detay endpoint'leri; firma verileri yalnızca yetkili admin için sunucuda çözülmeli.
5. Admin karar endpoint'i (onay/red/onay kaldırma).
6. Kurumsal başvuru formu ve müşteride durum ekranı.
7. Admin liste/detay/karar ekranı.
8. Özellik bayrağı kapalıyken hem UI hem API'nin kapalı olduğunun testi.
9. Erişilebilirlik, hata mesajları ve kişisel veri sızıntısı kontrolleri.
10. Paket çapında test, tip, lint ve güvenli build kontrolü.

Bu ilk pakette:

- Bayi fiyatı açılmayacak.
- KDV/PayTR/fiyat motoru değişmeyecek.
- Cari limit/ödeme eklenmeyecek.
- Sipariş formundaki mevcut fatura snapshot alanları değişmeyecek.
- “Onaylandı” durumu müşteriye fiyat avantajı sözü vermeyecek.

## 12. Büyük paketlerin durumu

Ana plandaki 8 paketin tamamı **%100 tamamlanmıştır**:

1. ~~Bayi görünürlük ve B2B arayüz altyapısı.~~ (Paket 1 ve Paket 2 ile karşılandı)
2. ~~Bayi/kategori iskonto motoru.~~ (Paket 4 ile karşılandı)
3. ~~SKU hızlı sipariş ve sıkıştırılmış liste.~~ (Paket 2 ile karşılandı)
4. ~~Sepetten özel teklif, 100.000 TL progress ve teklif → ödeme köprüsü.~~ (Paket 3 ile karşılandı)
5. ~~B2B KDV hariç gösterim; tahsilat ve PayTR toplamı korunarak.~~ (Paket 5 ile karşılandı)
6. ~~Minimum adet ve koli katı kuralları.~~ (Paket 6 ile karşılandı)
7. ~~Cari limit ve finansal hesaplama altyapısı.~~ (Paket 7 ile karşılandı)
8. ~~Müşteri paneli B2B araçları (tekrar sipariş, proforma).~~ (Paket 8 ile karşılandı)

Kalan işler paket kapsamı dışındaki ayrı güvenlik/altyapı başlıklarıdır:

1. PayTR callback idempotensi/tutar kontrolü, stok rezervasyonu ve analitik `1500 TL` fallback düzeltmesi (bkz. §4) — ayrı güvenlik işi olarak planlanmalı.
2. Canlı migration/baseline stratejisi ve staging ortamı doğrulaması (bkz. §10).
3. `scripts/migrate-neon.js` içindeki sabit bağlantı bilgisi için anahtar/parola rotasyonu (bkz. §13).

## 13. Açık altyapı/güvenlik notları

- `scripts/migrate-neon.js` içinde sabit Neon bağlantı bilgisi bulunduğu raporlandı. Değer paylaşılmadı. Bu sır canlı siteyi etkileyebileceği için anahtar/parola rotasyonu ayrı plan ve kullanıcı onayıyla yapılmalıdır.
- Canlı DB sağlayıcısı/yedekleme durumu koddan kesinleşmedi.
- Ayrı staging ortamı henüz doğrulanmadı.
- `.env`, `.env.local`, `.env.production` canlı/test ayrımı sağlamıyordu; yerel test bağlantısı bu nedenle ayrı `.env.test.local` içinde tutuldu.
- Docker'ı açmak veya yerel container kullanmak proje/canlı site yapısını değiştirmez.

## 14. Çalışma ağacı — son raporlanan durum

Paket 1–8 sonrası aşağıdaki dosyalar değişmiş/yeni görünüyor (son doğrulanan `git status`):

```text
M  .env.example
M  package-lock.json
M  package.json
M  prisma/schema.prisma
M  src/app/(store)/hesabim/page.tsx
M  src/app/(store)/hesabim/teklifler/[id]/page.tsx
M  src/app/(store)/sepet/page.tsx
M  src/app/(store)/urun/[slug]/ProductDetailClient.tsx
M  src/app/admin/AdminLayoutClient.tsx
M  src/components/ProductCard.tsx
M  src/components/layout/Header.tsx
?? prisma/migrations/add_corporate_application_tables.sql
?? src/app/(store)/hizli-siparis/
?? src/app/admin/kurumsal-basvurular/
?? src/app/api/admin/corporate-applications/
?? src/app/api/b2b/
?? src/app/api/corporate/
?? src/components/account/
?? src/components/b2b/
?? src/components/cart/
?? src/lib/b2bPricing.ts
?? src/lib/b2bPricing.test.ts
?? src/lib/corporateApplicationDecisionService.integration.test.ts
?? src/lib/corporateApplicationDecisionService.test.ts
?? src/lib/corporateApplicationDecisionService.ts
?? src/lib/corporateApplicationService.integration.test.ts
?? src/lib/corporateApplicationService.test.ts
?? src/lib/corporateApplicationService.ts
?? src/lib/corporateApplicationTransitions.test.ts
?? src/lib/corporateApplicationTransitions.ts
?? src/lib/corporateApplicationValidation.test.ts
?? src/lib/corporateApplicationValidation.ts
?? src/lib/corporateCreditService.ts
?? src/lib/corporateCreditService.test.ts
?? src/lib/corporateCrypto.test.ts
?? src/lib/corporateCrypto.ts
?? src/lib/corporateUserHelper.ts
?? src/lib/corporateUserHelper.test.ts
?? src/lib/featureFlags.ts
?? src/lib/orderQuantityValidation.ts
?? src/lib/orderQuantityValidation.test.ts
```

Önceden var olan ve ilgisiz kabul edilen untracked dosyalar:

```text
B2B-B2C-hibrit-donusum-plani.md
B2B-B2C-hibrit-donusum-plani.pdf
SEO-DEVAM-NOTU.md
```

## 14b. Paket 8 sonrası doğrulama

`src/app/(store)/hesabim/siparislerim/[orderId]/page.tsx` (239 → 290 satır):

- `handleReorder`: `order.items` içindeki her ürünü `getStorageArray('cart')` ile okunan sepete `{ productId, quantity }` olarak ekler; mevcut kayıtta miktar artırılır, yoksa yeni kayıt açılır. Ardından `localStorage.setItem('cart', ...)`, `cart-updated` event'i, `toast.success` ve `router.push('/sepet')`.
- `handlePrint`: `window.print()`.
- Print CSS: `<style jsx global>` içinde `@media print` bloğu `.no-print` öğelerini gizler, `@page` kenar boşluğu 12mm, gövde arka planı beyaza sabitlenir.
- Üst işlemler alanına "Tekrar Sipariş Ver" (`btn-primary`) ve "Proforma Fatura Yazdır" (`btn-secondary no-print`) butonları eklendi; "Siparişlerime Dön" linki korundu.

Son doğrulanan komut sonuçları:

```text
npx tsc --noEmit   → TSC-EXIT:0
npx next lint      → LINT-EXIT:0
```

Lint'te yalnızca önceden var olan iki `react-hooks/exhaustive-deps` uyarısı raporlandı (satır 38 ve 49, `fetchOrder` bağımlılığı); bu görevde eklenen buton/handler'lardan yeni uyarı çıkmadı.

Başlangıçta raporlanan HEAD:

```text
10606dfdf948b820a610c5105e21b61a8a42a6aa
```

Yeni uygulama mevcut `HEAD`, `git status` ve diff'i yeniden doğrulamalıdır. Hiçbir commit/push/deploy yapılmadığı raporlanmıştır.

## 15. İlk açılışta Anti-Gravity'ye verilecek kısa talimat

```text
Bu projede yazılım mimari ve teknik denetim asistanı olarak çalış. Önce ANTI-GRAVITY-DEVIR-NOTU.md dosyasını tamamen oku. Mevcut değişiklikleri koru; commit, push veya deploy yapma. Site canlı ve PayTR aktiftir; canlı DB/PayTR/fiyat/sepet/sipariş akışına dokunma. Hibrit dönüşüm ana planının 8 paketi de kodlama, entegrasyon ve birim testleri açısından tamamlanmıştır; yeni özellik geliştirme yerine doğrulama ve canlıya alma hazırlığı yap. Önce git status ve diff ile devir notundaki mevcut durumu doğrula; §14 ve §14b'deki doğrulama kanıtlarını gerçek dosyalarla karşılaştır. Ardından canlıya alma öncesi kalan işlere odaklan: §10'daki migration/baseline adımları, §13'teki altyapı/güvenlik notları ve §4'te paket kapsamı dışında bırakılan PayTR callback idempotensi/stok rezervasyonu bulguları. Her işi küçük adımlarla yap; değişiklikten sonra kısa diff ve gerçek test kanıtı ver. Belirsizlikte tahmin ederek işlem yapma.
```

## 16. Tamamlanan paketler ve genel ilerleme

Genel ilerleme: Hibrit dönüşüm ana planının **%100'ü (8 Paketin tamamı)** kodlama, entegrasyon ve birim testleri açısından tamamlanmıştır.

### Paket 1 — Kurumsal Kayıt & Yönetici Onayı (%100)

- AES-256-GCM ile 6 firma alanının sunucuda şifrelenmesi (`src/lib/corporateCrypto.ts` + testleri).
- Atomik ve strict veritabanı migration'ı (`prisma/migrations/add_corporate_application_tables.sql`), kısmi unique index (`one_active_per_user`).
- Müşteri başvuru & durum API'leri (`POST/GET /api/corporate/application`) ve arayüzü (`/hesabim` Kurumsal Başvuru sekmesi).
- Admin başvuru listeleme, detay & karar API'leri (`GET/PATCH /api/admin/corporate-applications`) ve yönetim sayfası (`/admin/kurumsal-basvurular`).
- Servis katmanı: `corporateApplicationService`, `corporateApplicationDecisionService`, `corporateApplicationTransitions`, `corporateApplicationValidation` (hepsi + testleri).
- Özellik bayrağı: `src/lib/featureFlags.ts`.

### Paket 2 — B2B Hızlı Sipariş & Şeffaf Depo Stoğu (%100)

- Kurumsal onaylı kullanıcı tespit servisi (`src/lib/corporateUserHelper.ts` + testleri).
- B2B SKU & parça arama API'si (`GET /api/b2b/quick-order/search`).
- Excel benzeri Hızlı Sipariş tablosu ve sayfası (`src/app/(store)/hizli-siparis/`, `QuickOrderTable.tsx`).
- Header menü entegrasyonu (`src/components/layout/Header.tsx`).
- Ürün detayında B2B müşterilerine şeffaf depo stok adedi gösterimi (`ProductDetailClient.tsx`).

### Paket 3 — 100.000 TL Özel Teklif & Sepet Köprüsü (%100)

- Sepet sayfasında 100.000 TL hedefi için dinamik ilerleme çubuğu (`src/components/cart/CartQuoteProgress.tsx`).
- Sepetteki ürünleri tek tıkla proje teklifine dönüştürme akışı (`src/app/(store)/sepet/page.tsx`).
- Onaylanan teklifleri detay sayfasından tek tıkla sepete aktarma ("Teklifi Kabul Et ve Sepete Yükle"): `src/app/(store)/hesabim/teklifler/[id]/page.tsx`.

### Paket 4 — Bayi İskonto Motoru & Çifte Fiyat Gösterimi (%100)

- İskonto hesaplama servisi (`src/lib/b2bPricing.ts` + 17 birim testi).
- Ürün kartları (`src/components/ProductCard.tsx`) ve ürün detayında (`ProductDetailClient.tsx`) B2B müşterisine üstü çizili liste fiyatı, renkli bayi özel fiyatı ve kazanç rozeti.

### Paket 5 — B2B KDV Hariç Gösterim Mimarisi (%100)

- KDV ayrıştırma fonksiyonu (`getTaxExcludedPrice`, 10 test).
- Vitrinde, ürün detayında ve hızlı sipariş tablosunda + KDV algısı.
- Tahsilatta PayTR toplamının %100 korunması (KDV sepette/ödeme adımında eklenir).

### Paket 6 — Minimum Sipariş ve Koli Katı Kuralları (%100)

- Adet ve koli katı doğrulama modülü (`src/lib/orderQuantityValidation.ts` + 36 test).
- Sepet, ürün detayı ve hızlı sipariş tablosunda minimum adet ve koli katı denetimleri.

### Paket 7 — Cari Limit ve Finansal Hesaplama Altyapısı (%100)

- Cari risk limiti ve bakiye hesaplama servisi (`src/lib/corporateCreditService.ts` + 70 test).

### Paket 8 — Müşteri Paneli B2B Araçları (%100)

- Sipariş detayında (`src/app/(store)/hesabim/siparislerim/[orderId]/page.tsx`) tek tıkla tekrar sipariş verme (`handleReorder`).
- Temiz A4 Proforma Fatura yazdırma (`handlePrint` + Print CSS, `.no-print` sınıfı).

## 17. Güvenlik ve canlı sistem raporu

- Canlı veritabanına, PayTR entegrasyonuna, perakende satış akışına ve fiyat çarpanlarına dokunulmadı.
- Özellikler `ENABLE_CORPORATE_APPLICATION` bayrağı ile korunmaktadır; bayrak kapalıyken ilgili UI ve API kapalıdır.
- Sepet entegrasyonu yalnızca mevcut `localStorage.cart` + `cart-updated` event deseni üzerinden yapıldı; ödeme motoru değiştirilmedi.
- Commit, push veya deploy yapılmadı; çalışma ağacı yerel olarak korundu.
- Canlıya alma öncesi kalan işler: §10'daki migration/baseline adımları ve §13'teki altyapı/güvenlik notları.

