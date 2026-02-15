'use client'

import { useEffect, useState } from 'react'
import { FiDollarSign, FiRefreshCw } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AdminCurrencyPage() {
  const [rates, setRates] = useState<any[]>([])
  const [usdRate, setUsdRate] = useState('')
  const [eurRate, setEurRate] = useState('')
  const [loading, setLoading] = useState(false)

  const load = () => {
    fetch('/api/admin/currency').then(r => r.json()).then((data) => {
      setRates(data)
      const usd = data.find((r: any) => r.currency === 'USD')
      const eur = data.find((r: any) => r.currency === 'EUR')
      if (usd) setUsdRate(usd.rate.toString())
      if (eur) setEurRate(eur.rate.toString())
    })
  }
  useEffect(() => { load() }, [])

  const updateRate = async (currency: string, rate: string) => {
    if (!rate || parseFloat(rate) <= 0) { toast.error('Geçerli bir kur giriniz.'); return }
    setLoading(true)
    const res = await fetch('/api/admin/currency', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currency, rate: parseFloat(rate) })
    })
    const data = await res.json()
    toast.success(data.message)
    setLoading(false)
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Döviz Kuru Yönetimi</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Önemli:</strong> Kur güncellendiğinde, ilgili para birimindeki tüm ürünlerin TL fiyatları otomatik olarak yeniden hesaplanır.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* USD */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">USD / TRY</h2>
              <p className="text-sm text-gray-500">Amerikan Doları</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">1 USD = ? TL</label>
              <input type="number" step="0.0001" className="input-field" value={usdRate}
                onChange={(e) => setUsdRate(e.target.value)} placeholder="Örn: 32.50" />
            </div>
            <button onClick={() => updateRate('USD', usdRate)} disabled={loading} className="btn-primary self-end">
              <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Güncelle
            </button>
          </div>
          {rates.find(r => r.currency === 'USD') && (
            <p className="text-xs text-gray-400 mt-2">
              Son güncelleme: {new Date(rates.find(r => r.currency === 'USD').updatedAt).toLocaleString('tr-TR')}
            </p>
          )}
        </div>

        {/* EUR */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-xl font-bold text-blue-600">€</span>
            </div>
            <div>
              <h2 className="font-semibold text-lg">EUR / TRY</h2>
              <p className="text-sm text-gray-500">Euro</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">1 EUR = ? TL</label>
              <input type="number" step="0.0001" className="input-field" value={eurRate}
                onChange={(e) => setEurRate(e.target.value)} placeholder="Örn: 35.20" />
            </div>
            <button onClick={() => updateRate('EUR', eurRate)} disabled={loading} className="btn-primary self-end">
              <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Güncelle
            </button>
          </div>
          {rates.find(r => r.currency === 'EUR') && (
            <p className="text-xs text-gray-400 mt-2">
              Son güncelleme: {new Date(rates.find(r => r.currency === 'EUR').updatedAt).toLocaleString('tr-TR')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
