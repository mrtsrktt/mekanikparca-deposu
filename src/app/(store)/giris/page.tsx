'use client'

import { signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [redirectTo, setRedirectTo] = useState('/')
  const [isCheckoutFlow, setIsCheckoutFlow] = useState(false)

  // redirect parametresini oku (örn. ödemeye geç → /giris?redirect=/odeme)
  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get('redirect')
    if (r) {
      setRedirectTo(r)
      setIsCheckoutFlow(r.startsWith('/odeme'))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    setLoading(false)

    if (result?.error) {
      toast.error('E-posta veya şifre hatalı.')
    } else {
      toast.success('Giriş başarılı!')
      router.push(redirectTo)
      router.refresh()
    }
  }

  // Kayıt olmadan misafir olarak devam et
  const handleGuestContinue = () => {
    sessionStorage.setItem('guestCheckout', '1')
    router.push(redirectTo)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Giriş Yap</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              type="email" required className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input
              type="password" required className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        {/* Misafir devam — ödeme akışında göster */}
        {isCheckoutFlow && (
          <div className="mt-5">
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">veya</span></div>
            </div>
            <button
              onClick={handleGuestContinue}
              className="w-full border-2 border-primary-500 text-primary-600 hover:bg-primary-50 font-bold py-3 rounded-lg transition-colors"
            >
              Kayıt Olmadan Devam Et →
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              Üyelik gerekmez — bilgilerinizi girip hızlıca ödemeye geçin.
            </p>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Hesabınız yok mu? <Link href="/kayit" className="text-primary-500 hover:underline">Kayıt Ol</Link></p>
        </div>
      </div>
    </div>
  )
}
