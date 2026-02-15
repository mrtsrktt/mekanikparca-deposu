'use client'

import { useEffect, useState } from 'react'
import { FiPercent, FiTag, FiFolder, FiPlus, FiTrash2, FiSave } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface B2BDiscount {
  id: string
  scopeType: string
  brandId?: string | null
  categoryId?: string | null
  discount: number
  brand?: { name: string } | null
  category?: { name: string } | null
}

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<B2BDiscount[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [generalDiscount, setGeneralDiscount] = useState<number>(0)
  const [brandDiscounts, setBrandDiscounts] = useState<{ brandId: string; discount: number }[]>([])
  const [categoryDiscounts, setCategoryDiscounts] = useState<{ categoryId: string; discount: number }[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/b2b-discounts').then(r => r.json()),
      fetch('/api/admin/brands').then(r => r.json()),
      fetch('/api/admin/categories').then(r => r.json()),
    ]).then(([disc, br, cat]) => {
      setDiscounts(disc)
      setBrands(br)
      setCategories(cat)

      // Parse discounts into form state
      const gen = disc.find((d: B2BDiscount) => d.scopeType === 'GENERAL')
      setGeneralDiscount(gen?.discount || 0)

      setBrandDiscounts(
        disc.filter((d: B2BDiscount) => d.scopeType === 'BRAND').map((d: B2BDiscount) => ({
          brandId: d.brandId || '', discount: d.discount,
        }))
      )
      setCategoryDiscounts(
        disc.filter((d: B2BDiscount) => d.scopeType === 'CATEGORY').map((d: B2BDiscount) => ({
          categoryId: d.categoryId || '', discount: d.discount,
        }))
      )
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/b2b-discounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generalDiscount,
          brandDiscounts: brandDiscounts.filter(d => d.brandId && d.discount > 0),
          categoryDiscounts: categoryDiscounts.filter(d => d.categoryId && d.discount > 0),
        }),
      })
      if (res.ok) {
        toast.success('İndirimler kaydedildi!')
        const updated = await res.json()
        setDiscounts(updated)
      } else {
        toast.error('Hata oluştu.')
      }
    } catch {
      toast.error('Hata oluştu.')
    }
    setSaving(false)
  }

  if (loading) return <div className="text-center py-16">Yükleniyor...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bayi İndirim Yönetimi</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <FiSave className="w-4 h-4" /> {saving ? 'Kaydediliyor...' : 'Tümünü Kaydet'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">Bilgi</h3>
        <p className="text-sm text-blue-700">
          Burada tanımlanan indirimler tüm onaylı bayiler için geçerlidir. Bayi hesabıyla giriş yapan tüm müşteriler bu indirimleri görür.
        </p>
        <div className="mt-2 text-sm text-blue-600">
          <span className="font-medium">Öncelik sırası:</span> 1. Ürün bazlı bayi fiyat → 2. Marka bazlı indirim → 3. Kategori bazlı indirim → 4. Genel bayi indirimi
        </div>
      </div>

      {/* Genel Bayi İndirimi */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <FiPercent className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Genel Bayi İndirimi</h2>
            <p className="text-sm text-gray-500">Tüm ürünlerde geçerli varsayılan indirim yüzdesi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            className="input-field w-32"
            value={generalDiscount}
            onChange={(e) => setGeneralDiscount(parseFloat(e.target.value) || 0)}
          />
          <span className="text-gray-500 font-medium">%</span>
        </div>
      </div>

      {/* Marka Bazlı İndirimler */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiTag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Marka Bazlı İndirimler</h2>
              <p className="text-sm text-gray-500">Belirli markalarda geçerli indirim oranları</p>
            </div>
          </div>
          <button
            onClick={() => setBrandDiscounts([...brandDiscounts, { brandId: '', discount: 0 }])}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            <FiPlus className="w-4 h-4" /> Marka Ekle
          </button>
        </div>
        {brandDiscounts.length === 0 ? (
          <p className="text-sm text-gray-400">Henüz marka bazlı indirim tanımlanmamış.</p>
        ) : (
          <div className="space-y-3">
            {brandDiscounts.map((bd, i) => (
              <div key={i} className="flex items-center gap-3">
                <select
                  className="input-field flex-1"
                  value={bd.brandId}
                  onChange={(e) => {
                    const arr = [...brandDiscounts]; arr[i].brandId = e.target.value
                    setBrandDiscounts(arr)
                  }}
                >
                  <option value="">Marka Seç</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="%"
                    className="input-field w-24"
                    value={bd.discount}
                    onChange={(e) => {
                      const arr = [...brandDiscounts]; arr[i].discount = parseFloat(e.target.value) || 0
                      setBrandDiscounts(arr)
                    }}
                  />
                  <span className="text-gray-500">%</span>
                </div>
                <button
                  onClick={() => setBrandDiscounts(brandDiscounts.filter((_, j) => j !== i))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                  title="Sil"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kategori Bazlı İndirimler */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiFolder className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Kategori Bazlı İndirimler</h2>
              <p className="text-sm text-gray-500">Belirli kategorilerde geçerli indirim oranları</p>
            </div>
          </div>
          <button
            onClick={() => setCategoryDiscounts([...categoryDiscounts, { categoryId: '', discount: 0 }])}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            <FiPlus className="w-4 h-4" /> Kategori Ekle
          </button>
        </div>
        {categoryDiscounts.length === 0 ? (
          <p className="text-sm text-gray-400">Henüz kategori bazlı indirim tanımlanmamış.</p>
        ) : (
          <div className="space-y-3">
            {categoryDiscounts.map((cd, i) => (
              <div key={i} className="flex items-center gap-3">
                <select
                  className="input-field flex-1"
                  value={cd.categoryId}
                  onChange={(e) => {
                    const arr = [...categoryDiscounts]; arr[i].categoryId = e.target.value
                    setCategoryDiscounts(arr)
                  }}
                >
                  <option value="">Kategori Seç</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="%"
                    className="input-field w-24"
                    value={cd.discount}
                    onChange={(e) => {
                      const arr = [...categoryDiscounts]; arr[i].discount = parseFloat(e.target.value) || 0
                      setCategoryDiscounts(arr)
                    }}
                  />
                  <span className="text-gray-500">%</span>
                </div>
                <button
                  onClick={() => setCategoryDiscounts(categoryDiscounts.filter((_, j) => j !== i))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                  title="Sil"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ürün Bazlı Bilgi */}
      <div className="card p-6 bg-orange-50 border-orange-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-lg">
            <FiPercent className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-orange-800">Ürün Bazlı Bayi Fiyat</h2>
            <p className="text-sm text-orange-600">
              Ürün bazlı bayi fiyatı, ürün düzenleme sayfasından &quot;Bayi Fiyatı&quot; alanına değer girerek belirleyebilirsiniz. 
              Bu fiyat en yüksek önceliğe sahiptir.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
