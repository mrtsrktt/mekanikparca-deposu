'use client'

import { useEffect, useState } from 'react'
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import slugify from 'slugify'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', parentId: '', sortOrder: 0, isActive: true, metaTitle: '', metaDesc: '' })

  const load = () => fetch('/api/admin/categories').then(r => r.json()).then(setCategories)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, parentId: form.parentId || null }) })
    if (res.ok) {
      toast.success(editing ? 'Kategori güncellendi!' : 'Kategori eklendi!')
      setShowForm(false); setEditing(null)
      setForm({ name: '', slug: '', description: '', parentId: '', sortOrder: 0, isActive: true, metaTitle: '', metaDesc: '' })
      load()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    toast.success('Kategori silindi.')
    load()
  }

  const startEdit = (cat: any) => {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', parentId: cat.parentId || '', sortOrder: cat.sortOrder, isActive: cat.isActive, metaTitle: cat.metaTitle || '', metaDesc: cat.metaDesc || '' })
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kategoriler</h1>
        <button onClick={() => { setShowForm(!showForm); setEditing(null) }} className="btn-primary">
          <FiPlus className="w-4 h-4 mr-2" /> Yeni Kategori
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kategori Adı *</label>
              <input type="text" required className="input-field" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value, { lower: true, strict: true }) })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input type="text" className="input-field" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Üst Kategori</label>
              <select className="input-field" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                <option value="">Yok (Ana Kategori)</option>
                {categories.filter(c => c.id !== editing?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sıralama</label>
              <input type="number" className="input-field" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Açıklama</label>
            <textarea rows={2} className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Meta Başlık</label>
              <input type="text" className="input-field" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Meta Açıklama</label>
              <input type="text" className="input-field" value={form.metaDesc} onChange={(e) => setForm({ ...form, metaDesc: e.target.value })} />
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
              <th className="text-left p-3">Kategori</th>
              <th className="text-left p-3">Üst Kategori</th>
              <th className="text-left p-3">Ürün Sayısı</th>
              <th className="text-left p-3">Sıra</th>
              <th className="text-left p-3">Durum</th>
              <th className="text-left p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{cat.name}</td>
                <td className="p-3 text-gray-500">{cat.parent?.name || '-'}</td>
                <td className="p-3">{cat._count?.products || 0}</td>
                <td className="p-3">{cat.sortOrder}</td>
                <td className="p-3"><span className={`badge ${cat.isActive ? 'badge-success' : 'badge-danger'}`}>{cat.isActive ? 'Aktif' : 'Pasif'}</span></td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><FiEdit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 className="w-4 h-4" /></button>
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
