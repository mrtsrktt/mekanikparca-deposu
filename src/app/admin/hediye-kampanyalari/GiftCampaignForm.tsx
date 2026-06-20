'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FiPlus, FiTrash2, FiSave, FiSearch, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface GroupData {
  name: string
  productIds: string[]
  threshold: number
  sortOrder: number
}

interface CampaignData {
  id?: string
  name: string
  slug: string
  description: string
  giftName: string
  giftStockCode: string
  giftValue: number
  giftQuantity: number
  giftImage: string
  startDate: string
  endDate: string
  isActive: boolean
  groups: GroupData[]
}

interface Props {
  initial?: any
  isEdit?: boolean
}

const DEFAULT_GROUPS: GroupData[] = [
  { name: 'Grup A - 500ml', productIds: [], threshold: 500, sortOrder: 0 },
  { name: 'Grup B - Express 400ml', productIds: [], threshold: 500, sortOrder: 1 },
  { name: 'Grup C - 265ml & 20 Litre', productIds: [], threshold: 500, sortOrder: 2 },
  { name: 'Grup D - Yalnızca 20 Litre', productIds: [], threshold: 60, sortOrder: 3 },
]

export default function GiftCampaignForm({ initial, isEdit }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchingGroup, setSearchingGroup] = useState<number | null>(null)

  const [form, setForm] = useState<CampaignData>({
    name: '',
    slug: '',
    description: '',
    giftName: '',
    giftStockCode: '',
    giftValue: 0,
    giftQuantity: 1,
    giftImage: '',
    startDate: '',
    endDate: '',
    isActive: true,
    groups: JSON.parse(JSON.stringify(DEFAULT_GROUPS)),
  })

  // Load all products on mount
  useEffect(() => {
    fetch('/api/admin/products?limit=2000')
      .then(r => r.json())
      .then(d => setAllProducts(d.products || d))
      .catch(() => {})
  }, [])

  // Populate form for edit mode
  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        slug: initial.slug || '',
        description: initial.description || '',
        giftName: initial.giftName || '',
        giftStockCode: initial.giftStockCode || '',
        giftValue: initial.giftValue || 0,
        giftQuantity: initial.giftQuantity || 1,
        giftImage: initial.giftImage || '',
        startDate: initial.startDate ? new Date(initial.startDate).toISOString().split('T')[0] : '',
        endDate: initial.endDate ? new Date(initial.endDate).toISOString().split('T')[0] : '',
        isActive: initial.isActive !== false,
        groups: initial.groups?.length > 0
          ? initial.groups.map((g: any) => ({
              name: g.name,
              productIds: g.productIds || [],
              threshold: g.threshold || 0,
              sortOrder: g.sortOrder || 0,
            }))
          : JSON.parse(JSON.stringify(DEFAULT_GROUPS)),
      })
    }
  }, [initial])

  // Search products
  const searchProducts = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    const q = query.toLowerCase()
    const results = allProducts.filter(
      (p: any) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
    ).slice(0, 20)
    setSearchResults(results)
  }, [allProducts])

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const updateGroup = (idx: number, field: keyof GroupData, val: any) => {
    const groups = [...form.groups]
    groups[idx] = { ...groups[idx], [field]: val }
    setForm({ ...form, groups })
  }

  const addProductToGroup = (groupIdx: number, productId: string) => {
    const groups = [...form.groups]
    const group = groups[groupIdx]
    if (!group.productIds.includes(productId)) {
      group.productIds = [...group.productIds, productId]
      setForm({ ...form, groups })
    }
    setSearchQuery('')
    setSearchResults([])
    setSearchingGroup(null)
  }

  const removeProductFromGroup = (groupIdx: number, productId: string) => {
    const groups = [...form.groups]
    groups[groupIdx].productIds = groups[groupIdx].productIds.filter(id => id !== productId)
    setForm({ ...form, groups })
  }

  const getProductName = (productId: string) => {
    const product = allProducts.find(p => p.id === productId)
    return product ? `${product.name}${product.sku ? ` (${product.sku})` : ''}` : productId
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Validate
    if (!form.name || !form.slug || !form.giftName || !form.giftStockCode) {
      toast.error('Lütfen zorunlu alanları doldurun.')
      setSaving(false)
      return
    }

    // Validate at least one group has products
    const totalProducts = form.groups.reduce((sum, g) => sum + g.productIds.length, 0)
    if (totalProducts === 0) {
      toast.error('En az bir gruba ürün ekleyin.')
      setSaving(false)
      return
    }

    const payload = {
      ...form,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate + 'T23:59:59').toISOString(),
    }

    const url = isEdit ? `/api/admin/gift-campaigns/${initial.id}` : '/api/admin/gift-campaigns'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success(isEdit ? 'Kampanya güncellendi.' : 'Kampanya oluşturuldu.')
        router.push('/admin/hediye-kampanyalari')
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
              onChange={e => {
                const name = e.target.value
                setForm({ ...form, name, slug: form.slug || generateSlug(name) })
              }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Kodu *</label>
            <input type="text" required className="input-field" value={form.slug}
              onChange={e => setForm({ ...form, slug: e.target.value })} />
            <p className="text-xs text-gray-400 mt-1">/kampanyalar/hediye/<strong>{form.slug || 'ornek'}</strong></p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <textarea className="input-field" rows={2} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Hediye Cihaz Bilgileri */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">🎁 Hediye Cihaz Bilgileri</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cihaz Adı *</label>
            <input type="text" required className="input-field" value={form.giftName}
              onChange={e => setForm({ ...form, giftName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stok Kodu *</label>
            <input type="text" required className="input-field" value={form.giftStockCode}
              onChange={e => setForm({ ...form, giftStockCode: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yaklaşık Değer (TL) *</label>
            <input type="number" min={0} step="0.01" required className="input-field" value={form.giftValue}
              onChange={e => setForm({ ...form, giftValue: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verilecek Adet</label>
            <input type="number" min={1} className="input-field" value={form.giftQuantity}
              onChange={e => setForm({ ...form, giftQuantity: parseInt(e.target.value) || 1 })} />
            <p className="text-xs text-gray-400 mt-1">Her kazanımda verilecek adet (Lega/Regen için 8)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cihaz Görseli</label>
            <div className="flex gap-2">
              <input type="text" className="input-field flex-1" value={form.giftImage}
                placeholder="https://... veya dosya yükleyin"
                onChange={e => setForm({ ...form, giftImage: e.target.value })} />
              <label className="btn-secondary text-sm cursor-pointer flex items-center gap-1 whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Yükle
                <input type="file" accept="image/*" className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const toastModule = await import('react-hot-toast')
                    const uploadToast = toastModule.default.loading('Görsel yükleniyor...')
                    try {
                      const formData = new FormData()
                      formData.append('files', file)
                      formData.append('folder', 'gift-campaigns')
                      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
                      if (res.ok) {
                        const data = await res.json()
                        const uploadedUrl = data.files?.[0]?.url || data.url
                        if (uploadedUrl) {
                          setForm(prev => ({ ...prev, giftImage: uploadedUrl }))
                          toastModule.default.success('Görsel yüklendi!', { id: uploadToast })
                        } else {
                          toastModule.default.error('Yükleme başarısız.', { id: uploadToast })
                        }
                      } else {
                        toastModule.default.error('Yükleme başarısız.', { id: uploadToast })
                      }
                    } catch {
                      toastModule.default.error('Yükleme başarısız.', { id: uploadToast })
                    }
                  }} />
              </label>
            </div>
            {form.giftImage && (
              <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border bg-gray-50">
                <img src={form.giftImage} alt="Önizleme" className="w-full h-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
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

      {/* Ürün Grupları */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">📦 Ürün Grupları ve Eşikler</h2>
        <p className="text-sm text-gray-500 mb-4">
          Her grup için eşik adedi ve gruba dahil ürünleri belirleyin. Müşteri bir gruptan toplamda bu adede ulaşınca hediye kazanır.
        </p>
        <div className="space-y-6">
          {form.groups.map((group, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grup Adı</label>
                  <input type="text" className="input-field" value={group.name}
                    onChange={e => updateGroup(idx, 'name', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eşik Adet *</label>
                  <input type="number" min={1} required className="input-field" value={group.threshold}
                    onChange={e => updateGroup(idx, 'threshold', parseInt(e.target.value) || 0)} />
                </div>
              </div>

              {/* Ürün Listesi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gruptaki Ürünler ({group.productIds.length})
                </label>

                {/* Seçili ürünler */}
                <div className="space-y-1 mb-3">
                  {group.productIds.map(pid => (
                    <div key={pid} className="flex items-center justify-between bg-white rounded border px-3 py-1.5 text-sm">
                      <span className="text-gray-700">{getProductName(pid)}</span>
                      <button type="button" onClick={() => removeProductFromGroup(idx, pid)}
                        className="text-red-400 hover:text-red-600 p-1">
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Ürün arama / ekleme */}
                {searchingGroup === idx ? (
                  <div>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          autoFocus
                          className="input-field pl-9"
                          placeholder="Ürün adı veya SKU ile ara..."
                          value={searchQuery}
                          onChange={e => {
                            setSearchQuery(e.target.value)
                            searchProducts(e.target.value)
                          }}
                        />
                      </div>
                      <button type="button" onClick={() => { setSearchingGroup(null); setSearchQuery(''); setSearchResults([]) }}
                        className="btn-secondary text-sm">
                        Kapat
                      </button>
                    </div>
                    {searchResults.length > 0 && (
                      <div className="border rounded max-h-48 overflow-y-auto bg-white">
                        {searchResults.map((p: any) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => addProductToGroup(idx, p.id)}
                            disabled={group.productIds.includes(p.id)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed border-b last:border-b-0"
                          >
                            <span className="font-medium">{p.name}</span>
                            {p.sku && <span className="text-gray-400 ml-2">({p.sku})</span>}
                            {p.brand && <span className="text-gray-400 ml-2">- {p.brand.name}</span>}
                            {group.productIds.includes(p.id) && <span className="text-green-500 ml-2">✓ Eklendi</span>}
                          </button>
                        ))}
                      </div>
                    )}
                    {searchQuery && searchResults.length === 0 && (
                      <p className="text-sm text-gray-400">Sonuç bulunamadı.</p>
                    )}
                  </div>
                ) : (
                  <button type="button" onClick={() => setSearchingGroup(idx)}
                    className="btn-secondary text-sm">
                    <FiPlus className="w-3.5 h-3.5 mr-1" /> Ürün Ekle
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.push('/admin/hediye-kampanyalari')} className="btn-secondary">
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
