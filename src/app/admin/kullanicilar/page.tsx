'use client'

import { useEffect, useState } from 'react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => { fetch('/api/admin/users').then(r => r.json()).then(setUsers) }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Kullanıcılar</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Ad Soyad</th>
              <th className="text-left p-3">E-posta</th>
              <th className="text-left p-3">Rol</th>
              <th className="text-left p-3">Firma</th>
              <th className="text-left p-3">Sipariş</th>
              <th className="text-left p-3">Kayıt Tarihi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-gray-500">{u.email}</td>
                <td className="p-3">
                  <span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : u.role === 'B2B' ? 'badge-warning' : 'badge-info'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-3">{u.companyName || '-'}</td>
                <td className="p-3">{u._count?.orders || 0}</td>
                <td className="p-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
