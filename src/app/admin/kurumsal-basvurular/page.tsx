'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiEye, FiCheck, FiX, FiRotateCcw, FiRefreshCw, FiXCircle } from 'react-icons/fi'

type Status = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED'

type ApplicationListItem = {
  id: string
  userId: string
  status: Status
  submittedAt: string
  decidedAt: string | null
  createdAt: string
  updatedAt: string
  user?: { id: string; name: string | null; email: string | null; phone: string | null } | null
}

type ApplicationEvent = {
  id: string
  fromStatus: Status | null
  toStatus: Status
  actorRole: string
  reason: string | null
  createdAt: string
  actorUser?: { id: string; name: string | null; email: string | null } | null
}

type ApplicationDetail = ApplicationListItem & {
  companyName: string
  taxNumber: string
  taxOffice: string
  companyAddress: string
  companyPhone: string
  authorizedPerson: string
  applicationNote: string | null
  decidedByUser?: { id: string; name: string | null; email: string | null } | null
  events: ApplicationEvent[]
}

const statusMeta: Record<Status, { label: string; badge: string }> = {
  PENDING: { label: 'Beklemede', badge: 'badge-warning' },
  APPROVED: { label: 'Onaylandı', badge: 'badge-success' },
  REJECTED: { label: 'Reddedildi', badge: 'badge-danger' },
  REVOKED: { label: 'İptal Edildi', badge: 'badge-info' },
}

