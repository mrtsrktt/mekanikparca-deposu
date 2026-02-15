'use client'

import { useEffect, useState, useRef } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiUpload, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import slugify from 'slugify'

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ title: '', slug: '', content: '', excerpt: '', coverImage: '', isPublished: false, metaTitle: '', metaDesc: '' })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = () => fetch('/api/admin/blog').then(r => r.json()).then(setPosts)
  useEffect(() => { load() }, [])

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('files', file)
      formData.append('folder', 'blog')

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        if (data.files?.[0]?.url) {
          setForm(prev => ({ ...prev, coverImage: data.files[0].url }))
          toast.success('Görsel yüklendi!')
        }
      } else {
        toast.error('Yükleme başarısız.')
      }
    } catch {
      toast.error('Yükleme hatası.')
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/admin/blog/${editing.id}` : '/api/admin/blog'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) {
      toast.success(editing ? 'Yazı güncellendi!' : 'Yazı eklendi!')
      setShowForm(false); setEditing(null)
      setForm({ title: '', slug: '', content: '', excerpt: '', coverImage: '', isPublished: false, metaTitle: '', metaDesc: '' })
      load()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    toast.success('Yazı silindi.')
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blog Yazıları</h1>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ title: '', slug: '', content: '', excerpt: '', coverImage: '', isPublished: false, metaTitle: '', metaDesc: '' }) }} className="btn-primary">
          <FiPlus className="w-4 h-4 mr-2" /> Yeni Yazı
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Başlık *</label>
              <input type="text" required className="input-field" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value, { lower: true, strict: true }) })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input type="text" className="input-field" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Özet</label>
            <textarea rows={2} className="input-field" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">İçerik *</label>
            <textarea rows={10} required className="input-field" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>

          {/* Kapak Görseli — Dosya Yükleme */}
          <div>
            <label className="block text-sm font-medium mb-1">Kapak Görseli</label>
            {form.coverImage ? (
              <div className="relative inline-block">
                <img src={form.coverImage} alt="Kapak" className="w-48 h-32 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, coverImage: '' })}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  title="Görseli Kaldır"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin w-8 h-8 text-primary-500" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm text-gray-500">Yükleniyor...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FiUpload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">Görsel yüklemek için tıklayın</span>
                    <span className="text-xs text-gray-400">JPG, PNG, WebP</span>
                  </div>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadCover}
            />
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
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
            <span className="text-sm">Yayınla</span>
          </label>
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
              <th className="text-left p-3">Görsel</th>
              <th className="text-left p-3">Başlık</th>
              <th className="text-left p-3">Durum</th>
              <th className="text-left p-3">Tarih</th>
              <th className="text-left p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Henüz blog yazısı yok.</td></tr>
            ) : posts.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  {p.coverImage ? (
                    <img src={p.coverImage} alt={p.title} className="w-16 h-10 object-cover rounded" />
                  ) : (
                    <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Yok</div>
                  )}
                </td>
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3"><span className={`badge ${p.isPublished ? 'badge-success' : 'badge-warning'}`}>{p.isPublished ? 'Yayında' : 'Taslak'}</span></td>
                <td className="p-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString('tr-TR')}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(p); setForm({ title: p.title, slug: p.slug, content: p.content, excerpt: p.excerpt || '', coverImage: p.coverImage || '', isPublished: p.isPublished, metaTitle: p.metaTitle || '', metaDesc: p.metaDesc || '' }); setShowForm(true) }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><FiEdit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 className="w-4 h-4" /></button>
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
