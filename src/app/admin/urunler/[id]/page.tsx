'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import toast from 'react-hot-toast'
import slugify from 'slugify'

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', sku: '', description: '', technicalDetails: '',
    priceCurrency: 'TRY', priceOriginal: 0, b2bPrice: 0,
    stock: 0, trackStock: true, categoryId: '', brandId: '',
    isActive: true, isFeatured: false,
    metaTitle: '', metaDesc: '', weight: 0, unit: 'Adet', minOrder: 1,
    freeShipping: false,
    images: [] as { url: string; alt: string }[],
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/categories').then(r => r.json()),
      fetch('/api/admin/brands').then(r => r.json()),
      fetch(`/api/admin/products/${params.id}`).then(r => r.json()),
    ]).then(([cats, brs, product]) => {
      setCategories(cats)
      setBrands(brs)
      setForm({
        name: product.name || '', slug: product.slug || '', sku: product.sku || '',
        description: product.description || '', technicalDetails: product.technicalDetails || '',
        priceCurrency: product.priceCurrency || 'TRY', priceOriginal: product.priceOriginal || 0,
        b2bPrice: product.b2bPrice || 0, stock: product.stock || 0,
        trackStock: product.trackStock ?? true,
        categoryId: product.categoryId || '', brandId: product.brandId || '',
        isActive: product.isActive ?? true, isFeatured: product.isFeatured ?? false,
        metaTitle: product.metaTitle || '', metaDesc: product.metaDesc || '',
        weight: product.weight || 0, unit: product.unit || 'Adet', minOrder: product.minOrder || 1,
        freeShipping: product.freeShipping ?? false,
        images: product.images?.map((img: any) => ({ url: img.url, alt: img.alt || '' })) || [],
      })
      setLoading(false)
    })
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success('Ürün güncellendi!')
        router.push('/admin/urunler')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Hata oluştu.')
      }
    } catch {
      toast.error('Bir hata oluştu.')
    }
    setSaving(false)
  }

  const update = (field: string, value: any) => setForm({ ...form, [field]: value })

  if (loading) return <div className="text-center py-16">Yükleniyor...</div>

  return (
    <div>
      <Link href="/admin/urunler" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-6">
        <FiArrowLeft className="w-4 h-4" /> Ürünler
      </Link>
      <h1 className="text-2xl font-bold mb-6">Ürün Düzenle</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Temel Bilgiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ürün Adı *</label>
              <input type="text" required className="input-field" value={form.name} onChange={(e) => { update('name', e.target.value); update('slug', slugify(e.target.value, { lower: true, strict: true })) }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input type="text" className="input-field" value={form.slug} onChange={(e) => update('slug', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input type="text" className="input-field" value={form.sku} onChange={(e) => update('sku', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Birim</label>
              <input type="text" className="input-field" value={form.unit} onChange={(e) => update('unit', e.target.value)} />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Açıklama</label>
            <textarea rows={4} className="input-field" value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Teknik Detaylar</label>
            <textarea rows={4} className="input-field" value={form.technicalDetails} onChange={(e) => update('technicalDetails', e.target.value)} />
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Fiyatlandırma</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Para Birimi</label>
              <select className="input-field" value={form.priceCurrency} onChange={(e) => update('priceCurrency', e.target.value)}>
                <option value="TRY">TL (₺)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fiyat *</label>
              <input type="number" step="any" required className="input-field" value={form.priceOriginal} onChange={(e) => update('priceOriginal', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bayi Özel Fiyat (TL)</label>
              <input type="number" step="0.01" className="input-field" value={form.b2bPrice} onChange={(e) => update('b2bPrice', parseFloat(e.target.value))} />
              <p className="text-xs text-gray-400 mt-1">Boş bırakılırsa indirim kuralları uygulanır</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stok</label>
              <input type="number" className="input-field" value={form.stock} onChange={(e) => update('stock', parseInt(e.target.value))} disabled={!form.trackStock} />
              <label className="flex items-center gap-2 mt-2">
                <input type="checkbox" checked={!form.trackStock} onChange={(e) => update('trackStock', !e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-600">Stok takibi olmasın</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min. Sipariş</label>
              <input type="number" className="input-field" value={form.minOrder} onChange={(e) => update('minOrder', parseInt(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ağırlık (kg)</label>
              <input type="number" step="0.01" className="input-field" value={form.weight} onChange={(e) => update('weight', parseFloat(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Marka & Kategori */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Marka & Kategori</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Marka *</label>
              <select className="input-field" value={form.brandId} onChange={(e) => update('brandId', e.target.value)}>
                <option value="">Marka Seçiniz</option>
                {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kategori *</label>
              <select className="input-field" value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)}>
                <option value="">Kategori Seçiniz</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Görseller</h2>
          {form.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
              {form.images.map((img, i) => (
                <div key={i} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                  <img src={img.url} alt={img.alt} className="w-full h-32 object-cover" />
                  <button type="button" onClick={() => update('images', form.images.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                  <input type="text" placeholder="Alt metin" className="w-full text-xs px-2 py-1 border-t bg-white" value={img.alt}
                    onChange={(e) => { const imgs = [...form.images]; imgs[i].alt = e.target.value; update('images', imgs) }} />
                </div>
              ))}
            </div>
          )}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors">
            <div className="flex flex-col items-center text-gray-500">
              <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" /></svg>
              <span className="text-sm font-medium">{uploading ? 'Yükleniyor...' : 'Görsel yüklemek için tıklayın'}</span>
            </div>
            <input type="file" accept="image/*" multiple className="hidden" disabled={uploading}
              onChange={async (e) => {
                const files = e.target.files; if (!files?.length) return
                setUploading(true)
                try {
                  const fd = new FormData(); Array.from(files).forEach(f => fd.append('files', f))
                  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
                  const data = await res.json()
                  if (res.ok && data.files) { update('images', [...form.images, ...data.files]); toast.success(`${data.files.length} görsel yüklendi`) }
                  else { toast.error(data.error || 'Yükleme hatası') }
                } catch { toast.error('Görsel yüklenirken hata oluştu') }
                setUploading(false); e.target.value = ''
              }} />
          </label>
        </div>

        {/* SEO */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">SEO</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Meta Başlık</label>
              <input type="text" className="input-field" value={form.metaTitle} onChange={(e) => update('metaTitle', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">Meta Açıklama</label>
              <textarea rows={2} className="input-field" value={form.metaDesc} onChange={(e) => update('metaDesc', e.target.value)} /></div>
          </div>
        </div>

        {/* Options */}
        <div className="card p-6">
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)} className="rounded" />
              <span className="text-sm">Aktif</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => update('isFeatured', e.target.checked)} className="rounded" />
              <span className="text-sm">Öne Çıkan</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.freeShipping} onChange={(e) => update('freeShipping', e.target.checked)} className="rounded" />
              <span className="text-sm">Ücretsiz Kargo</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Kaydediliyor...' : 'Güncelle'}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">İptal</button>
        </div>
      </form>
    </div>
  )
}
