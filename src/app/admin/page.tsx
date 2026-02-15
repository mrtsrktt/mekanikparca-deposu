'use client'

import { useEffect, useState } from 'react'
import { FiPackage, FiShoppingCart, FiUsers, FiDollarSign, FiAlertCircle, FiClock, FiFileText } from 'react-icons/fi'
import { formatPrice } from '@/lib/pricing'
import Link from 'next/link'

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-16">Yükleniyor...</div>
  if (!data) return <div className="text-center py-16 text-red-500">Veri yüklenemedi.</div>

  const { stats, recentOrders, recentQuotes } = data

  const statCards = [
    { label: 'Toplam Ürün', value: stats.totalProducts, icon: FiPackage, color: 'bg-blue-500' },
    { label: 'Toplam Sipariş', value: stats.totalOrders, icon: FiShoppingCart, color: 'bg-green-500' },
    { label: 'Toplam Gelir', value: formatPrice(stats.totalRevenue), icon: FiDollarSign, color: 'bg-yellow-500' },
    { label: 'B2C Müşteri', value: stats.totalUsers, icon: FiUsers, color: 'bg-purple-500' },
    { label: 'B2B Müşteri', value: stats.totalB2BUsers, icon: FiUsers, color: 'bg-indigo-500' },
    { label: 'Bekleyen B2B', value: stats.pendingB2B, icon: FiAlertCircle, color: 'bg-orange-500' },
    { label: 'Bekleyen Sipariş', value: stats.pendingOrders, icon: FiClock, color: 'bg-red-500' },
    { label: 'Bekleyen Teklif', value: stats.pendingQuotes, icon: FiFileText, color: 'bg-teal-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${card.color} text-white`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className="text-xl font-bold">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Quotes */}
      {recentQuotes && recentQuotes.length > 0 && (
        <div className="card mb-8">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <FiFileText className="w-5 h-5 text-orange-500" />
              Bekleyen Teklif Talepleri
            </h2>
            <Link href="/admin/teklifler" className="text-sm text-primary-500 hover:underline">Tümünü Gör →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Teklif No</th>
                  <th className="text-left p-3">Müşteri</th>
                  <th className="text-left p-3">Firma</th>
                  <th className="text-center p-3">Ürün</th>
                  <th className="text-left p-3">Tarih</th>
                  <th className="text-left p-3">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {recentQuotes.map((q: any) => (
                  <tr key={q.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-semibold text-primary-500">{q.quoteNumber}</td>
                    <td className="p-3">{q.user?.name}<br/><span className="text-xs text-gray-400">{q.user?.email}</span></td>
                    <td className="p-3 text-gray-500">{q.user?.companyName || '-'}</td>
                    <td className="p-3 text-center">{q.items?.length} ürün</td>
                    <td className="p-3 text-gray-500 text-xs">{new Date(q.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td className="p-3">
                      <Link href={`/admin/teklifler/${q.id}`} className="text-blue-500 hover:underline text-xs font-medium">İncele</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="card">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Son Siparişler</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Sipariş No</th>
                <th className="text-left p-3">Müşteri</th>
                <th className="text-left p-3">Tip</th>
                <th className="text-left p-3">Tutar</th>
                <th className="text-left p-3">Durum</th>
                <th className="text-left p-3">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any) => (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{order.orderNumber}</td>
                  <td className="p-3">{order.user?.name}</td>
                  <td className="p-3">
                    <span className={`badge ${order.user?.role === 'B2B' ? 'badge-warning' : 'badge-info'}`}>
                      {order.user?.role}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{formatPrice(order.totalAmount)}</td>
                  <td className="p-3">
                    <span className={`badge ${
                      order.status === 'DELIVERED' ? 'badge-success' :
                      order.status === 'CANCELLED' ? 'badge-danger' :
                      order.status === 'SHIPPED' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Henüz sipariş yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
