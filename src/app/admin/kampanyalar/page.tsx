'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

function getCampaignStatus(c: any): { label: string; class: string } {
  if (!c.isActive) return { label: 'Pasif', class: 'badge-danger' }
  const now = new Date()
  const start = new Date(c.startDate)
  const end = new Date(c.endDate)
  if (now < start) return { label: 'Beklemede', class: 'bg-yellow-100 text-yellow-800' }
  if (now > end) return { label: 'Süresi Dolmuş', class: 'badge-danger' }
  return { label: 'Aktif', class: 'badge-success' }
}

const scopeLabels: Record<string, string> = {
  PRODUCT: 'Ürün',
  BRAND: 'Marka',
  CATEGORY: 'Kategori',
}

const typeLabels: Record<string, string> = {
  PERCENTAGE: 'Yüzde (%)',
  FIXED_PRICE: 'Sabit TL',
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/campaigns')
    if (res.ok) setCampaigns(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) return
    const res = await fetch(`/api/admin/campaigns/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Kampanya silindi.'); load() }
    else toast.error('Silme başarısız.')
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('tr-TR')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kampanyalar ({campaigns.length})</h1>
        <Link href="/admin/kampanyalar/yeni" className="btn-primary">
          <FiPlus className="w-4 h-4 mr-2" /> Yeni Kampanya
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Kampanya Adı</th>
              <th className="text-left p-3">Tür</th>
              <th className="text-left p-3">Kapsam</th>
              <th className="text-left p-3">Kademeler</th>
              <th className="text-left p-3">Tarih Aralığı</th>
              <th className="text-left p-3">Durum</th>
              <th className="text-left p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const status = getCampaignStatus(c)
              return (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3">{typeLabels[c.type] || c.type}</td>
                  <td className="p-3">{scopeLabels[c.scopeType] || c.scopeType}</td>
                  <td className="p-3 text-gray-500">{c.tiers?.length || 0} kademe</td>
                  <td className="p-3 text-gray-500">{fmt(c.startDate)} - {fmt(c.endDate)}</td>
                  <td className="p-3"><span className={`badge ${status.class}`}>{status.label}</span></td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Link href={`/admin/kampanyalar/${c.id}`} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded">
                        <FiEdit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {!loading && campaigns.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Henüz kampanya oluşturulmamış.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
