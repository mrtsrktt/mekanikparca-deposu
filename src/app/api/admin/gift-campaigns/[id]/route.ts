import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { revalidateStorefront } from '@/lib/revalidate'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const campaign = await prisma.giftCampaign.findUnique({
    where: { id: params.id },
    include: { groups: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!campaign) {
    return NextResponse.json({ error: 'Kampanya bulunamadı.' }, { status: 404 })
  }

  return NextResponse.json(campaign)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const {
    name, slug, description,
    giftName, giftStockCode, giftValue, giftQuantity, giftImage,
    startDate, endDate, isActive, groups,
  } = body

  // Validation
  if (!name || !slug || !giftName || !giftStockCode || giftValue === undefined || !startDate || !endDate) {
    return NextResponse.json({ error: 'Eksik alanlar var.' }, { status: 400 })
  }

  if (new Date(endDate) < new Date(startDate)) {
    return NextResponse.json({ error: 'Bitiş tarihi başlangıç tarihinden önce olamaz.' }, { status: 400 })
  }

  // Check slug uniqueness (exclude current)
  const existing = await prisma.giftCampaign.findUnique({ where: { slug } })
  if (existing && existing.id !== params.id) {
    return NextResponse.json({ error: 'Bu URL kodu zaten kullanımda.' }, { status: 400 })
  }

  // Delete old groups and recreate
  await prisma.giftCampaignGroup.deleteMany({ where: { campaignId: params.id } })

  const campaign = await prisma.giftCampaign.update({
    where: { id: params.id },
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
        create: (groups || []).map((g: any, idx: number) => ({
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
  return NextResponse.json(campaign)
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin()
  if (error) return error

  await prisma.giftCampaign.delete({ where: { id: params.id } })

  revalidateStorefront()
  return NextResponse.json({ success: true })
}