const filters: { key: string; label: string }[] = [
  { key: '', label: 'Tümü' },
  { key: 'PENDING', label: 'Bekleyenler' },
  { key: 'APPROVED', label: 'Onaylananlar' },
  { key: 'REJECTED', label: 'Reddedilenler' },
  { key: 'REVOKED', label: 'İptal Edilenler' },
]

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminCorporateApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationListItem[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const [detailId, setDetailId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ApplicationDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [actionLoading, setActionLoading] = useState(false)
  const [rejectMode, setRejectMode] = useState(false)
  const [revokeMode, setRevokeMode] = useState(false)
  const [reason, setReason] = useState('')

  const loadList = useCallback(async (status: string) => {
    setListLoading(true)
    try {
      const qs = status ? `?status=${encodeURIComponent(status)}` : ''
      const res = await fetch(`/api/admin/corporate-applications${qs}`)
      if (res.status === 401) {
        toast.error('Yetkisiz')
        return
      }
      if (res.status === 403) {
        toast.error('Yetkisiz erişim')
        return
      }
      if (res.status === 404) {
        toast.error('Bulunamadı')
        return
      }
      if (!res.ok) {
        toast.error('Sunucu hatası')
        return
      }
      const data = await res.json()
      setApplications(Array.isArray(data?.applications) ? data.applications : [])
    } catch {
      toast.error('Sunucu hatası')
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    loadList(statusFilter)
  }, [statusFilter, loadList])

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/admin/corporate-applications/${id}`)
      if (res.status === 401) {
        toast.error('Yetkisiz')
        return
      }
      if (res.status === 403) {
        toast.error('Yetkisiz erişim')
        return
      }
      if (res.status === 404) {
        toast.error('Başvuru bulunamadı')
        closeDetail()
        return
      }
      if (!res.ok) {
        toast.error('Sunucu hatası')
        return
      }
      const data = await res.json()
      setDetail(data?.application ?? null)
    } catch {
      toast.error('Sunucu hatası')
    } finally {
      setDetailLoading(false)
    }
  }, [])

  function openDetail(id: string) {
    setDetailId(id)
    setDetail(null)
    setRejectMode(false)
    setRevokeMode(false)
    setReason('')
    loadDetail(id)
  }

  function closeDetail() {
    setDetailId(null)
    setDetail(null)
    setRejectMode(false)
    setRevokeMode(false)
    setReason('')
  }

  async function submitDecision(toStatus: Status, decisionReason: string | null) {
    if (!detailId) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/corporate-applications/${detailId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toStatus, reason: decisionReason }),
      })

      if (res.status === 401) {
        toast.error('Yetkisiz')
        return
      }
      if (res.status === 403) {
        toast.error('Yetkisiz erişim')
        return
      }
      if (res.status === 404) {
        toast.error('Başvuru bulunamadı')
        return
      }
      if (res.status === 400) {
        toast.error('Geçersiz durum geçişi veya eksik gerekçe')
        return
      }
      if (res.status === 409) {
        toast.error('Başvuru durumu eşzamanlı bir işlemle değişti')
        await loadDetail(detailId)
        await loadList(statusFilter)
        return
      }
      if (!res.ok) {
        toast.error('Sunucu hatası')
        return
      }

      toast.success('Karar kaydedildi')
      setRejectMode(false)
      setRevokeMode(false)
      setReason('')
      await loadDetail(detailId)
      await loadList(statusFilter)
    } catch {
      toast.error('Sunucu hatası')
    } finally {
      setActionLoading(false)
    }
  }

  function handleApprove() {
    submitDecision('APPROVED', null)
  }

  function handleReject() {
    if (reason.trim().length === 0) {
      toast.error('Geçersiz durum geçişi veya eksik gerekçe')
      return
    }
    submitDecision('REJECTED', reason.trim())
  }

  function handleRevoke() {
    if (reason.trim().length === 0) {
      toast.error('Geçersiz durum geçişi veya eksik gerekçe')
      return
    }
    submitDecision('REVOKED', reason.trim())
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kurumsal Başvurular</h1>
        <button
          type="button"
          onClick={() => loadList(statusFilter)}
          className="btn-secondary text-sm flex items-center gap-1"
          disabled={listLoading}
        >
          <FiRefreshCw className="w-4 h-4" /> Yenile
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.key || 'all'}
            type="button"
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              statusFilter === f.key
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {listLoading ? (
        <div className="text-center py-16 text-gray-500">Yükleniyor...</div>
      ) : applications.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">Bu filtreye uygun başvuru yok.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Müşteri</th>
                <th className="text-left p-3">E-posta</th>
                <th className="text-center p-3">Durum</th>
                <th className="text-left p-3">Gönderim</th>
                <th className="text-left p-3">Karar</th>
                <th className="text-left p-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => {
                const st = statusMeta[a.status] || { label: a.status, badge: 'badge-warning' }
                return (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{a.user?.name || '-'}</td>
                    <td className="p-3 text-gray-500">{a.user?.email || '-'}</td>
                    <td className="p-3 text-center">
                      <span className={`badge ${st.badge}`}>{st.label}</span>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">{formatDate(a.submittedAt)}</td>
                    <td className="p-3 text-gray-500 text-xs">{formatDate(a.decidedAt)}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => openDetail(a.id)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded inline-flex items-center gap-1"
                        title="İncele / Detay"
                      >
                        <FiEye className="w-4 h-4" /> İncele
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {detailId && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40"
          onClick={closeDetail}
        >
          <div
            className="w-full max-w-xl h-full bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-bold">Başvuru Detayı</h2>
              <button
                type="button"
                onClick={closeDetail}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                title="Kapat"
              >
                <FiXCircle className="w-5 h-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
            ) : !detail ? (
              <div className="p-8 text-center text-gray-500">Başvuru yüklenemedi.</div>
            ) : (
              <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                  <span className={`badge ${(statusMeta[detail.status] || {}).badge || 'badge-warning'}`}>
                    {(statusMeta[detail.status] || {}).label || detail.status}
                  </span>
                  <span className="text-xs text-gray-400">Gönderim: {formatDate(detail.submittedAt)}</span>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Firma Bilgileri</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-gray-400">Firma Adı</dt>
                      <dd className="font-medium">{detail.companyName || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Vergi No</dt>
                      <dd className="font-medium">{detail.taxNumber || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Vergi Dairesi</dt>
                      <dd className="font-medium">{detail.taxOffice || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Yetkili</dt>
                      <dd className="font-medium">{detail.authorizedPerson || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Telefon</dt>
                      <dd className="font-medium">{detail.companyPhone || '-'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-gray-400">Adres</dt>
                      <dd className="font-medium whitespace-pre-wrap">{detail.companyAddress || '-'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-gray-400">Not</dt>
                      <dd className="font-medium whitespace-pre-wrap">{detail.applicationNote || '-'}</dd>
                    </div>
                  </dl>
                </div>

                {detail.user && (
                  <div>
                    <h3 className="font-semibold mb-2">Hesap Bilgileri</h3>
                    <div className="text-sm text-gray-600">
                      <div>{detail.user.name || '-'}</div>
                      <div>{detail.user.email || '-'}</div>
                      {detail.user.phone && <div>{detail.user.phone}</div>}
                    </div>
                  </div>
                )}

                {(detail.status === 'PENDING' || detail.status === 'APPROVED') && (
                  <div className="border-t pt-4">
                    {detail.status === 'PENDING' && !rejectMode && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleApprove}
                          disabled={actionLoading}
                          className="btn-primary flex items-center gap-1 disabled:opacity-50"
                        >
                          <FiCheck className="w-4 h-4" /> Onayla
                        </button>
                        <button
                          type="button"
                          onClick={() => { setRejectMode(true); setReason('') }}
                          disabled={actionLoading}
                          className="btn-secondary flex items-center gap-1 disabled:opacity-50"
                        >
                          <FiX className="w-4 h-4" /> Reddet
                        </button>
                      </div>
                    )}

                    {detail.status === 'PENDING' && rejectMode && (
                      <div className="space-y-2">
                        <label className="text-sm text-gray-600">Reddetme Gerekçesi (zorunlu)</label>
                        <textarea
                          className="input-field w-full"
                          rows={3}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Gerekçe giriniz..."
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleReject}
                            disabled={actionLoading || reason.trim().length === 0}
                            className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-1 disabled:opacity-50"
                          >
                            <FiX className="w-4 h-4" /> Reddet
                          </button>
                          <button
                            type="button"
                            onClick={() => { setRejectMode(false); setReason('') }}
                            disabled={actionLoading}
                            className="btn-secondary disabled:opacity-50"
                          >
                            Vazgeç
                          </button>
                        </div>
                      </div>
                    )}

                    {detail.status === 'APPROVED' && !revokeMode && (
                      <button
                        type="button"
                        onClick={() => { setRevokeMode(true); setReason('') }}
                        disabled={actionLoading}
                        className="btn-secondary flex items-center gap-1 disabled:opacity-50"
                      >
                        <FiRotateCcw className="w-4 h-4" /> Onayı Kaldır
                      </button>
                    )}

                    {detail.status === 'APPROVED' && revokeMode && (
                      <div className="space-y-2">
                        <label className="text-sm text-gray-600">Onay Kaldırma Gerekçesi (zorunlu)</label>
                        <textarea
                          className="input-field w-full"
                          rows={3}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Gerekçe giriniz..."
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleRevoke}
                            disabled={actionLoading || reason.trim().length === 0}
                            className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-1 disabled:opacity-50"
                          >
                            <FiRotateCcw className="w-4 h-4" /> Onayı Kaldır
                          </button>
                          <button
                            type="button"
                            onClick={() => { setRevokeMode(false); setReason('') }}
                            disabled={actionLoading}
                            className="btn-secondary disabled:opacity-50"
                          >
                            Vazgeç
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Geçmiş</h3>
                  {detail.events.length === 0 ? (
                    <p className="text-sm text-gray-400">Kayıt yok.</p>
                  ) : (
                    <ul className="space-y-3">
                      {detail.events.map((ev) => (
                        <li key={ev.id} className="text-sm border-l-2 border-gray-200 pl-3">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">
                              {ev.fromStatus ? `${(statusMeta[ev.fromStatus] || {}).label || ev.fromStatus} → ` : ''}
                            </span>
                            <span className={`badge ${(statusMeta[ev.toStatus] || {}).badge || 'badge-warning'}`}>
                              {(statusMeta[ev.toStatus] || {}).label || ev.toStatus}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatDate(ev.createdAt)} · {ev.actorUser?.name || ev.actorRole}
                          </div>
                          {ev.reason && <div className="text-xs text-gray-600 mt-1">{ev.reason}</div>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}