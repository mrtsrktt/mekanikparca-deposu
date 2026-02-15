'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Tier {
  minQuantity: number
  value: number
}

interface CampaignData {
  id?: string
  name: string
  description: string
  type: 'PERCENTAGE' | 'FIXED_PRICE'
  scopeType: 'PRODUCT' | 'BRAND' | 'CATEGORY'
  productId: string
  brandId: string
  categoryId: string
  startDate: string
  endDate: string
  isActive: boolean
  tiers: Tier[]
}

interface Props {
  initial?: any
  isEdit?: boolean
}

export default function CampaignForm({ initial, isEdit }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  const [form, setForm] = useState<CampaignData>({
    name: '',
    description: '',
    type: 'PERCENTAGE',
    scopeType: 'PRODUCT',
    productId: '',
    brandId: '',
    categoryId: '',
    startDate: '',
    endDate: '',
    isActive: true,
    tiers: [{ minQuantity: 10, value: 5 }],
  })

  useEffect(() => {
    fetch('/api/admin/products?limit=1000').then(r => r.json()).then(d => setProducts(d.products || d))
    fetch('/api/admin/brands').then(r => r.json()).then(setBrands)
    fetch('/api/admin/categories').then(r => r.json()).then(setCategories)
  }, [])

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        description: initial.description || '',
        type: initial.type || 'PERCENTAGE',
        scopeType: initial.scopeType || 'PRODUCT',
        productId: initial.productId || '',
        brandId: initial.brandId || '',
        categoryId: initial.categoryId || '',
        startDate: initial.startDate ? new Date(initial.startDate).toISOString().split('T')[0] : '',
        endDate: initial.endDate ? new Date(initial.endDate).toISOString().split('T')[0] : '',
        isActive: initial.isActive !== false,
        tiers: initial.tiers?.map((t: any) => ({ minQuantity: t.minQuantity, value: t.value })) || [{ minQuantity: 10, value: 5 }],
      })
    }
  }, [initial])

  const addTier = () => {
    const lastQty = form.tiers.length > 0 ? form.tiers[form.tiers.length - 1].minQuantity : 0
    setForm({ ...form, tiers: [...form.tiers, { minQuantity: lastQty + 10, value: 0 }] })
  }

  const removeTier = (idx: number) => {
    setForm({ ...form, tiers: form.tiers.filter((_, i) => i !== idx) })
  }

  const updateTier = (idx: number, field: keyof Tier, val: number) => {
    const tiers = [...form.tiers]
    tiers[idx] = { ...tiers[idx], [field]: val }
    setForm({ ...form, tiers })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Check duplicate minQuantity
    const quantities = form.tiers.map(t => t.minQuantity)
    if (new Set(quantities).size !== quantities.length) {
      toast.error('Aynı minimum adet değerine sahip birden fazla kademe olamaz.')
      setSaving(false)
      return
    }

    const payload = {
      ...form,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate + 'T23:59:59').toISOString(),
    }

    const url = isEdit ? `/api/admin/campaigns/${initial.id}` : '/api/admin/campaigns'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success(isEdit ? 'Kampanya güncellendi.' : 'Kampanya oluşturuldu.')
        router.push('/admin/kampanyalar')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Bir hata oluştu.')
      }
    } catch {
      toast.error('Bir hata oluştu.')
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Temel Bilgiler */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Kampanya Bilgileri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Adı *</label>
            <input type="text" required className="input-field" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Türü *</label>
            <select className="input-field" value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value as any })}>
              <option value="PERCENTAGE">Yüzde İndirim (%)</option>
              <option value="FIXED_PRICE">Sabit TL Fiyat</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <textarea className="input-field" rows={2} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Kapsam */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Kampanya Kapsamı</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kapsam Türü *</label>
            <select className="input-field" value={form.scopeType}
              onChange={e => setForm({ ...form, scopeType: e.target.value as any, productId: '', brandId: '', categoryId: '' })}>
              <option value="PRODUCT">Ürün Bazlı</option>
              <option value="BRAND">Marka Bazlı</option>
              <option value="CATEGORY">Kategori Bazlı</option>
            </select>
          </div>
          <div>
            {form.scopeType === 'PRODUCT' && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ürün *</label>
                <select className="input-field" required value={form.productId}
                  onChange={e => setForm({ ...form, productId: e.target.value })}>
                  <option value="">Ürün seçin...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </>
            )}
            {form.scopeType === 'BRAND' && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marka *</label>
                <select className="input-field" required value={form.brandId}
                  onChange={e => setForm({ ...form, brandId: e.target.value })}>
                  <option value="">Marka seçin...</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </>
            )}
            {form.scopeType === 'CATEGORY' && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                <select className="input-field" required value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">Kategori seçin...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tarihler */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Tarih Aralığı</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi *</label>
            <input type="date" required className="input-field" value={form.startDate}
              onChange={e => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi *</label>
            <input type="date" required className="input-field" value={form.endDate}
              onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 text-primary-500 rounded" />
              <span className="text-sm font-medium text-gray-700">Aktif</span>
            </label>
          </div>
        </div>
      </div>

      {/* Kademeler */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Fiyat Kademeleri</h2>
          <button type="button" onClick={addTier} className="btn-secondary text-sm">
            <FiPlus className="w-4 h-4 mr-1" /> Kademe Ekle
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {form.type === 'PERCENTAGE'
            ? 'Belirtilen adet ve üzeri alımlarda uygulanacak yüzde indirim oranını girin.'
            : 'Belirtilen adet ve üzeri alımlarda uygulanacak birim TL fiyatını girin.'}
        </p>
        <div className="space-y-3">
          {form.tiers.map((tier, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Min. Adet</label>
                <input type="number" min={1} required className="input-field"
                  value={tier.minQuantity}
                  onChange={e => updateTier(idx, 'minQuantity', parseInt(e.target.value) || 0)} />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">
                  {form.type === 'PERCENTAGE' ? 'İndirim (%)' : 'Birim Fiyat (TL)'}
                </label>
                <input type="number" min={0} step="0.01" required className="input-field"
                  value={tier.value}
                  onChange={e => updateTier(idx, 'value', parseFloat(e.target.value) || 0)} />
              </div>
              {form.tiers.length > 1 && (
                <button type="button" onClick={() => removeTier(idx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded mt-5">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.push('/admin/kampanyalar')} className="btn-secondary">
          İptal
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          <FiSave className="w-4 h-4 mr-2" />
          {saving ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Oluştur'}
        </button>
      </div>
    </form>
  )
}
