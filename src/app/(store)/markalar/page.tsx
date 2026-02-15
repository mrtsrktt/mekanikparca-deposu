import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Markalar</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {brands.map((brand) => (
          <Link key={brand.id} href={`/urunler?brand=${brand.slug}`} className="card p-6 text-center hover:shadow-md transition-shadow">
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} className="h-12 mx-auto mb-3 object-contain" />
            ) : (
              <div className="h-12 flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-gray-400">{brand.name[0]}</span>
              </div>
            )}
            <h2 className="font-semibold text-sm">{brand.name}</h2>
            <p className="text-xs text-gray-500 mt-1">{brand._count.products} ürün</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
