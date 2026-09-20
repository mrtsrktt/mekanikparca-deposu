-- Kurumsal basvuru modulu (additive, atomik, strict).
-- Yalnizca yeni enum, iki yeni tablo, iliskiler ve indeksler ekler.
-- Mevcut tablo/kolon SILINMEZ, yeniden ADLANDIRILMAZ, veri GUNCELLENMEZ.
-- "User" tablosuna kolon EKLENMEZ (yalnizca iliski kolonlari yeni tablolarda).
--
-- Atomik: tum islem tek transaction icinde; herhangi bir cakismada hata verir
-- ve transaction TAMAMEN geri alinir. Sessizce devam etmez (IF NOT EXISTS yok).

BEGIN;

-- CreateEnum
CREATE TYPE "CorporateApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVOKED');

-- CreateTable
CREATE TABLE "CorporateApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CorporateApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "companyName" JSONB NOT NULL,
    "taxNumber" JSONB NOT NULL,
    "taxOffice" JSONB NOT NULL,
    "companyAddress" JSONB NOT NULL,
    "companyPhone" JSONB NOT NULL,
    "authorizedPerson" JSONB NOT NULL,
    "applicationNote" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "decidedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorporateApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorporateApplicationEvent" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fromStatus" "CorporateApplicationStatus",
    "toStatus" "CorporateApplicationStatus" NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CorporateApplicationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CorporateApplication_userId_idx" ON "CorporateApplication"("userId");

-- CreateIndex
CREATE INDEX "CorporateApplication_status_idx" ON "CorporateApplication"("status");

-- CreateIndex
CREATE INDEX "CorporateApplication_decidedByUserId_idx" ON "CorporateApplication"("decidedByUserId");

-- CreateIndex
CREATE INDEX "CorporateApplicationEvent_applicationId_idx" ON "CorporateApplicationEvent"("applicationId");

-- CreateIndex
CREATE INDEX "CorporateApplicationEvent_actorUserId_idx" ON "CorporateApplicationEvent"("actorUserId");

-- CreateIndex (kismi unique: ayni kullanici icin ayni anda en fazla bir PENDING/APPROVED basvuru)
CREATE UNIQUE INDEX "CorporateApplication_one_active_per_user"
    ON "CorporateApplication"("userId")
    WHERE "status" IN ('PENDING', 'APPROVED');

-- AddForeignKey
ALTER TABLE "CorporateApplication" ADD CONSTRAINT "CorporateApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorporateApplication" ADD CONSTRAINT "CorporateApplication_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorporateApplicationEvent" ADD CONSTRAINT "CorporateApplicationEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "CorporateApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorporateApplicationEvent" ADD CONSTRAINT "CorporateApplicationEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
