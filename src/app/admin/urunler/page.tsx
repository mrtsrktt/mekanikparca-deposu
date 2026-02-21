'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi'
import { formatPrice } from '@/lib/pricing'
import toast from 'react-hot-toast'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadProducts = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/products?page=${page}&search=${search}`)
    const data = await res.json()
    setProducts(data.products)
    setTotal(data.total)
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadProducts() }, [page, search])

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Ürün silindi.')
      loadProducts()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Ürün silinemedi.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ürünler ({total})</h1>
        <Link href="/admin/urunler/ekle" className="btn-primary">
          <FiPlus className="w-4 h-4 mr-2" /> Yeni Ürün
        </Link>
      </div>

      <div className="card mb-4">
        <div className="p-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Ürün ara..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Ürün</th>
              <th className="text-left p-3">SKU</th>
              <th className="text-left p-3">Kategori</th>
              <th className="text-left p-3">Marka</th>
              <th className="text-left p-3">Fiyat</th>
              <th className="text-left p-3">Stok</th>
              <th className="text-left p-3">Durum</th>
              <th className="text-left p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]?.url || '/placeholder.jpg'} alt="" className="w-10 h-10 object-contain bg-gray-100 rounded" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-3 text-gray-500">{p.sku || '-'}</td>
                <td className="p-3">{p.category?.name || '-'}</td>
                <td className="p-3">{p.brand?.name || '-'}</td>
                <td className="p-3 font-medium">{formatPrice(p.priceTRY)}</td>
                <td className="p-3">{p.trackStock === false ? <span className="text-xs text-gray-400">Takip Yok</span> : p.stock}</td>
                <td className="p-3">
                  <span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {p.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Link href={`/admin/urunler/${p.id}`} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded">
                      <FiEdit className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && products.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-gray-500">Ürün bulunamadı.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
