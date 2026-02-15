'use client'

import { useEffect, useState } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiX, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface UserForm {
  name: string
  email: string
  password: string
  phone: string
  role: string
  companyName: string
  taxNumber: string
  taxOffice: string
  b2bStatus: string
}

const emptyForm: UserForm = {
  name: '', email: '', password: '', phone: '',
  role: 'CUSTOMER', companyName: '', taxNumber: '', taxOffice: '', b2bStatus: 'APPROVED',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<UserForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadUsers = () => {
    fetch('/api/admin/users').then(r => r.json()).then(setUsers)
  }

  useEffect(() => { loadUsers() }, [])

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.companyName?.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEditId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (u: any) => {
    setEditId(u.id)
    setForm({
      name: u.name || '',
      email: u.email || '',
      password: '',
      phone: u.phone || '',
      role: u.role || 'CUSTOMER',
      companyName: u.companyName || '',
      taxNumber: u.taxNumber || '',
      taxOffice: u.taxOffice || '',
      b2bStatus: u.b2bStatus || 'APPROVED',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast.error('Ad ve e-posta zorunludur')
      return
    }
    if (!editId && !form.password) {
      toast.error('Yeni kullanıcı için şifre zorunludur')
      return
    }

    setSaving(true)
    try {
      const url = editId ? `/api/admin/users/${editId}` : '/api/admin/users'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Hata oluştu')
      } else {
        toast.success(editId ? 'Kullanıcı güncellendi' : 'Kullanıcı eklendi')
        setShowModal(false)
        loadUsers()
      }
    } catch {
      toast.error('Bir hata oluştu')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" kullanıcısını silmek istediğinize emin misiniz?`)) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Kullanıcı silindi')
      loadUsers()
    } else {
      toast.error('Silinemedi')
    }
  }

  const roleLabel = (role: string) => {
    if (role === 'ADMIN') return 'Admin'
    if (role === 'B2B') return 'Bayi'
    return 'Müşteri'
  }

  const roleBadge = (role: string) => {
    if (role === 'ADMIN') return 'badge-danger'
    if (role === 'B2B') return 'badge-warning'
    return 'badge-info'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kullanıcılar</h1>
        <button onClick={openAdd} className="btn-primary text-sm flex items-center gap-1">
          <FiPlus className="w-4 h-4" /> Yeni Kullanıcı
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Ad, e-posta veya firma ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9 text-sm"
        />
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Ad Soyad</th>
              <th className="text-left p-3">E-posta</th>
              <th className="text-left p-3">Telefon</th>
              <th className="text-left p-3">Rol</th>
              <th className="text-left p-3">Firma</th>
              <th className="text-left p-3">Sipariş</th>
              <th className="text-left p-3">Kayıt Tarihi</th>
              <th className="text-left p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-gray-500">{u.email}</td>
                <td className="p-3 text-gray-500">{u.phone || '-'}</td>
                <td className="p-3">
                  <span className={`badge ${roleBadge(u.role)}`}>{roleLabel(u.role)}</span>
                  {u.role === 'B2B' && u.b2bStatus && (
                    <span className={`badge ml-1 ${u.b2bStatus === 'APPROVED' ? 'badge-success' : u.b2bStatus === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                      {u.b2bStatus === 'APPROVED' ? 'Onaylı' : u.b2bStatus === 'REJECTED' ? 'Reddedildi' : 'Beklemede'}
                    </span>
                  )}
                </td>
                <td className="p-3">{u.companyName || '-'}</td>
                <td className="p-3">{u._count?.orders || 0}</td>
                <td className="p-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(u)} className="text-blue-500 hover:text-blue-700" title="Düzenle">
                      <FiEdit className="w-4 h-4" />
                    </button>
                    {u.role !== 'ADMIN' && (
                      <button onClick={() => handleDelete(u.id, u.name)} className="text-red-500 hover:text-red-700" title="Sil">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">Kullanıcı bulunamadı.</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editId ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şifre {editId ? '(boş bırakılırsa değişmez)' : '*'}
                  </label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field text-sm" placeholder={editId ? '••••••••' : ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field text-sm" placeholder="05XX XXX XX XX" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field text-sm">
                  <option value="CUSTOMER">Müşteri</option>
                  <option value="B2B">Bayi</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {form.role === 'B2B' && (
                <div className="border rounded-lg p-4 bg-orange-50/50 space-y-3">
                  <h3 className="text-sm font-semibold text-orange-700">Bayi Bilgileri</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Firma Adı</label>
                    <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="input-field text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vergi No</label>
                      <input type="text" value={form.taxNumber} onChange={(e) => setForm({ ...form, taxNumber: e.target.value })} className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Dairesi</label>
                      <input type="text" value={form.taxOffice} onChange={(e) => setForm({ ...form, taxOffice: e.target.value })} className="input-field text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bayi Durumu</label>
                    <select value={form.b2bStatus} onChange={(e) => setForm({ ...form, b2bStatus: e.target.value })} className="input-field text-sm">
                      <option value="APPROVED">Onaylı</option>
                      <option value="PENDING">Beklemede</option>
                      <option value="REJECTED">Reddedildi</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setShowModal(false)} className="btn-secondary text-sm">İptal</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                {saving ? 'Kaydediliyor...' : editId ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
