'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/pricing'
import { getStorageArray } from '@/lib/safeStorage'
import toast from 'react-hot-toast'
import { FiMapPin, FiPlus, FiCheck } from 'react-icons/fi'

interface CartItem {
  productId: string
  quantity: number
  product?: any
  unitPrice?: number
  campaignPrice?: any
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
  const [invoiceType, setInvoiceType] = useState<'PERSONAL' | 'CORPORATE'>('PERSONAL')
  const [invoiceData, setInvoiceData] = useState({ companyName: '', taxNumber: '', taxOffice: '', billingCity: '', billingDistrict: '', billingAddress: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [newAddr, setNewAddr] = useState({ title: '', fullName: '', phone: '', city: '', district: '', address: '', zipCode: '' })

  const loadData = useCallback(async () => {
    const cart = getStorageArray('cart')
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
    const validItems = enriched.filter((i: CartItem) => i.product)

    // Fetch campaign prices
    if (validItems.length > 0) {
      try {
        const res = await fetch('/api/campaigns/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: validItems.map(i => ({ productId: i.productId, quantity: i.quantity }))
          }),
        })
        if (res.ok) {
          const prices = await res.json()
          for (const item of validItems) {
            const price = prices.find((p: any) => p.productId === item.productId)
            if (price) item.campaignPrice = price
          }
        }
      } catch {}
    }

    setItems(validItems)

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

  const getUnitPrice = (item: CartItem) => {
    if (item.campaignPrice?.discountedPrice && item.campaignPrice.discountedPrice < (item.product?.priceTRY || Infinity)) {
      return item.campaignPrice.discountedPrice
    }
    return item.product?.priceTRY || 0
  }

  const getDiscountLabel = (item: CartItem): { type: 'campaign' | 'tier' | null; label: string } => {
    if (!item.campaignPrice || item.campaignPrice.source === 'base') return { type: null, label: '' }

    if (item.campaignPrice.source === 'tier' && item.campaignPrice.appliedPriceTier) {
      return {
        type: 'tier',
        label: `📦 Toplu Alım (${item.campaignPrice.appliedPriceTier.minQuantity}+ adet)`,
      }
    }

    if (item.campaignPrice.source === 'campaign' && item.campaignPrice.appliedCampaign) {
      return {
        type: 'campaign',
        label: `🎁 ${item.campaignPrice.appliedCampaign.name}${item.campaignPrice.appliedTier ? ` (${item.campaignPrice.appliedTier.minQuantity}+ adet)` : ''}`,
      }
    }

    return { type: null, label: '' }
  }

  const handlePayment = async () => {
    if (!selectedAddressId) { toast.error('Lütfen bir adres seçin.'); return }
    if (items.length === 0) { toast.error('Sepetiniz boş.'); return }
    if (invoiceType === 'CORPORATE') {
      if (!invoiceData.companyName || !invoiceData.taxNumber || !invoiceData.taxOffice || !invoiceData.billingCity || !invoiceData.billingDistrict || !invoiceData.billingAddress) {
        toast.error('Kurumsal fatura bilgilerini eksiksiz doldurun.'); return
      }
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/payment/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: getUnitPrice(i) })),
          addressId: selectedAddressId,
          notes,
          invoiceType,
          ...(invoiceType === 'CORPORATE' ? invoiceData : {}),
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

  const subtotal = items.reduce((sum, item) => sum + getUnitPrice(item) * item.quantity, 0)
  const originalTotal = items.reduce((sum, item) => sum + (item.product?.priceTRY || 0) * item.quantity, 0)
  const totalDiscount = originalTotal - subtotal

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

