'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

/**
 * Admin > Bayiler
 *
 * `dealerType` atanmis (onayli bayi) kullanicilari listeler. Her satirda
 * firma/yetkili bilgisi, bayi turu, uygulanan indirim orani ve siparis/teklif
 * sayilari gosterilir. Detay ve tur degisikligi icin satirdaki baglantiya
 * gidilir.
 */

type DealerType = 'WHOLESALER' | 'SERVICE'

const DEALER_TYPE_LABELS: Record<DealerType, string> = {
  WHOLESALER: 'Toptancı',
  SERVICE: 'Servis',
}

interface DealerRow {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  dealerType: DealerType | null
  discountPercent: number
  orderCount: number
  quoteCount: number
  createdAt: string
}

export default function AdminDealersPage() {
  const [dealers, setDealers] = useState<DealerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | DealerType>('ALL')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/dealers', { cache: 'no-store' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Bayiler yüklenemedi')
      }
      const data = await res.json()
      setDealers(Array.isArray(data.dealers) ? data.dealers : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bayiler yüklenemedi')
      setDealers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return dealers.filter((d) => {
      if (typeFilter !== 'ALL' && d.dealerType !== typeFilter) return false
      if (term.length === 0) return true
      return [d.name, d.email, d.phone]
        .filter((v): v is string => typeof v === 'string')
        .some((v) => v.toLowerCase().includes(term))
    })
  }, [dealers, search, typeFilter])

  const counts = useMemo(() => {
    let wholesaler = 0
    let service = 0
    for (const d of dealers) {
      if (d.dealerType === 'WHOLESALER') wholesaler += 1
      else if (d.dealerType === 'SERVICE') service += 1
    }
    return { wholesaler, service, total: dealers.length }
  }, [dealers])

  const formatDate = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bayiler</h1>
        <p className="mt-1 text-sm text-gray-600">
          Onaylı bayiler, bayi türleri ve uygulanan indirim oranları. İndirim
          oranları{' '}
          <Link
            href="/admin/ayarlar"
            className="font-medium text-blue-600 hover:underline"
          >
            Ayarlar
          </Link>{' '}
          sayfasından değiştirilir.
        </p>
      </div>

      {/* Ozet kartlari */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-600">Toplam Bayi</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {counts.total}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-600">Toptancı</div>
          <div className="mt-1 text-2xl font-bold text-blue-700">
            {counts.wholesaler}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-600">Servis</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">
            {counts.service}
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Firma, yetkili, e-posta veya telefon ara..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:max-w-md"
        />
        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as 'ALL' | DealerType)
          }
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="ALL">Tüm Türler</option>
          <option value="WHOLESALER">Toptancı</option>
          <option value="SERVICE">Servis</option>
        </select>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Yükleniyor...' : 'Yenile'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tablo */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Firma / Yetkili
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  İletişim
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Bayi Türü
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                  İndirim
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Sipariş
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Teklif
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Kayıt
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && dealers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                    {dealers.length === 0
                      ? 'Henüz onaylı bayi bulunmuyor.'
                      : 'Filtrelere uyan bayi bulunamadı.'}
                  </td>
                </tr>
              )}

              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {d.name || '-'}
                    </div>
                    <div className="font-mono text-xs text-gray-400">
                      {d.id.slice(0, 8)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700">{d.email || '-'}</div>
                    <div className="text-xs text-gray-500">{d.phone || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    {d.dealerType ? (
                      <span
                        className={
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                          (d.dealerType === 'WHOLESALER'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800')
                        }
                      >
                        {DEALER_TYPE_LABELS[d.dealerType]}
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        Bayi Değil
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    %{d.discountPercent}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700">
                    {d.orderCount}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700">
                    {d.quoteCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(d.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/bayiler/${d.id}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Detay
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
