'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

/**
 * Admin > Bayiler > Detay
 *
 * Tek bir bayinin firma bilgilerini (cozulmus), bayi turunu, uygulanan indirim
 * oranini, siparislerini ve tekliflerini gosterir. Bayi turu buradan
 * degistirilebilir; degisiklik sonraki fiyatlandirmayi etkiler.
 *
 * Gecmis siparis/teklif tutarlari DEGISTIRILMEZ.
 */

type DealerType = 'WHOLESALER' | 'SERVICE'

const DEALER_TYPE_LABELS: Record<DealerType, string> = {
  WHOLESALER: 'Toptancı',
  SERVICE: 'Servis',
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Beklemede',
  PROCESSING: 'Hazırlanıyor',
  SHIPPED: 'Kargoda',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal',
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Beklemede',
  PAID: 'Ödendi',
  FAILED: 'Başarısız',
  REFUNDED: 'İade',
}

interface DealerDetail {
  dealer: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    dealerType: DealerType
    discountPercent: number
    createdAt: string
  }
  company: Record<string, string | null> | null
  application: {
    id: string
    status: string
    dealerType: DealerType | null
    submittedAt: string
    decidedAt: string | null
    applicationNote: string | null
  } | null
  orders: {
    id: string
    orderNumber: string
    status: string
    paymentStatus: string
    totalAmount: number
    currency: string
    companyName: string | null
    taxNumber: string | null
    taxOffice: string | null
    itemCount: number
    createdAt: string
  }[]
  quotes: {
    id: string
    quoteNumber: string
    status: string
    currency: string
    createdAt: string
  }[]
}

const COMPANY_FIELDS: { key: string; label: string }[] = [
  { key: 'companyName', label: 'Firma Adı' },
  { key: 'authorizedPerson', label: 'Yetkili Kişi' },
  { key: 'taxNumber', label: 'Vergi No' },
  { key: 'taxOffice', label: 'Vergi Dairesi' },
  { key: 'companyPhone', label: 'Firma Telefonu' },
  { key: 'companyAddress', label: 'Adres' },
]