          {/* Fatura Bilgileri */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Fatura Bilgileri</h2>
            <div className="flex gap-4 mb-4">
              <label className={`flex items-center gap-2 border rounded-lg px-4 py-3 cursor-pointer transition-all flex-1 ${invoiceType === 'PERSONAL' ? 'border-primary-500 bg-primary-50/30' : 'hover:border-gray-300'}`}>
                <input type="radio" name="invoiceType" value="PERSONAL" checked={invoiceType === 'PERSONAL'}
                  onChange={() => setInvoiceType('PERSONAL')} />
                <div>
                  <span className="text-sm font-medium">Bireysel</span>
                  <p className="text-xs text-gray-500">Şahsi fatura</p>
                </div>
              </label>
              <label className={`flex items-center gap-2 border rounded-lg px-4 py-3 cursor-pointer transition-all flex-1 ${invoiceType === 'CORPORATE' ? 'border-primary-500 bg-primary-50/30' : 'hover:border-gray-300'}`}>
                <input type="radio" name="invoiceType" value="CORPORATE" checked={invoiceType === 'CORPORATE'}
                  onChange={() => setInvoiceType('CORPORATE')} />
                <div>
                  <span className="text-sm font-medium">Kurumsal</span>
                  <p className="text-xs text-gray-500">Şirket faturası</p>
                </div>
              </label>
            </div>
            {invoiceType === 'CORPORATE' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Şirket Adı *</label>
                    <input className="input-field text-sm" value={invoiceData.companyName}
                      onChange={e => setInvoiceData({...invoiceData, companyName: e.target.value})} placeholder="Firma ünvanı" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Vergi Numarası *</label>
                    <input className="input-field text-sm" value={invoiceData.taxNumber}
                      onChange={e => setInvoiceData({...invoiceData, taxNumber: e.target.value})} placeholder="Vergi numarası" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Vergi Dairesi *</label>
                    <input className="input-field text-sm" value={invoiceData.taxOffice}
                      onChange={e => setInvoiceData({...invoiceData, taxOffice: e.target.value})} placeholder="Vergi dairesi adı" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">İl *</label>
                    <input className="input-field text-sm" value={invoiceData.billingCity}
                      onChange={e => setInvoiceData({...invoiceData, billingCity: e.target.value})} placeholder="İl" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">İlçe *</label>
                    <input className="input-field text-sm" value={invoiceData.billingDistrict}
                      onChange={e => setInvoiceData({...invoiceData, billingDistrict: e.target.value})} placeholder="İlçe" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Fatura Adresi *</label>
                  <textarea className="input-field text-sm" rows={2} value={invoiceData.billingAddress}
                    onChange={e => setInvoiceData({...invoiceData, billingAddress: e.target.value})} placeholder="Şirket fatura adresi" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sağ: Özet */}
        <div className="card p-6 h-fit sticky top-24">
          <h2 className="font-semibold mb-4">Sipariş Özeti</h2>
          <div className="space-y-2 text-sm mb-4">
            {items.map(item => {
              const unitPrice = getUnitPrice(item)
              const discount = getDiscountLabel(item)
              const hasDiscount = discount.type !== null
              return (
                <div key={item.productId} className="mb-2 pb-2 border-b last:border-0">
                  <div className="flex justify-between">
                    <span className="text-gray-600 truncate max-w-[140px]">{item.product?.name} x{item.quantity}</span>
                    <span className="font-medium">{formatPrice(unitPrice * item.quantity)}</span>
                  </div>
                  {hasDiscount && (
                    <div className="flex justify-between text-xs mt-0.5">
                      <span className={`${discount.type === 'campaign' ? 'text-red-500' : 'text-orange-500'}`}>
                        {discount.label}
                      </span>
                      <span className="text-gray-400 line-through">
                        {formatPrice((item.product?.priceTRY || 0) * item.quantity)}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
            <hr />
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Ara Toplam</span>
                <span>{formatPrice(originalTotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>İndirim</span>
                  <span>-{formatPrice(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Kargo</span>
                {subtotal >= 5000 ? (
                  <span className="text-green-600 font-semibold">Ücretsiz</span>
                ) : (
                  <span className="text-orange-600 text-sm font-medium">Alıcı Öder</span>
                )}
              </div>
              {subtotal < 5000 && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
                  🚚 {formatPrice(5000 - subtotal)} daha ekleyin, <strong>kargo bedava</strong> olsun!
                </div>
              )}
              <hr />
              <div className="flex justify-between text-base font-bold">
                <span>Toplam</span>
                <span className="text-primary-500">{formatPrice(subtotal)}</span>
              </div>
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
          <p className="text-xs text-gray-400 text-center mt-1">
            Siparişi tamamlayarak{' '}
            <a href="/on-bilgilendirme-formu" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">
              Ön Bilgilendirme Formu
            </a>
            &apos;nu okuduğunuzu kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  )
}
