import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const discounts = await (prisma as any).b2BDiscount.findMany({
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(discounts)
}

export async function PUT(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const { generalDiscount, brandDiscounts, categoryDiscounts } = await req.json()

  // Tüm mevcut indirimleri sil
  await (prisma as any).b2BDiscount.deleteMany()

  // Genel indirim
  if (generalDiscount && generalDiscount > 0) {
    await (prisma as any).b2BDiscount.create({
      data: { scopeType: 'GENERAL', discount: generalDiscount },
    })
  }

  // Marka indirimleri
  if (brandDiscounts && Array.isArray(brandDiscounts)) {
    for (const bd of brandDiscounts) {
      if (bd.brandId && bd.discount > 0) {
        await (prisma as any).b2BDiscount.create({
          data: { scopeType: 'BRAND', brandId: bd.brandId, discount: bd.discount },
        })
      }
    }
  }

  // Kategori indirimleri
  if (categoryDiscounts && Array.isArray(categoryDiscounts)) {
    for (const cd of categoryDiscounts) {
      if (cd.categoryId && cd.discount > 0) {
        await (prisma as any).b2BDiscount.create({
          data: { scopeType: 'CATEGORY', categoryId: cd.categoryId, discount: cd.discount },
        })
      }
    }
  }

  // Güncel listeyi döndür
  const updated = await (prisma as any).b2BDiscount.findMany({
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(updated)
}
