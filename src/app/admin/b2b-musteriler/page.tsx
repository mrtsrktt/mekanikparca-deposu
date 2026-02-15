'use client'

import { useEffect, useState } from 'react'
import { FiCheck, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AdminB2BPage() {
  const [users, setUsers] = useState<any[]>([])

  const load = () => fetch('/api/admin/b2b-users').then(r => r.json()).then(setUsers)
  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/b2b-users/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ b2bStatus: status })
    })
    toast.success(`Bayi hesap ${status === 'APPROVED' ? 'onaylandı' : 'reddedildi'}.`)
    load()
  }

  const statusLabel: Record<string, string> = { PENDING: 'Beklemede', APPROVED: 'Onaylı', REJECTED: 'Reddedildi' }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bayi Müşteriler</h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Firma</th>
              <th className="text-left p-3">Yetkili</th>
              <th className="text-left p-3">E-posta</th>
              <th className="text-left p-3">Telefon</th>
              <th className="text-left p-3">Vergi No</th>
              <th className="text-left p-3">Vergi Dairesi</th>
              <th className="text-left p-3">Sipariş</th>
              <th className="text-left p-3">Durum</th>
              <th className="text-left p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={9} className="p-8 text-center text-gray-500">Henüz bayi başvurusu yok.</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{u.companyName}</td>
                <td className="p-3">{u.name}</td>
                <td className="p-3 text-gray-500 text-xs">{u.email}</td>
                <td className="p-3 text-gray-500">{u.phone || '-'}</td>
                <td className="p-3 text-gray-500">{u.taxNumber}</td>
                <td className="p-3 text-gray-500">{u.taxOffice || '-'}</td>
                <td className="p-3">{u._count?.orders || 0}</td>
                <td className="p-3">
                  <span className={`badge ${u.b2bStatus === 'APPROVED' ? 'badge-success' : u.b2bStatus === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                    {statusLabel[u.b2bStatus] || u.b2bStatus}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {u.b2bStatus === 'PENDING' && (
                      <>
                        <button onClick={() => updateStatus(u.id, 'APPROVED')} className="p-1.5 text-green-500 hover:bg-green-50 rounded" title="Onayla"><FiCheck className="w-4 h-4" /></button>
                        <button onClick={() => updateStatus(u.id, 'REJECTED')} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Reddet"><FiX className="w-4 h-4" /></button>
                      </>
                    )}
                    {u.b2bStatus === 'APPROVED' && (
                      <button onClick={() => updateStatus(u.id, 'REJECTED')} className="p-1.5 text-red-500 hover:bg-red-50 rounded text-xs" title="Askıya Al"><FiX className="w-4 h-4" /></button>
                    )}
                    {u.b2bStatus === 'REJECTED' && (
                      <button onClick={() => updateStatus(u.id, 'APPROVED')} className="p-1.5 text-green-500 hover:bg-green-50 rounded text-xs" title="Tekrar Onayla"><FiCheck className="w-4 h-4" /></button>
                    )}
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
