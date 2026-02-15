'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiFileText, FiEye } from 'react-icons/fi'

const statusLabels: Record<string, { label: string; class: string }> = {
  PENDING: { label: 'Beklemede', class: 'badge-warning' },
  REVIEWING: { label: 'İnceleniyor', class: 'badge-warning' },
  QUOTED: { label: 'Teklif Verildi', class: 'badge-success' },
  ACCEPTED: { label: 'Kabul Edildi', class: 'badge-success' },
  REJECTED: { label: 'Reddedildi', class: 'badge-danger' },
}

export default function MyQuotesPage() {
  const { data: session, status: authStatus } = useSession()
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetch('/api/quotes')
        .then(r => r.json())
        .then(setQuotes)
        .finally(() => setLoading(false))
    }
  }, [authStatus])

  if (authStatus === 'loading') return <div className="max-w-7xl mx-auto px-4 py-16 text-center">Yükleniyor...</div>
  if (!session) redirect('/giris')

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Tekliflerim</h1>
        <Link href="/teklif" className="btn-secondary text-sm">Yeni Teklif İste</Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Yükleniyor...</div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-16">
          <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">Henüz teklif talebiniz yok.</p>
          <Link href="/urunler" className="btn-primary">Ürünlere Git</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((q: any) => {
            const st = statusLabels[q.status] || { label: q.status, class: 'badge-warning' }
            const totalItems = q.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0
            const hasQuotedPrices = q.items?.some((i: any) => i.unitPrice != null)
            const quotedTotal = hasQuotedPrices
              ? q.items.reduce((s: number, i: any) => s + (i.unitPrice || 0) * i.quantity, 0)
              : null

            return (
              <div key={q.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-primary-500">{q.quoteNumber}</span>
                      <span className={`badge ${st.class}`}>{st.label}</span>
                      {q.status === 'QUOTED' && !q.sentAt && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Yeni Teklif</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {q.items?.length} ürün, {totalItems} adet
                      {quotedTotal != null && (
                        <span className="ml-2 font-medium text-green-600">
                          Teklif: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(quotedTotal)}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(q.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <Link href={`/hesabim/teklifler/${q.id}`} className="btn-secondary text-sm inline-flex items-center gap-1 self-start">
                    <FiEye className="w-4 h-4" /> Detay
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
