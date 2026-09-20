-- Bayi turu (dealer type) modulu — additive, atomik, strict.
-- Yalnizca yeni enum ve iki nullable kolon ekler; mevcut veri SILINMEZ.
--
-- Atomik: tum islem tek transaction icinde. Herhangi bir cakismada hata verir
-- ve transaction TAMAMEN geri alinir (IF NOT EXISTS yok).

BEGIN;

-- CreateEnum
CREATE TYPE "DealerType" AS ENUM ('WHOLESALER', 'SERVICE');

-- AddColumn: User.dealerType (nullable — onayli bayi degilse NULL)
ALTER TABLE "User" ADD COLUMN "dealerType" "DealerType";

-- AddColumn: CorporateApplication.dealerType (nullable — talep edilen tur)
ALTER TABLE "CorporateApplication" ADD COLUMN "dealerType" "DealerType";

-- Geriye donuk atama: mevcut ONAYLI basvurularin tumu TOPTANCI kabul edilir.
-- (Bu noktada yalnizca test amacli tek bir onayli kayit bulunmaktadir.)
UPDATE "CorporateApplication"
   SET "dealerType" = 'WHOLESALER'
 WHERE "status" = 'APPROVED'
   AND "dealerType" IS NULL;

-- Onayli basvurusu olan kullanicilarin User.dealerType alani da TOPTANCI olur.
UPDATE "User" u
   SET "dealerType" = 'WHOLESALER'
  FROM "CorporateApplication" ca
 WHERE ca."userId" = u."id"
   AND ca."status" = 'APPROVED'
   AND u."dealerType" IS NULL;

-- Ilk ayar degerleri: tur bazli bayi indirim oranlari (yuzde).
-- Admin panelinden degistirilebilir; yoksa kod varsayilanlari kullanilir.
-- Sabit ID'ler kullanilir: SiteSetting.id DB tarafinda varsayilana sahip degil
-- (Prisma cuid() uygulama tarafinda uretir). gen_random_uuid() uzanti gerektirir.
INSERT INTO "SiteSetting" ("id", "key", "value")
VALUES
  ('setting_dealer_discount_wholesaler', 'dealer_discount_wholesaler', '25'),
  ('setting_dealer_discount_service',    'dealer_discount_service',    '15')
ON CONFLICT ("key") DO NOTHING;

COMMIT;
