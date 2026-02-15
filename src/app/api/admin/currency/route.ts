import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { recalculateProductPrices } from '@/lib/pricing'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error
  const rates = await prisma.currencyRate.findMany()
  return NextResponse.json(rates)
}

export async function POST(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const { currency, rate } = body

  const updated = await prisma.currencyRate.upsert({
    where: { currency },
    update: { rate },
    create: { currency, rate },
  })

  // Recalculate all product prices in this currency
  await recalculateProductPrices(currency, rate)

  return NextResponse.json({ message: `${currency} kuru güncellendi. Ürün fiyatları yeniden hesaplandı.`, rate: updated })
}
