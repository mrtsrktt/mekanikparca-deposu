-- Bayiye OZEL indirim orani — additive, atomik, strict.
-- Yalnizca yeni bir nullable kolon ekler; mevcut veri SILINMEZ.
--
-- Anlam:
--   User.customDiscountPercent = NULL  -> tur bazli oran kullanilir (WHOLESALER %25 / SERVICE %15)
--   User.customDiscountPercent = 0..100 -> bu kisi icin tur bazli oran GECERSIZ kilinir
--
-- Atomik: tum islem tek transaction icinde. Herhangi bir cakismada hata verir
-- ve transaction TAMAMEN geri alinir (IF NOT EXISTS yok).

BEGIN;

-- AddColumn: User.customDiscountPercent (nullable — ozel oran tanimlanmamissa NULL)
ALTER TABLE "User" ADD COLUMN "customDiscountPercent" DOUBLE PRECISION;

COMMIT;
