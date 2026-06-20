'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiPlus, FiEdit, FiTrash2, FiExternalLink } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/pricing'

function getCampaignStatus(c: any): { label: string; class: string } {
  if (!c.isActive) return { label: 'Pasif', class: 'badge-danger' }
  const now = new Date()
  const start = new Date(c.startDate)
  const end = new Date(c.endDate)
  if (now < start) return { label: 'Beklemede', class: 'bg-yellow-100 text-yellow-800' }
  if (now > end) return { label: 'Süresi Dolmuş', class: 'badge-danger' }
  return { label: 'Aktif', class: 'badge-success' }
}

export default function AdminGiftCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/gift-campaigns')
    if (res.ok) setCampaigns(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) return
    const res = await fetch(`/api/admin/gift-campaigns/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Kampanya silindi.'); load() }
    else toast.error('Silme başarısız.')
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('tr-TR')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Hediye Kampanyaları ({campaigns.length})</h1>
          <p className="text-sm text-gray-500 mt-1">Alım yap, hediye cihaz kazan kampanyaları</p>
        </div>
        <Link href="/admin/hediye-kampanyalari/yeni" className="btn-primary">
          <FiPlus className="w-4 h-4 mr-2" /> Yeni Kampanya
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Kampanya</th>
              <th className="text-left p-3">🎁 Hediye Cihaz</th>
              <th className="text-left p-3">Değer</th>
              <th className="text-left p-3">Ürün Grupları</th>
              <th className="text-left p-3">Tarih</th>
              <th className="text-left p-3">Durum</th>
              <th className="text-left p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const status = getCampaignStatus(c)
              const totalProducts = c.groups?.reduce((sum: number, g: any) => sum + (g.productIds?.length || 0), 0) || 0
              return (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">/{c.slug}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-gray-700">{c.giftName}</div>
                    <div className="text-xs text-gray-400">{c.giftStockCode}</div>
                  </td>
                  <td className="p-3 font-medium">{formatPrice(c.giftValue)}</td>
                  <td className="p-3 text-gray-500">
                    {c.groups?.length || 0} grup / {totalProducts} ürün
                  </td>
                  <td className="p-3 text-gray-500 text-xs">
                    {fmt(c.startDate)}<br />{fmt(c.endDate)}
                  </td>
                  <td className="p-3">
                    <span className={`badge text-xs ${status.class}`}>{status.label}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Link href={`/kampanyalar/hediye/${c.slug}`} target="_blank"
                        className="p-1.5 text-green-500 hover:bg-green-50 rounded" title="Görüntüle">
                        <FiExternalLink className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/hediye-kampanyalari/${c.id}`}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded" title="Düzenle">
                        <FiEdit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Sil">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {!loading && campaigns.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Henüz hediye kampanyası oluşturulmamış.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
