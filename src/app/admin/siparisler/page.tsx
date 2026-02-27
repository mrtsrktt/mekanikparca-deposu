'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/pricing'
import toast from 'react-hot-toast'

const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede', CONFIRMED: 'Onaylandı', SHIPPED: 'Kargoda', DELIVERED: 'Teslim Edildi', CANCELLED: 'İptal'
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetch('/api/admin/orders?paymentStatus=PAID').then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
    })
    toast.success('Sipariş durumu güncellendi.')
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Siparişler</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Sipariş No</th>
              <th className="text-left p-3">Müşteri</th>
              <th className="text-left p-3">Tip</th>
              <th className="text-left p-3">Tutar</th>
              <th className="text-left p-3">Durum</th>
              <th className="text-left p-3">Tarih</th>
              <th className="text-left p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">
                  <Link href={`/admin/siparisler/${o.id}`} className="text-primary-600 hover:underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="p-3">
                  <Link href={`/admin/siparisler/${o.id}`} className="hover:underline">
                    {o.user?.name}<br/><span className="text-xs text-gray-400">{o.user?.email}</span>
                  </Link>
                </td>
                <td className="p-3"><span className={`badge ${o.user?.role === 'B2B' ? 'badge-warning' : 'badge-info'}`}>{o.user?.role}</span></td>
                <td className="p-3 font-medium">{formatPrice(o.totalAmount)}</td>
                <td className="p-3"><span className={`badge ${o.status === 'DELIVERED' ? 'badge-success' : o.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>{statusLabels[o.status]}</span></td>
                <td className="p-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString('tr-TR')}</td>
                <td className="p-3">
                  <select className="input-field text-xs py-1" value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Henüz sipariş yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
