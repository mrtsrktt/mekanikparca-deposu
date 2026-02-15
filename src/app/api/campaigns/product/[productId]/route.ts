import { NextRequest, NextResponse } from 'next/server'
import { getActiveCampaignsForProduct } from '@/lib/campaignPricing'

export async function GET(req: NextRequest, { params }: { params: { productId: string } }) {
  const campaigns = await getActiveCampaignsForProduct(params.productId)
  return NextResponse.json(campaigns)
}
