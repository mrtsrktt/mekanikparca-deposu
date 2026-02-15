import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const campaigns = await prisma.campaign.findMany({
    include: { tiers: { orderBy: { minQuantity: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(campaigns)
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const { name, description, type, scopeType, productId, brandId, categoryId, startDate, endDate, isActive, tiers } = body

  // Validation
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

  // Check duplicate minQuantity in tiers
  if (tiers && Array.isArray(tiers)) {
    const quantities = tiers.map((t: any) => t.minQuantity)
    const uniqueQuantities = new Set(quantities)
    if (quantities.length !== uniqueQuantities.size) {
      return NextResponse.json({ error: 'Aynı minimum adet değerine sahip birden fazla kademe eklenemez.' }, { status: 400 })
    }
  }

  const campaign = await prisma.campaign.create({
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

  return NextResponse.json(campaign, { status: 201 })
}
