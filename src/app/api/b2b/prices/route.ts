import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateB2BPrice } from '@/lib/pricing'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'B2B') {
    return NextResponse.json([])
  }

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } })
  if (!user || user.b2bStatus !== 'APPROVED') {
    return NextResponse.json([])
  }

  const { productIds } = await req.json()
  if (!productIds || !Array.isArray(productIds)) {
    return NextResponse.json([])
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, priceTRY: true, b2bPrice: true, brandId: true, categoryId: true },
  })

  const results = await Promise.all(
    products.map(async (product) => {
      const b2bPrice = await calculateB2BPrice(product)
      return {
        productId: product.id,
        originalPrice: product.priceTRY,
        b2bPrice,
        hasDiscount: b2bPrice < product.priceTRY,
        discountPercent: b2bPrice < product.priceTRY
          ? Math.round((1 - b2bPrice / product.priceTRY) * 100)
          : 0,
      }
    })
  )

  return NextResponse.json(results)
}
