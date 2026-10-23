'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FiUser, FiBriefcase, FiInfo } from 'react-icons/fi'

export default function RegisterPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'individual' | 'corporate'>('individual')
  const [loading, setLoading] = useState(false)

  // Bireysel Kayıt Formu
  const [individualForm, setIndividualForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })

  // Kurumsal / Bayi Başvuru Formu
  const [corporateForm, setCorporateForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    dealerType: 'WHOLESALER' as 'WHOLESALER' | 'SERVICE',
    companyName: '',
    taxOffice: '',
    taxNumber: '',
    companyAddress: '',
    companyPhone: '',
    authorizedPerson: '',
    applicationNote: '',
  })

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(individualForm),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Kayıt başarılı! Giriş yapabilirsiniz.')
        router.push('/giris')
      } else {
        toast.error(data.error || 'Kayıt sırasında bir hata oluştu.')
      }
    } catch {
      toast.error('Bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const handleCorporateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const effectiveAuthorizedPerson =
      corporateForm.authorizedPerson.trim() || corporateForm.name.trim()

    const payload = {
      name: corporateForm.name.trim(),
      email: corporateForm.email.trim(),
      phone: corporateForm.phone.trim(),
      password: corporateForm.password,
      isCorporate: true,
      corporateData: {
        dealerType: corporateForm.dealerType,
        companyName: corporateForm.companyName.trim(),
        taxOffice: corporateForm.taxOffice.trim(),
        taxNumber: corporateForm.taxNumber.trim(),
        companyAddress: corporateForm.companyAddress.trim(),
        companyPhone: corporateForm.companyPhone.trim(),
        authorizedPerson: effectiveAuthorizedPerson,
        applicationNote: corporateForm.applicationNote.trim() || undefined,
      },
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(
          'Kurumsal başvurunuz ve kaydınız başarıyla alındı! Yönetici onayından sonra bayi avantajlarınız aktifleşecektir.',
          { duration: 5000 }
        )
        router.push('/giris')
      } else {
        toast.error(data.error || 'Başvuru sırasında bir hata oluştu.')
      }
    } catch {
      toast.error('Bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`mx-auto px-4 py-12 transition-all duration-300 ${
        tab === 'corporate' ? 'max-w-2xl' : 'max-w-md'
      }`}
    >
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">
          {tab === 'corporate' ? 'Kurumsal / Bayi Başvurusu' : 'Kayıt Ol'}
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          {tab === 'corporate'
            ? 'Bayimiz olarak avantajlı fiyatlar ve toptan iskonto oranlarından yararlanın.'
            : 'Hemen üye olun, hızlı ve güvenli alışverişe başlayın.'}
        </p>

        {/* Sekmeler (Tabs) */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setTab('individual')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              tab === 'individual'
                ? 'bg-white text-primary-600 shadow-sm border border-gray-200/60'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <FiUser className="w-4 h-4" />
            Bireysel Kayıt
          </button>
          <button
            type="button"
            onClick={() => setTab('corporate')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              tab === 'corporate'
                ? 'bg-white text-primary-600 shadow-sm border border-gray-200/60'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <FiBriefcase className="w-4 h-4" />
            Kurumsal / Bayi Başvurusu
          </button>
        </div>

        {/* Bireysel Kayıt Formu */}
        {tab === 'individual' && (
          <form onSubmit={handleIndividualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad Soyad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={individualForm.name}
                onChange={(e) => setIndividualForm({ ...individualForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-posta <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                className="input-field"
                value={individualForm.email}
                onChange={(e) => setIndividualForm({ ...individualForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input
                type="tel"
                className="input-field"
                value={individualForm.phone}
                onChange={(e) => setIndividualForm({ ...individualForm, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şifre <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="input-field"
                value={individualForm.password}
                onChange={(e) => setIndividualForm({ ...individualForm, password: e.target.value })}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </button>
          </form>
        )}

        {/* Kurumsal / Bayi Başvuru Formu */}
        {tab === 'corporate' && (
          <form onSubmit={handleCorporateSubmit} className="space-y-6">
            {/* Bilgilendirme Kutusu */}
            <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-4 flex items-start gap-3 text-blue-900 text-sm">
              <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Bilgilendirme</span>
                <p className="text-blue-800">
                  Kurumsal bayi başvurunuz yönetici onayından sonra aktifleşecek ve toptan/iskontolu fiyatları görebileceksiniz.
                </p>
              </div>
            </div>

            {/* Hesap Bilgileri */}
            <div className="border-t border-gray-100 pt-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                Hesap Bilgileri
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={corporateForm.name}
                    onChange={(e) => {
                      const val = e.target.value
                      setCorporateForm((prev) => ({
                        ...prev,
                        name: val,
                        authorizedPerson:
                          prev.authorizedPerson === '' || prev.authorizedPerson === prev.name
                            ? val
                            : prev.authorizedPerson,
                      }))
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    value={corporateForm.email}
                    onChange={(e) => setCorporateForm({ ...corporateForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    className="input-field"
                    value={corporateForm.phone}
                    onChange={(e) => setCorporateForm({ ...corporateForm, phone: e.target.value })}
                    placeholder="05XX XXX XX XX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şifre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="input-field"
                    value={corporateForm.password}
                    onChange={(e) => setCorporateForm({ ...corporateForm, password: e.target.value })}
                    placeholder="En az 6 karakter"
                  />
                </div>
              </div>
            </div>

            {/* Kurumsal Bilgiler */}
            <div className="border-t border-gray-100 pt-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                Kurumsal Bilgiler
              </h2>
              <div className="space-y-4">
                {/* Bayi Türü (Toptancı / Servis) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bayi Türü <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setCorporateForm({ ...corporateForm, dealerType: 'WHOLESALER' })
                      }
                      className={`text-left rounded-xl border p-3.5 transition-all ${
                        corporateForm.dealerType === 'WHOLESALER'
                          ? 'border-primary-500 bg-primary-50/40 ring-1 ring-primary-500 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            corporateForm.dealerType === 'WHOLESALER'
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {corporateForm.dealerType === 'WHOLESALER' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <span className="text-sm font-bold text-gray-900">Toptancı</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 ml-6">
                        Yüksek adetli toptan alım yapan bayiler için daha yüksek iskonto.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setCorporateForm({ ...corporateForm, dealerType: 'SERVICE' })
                      }
                      className={`text-left rounded-xl border p-3.5 transition-all ${
                        corporateForm.dealerType === 'SERVICE'
                          ? 'border-primary-500 bg-primary-50/40 ring-1 ring-primary-500 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            corporateForm.dealerType === 'SERVICE'
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {corporateForm.dealerType === 'SERVICE' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <span className="text-sm font-bold text-gray-900">Servis</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 ml-6">
                        Montaj/servis hizmeti veren bayiler için standart iskonto.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Firma Adı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={200}
                      className="input-field"
                      value={corporateForm.companyName}
                      onChange={(e) =>
                        setCorporateForm({ ...corporateForm, companyName: e.target.value })
                      }
                      placeholder="Örn: ABC Otomotiv Ltd. Şti."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vergi Numarası <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={32}
                      className="input-field"
                      value={corporateForm.taxNumber}
                      onChange={(e) =>
                        setCorporateForm({ ...corporateForm, taxNumber: e.target.value })
                      }
                      placeholder="VKN / TCKN"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vergi Dairesi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={200}
                      className="input-field"
                      value={corporateForm.taxOffice}
                      onChange={(e) =>
                        setCorporateForm({ ...corporateForm, taxOffice: e.target.value })
                      }
                      placeholder="Örn: Kadıköy V.D."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Firma Telefonu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={32}
                      className="input-field"
                      value={corporateForm.companyPhone}
                      onChange={(e) =>
                        setCorporateForm({ ...corporateForm, companyPhone: e.target.value })
                      }
                      placeholder="0XXX XXX XX XX"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yetkili Kişi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={200}
                      className="input-field"
                      value={corporateForm.authorizedPerson}
                      onChange={(e) =>
                        setCorporateForm({ ...corporateForm, authorizedPerson: e.target.value })
                      }
                      placeholder="Varsayılan: Ad Soyad"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Firma Adresi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      maxLength={1000}
                      className="input-field resize-y"
                      value={corporateForm.companyAddress}
                      onChange={(e) =>
                        setCorporateForm({ ...corporateForm, companyAddress: e.target.value })
                      }
                      placeholder="Fatura ve sevkiyat için açık firma adresi"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Başvuru Notu <span className="text-xs text-gray-400 font-normal">(opsiyonel)</span>
                    </label>
                    <textarea
                      rows={2}
                      maxLength={2000}
                      className="input-field resize-y"
                      value={corporateForm.applicationNote}
                      onChange={(e) =>
                        setCorporateForm({ ...corporateForm, applicationNote: e.target.value })
                      }
                      placeholder="Faaliyet alanınız, filo büyüklüğü veya eklemek istediğiniz notlar"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Başvuru Gönderiliyor...' : 'Kurumsal Kayıt ve Başvuru Yap'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Zaten hesabınız var mı?{' '}
          <Link href="/giris" className="text-primary-500 hover:underline font-medium">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  )
}
