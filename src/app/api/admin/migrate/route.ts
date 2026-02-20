import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    // Execute raw SQL to create tables
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

    // Add foreign keys if they don't exist
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "ProductVideo" 
        ADD CONSTRAINT "ProductVideo_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "Product"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
      `)
    } catch (e) {
      // Foreign key might already exist
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "ProductDocument" 
        ADD CONSTRAINT "ProductDocument_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "Product"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
      `)
    } catch (e) {
      // Foreign key might already exist
    }

    return NextResponse.json({ success: true, message: 'Migration completed successfully' })
  } catch (err: any) {
    console.error('Migration error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
