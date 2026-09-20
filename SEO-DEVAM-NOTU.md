# Mekanik Parça Deposu — SEO Çalışması Devam Notu

**Son güncelleme:** 2026-09-13
**Durum:** Aşama 0 (doğrulama) ve B grubu (DB taraması) tamamlandı. Uygulama başlamadı.
**Kural:** Kullanıcı onayı olmadan hiçbir değişiklik yapılmaz. PayTR ödeme entegrasyonu kesinlikle bozulmaz.

---

## 1. Bağlam ve kaynaklar

- **SEO raporu konumu:** `C:\3matolye\seohizmeti\musteriler\mekanikparcadeposu\SEO-GUCLENDIRME-PLANI.md`
  (workspace dışında — okumak için izin gerekir; kullanıcı metni sohbete yapıştırdı)
- **Aynı klasördeki diğer dosyalar:** `HAFTA-01-PLAN.md`, `MUSTERI.md`, `SERPBAR-KULLANIM.md`, `icerik/HAZIR-METINLER.md`, `ham-veri/*`
- **Site:** Next.js 14 App Router + Prisma + Neon PostgreSQL + PayTR
- **Ödeme akışı dosyaları (DOKUNULMAYACAK):** `src/app/api/payment/**`, `src/app/(store)/odeme/**`, `src/app/(store)/sepet/**`

---

## 2. Yapılan işler (bu oturumda)

### Aşama 0 — Rapor tespitlerinin doğrulanması (kod + canlı site)

| Rapor maddesi | Doğrulama sonucu |
|---|---|
| `/` ve `/urunler` H1 yok | ✅ **DOĞRU** — canlıda ikisinde de H1=0 |
| Kategori sayfalarında H1 yok | ✅ **DOĞRU** — `/urunler?category=X` şablonunda H1 yok, breadcrumb'da kategori adı da yok |
| Sitemap'te kategori/marka URL'i yok | ✅ **DOĞRU** — 63 URL, 0 kategori, 0 marka |
| Lega ürünleri sitemap'te yok | ✅ **DOĞRU** — sebebi ürünlerin PASİF olması |
| Blog/ürün title çift marka eki | ✅ **DOĞRU** — canlıda görünüyor, ama kaynağı DB değil; root layout template + sayfa metadata çakışması |
| `/teklif` ve `/sss` canonical yok | ✅ **DOĞRU** — ikisi de root metadata'yı kullanıyor; ayrıca H1 de yok |
| `/kampanyalar` 307 dönüyor | ❌ **YANLIŞ** — sayfa çalışıyor, redirect yok |
| "canonical yok (genel)" | ❌ **YANLIŞ** — çoğu sayfada canonical var |
| `/kategoriler`, `/markalar` H1 yok | ❌ **YANLIŞ** — ikisinde de H1 var |
| robots.ts yok | ❌ **YANLIŞ** — `public/robots.txt` var ve düzgün |

### B grubu — DB taraması (salt okunur, Neon production DB)

Geçici script `scripts/seo-audit-temp.ts` yazıldı, çalıştırıldı, **silindi**. Hiçbir veri değiştirilmedi.

**Bulgular:**

| Konu | Sonuç |
|---|---|
| Toplam ürün | 64 |
| **Pasif ürün** | **12** |
| Pasif Lega regülatörleri | 10 (`lega-5/7.5/10/15/20/25/30/40 KVA`, `lega-500/1000 VA`) |
| Diğer pasif ürünler | `rgn-b-258`, `rgn-b-3210`, `test`, `testo-320-baca-gazi`, `tf1-sigma-manyetik-filtre-1-34-uyumlu...`, `fernox-leak-sealer-f4` |
| Kategori metaTitle | **21/21 BOŞ** |
| Blog metaTitle | 5 yazıda 60 karakter aşılıyor (63–72 kr). Çift marka eki DB'de YOK |
| Ürün metaTitle dolgu kelime | 10 Lega ürününde "Garantili"/"Kombi Koruma" |
| Uzun ürün metaTitle | 2 (`fernox-s1-solar`, `hp-eg-20-litre` — 62 kr) |
| Markalar | 5 aktif: fernox, lega, mru, regen, testo |

---

## 3. Kritik keşifler

1. **PayTR / sepet / ödeme akışında `category`/`brand`/`/urunler` bağlantısı YOK.**
   Tarama sonucu: `api/payment/**`, `api/admin/orders/**`, `odeme/**`, `sepet/page.tsx` içinde ilgili hiçbir referans bulunamadı. **SEO işleri ödeme akışına dokunmuyor.**

