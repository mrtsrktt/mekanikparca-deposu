'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FiUser, FiPhone, FiMail, FiLock, FiBriefcase, FiFileText, FiCheckCircle, FiShield, FiTag, FiClock } from 'react-icons/fi'

export default function B2BApplicationPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    companyName: '', taxNumber: '', taxOffice: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/b2b-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message)
        router.push('/giris')
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Bir hata oluştu.')
    }
    setLoading(false)
  }

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value })

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 rounded-full mb-4">
            <FiBriefcase className="w-7 h-7 text-primary-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bayi Başvurusu</h1>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto leading-relaxed">
            Toptan alım avantajlarından yararlanın. Onaylanan bayi hesaplarına özel indirimli fiyatlar, markaya ve kategoriye özel kampanyalar sunulmaktadır.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Section 1: Kişisel Bilgiler */}
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-1">
                <FiUser className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">Kişisel Bilgiler</h2>
              </div>
              <p className="text-sm text-gray-400 mb-5 ml-7">
                Başvurunuzla ilgili bilgilendirmeler bu bilgiler üzerinden yapılacaktır.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ad Soyad <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input id="name" type="text" required placeholder="Adınız ve soyadınız"
                      className="input-field pl-10" value={form.name} onChange={update('name')} />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Telefon <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input id="phone" type="tel" required placeholder="05XX XXX XX XX"
                      className="input-field pl-10" value={form.phone} onChange={update('phone')} />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    E-posta <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input id="email" type="email" required placeholder="firma@ornek.com"
                      className="input-field pl-10" value={form.email} onChange={update('email')} />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Şifre <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input id="password" type="password" required minLength={6} placeholder="En az 6 karakter"
                      className="input-field pl-10" value={form.password} onChange={update('password')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Section 2: Firma Bilgileri */}
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-1">
                <FiBriefcase className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">Firma Bilgileri</h2>
              </div>
              <p className="text-sm text-gray-400 mb-5 ml-7">
                Bayi hesapları yalnızca vergi mükellefi firmalar için onaylanır.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2">
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Firma Adı <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input id="companyName" type="text" required placeholder="Firma ünvanınız"
                      className="input-field pl-10" value={form.companyName} onChange={update('companyName')} />
                  </div>
                </div>
                <div>
                  <label htmlFor="taxOffice" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Vergi Dairesi <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input id="taxOffice" type="text" required placeholder="Vergi dairesi adı"
                      className="input-field pl-10" value={form.taxOffice} onChange={update('taxOffice')} />
                  </div>
                </div>
                <div>
                  <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Vergi Numarası <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input id="taxNumber" type="text" required placeholder="Vergi numaranız"
                      className="input-field pl-10" value={form.taxNumber} onChange={update('taxNumber')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Info Box */}
            <div className="p-6 md:p-8 bg-primary-50/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <FiClock className="w-4.5 h-4.5 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Yönetici Onayı</p>
                    <p className="text-xs text-gray-500 mt-0.5">Başvurular yönetici tarafından incelenerek onaylanır.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <FiTag className="w-4.5 h-4.5 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Özel Fiyatlar</p>
                    <p className="text-xs text-gray-500 mt-0.5">Onaylanan bayiler özel indirimli fiyatları görür.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <FiShield className="w-4.5 h-4.5 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Marka / Kategori İndirimi</p>
                    <p className="text-xs text-gray-500 mt-0.5">Markaya veya kategoriye özel indirim oranları uygulanabilir.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Submit */}
            <div className="p-6 md:p-8">
              <button type="submit" disabled={loading}
                className="btn-primary w-full text-base py-3.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Başvuru gönderiliyor...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="w-5 h-5" />
                    Bayi Başvurusu Gönder
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                Başvurunuz incelendikten sonra tarafınıza dönüş sağlanacaktır.
              </p>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}
