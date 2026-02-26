'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/pricing'
import toast from 'react-hot-toast'
import { FiMapPin, FiPlus, FiCheck } from 'react-icons/fi'

interface CartItem {
  productId: string
  quantity: number
  product?: any
  unitPrice?: number
}

interface Address {
  id: string
  title: string
  fullName: string
  phone: string
  city: string
  district: string
  address: string
  zipCode?: string
  isDefault: boolean
}

export default function OdemePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [items, setItems] = useState<CartItem[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [newAddr, setNewAddr] = useState({ title: '', fullName: '', phone: '', city: '', district: '', address: '', zipCode: '' })

  const loadData = useCallback(async () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    if (cart.length === 0) { router.push('/sepet'); return }

    const enriched = await Promise.all(
      cart.map(async (item: CartItem) => {
        try {
          const res = await fetch(`/api/products/${item.productId}`)
          if (res.ok) {
            const product = await res.json()
            return { ...item, product, unitPrice: item.unitPrice ?? product.priceTRY }
          }
        } catch {}
        return item
      })
    )
    setItems(enriched.filter((i: CartItem) => i.product))

    const addrRes = await fetch('/api/account/addresses')
    if (addrRes.ok) {
      const addrData = await addrRes.json()
      setAddresses(addrData)
      const def = addrData.find((a: Address) => a.isDefault)
      if (def) setSelectedAddressId(def.id)
      else if (addrData.length > 0) setSelectedAddressId(addrData[0].id)
    }

    setLoading(false)
  }, [router])

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/giris?redirect=/odeme'); return }
    if (status === 'authenticated') loadData()
  }, [status, loadData, router])

  const handleAddAddress = async () => {
    if (!newAddr.title || !newAddr.fullName || !newAddr.phone || !newAddr.city || !newAddr.district || !newAddr.address) {
      toast.error('Tüm alanları doldurun.')
      return
    }
    const res = await fetch('/api/account/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newAddr, isDefault: addresses.length === 0 }),
    })
    if (res.ok) {
      const saved = await res.json()
      setAddresses(prev => [...prev, saved])
      setSelectedAddressId(saved.id)
      setShowNewAddress(false)
      setNewAddr({ title: '', fullName: '', phone: '', city: '', district: '', address: '', zipCode: '' })
      toast.success('Adres eklendi.')
    } else {
      toast.error('Adres eklenemedi.')
    }
  }

  const handlePayment = async () => {
    if (!selectedAddressId) { toast.error('Lütfen bir adres seçin.'); return }
    if (items.length === 0) { toast.error('Sepetiniz boş.'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/payment/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
          addressId: selectedAddressId,
          notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Ödeme başlatılamadı.'); setSubmitting(false); return }
      router.push(`/odeme/iframe?token=${data.token}`)
    } catch {
      toast.error('Bir hata oluştu.')
      setSubmitting(false)
    }
  }

  const total = items.reduce((sum, i) => sum + (i.unitPrice ?? i.product?.priceTRY ?? 0) * i.quantity, 0)

  if (loading || status === 'loading') {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center">Yükleniyor...</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Ödeme</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Sol: Adres */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2"><FiMapPin className="text-primary-500" /> Teslimat Adresi</h2>
              <button onClick={() => setShowNewAddress(!showNewAddress)} className="btn-secondary text-sm gap-1">
                <FiPlus className="w-4 h-4" /> Yeni Adres
              </button>
            </div>

            {showNewAddress && (
              <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Adres Başlığı</label>
                    <input className="input-field text-sm" value={newAddr.title} onChange={e => setNewAddr({...newAddr, title: e.target.value})} placeholder="Ev, İş..." /></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Ad Soyad</label>
                    <input className="input-field text-sm" value={newAddr.fullName} onChange={e => setNewAddr({...newAddr, fullName: e.target.value})} /></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Telefon</label>
                    <input className="input-field text-sm" value={newAddr.phone} onChange={e => setNewAddr({...newAddr, phone: e.target.value})} /></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">İl</label>
                    <input className="input-field text-sm" value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} /></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">İlçe</label>
                    <input className="input-field text-sm" value={newAddr.district} onChange={e => setNewAddr({...newAddr, district: e.target.value})} /></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Posta Kodu</label>
                    <input className="input-field text-sm" value={newAddr.zipCode} onChange={e => setNewAddr({...newAddr, zipCode: e.target.value})} /></div>
                  <div className="md:col-span-2"><label className="text-xs font-medium text-gray-600 block mb-1">Adres</label>
                    <textarea className="input-field text-sm" rows={2} value={newAddr.address} onChange={e => setNewAddr({...newAddr, address: e.target.value})} /></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddAddress} className="btn-primary text-sm">Kaydet</button>
                  <button onClick={() => setShowNewAddress(false)} className="btn-secondary text-sm">İptal</button>
                </div>
              </div>
            )}

            {addresses.length === 0 && !showNewAddress && (
              <p className="text-gray-500 text-sm">Kayıtlı adresiniz yok. Yeni adres ekleyin.</p>
            )}

            <div className="space-y-3">
              {addresses.map(addr => (
                <label key={addr.id} className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-primary-500 bg-primary-50/30' : 'hover:border-gray-300'}`}>
                  <input type="radio" name="address" value={addr.id} checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{addr.title}</span>
                      {addr.isDefault && <span className="badge badge-success text-[10px]"><FiCheck className="w-3 h-3 inline" /> Varsayılan</span>}
                    </div>
                    <p className="text-sm text-gray-600">{addr.fullName} — {addr.phone}</p>
                    <p className="text-xs text-gray-500">{addr.address}, {addr.district}/{addr.city}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">Sipariş Notu (opsiyonel)</label>
              <textarea className="input-field text-sm" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Teslimat ile ilgili notunuz..." />
            </div>
          </div>
        </div>

        {/* Sağ: Özet */}
        <div className="card p-6 h-fit sticky top-24">
          <h2 className="font-semibold mb-4">Sipariş Özeti</h2>
          <div className="space-y-2 text-sm mb-4">
            {items.map(item => (
              <div key={item.productId} className="flex justify-between">
                <span className="text-gray-600 truncate max-w-[160px]">{item.product?.name} x{item.quantity}</span>
                <span>{formatPrice((item.unitPrice ?? item.product?.priceTRY ?? 0) * item.quantity)}</span>
              </div>
            ))}
            <hr />
            <div className="flex justify-between">
              <span className="text-gray-500">Kargo</span>
              <span className="text-green-600">Ücretsiz</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Toplam</span>
              <span className="text-primary-500">{formatPrice(total)}</span>
            </div>
          </div>
          <button
            onClick={handlePayment}
            disabled={submitting || !selectedAddressId}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Yönlendiriliyor...' : 'Ödemeye Geç'}
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">256-bit SSL ile güvenli ödeme</p>
        </div>
      </div>
    </div>
  )
}
