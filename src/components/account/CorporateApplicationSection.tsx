'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  FiBriefcase,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiSend,
} from 'react-icons/fi'
import toast from 'react-hot-toast'

/**
 * Kurumsal basvuru durumunun API'den donen (sifresiz) ozeti.
 * Sifreli/hassas firma alanlari bu bilesene HIC gelmez.
 */
type CorporateApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED'

type CorporateApplicationSummary = {
  id: string
  status: CorporateApplicationStatus
  submittedAt: string | null
  decidedAt: string | null
  createdAt: string
  updatedAt: string
}

type FormState = {
  companyName: string
  taxNumber: string
  taxOffice: string
  companyAddress: string
  companyPhone: string
  authorizedPerson: string
  applicationNote: string
}

const EMPTY_FORM: FormState = {
  companyName: '',
  taxNumber: '',
  taxOffice: '',
  companyAddress: '',
  companyPhone: '',
  authorizedPerson: '',
  applicationNote: '',
}

const REQUIRED_FIELDS: { key: keyof FormState; label: string }[] = [
  { key: 'companyName', label: 'Firma Adı' },
  { key: 'taxNumber', label: 'Vergi No' },
  { key: 'taxOffice', label: 'Vergi Dairesi' },
  { key: 'companyAddress', label: 'Firma Adresi' },
  { key: 'companyPhone', label: 'Firma Telefonu' },
  { key: 'authorizedPerson', label: 'Yetkili Kişi' },
]

function formatDate(value: string | null): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Durum rozeti. Bilinmeyen durumlarda notr bir rozet gosterilir.
 */
function StatusBadge({ status }: { status: CorporateApplicationStatus }) {
  switch (status) {
    case 'PENDING':
      return (
        <span className="badge badge-warning gap-1">
          <FiClock className="w-3.5 h-3.5" /> Beklemede
        </span>
      )
    case 'APPROVED':
      return (
        <span className="badge badge-success gap-1">
          <FiCheckCircle className="w-3.5 h-3.5" /> Onaylandı
        </span>
      )
    case 'REJECTED':
      return (
        <span className="badge badge-danger gap-1">
          <FiXCircle className="w-3.5 h-3.5" /> Reddedildi
        </span>
      )
    case 'REVOKED':
      return (
        <span className="badge badge-danger gap-1">
          <FiAlertTriangle className="w-3.5 h-3.5" /> İptal Edildi
        </span>
      )
    default:
      return <span className="badge">Bilinmiyor</span>
  }
}

