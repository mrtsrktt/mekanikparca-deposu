import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://mekanikparcadeposu.com'
const STORE_NAME = 'Mekanik Parça Deposu'

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      brand: true,
      category: true,
    },
  })

  const items = products
    .filter((p) => p.priceTRY && p.priceTRY > 0)
    .map((p) => {
      const image = p.images[0]?.url || ''
      const availability = p.trackStock
        ? p.stock > 0 ? 'in_stock' : 'out_of_stock'
        : 'in_stock'
      const description = p.metaDesc || p.description?.replace(/<[^>]*>/g, '').slice(0, 500) || p.name
      const title = p.metaTitle || p.name

      return `
    <item>
      <g:id>${p.id}</g:id>
      <g:title><![CDATA[${title}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${BASE_URL}/urun/${p.slug}</g:link>
      <g:image_link>${image}</g:image_link>
      <g:price>${p.priceTRY.toFixed(2)} TRY</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      ${p.brand ? `<g:brand><![CDATA[${p.brand.name}]]></g:brand>` : ''}
      ${p.sku ? `<g:mpn>${p.sku}</g:mpn>` : ''}
      ${p.category ? `<g:product_type><![CDATA[${p.category.name}]]></g:product_type>` : ''}
      <g:identifier_exists>no</g:identifier_exists>
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${STORE_NAME}</title>
    <link>${BASE_URL}</link>
    <description>Isıtma ve soğutma sistemleri ürün kataloğu</description>
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
