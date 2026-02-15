'use client'

import { useEffect, useState } from 'react'
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import slugify from 'slugify'

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', slug: '', logo: '', description: '', sortOrder: 0, isActive: true })

  const load = () => fetch('/api/admin/brands').then(r => r.json()).then(setBrands)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/admin/brands/${editing.id}` : '/api/admin/brands'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) {
      toast.success(editing ? 'Marka güncellendi!' : 'Marka eklendi!')
      setShowForm(false); setEditing(null)
      setForm({ name: '', slug: '', logo: '', description: '', sortOrder: 0, isActive: true })
      load()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' })
    toast.success('Marka silindi.')
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Markalar</h1>
        <button onClick={() => { setShowForm(!showForm); setEditing(null) }} className="btn-primary">
          <FiPlus className="w-4 h-4 mr-2" /> Yeni Marka
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Marka Adı *</label>
              <input type="text" required className="input-field" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value, { lower: true, strict: true }) })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input type="text" className="input-field" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Logo URL</label>
              <input type="text" className="input-field" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sıralama</label>
              <input type="number" className="input-field" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">{editing ? 'Güncelle' : 'Kaydet'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="btn-secondary">İptal</button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Marka</th>
              <th className="text-left p-3">Ürün Sayısı</th>
              <th className="text-left p-3">Sıra</th>
              <th className="text-left p-3">Durum</th>
              <th className="text-left p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{b.name}</td>
                <td className="p-3">{b._count?.products || 0}</td>
                <td className="p-3">{b.sortOrder}</td>
                <td className="p-3"><span className={`badge ${b.isActive ? 'badge-success' : 'badge-danger'}`}>{b.isActive ? 'Aktif' : 'Pasif'}</span></td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(b); setForm({ name: b.name, slug: b.slug, logo: b.logo || '', description: b.description || '', sortOrder: b.sortOrder, isActive: b.isActive }); setShowForm(true) }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><FiEdit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
