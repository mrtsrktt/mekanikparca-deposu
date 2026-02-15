'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FiUser, FiShoppingCart, FiMapPin, FiFileText, FiEdit, FiTrash2, FiPlus, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'

type Tab = 'profile' | 'orders' | 'addresses' | 'quotes'

export default function AccountPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  if (status === 'loading') return <div className="max-w-7xl mx-auto px-4 py-16 text-center">Yükleniyor...</div>
  if (!session) redirect('/giris')

  const isB2B = session.user.role === 'B2B'

  const tabs = [
    { id: 'profile' as Tab, label: 'Profil Bilgileri', icon: FiUser, color: 'text-primary-500' },
    { id: 'orders' as Tab, label: 'Siparişlerim', icon: FiShoppingCart, color: 'text-green-500' },
    { id: 'addresses' as Tab, label: 'Adreslerim', icon: FiMapPin, color: 'text-blue-500' },
    { id: 'quotes' as Tab, label: 'Teklif Taleplerim', icon: FiFileText, color: 'text-orange-500' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Hesabım</h1>

      {/* Tab Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`card p-4 text-left transition-all duration-200 cursor-pointer ${activeTab === tab.id ? 'ring-2 ring-primary-500 bg-primary-50/50' : 'hover:shadow-md'}`}>
            <tab.icon className={`w-7 h-7 ${tab.color} mb-2`} />
            <h2 className="font-semibold text-sm">{tab.label}</h2>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && <ProfileTab session={session} isB2B={isB2B} />}
      {activeTab === 'orders' && <OrdersTab />}
      {activeTab === 'addresses' && <AddressesTab />}
      {activeTab === 'quotes' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Teklif Taleplerim</h2>
            <Link href="/hesabim/teklifler" className="btn-primary text-sm">Tekliflerimi Gör →</Link>
          </div>
          <p className="text-gray-500 text-sm">Teklif taleplerinizi detaylı görüntülemek için yukarıdaki butona tıklayın.</p>
        </div>
      )}
    </div>
  )
}


function ProfileTab({ session, isB2B }: { session: any; isB2B: boolean }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(session.user.name || '')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [b2bStatus, setB2bStatus] = useState(session.user.b2bStatus || '')
  const [companyName, setCompanyName] = useState('')

  useEffect(() => {
    fetch('/api/account/profile').then(r => r.json()).then(data => {
      if (data.phone) setPhone(data.phone)
      if (data.name) setName(data.name)
      if (data.b2bStatus) setB2bStatus(data.b2bStatus)
      if (data.companyName) setCompanyName(data.companyName)
    })
  }, [])

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch('/api/account/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
    })
    if (res.ok) {
      toast.success('Profil güncellendi')
      setEditing(false)
    } else {
      toast.error('Hata oluştu')
    }
    setLoading(false)
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Profil Bilgileri</h2>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-secondary text-sm gap-1">
            <FiEdit className="w-4 h-4" /> Düzenle
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input type="email" value={session.user.email} disabled className="input-field bg-gray-100 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="05XX XXX XX XX" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={loading} className="btn-primary text-sm">{loading ? 'Kaydediliyor...' : 'Kaydet'}</button>
            <button onClick={() => setEditing(false)} className="btn-secondary text-sm">İptal</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2"><span className="text-gray-500 w-24 text-sm">Ad Soyad:</span><span className="text-sm font-medium">{name}</span></div>
          <div className="flex gap-2"><span className="text-gray-500 w-24 text-sm">E-posta:</span><span className="text-sm font-medium">{session.user.email}</span></div>
          <div className="flex gap-2"><span className="text-gray-500 w-24 text-sm">Telefon:</span><span className="text-sm font-medium">{phone || '-'}</span></div>
          <div className="flex gap-2"><span className="text-gray-500 w-24 text-sm">Rol:</span><span className="text-sm font-medium">{session.user.role === 'ADMIN' ? 'Admin' : isB2B ? 'Bayi' : 'Müşteri'}</span></div>
        </div>
      )}

      {isB2B && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold mb-3">Bayi Hesap Bilgileri</h3>
          {companyName && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500">Firma:</span>
              <span className="text-sm font-medium">{companyName}</span>
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500">Durum:</span>
            <span className={`badge ${b2bStatus === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
              {b2bStatus === 'APPROVED' ? 'Onaylı' : 'Beklemede'}
            </span>
          </div>
          {b2bStatus === 'APPROVED' && (
            <p className="text-sm text-green-600">🎉 Tebrikler! Artık bayimizsiniz ve tüm ürünleri bayi fiyatından satın alabilirsiniz.</p>
          )}
        </div>
      )}
    </div>
  )
}


function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/account/orders').then(r => r.json()).then(data => {
      setOrders(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const statusMap: Record<string, { label: string; cls: string }> = {
    PENDING: { label: 'Beklemede', cls: 'badge-warning' },
    CONFIRMED: { label: 'Onaylandı', cls: 'badge-info' },
    SHIPPED: { label: 'Kargoda', cls: 'badge-info' },
    DELIVERED: { label: 'Teslim Edildi', cls: 'badge-success' },
    CANCELLED: { label: 'İptal', cls: 'badge-danger' },
  }

  if (loading) return <div className="card p-6 text-center text-gray-500">Yükleniyor...</div>

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold mb-4">Siparişlerim</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-sm">Henüz siparişiniz bulunmuyor.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">#{order.orderNumber}</span>
                <span className={`badge ${statusMap[order.status]?.cls || 'badge-info'}`}>{statusMap[order.status]?.label || order.status}</span>
              </div>
              <div className="text-xs text-gray-500 mb-2">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</div>
              <div className="text-sm font-semibold">{order.totalAmount.toLocaleString('tr-TR')} ₺</div>
              {order.items?.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">{order.items.length} ürün</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


function AddressesTab() {
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', fullName: '', phone: '', city: '', district: '', address: '', zipCode: '', isDefault: false })

  const loadAddresses = () => {
    fetch('/api/account/addresses').then(r => r.json()).then(data => {
      setAddresses(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { loadAddresses() }, [])

  const resetForm = () => {
    setForm({ title: '', fullName: '', phone: '', city: '', district: '', address: '', zipCode: '', isDefault: false })
    setShowForm(false)
    setEditId(null)
  }

  const handleSave = async () => {
    const url = editId ? `/api/account/addresses/${editId}` : '/api/account/addresses'
    const method = editId ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) {
      toast.success(editId ? 'Adres güncellendi' : 'Adres eklendi')
      resetForm()
      loadAddresses()
    } else {
      toast.error('Hata oluştu')
    }
  }

  const handleEdit = (addr: any) => {
    setForm({ title: addr.title, fullName: addr.fullName, phone: addr.phone, city: addr.city, district: addr.district, address: addr.address, zipCode: addr.zipCode || '', isDefault: addr.isDefault })
    setEditId(addr.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) return
    const res = await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Adres silindi'); loadAddresses() }
  }

  if (loading) return <div className="card p-6 text-center text-gray-500">Yükleniyor...</div>

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Adreslerim</h2>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary text-sm gap-1">
            <FiPlus className="w-4 h-4" /> Yeni Adres
          </button>
        )}
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 mb-6 bg-gray-50">
          <h3 className="font-medium mb-3">{editId ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Adres Başlığı</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field text-sm" placeholder="Ev, İş vb." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ad Soyad</label>
              <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Telefon</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">İl</label>
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">İlçe</label>
              <input type="text" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Posta Kodu</label>
              <input type="text" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} className="input-field text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Adres</label>
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field text-sm" rows={2} />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="rounded" />
                Varsayılan adres olarak ayarla
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="btn-primary text-sm">Kaydet</button>
            <button onClick={resetForm} className="btn-secondary text-sm">İptal</button>
          </div>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <p className="text-gray-500 text-sm">Henüz kayıtlı adresiniz bulunmuyor.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr: any) => (
            <div key={addr.id} className={`border rounded-lg p-4 relative ${addr.isDefault ? 'border-primary-300 bg-primary-50/30' : ''}`}>
              {addr.isDefault && (
                <span className="absolute top-2 right-2 badge badge-success text-[10px] gap-1"><FiCheck className="w-3 h-3" /> Varsayılan</span>
              )}
              <h3 className="font-semibold text-sm mb-1">{addr.title}</h3>
              <p className="text-sm text-gray-600">{addr.fullName}</p>
              <p className="text-xs text-gray-500 mt-1">{addr.address}</p>
              <p className="text-xs text-gray-500">{addr.district}, {addr.city} {addr.zipCode}</p>
              <p className="text-xs text-gray-500">{addr.phone}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleEdit(addr)} className="text-xs text-primary-500 hover:underline flex items-center gap-1"><FiEdit className="w-3 h-3" /> Düzenle</button>
                <button onClick={() => handleDelete(addr.id)} className="text-xs text-red-500 hover:underline flex items-center gap-1"><FiTrash2 className="w-3 h-3" /> Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
