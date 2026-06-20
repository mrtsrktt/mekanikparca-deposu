import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { revalidateStorefront } from '@/lib/revalidate'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const campaigns = await prisma.giftCampaign.findMany({
    include: { groups: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(campaigns)
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const {
    name, slug, description,
    giftName, giftStockCode, giftValue, giftQuantity, giftImage,
    startDate, endDate, isActive, groups,
  } = body

  // Validation
  const missing: string[] = []
  if (!name) missing.push('name')
  if (!slug) missing.push('slug')
  if (!giftName) missing.push('giftName')
  if (!giftStockCode) missing.push('giftStockCode')
  if (giftValue === undefined || giftValue === null) missing.push('giftValue')
  if (!startDate) missing.push('startDate')
  if (!endDate) missing.push('endDate')
  if (!groups || !Array.isArray(groups) || groups.length === 0) missing.push('groups')

  if (missing.length > 0) {
    return NextResponse.json({ error: 'Eksik alanlar', fields: missing }, { status: 400 })
  }

  if (new Date(endDate) < new Date(startDate)) {
    return NextResponse.json({ error: 'Bitiş tarihi başlangıç tarihinden önce olamaz.' }, { status: 400 })
  }

  // Check slug uniqueness
  const existing = await prisma.giftCampaign.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'Bu URL kodu zaten kullanımda.' }, { status: 400 })
  }

  const campaign = await prisma.giftCampaign.create({
    data: {
      name,
      slug,
      description: description || null,
      giftName,
      giftStockCode,
      giftValue,
      giftQuantity: giftQuantity || 1,
      giftImage: giftImage || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive !== false,
      groups: {
        create: groups.map((g: any, idx: number) => ({
          name: g.name,
          productIds: g.productIds || [],
          threshold: g.threshold,
          sortOrder: g.sortOrder ?? idx,
        })),
      },
    },
    include: { groups: { orderBy: { sortOrder: 'asc' } } },
  })

  revalidateStorefront()
  return NextResponse.json(campaign, { status: 201 })
}
