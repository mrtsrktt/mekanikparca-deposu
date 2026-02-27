import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rates = await prisma.currencyRate.findMany({
      where: {
        currency: {
          in: ['USD', 'EUR']
        }
      }
    })

    const rateMap: Record<string, number> = {
      TRY: 1
    }

    rates.forEach(rate => {
      rateMap[rate.currency] = rate.rate
    })

    // Default rates if not in DB
    if (!rateMap.USD) rateMap.USD = 44.0
    if (!rateMap.EUR) rateMap.EUR = 55.0

    return NextResponse.json(rateMap)
  } catch (error) {
    console.error('Exchange rates fetch error:', error)
    // Return default rates if DB error
    return NextResponse.json({
      TRY: 1,
      USD: 44.0,
      EUR: 55.0
    })
  }
}