export default function CorporateApplicationSection() {
  // 'hidden' -> ozellik kapali (404) veya oturum yok; hicbir sey render edilmez.
  const [state, setState] = useState<'loading' | 'hidden' | 'ready'>('loading')
  const [application, setApplication] = useState<CorporateApplicationSummary | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const loadApplication = useCallback(async () => {
    try {
      const res = await fetch('/api/corporate/application', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })

      // Ozellik kapali (404) veya yetkisiz (401): bolumu hic gosterme.
      if (res.status === 404 || res.status === 401) {
        setState('hidden')
        return
      }

      if (!res.ok) {
        // Beklenmeyen hata: sessizce gizle (hassas bilgi sizdirma).
        setState('hidden')
        return
      }

      const data = (await res.json()) as { application: CorporateApplicationSummary | null }
      setApplication(data.application ?? null)
      setState('ready')
    } catch {
      setState('hidden')
    }
  }, [])

  useEffect(() => {
    void loadApplication()
  }, [loadApplication])

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    // Istemci tarafi basit zorunlu alan dogrulamasi.
    for (const field of REQUIRED_FIELDS) {
      if (form[field.key].trim().length === 0) {
        toast.error(`${field.label} zorunludur.`)
        return
      }
    }

    setSubmitting(true)
    try {
      const body: Record<string, string> = {
        companyName: form.companyName.trim(),
        taxNumber: form.taxNumber.trim(),
        taxOffice: form.taxOffice.trim(),
        companyAddress: form.companyAddress.trim(),
        companyPhone: form.companyPhone.trim(),
        authorizedPerson: form.authorizedPerson.trim(),
      }
      const note = form.applicationNote.trim()
      if (note.length > 0) body.applicationNote = note

      const res = await fetch('/api/corporate/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 201) {
        const data = (await res.json()) as { application: CorporateApplicationSummary }
        toast.success('Kurumsal başvurunuz alındı.')
        setApplication({
          ...data.application,
          submittedAt: data.application.submittedAt ?? data.application.createdAt,
        })
        setShowForm(false)
        setForm(EMPTY_FORM)
        return
      }

      if (res.status === 409) {
        toast.error('Aktif başvurunuz bulunmaktadır.')
        // Sunucu durumu ile senkronize ol.
        await loadApplication()
        return
      }

      if (res.status === 403) {
        toast.error('Yalnızca bireysel müşteriler kurumsal başvuru yapabilir.')
        return
      }

      toast.error('Başvuru gönderilemedi. Lütfen tekrar deneyin.')
    } catch {
      toast.error('Başvuru gönderilemedi. Lütfen tekrar deneyin.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReapply = () => {
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  // Ozellik kapali / oturum yok: hicbir sey render etme.
  if (state === 'hidden') return null

  if (state === 'loading') {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiBriefcase className="w-6 h-6 text-purple-500" />
          <h2 className="text-lg font-semibold">Kurumsal Başvuru</h2>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    )
  }

  const hasApplication = application !== null
  const isReapplyable =
    application !== null &&
    (application.status === 'REJECTED' || application.status === 'REVOKED')
  const showFormNow = !hasApplication || showForm

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FiBriefcase className="w-6 h-6 text-purple-500" />
          <h2 className="text-lg font-semibold">Kurumsal Başvuru</h2>
        </div>
        {hasApplication && <StatusBadge status={application.status} />}
      </div>

      {/* Mevcut basvuru ozeti (PENDING / APPROVED) */}
      {hasApplication && !showFormNow && (
        <div className="space-y-3">
          {application.status === 'PENDING' && (
            <p className="text-sm text-gray-600">
              Kurumsal başvurunuz alındı ve inceleme aşamasındadır. Onay süreci
              tamamlandığında bilgilendirileceksiniz.
            </p>
          )}
          {application.status === 'APPROVED' && (
            <p className="text-sm text-gray-600">
              Kurumsal başvurunuz onaylanmıştır. Kurumsal fiyat ve faturalandırma
              avantajlarından yararlanabilirsiniz.
            </p>
          )}
          {(application.status === 'REJECTED' || application.status === 'REVOKED') && (
            <p className="text-sm text-gray-600">
              {application.status === 'REJECTED'
                ? 'Kurumsal başvurunuz reddedilmiştir. Bilgilerinizi güncelleyerek yeniden başvurabilirsiniz.'
                : 'Kurumsal başvurunuz iptal edilmiştir. Yeniden başvurabilirsiniz.'}
            </p>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="text-gray-500">
              Başvuru Tarihi:{' '}
              <span className="text-gray-800 font-medium">
                {formatDate(application.submittedAt ?? application.createdAt)}
              </span>
            </span>
            {application.decidedAt && (
              <span className="text-gray-500">
                Karar Tarihi:{' '}
                <span className="text-gray-800 font-medium">
                  {formatDate(application.decidedAt)}
                </span>
              </span>
            )}
          </div>

          {isReapplyable && (
            <div className="pt-2">
              <button onClick={handleReapply} className="btn-primary text-sm">
                Yeniden Başvur
              </button>
            </div>
          )}
        </div>
      )}

      {/* Form: hic basvuru yoksa veya yeniden basvuru modunda */}
      {showFormNow && (
        <div className="space-y-4">
          {!hasApplication && (
            <p className="text-sm text-gray-600">
              Kurumsal müşteri avantajlarından yararlanmak için aşağıdaki formu
              doldurun. Başvurunuz yönetici onayına gönderilecektir.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Firma Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                className="input-field text-sm"
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Vergi No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.taxNumber}
                onChange={(e) => updateField('taxNumber', e.target.value)}
                className="input-field text-sm"
                maxLength={32}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Vergi Dairesi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.taxOffice}
                onChange={(e) => updateField('taxOffice', e.target.value)}
                className="input-field text-sm"
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Yetkili Kişi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.authorizedPerson}
                onChange={(e) => updateField('authorizedPerson', e.target.value)}
                className="input-field text-sm"
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Firma Telefonu <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={form.companyPhone}
                onChange={(e) => updateField('companyPhone', e.target.value)}
                className="input-field text-sm"
                maxLength={32}
                placeholder="0XXX XXX XX XX"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Firma Adresi <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.companyAddress}
                onChange={(e) => updateField('companyAddress', e.target.value)}
                className="input-field text-sm"
                rows={2}
                maxLength={1000}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Not</label>
              <textarea
                value={form.applicationNote}
                onChange={(e) => updateField('applicationNote', e.target.value)}
                className="input-field text-sm"
                rows={3}
                maxLength={2000}
                placeholder="Eklemek istediğiniz not (isteğe bağlı)"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary text-sm gap-1"
            >
              <FiSend className="w-4 h-4" />
              {submitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
            </button>
            {hasApplication && (
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary text-sm"
                disabled={submitting}
              >
                İptal
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}