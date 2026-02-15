'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiEye, FiPlus } from 'react-icons/fi'

const statusLabels: Record<string, { label: string; class: string }> = {
  PENDING: { label: 'Beklemede', class: 'badge-warning' },
  REVIEWING: { label: 'İnceleniyor', class: 'badge-warning' },
  QUOTED: { label: 'Teklif Verildi', class: 'badge-success' },
  ACCEPTED: { label: 'Kabul Edildi', class: 'badge-success' },
  REJECTED: { label: 'Reddedildi', class: 'badge-danger' },
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/quotes')
      .then(r => r.json())
      .then(setQuotes)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Teklif Talepleri</h1>
        <Link href="/admin/teklifler/yeni" className="btn-primary text-sm flex items-center gap-1">
          <FiPlus className="w-4 h-4" /> Yeni Teklif Oluştur
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Yükleniyor...</div>
      ) : quotes.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">Henüz teklif talebi yok.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Teklif No</th>
                <th className="text-left p-3">Müşteri</th>
                <th className="text-left p-3">Firma</th>
                <th className="text-center p-3">Ürün</th>
                <th className="text-center p-3">Durum</th>
                <th className="text-left p-3">Tarih</th>
                <th className="text-left p-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q: any) => {
                const st = statusLabels[q.status] || { label: q.status, class: 'badge-warning' }
                return (
                  <tr key={q.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-semibold text-primary-500">
                      {q.quoteNumber}
                      {q.isManual && <span className="ml-1 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">Manuel</span>}
                    </td>
                    <td className="p-3">
                      {q.user?.name || q.customerName}
                      <br /><span className="text-xs text-gray-400">{q.user?.email || q.customerEmail}</span>
                    </td>
                    <td className="p-3 text-gray-500">{q.user?.companyName || q.customerCompany || '-'}</td>
                    <td className="p-3 text-center">{q.items?.length} ürün</td>
                    <td className="p-3 text-center"><span className={`badge ${st.class}`}>{st.label}</span></td>
                    <td className="p-3 text-gray-500 text-xs">
                      {new Date(q.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-3">
                      <Link href={`/admin/teklifler/${q.id}`} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded inline-flex" title="Detay">
                        <FiEye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
