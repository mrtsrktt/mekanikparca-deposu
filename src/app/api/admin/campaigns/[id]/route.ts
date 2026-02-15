import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error

  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: { tiers: { orderBy: { minQuantity: 'asc' } } },
  })

  if (!campaign) {
    return NextResponse.json({ error: 'Kampanya bulunamadı.' }, { status: 404 })
  }

  return NextResponse.json(campaign)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error

  const existing = await prisma.campaign.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Kampanya bulunamadı.' }, { status: 404 })
  }

  const body = await req.json()
  const { name, description, type, scopeType, productId, brandId, categoryId, startDate, endDate, isActive, tiers } = body

  const missing: string[] = []
  if (!name) missing.push('name')
  if (!type || !['PERCENTAGE', 'FIXED_PRICE'].includes(type)) missing.push('type')
  if (!scopeType || !['PRODUCT', 'BRAND', 'CATEGORY'].includes(scopeType)) missing.push('scopeType')
  if (!startDate) missing.push('startDate')
  if (!endDate) missing.push('endDate')
  if (scopeType === 'PRODUCT' && !productId) missing.push('productId')
  if (scopeType === 'BRAND' && !brandId) missing.push('brandId')
  if (scopeType === 'CATEGORY' && !categoryId) missing.push('categoryId')

  if (missing.length > 0) {
    return NextResponse.json({ error: 'Eksik alanlar', fields: missing }, { status: 400 })
  }

  if (new Date(endDate) < new Date(startDate)) {
    return NextResponse.json({ error: 'Bitiş tarihi başlangıç tarihinden önce olamaz.' }, { status: 400 })
  }

  if (tiers && Array.isArray(tiers)) {
    const quantities = tiers.map((t: any) => t.minQuantity)
    if (quantities.length !== new Set(quantities).size) {
      return NextResponse.json({ error: 'Aynı minimum adet değerine sahip birden fazla kademe eklenemez.' }, { status: 400 })
    }
  }

  // Delete existing tiers and recreate
  await prisma.campaignTier.deleteMany({ where: { campaignId: params.id } })

  const campaign = await prisma.campaign.update({
    where: { id: params.id },
    data: {
      name,
      description: description || null,
      type,
      scopeType,
      productId: scopeType === 'PRODUCT' ? productId : null,
      brandId: scopeType === 'BRAND' ? brandId : null,
      categoryId: scopeType === 'CATEGORY' ? categoryId : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive !== false,
      tiers: {
        create: (tiers || []).map((t: any) => ({
          minQuantity: t.minQuantity,
          value: t.value,
        })),
      },
    },
    include: { tiers: { orderBy: { minQuantity: 'asc' } } },
  })

  return NextResponse.json(campaign)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error

  const existing = await prisma.campaign.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Kampanya bulunamadı.' }, { status: 404 })
  }

  await prisma.campaign.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
