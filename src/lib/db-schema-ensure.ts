import { prisma } from './prisma'

let tablesEnsured = false

/**
 * Ensures ProductVideo and ProductDocument tables and foreign key constraints
 * exist in PostgreSQL / Neon database. Self-healing and idempotent.
 */
export async function ensureVideoAndDocumentTables() {
  if (tablesEnsured) return
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProductVideo" (
        "id" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "title" TEXT,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "ProductVideo_pkey" PRIMARY KEY ("id")
      );
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProductDocument" (
        "id" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "fileSize" INTEGER,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "ProductDocument_pkey" PRIMARY KEY ("id")
      );
    `)

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'ProductVideo_productId_fkey'
        ) THEN
          ALTER TABLE "ProductVideo"
          ADD CONSTRAINT "ProductVideo_productId_fkey"
          FOREIGN KEY ("productId") REFERENCES "Product"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'ProductDocument_productId_fkey'
        ) THEN
          ALTER TABLE "ProductDocument"
          ADD CONSTRAINT "ProductDocument_productId_fkey"
          FOREIGN KEY ("productId") REFERENCES "Product"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)

    tablesEnsured = true
  } catch (err) {
    console.warn('ensureVideoAndDocumentTables warning (continuing):', err)
  }
}