2. **`?brand=` zaten gelişmiş bir marka sayfası olarak çalışıyor.**
   `src/lib/brand-content.ts` + `src/components/brand-landing/*` (FAQ, ürün grid, teknik servis). Raporun "Lega marka sayfası yok" tespiti kısmen yanlış — sayfa var, sadece URL kalıcı değil.

3. **Lega ürünlerinin 0 tık almasının asıl sebebi: PASİF olmaları.**
   İşletme sahibi Lega ürünlerini kaldırmış, kısa vadede satmayacak. Bu, raporun en büyük iki fırsatını ("Lega kümesi" ve "regülatör kümesi") kısmen geçersiz kılıyor.

4. **Lega sitede 7 yerde görünüyor:** footer rozetleri, hakkımızda metni, hakkımızda bayi belgesi (PDF), SSS linki, `/urunler?brand=lega`, 10 pasif ürün sayfası, `urunler` meta description. **Noindex bunların çoğunu gizlemez.**

5. **`?brand=lega` linkleri:** `sss/page.tsx:112`, `HeroSlider.tsx:14,147` (Fernox), Header, markalar sayfası, ana sayfa.

---

## 4. AÇIK KALAN İŞLER

### 🔴 BLOKE EDİCİ — kullanıcı/işletme sahibi kararı bekliyor

| # | Karar | Seçenekler |
|---|---|---|
| K1 | **Lega nasıl kapatılacak?** | **A)** Tam kapat: 410 + footer/hakkımızda/SSS temizliği + meta desc'ten çıkar. **B)** Sadece gizle: pasif ürünlere + `?brand=lega`'ya noindex, gerisi kalır. **C)** Şimdilik kalsın (mevcut karar) |
| K2 | **Regülatör kategorisi ne olacak?** | **a)** Marka bağımsız rehber sayfası olarak koru (134 gösterim var). **b)** Tamamen kapat (isActive:false, 410) |
| K3 | **Diğer 5 pasif ürün ne olacak?** | `rgn-b-258`, `rgn-b-3210`, `test`, `testo-320-baca-gazi`, `tf1-sigma-...`, `fernox-leak-sealer-f4` — silinecek mi, aktif mi edilecek? |
| K4 | **Hakkımızda'daki Lega bayi belgesi** kalsın mı? | Tutarlılık sorunu: "yetkili satıcıyım" deyip ürünü noindex'lemek çelişki |

**Not:** Kullanıcı "Şimdilik kalsın, işletme sahibiyle konuşup döneceğim" dedi.

### 🟡 ONAY BEKLİYOR — Lega kararından bağımsız yapılabilir

**A grubu — Kod (sıfır risk):**

| # | İş | Dosya |
|---|---|---|
| A1 | Ana sayfaya H1 ekle | `src/app/(store)/page.tsx` |
| A2 | `/urunler` + kategori sayfasına dinamik H1 | `src/app/(store)/urunler/page.tsx` |
| A3 | Kategori title'ına kategori adı ekle | `urunler/page.tsx` (metadata bloğu, ~satır 24-33) |
| A4 | Sitemap'e 21 kategori URL'i ekle | `src/app/sitemap.ts` |
| A5 | Sitemap'e 5 marka URL'i ekle | `src/app/sitemap.ts` |
| A6 | Blog title çift marka ekini düzelt (`title.absolute` kullan) | `src/app/(store)/blog/[slug]/page.tsx` |
| A7 | `/teklif` + `/sss` için ayrı metadata + H1 (server layout gerekir, ikisi de `'use client'`) | yeni layout dosyaları |
| A8 | robots.txt'ye `/odeme` ve `/sepet` ekle | `public/robots.txt` |
| A9 | `?sort=` URL'lere noindex | `urunler/page.tsx` |

