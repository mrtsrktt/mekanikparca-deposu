import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Kategoriler</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/urunler?category=${cat.slug}`} className="card p-5 hover:shadow-md transition-shadow group flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
              <span className="text-xl">🔧</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm group-hover:text-primary-500 transition-colors truncate">{cat.name}</h2>
              <p className="text-xs text-gray-500">{cat._count.products} ürün</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