export default function AdminDealerDetailPage() {
  const params = useParams<{ userId: string }>()
  const router = useRouter()
  const userId = typeof params?.userId === 'string' ? params.userId : ''

  const [detail, setDetail] = useState<DealerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedType, setSelectedType] = useState<DealerType>('WHOLESALER')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveOk, setSaveOk] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) {
      setError('Bayi bulunamadı')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/dealers/${userId}`, {
        cache: 'no-store',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Bayi yüklenemedi')
      const next = data as DealerDetail
      setDetail(next)
      if (next.dealer?.dealerType) setSelectedType(next.dealer.dealerType)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bayi yüklenemedi')
      setDetail(null)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  const handleSave = async () => {
    if (!detail) return
    setSaving(true)
    setSaveError(null)
    setSaveOk(null)
    try {
      const res = await fetch(`/api/admin/dealers/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealerType: selectedType }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Kaydedilemedi')

      // Sunucudan donen guncel orani yansit.
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              dealer: {
                ...prev.dealer,
                dealerType: data.dealer?.dealerType ?? selectedType,
                discountPercent:
                  typeof data.dealer?.discountPercent === 'number'
                    ? data.dealer.discountPercent
                    : prev.dealer.discountPercent,
              },
            }
          : prev
      )
      setSaveOk('Bayi türü güncellendi. Yeni oran sonraki fiyatlandırmada geçerli.')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (value: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatMoney = (amount: number, currency: string) => {
    const symbol = currency === 'TRY' ? '₺' : currency
    return `${amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${symbol}`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
          Yükleniyor...
        </div>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="p-6">
        <button
          type="button"
          onClick={() => router.push('/admin/bayiler')}
          className="mb-4 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Bayiler
        </button>
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || 'Bayi bulunamadı'}
        </div>
      </div>
    )
  }

  const { dealer, company, application, orders, quotes } = detail
  const typeChanged = selectedType !== dealer.dealerType

  return (
    <div className="p-6">
      <button
        type="button"
        onClick={() => router.push('/admin/bayiler')}
        className="mb-4 text-sm font-medium text-blue-600 hover:underline"
      >
        ← Bayiler
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {dealer.name || company?.companyName || 'İsimsiz Bayi'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {dealer.email || '-'} · {dealer.phone || '-'}
          </p>
          <p className="mt-1 font-mono text-xs text-gray-400">{dealer.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={
              'inline-flex rounded-full px-3 py-1 text-sm font-medium ' +
              (dealer.dealerType === 'WHOLESALER'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-emerald-100 text-emerald-800')
            }
          >
            {DEALER_TYPE_LABELS[dealer.dealerType]}
          </span>
          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-800">
            %{dealer.discountPercent} indirim
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol kolon: firma bilgisi + tur degistirme */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bayi turu */}
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900">
              Bayi Türü ve İndirim
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Tür değişikliği yalnızca bundan sonraki fiyatlandırmayı etkiler.
              Geçmiş sipariş ve teklif tutarları değişmez.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as DealerType)
                  setSaveOk(null)
                  setSaveError(null)
                }}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="WHOLESALER">Toptancı</option>
                <option value="SERVICE">Servis</option>
              </select>

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving || !typeChanged}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>

              {typeChanged && (
                <span className="text-sm text-amber-700">
                  Kaydedilmemiş değişiklik var
                </span>
              )}
            </div>

            {saveError && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {saveError}
              </div>
            )}
            {saveOk && (
              <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {saveOk}
              </div>
            )}
          </section>

          {/* Firma bilgisi */}
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900">
              Firma Bilgileri
            </h2>
            {!company ? (
              <p className="mt-3 text-sm text-gray-500">
                Karara bağlanmış başvuru bulunamadı.
              </p>
            ) : (
              <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {COMPANY_FIELDS.map((f) => (
                  <div key={f.key}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {f.label}
                    </dt>
                    <dd className="mt-0.5 text-sm text-gray-900 break-words">
                      {company[f.key] || '-'}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {application && (
              <div className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-500">
                Başvuru: {formatDate(application.submittedAt)}
                {application.decidedAt
                  ? ` · Karar: ${formatDate(application.decidedAt)}`
                  : ''}
                {application.dealerType
                  ? ` · Başvuruda seçilen tür: ${DEALER_TYPE_LABELS[application.dealerType]}`
                  : ''}
              </div>
            )}
          </section>

          {/* Siparisler */}
          <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Siparişler ({orders.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Sipariş No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Durum
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Ödeme
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Kalem
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Tutar
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Tarih
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                        Sipariş bulunmuyor.
                      </td>
                    </tr>
                  )}
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm text-gray-800">
                        {o.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {ORDER_STATUS_LABELS[o.status] || o.status}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {PAYMENT_STATUS_LABELS[o.paymentStatus] || o.paymentStatus}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">
                        {o.itemCount}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 whitespace-nowrap">
                        {formatMoney(o.totalAmount, o.currency)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(o.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Teklifler */}
          <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Teklif Talepleri ({quotes.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Teklif No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Durum
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Tarih
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {quotes.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500">
                        Teklif talebi bulunmuyor.
                      </td>
                    </tr>
                  )}
                  {quotes.map((q) => (
                    <tr key={q.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm text-gray-800">
                        {q.quoteNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {q.status}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(q.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sag kolon: ozet */}
        <div className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900">Özet</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Bayi Türü</dt>
                <dd className="font-medium text-gray-900">
                  {DEALER_TYPE_LABELS[dealer.dealerType]}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">İndirim Oranı</dt>
                <dd className="font-semibold text-gray-900">
                  %{dealer.discountPercent}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Sipariş Sayısı</dt>
                <dd className="font-medium text-gray-900">{orders.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Teklif Sayısı</dt>
                <dd className="font-medium text-gray-900">{quotes.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Kayıt Tarihi</dt>
                <dd className="font-medium text-gray-900">
                  {formatDate(dealer.createdAt)}
                </dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
              İndirim oranı bayi türüne göre global olarak{' '}
              <a href="/admin/ayarlar" className="text-blue-600 hover:underline">
                Ayarlar
              </a>{' '}
              sayfasından yönetilir.
            </p>
          </section>

          {application?.applicationNote && (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-base font-semibold text-gray-900">
                Başvuru Notu
              </h2>
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                {application.applicationNote}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