**B grubu — DB (Lega'sız kısım):**

| # | İş |
|---|---|
| B1 | 21 kategoriye metaTitle + metaDesc yaz (Lega hariç, K2 kararına bağlı) |
| B2 | 5 blog metaTitle'ı 60 karaktere indir |
| B4 | 2 uzun ürün metaTitle'ını düzelt (`fernox-s1-solar`, `hp-eg-20-litre`) |
| ~~B3~~ | ~~Lega ürün title dolgu kelime~~ → K1'e bağlı |
| ~~B5~~ | ~~Pasif ürün kararı~~ → K1/K3'e bağlı |

### 🟢 Aşama 2/3/4 — sonraki fazlar

**C grubu — İçerik (link değişmez):**
- C1: `manyetik-filtre-nedir-ne-zaman-degistirilmeli` blogunu yeniden yaz (438 → 1200+ kelime). Hedef küme: ~480 gösterim, 0 tık (manyetik filtre 365/poz 10,7; nedir 40; ne işe yarar 44; filitre yazım hatası 30; fernox f1/f3/f8 ~120). **En yüksek getirili tek iş, Lega'dan bağımsız.**
- C2: Fernox TF1 Omega/Sigma/Sigma Mini karşılaştırma tablosu + 5 soruluk SSS + `FAQPage` schema
- C3: `filtreler` kategorisine 300 kelime üst metin
- C4: Regülatör kategorisine kVA/kW dönüşüm tablosu + 250 kelime üst metin + SSS (K2'ye bağlı)
- C5: Diğer 19 kategoriye sırayla içerik (sıra: filtreler → voltaj-regulatorleri → inhibitorler → sirkulasyon-pompalari → isi-pompasi-transfer → gaz-kacak → kalan)
- C6: İç link blokları: blog→ürün, ürün→aksesuar, kategori→blog
- C7: Yapısal veri: kategori `ItemList`+`FAQPage`, blog `Article`+`FAQPage`, `/kategoriler` `CollectionPage`. **Dikkat:** mevcut `Product` schema fiyatı `applySalePrice` çıktısıyla birebir eşleşmeli

**D grubu — Kalıcı URL (en son, 2 hafta ölçüm sonrası):**
- D1: `/kategori/[slug]` sayfası aç
- D2: `?category=` → `/kategori/` 301 (14 link aynı commit'te güncellenmeli)
- D3: `/marka/[slug]` sayfası aç (Lega hariç — K1'e bağlı)
- D4: `?brand=` → `/marka/` 301 (17 link aynı commit'te)
- D5: Header, HeroSlider, SSS, ana sayfa linklerini güncelle
- D6: Sitemap'i yeni URL'lere çevir

**Ölçüm (her aşamadan sonra):**
- GSC'de 10 kritik sayfaya yeniden indeksleme talebi
- SerpBear (localhost:3010, domain ID=2): fırsat kelimelerini keyword olarak ekle (manyetik filtre, lega, 10 kva regülatör). Scraper yok, GSC kolonundan takip.
- Haftalık sorgu + sayfa raporu karşılaştırması

---

## 5. Risk kuralları (DEĞİŞMEZ)

1. **PayTR / sepet / ödeme dosyalarına dokunulmaz.** Tarama sonucu SEO işleriyle bağlantısı sıfır.
2. **Ürün silinmez.** Sipariş geçmişi `OrderItem` ile bağlı olabilir; foreign key hatası riski. Sadece `isActive: false`.
3. **`prisma db push --accept-data-loss` şema değişikliğinde kullanılmaz.** Migration gerekir. (Not: `package.json` build script'inde bu komut var — dikkat.)
4. **301 yapılırken eski parametreli URL'ler yaşatılır**, silinmez. Aksi halde mevcut sıralamalar düşer.
5. **Lega ile ilgili hiçbir karar işletme sahibi onayı olmadan uygulanmaz.**
6. Rapor tespitleri canlıda tek tek doğrulanır; 4 madde geçersiz çıktı.

---

## 6. Önemli dosya konumları (referans)

| Amaç | Dosya |
|---|---|
| Root metadata + template | `src/app/layout.tsx` |
| Ürünler listeleme + kategori metadata | `src/app/(store)/urunler/page.tsx` |
| Ürün detay + Product schema | `src/app/(store)/urun/[slug]/page.tsx` |
| Blog detay metadata | `src/app/(store)/blog/[slug]/page.tsx` |
| Sitemap | `src/app/sitemap.ts` |
| Robots | `public/robots.txt` |
| Marka landing içerikleri | `src/lib/brand-content.ts` |
| Bayi belgeleri | `src/lib/dealership-certificates.ts` |
| Ürün açıklamaları | `src/lib/product-descriptions.ts` |
| Footer marka rozetleri | `src/components/layout/Footer.tsx:114` |
| Header kategori/marka menüsü | `src/components/layout/Header.tsx:221,248,321,335` |
| Ana sayfa hero | `src/components/HeroSlider.tsx` |
| Prisma şeması | `prisma/schema.prisma` |
| Next config + redirect'ler | `next.config.js` |

---

## 7. Sonraki oturumda ilk adım

1. Kullanıcıdan K1/K2/K3/K4 kararlarını al.
2. Karar ne olursa olsun **A grubu + B1/B2/B4** işlerine başla (Lega'dan bağımsız, sıfır risk).
3. Ardından C1 (manyetik filtre) — en yüksek getirili tek iş.
4. D grubunu 2 hafta ölçüm sonrasına ertele.

**Devam cümlesi:** "SEO devam notundan devam ediyoruz. K1/K2/K3/K4 kararlarım şunlar: ..."