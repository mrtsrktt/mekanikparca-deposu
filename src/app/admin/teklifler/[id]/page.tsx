'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSave, FiSend, FiMessageCircle, FiMail } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/pricing'

const statusOptions = [
  { value: 'PENDING', label: 'Beklemede' },
  { value: 'REVIEWING', label: 'İnceleniyor' },
  { value: 'QUOTED', label: 'Teklif Verildi' },
  { value: 'ACCEPTED', label: 'Kabul Edildi' },
  { value: 'REJECTED', label: 'Reddedildi' },
]

export default function AdminQuoteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [quote, setQuote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [itemPrices, setItemPrices] = useState<Record<string, { unitPrice: string; note: string }>>({})

  useEffect(() => {
    fetch(`/api/admin/quotes/${params.id}`)
      .then(r => r.json())
      .then((data) => {
        setQuote(data)
        setStatus(data.status)
        setAdminNote(data.adminNote || '')
        const prices: Record<string, { unitPrice: string; note: string }> = {}
        data.items?.forEach((item: any) => {
          prices[item.id] = {
            unitPrice: item.unitPrice != null ? String(item.unitPrice) : '',
            note: item.note || '',
          }
        })
        setItemPrices(prices)
      })
      .finally(() => setLoading(false))
  }, [params.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const items = Object.entries(itemPrices).map(([id, data]) => ({
        id,
        unitPrice: data.unitPrice ? parseFloat(data.unitPrice) : null,
        note: data.note || null,
      }))

      const res = await fetch(`/api/admin/quotes/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote, items }),
      })

      if (res.ok) {
        const updated = await res.json()
        setQuote(updated)
        toast.success('Teklif güncellendi!')
      } else {
        toast.error('Hata oluştu.')
      }
    } catch {
      toast.error('Hata oluştu.')
    }
    setSaving(false)
  }

  const handleSendWhatsApp = async () => {
    // Önce kaydet
    await handleSave()
    // Sonra WhatsApp linki oluştur
    const phone = (quote.user?.phone || quote.customerPhone || '').replace(/\D/g, '')
    const customerNameStr = quote.user?.name || quote.customerName || 'Müşteri'
    const quoteUrl = `${window.location.origin}/hesabim/teklifler/${quote.id}`
    const msg = encodeURIComponent(
      `Merhaba ${customerNameStr},\n\n` +
      `${quote.quoteNumber} numaralı teklif talebiniz hazırlanmıştır.\n\n` +
      `Teklifinizi görüntülemek için:\n${quoteUrl}\n\n` +
      `İKİ M İKLİMLENDİRME SİSTEMLERİ`
    )
    window.open(`https://wa.me/90${phone}?text=${msg}`, '_blank')

    // Mark as sent
    await fetch(`/api/admin/quotes/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAsSent: true, status: 'QUOTED' }),
    })
    setStatus('QUOTED')
    toast.success('WhatsApp ile gönderildi!')
  }

  const handleSendEmail = async () => {
    await handleSave()
    const customerNameStr = quote.user?.name || quote.customerName || 'Müşteri'
    const customerEmailStr = quote.user?.email || quote.customerEmail || ''
    const quoteUrl = `${window.location.origin}/hesabim/teklifler/${quote.id}`
    const subject = encodeURIComponent(`Teklif: ${quote.quoteNumber} - Mekanik Parça Deposu`)
    const body = encodeURIComponent(
      `Sayın ${customerNameStr},\n\n` +
      `${quote.quoteNumber} numaralı teklif talebiniz hazırlanmıştır.\n\n` +
      `Teklifinizi görüntülemek için aşağıdaki linke tıklayın:\n${quoteUrl}\n\n` +
      `Saygılarımızla,\nİKİ M İKLİMLENDİRME SİSTEMLERİ`
    )
    window.open(`mailto:${customerEmailStr}?subject=${subject}&body=${body}`, '_blank')

    await fetch(`/api/admin/quotes/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAsSent: true, status: 'QUOTED' }),
    })
    setStatus('QUOTED')
    toast.success('E-posta ile gönderildi!')
  }

  if (loading) return <div className="text-center py-16 text-gray-500">Yükleniyor...</div>
  if (!quote) return <div className="text-center py-16 text-gray-500">Teklif bulunamadı.</div>

  const quotedTotal = quote.items?.reduce((s: number, i: any) => {
    const price = itemPrices[i.id]?.unitPrice ? parseFloat(itemPrices[i.id].unitPrice) : 0
    return s + price * i.quantity
  }, 0) || 0

  return (
    <div>
      <Link href="/admin/teklifler" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-6">
        <FiArrowLeft className="w-4 h-4" /> Teklif Listesi
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sol: Ürünler */}
        <div className="flex-1">
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">{quote.quoteNumber}</h1>
              <span className="text-sm text-gray-400">
                {new Date(quote.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Müşteri Bilgileri */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><span className="text-gray-400 block">Müşteri</span><span className="font-medium">{quote.user?.name || quote.customerName}</span></div>
              <div><span className="text-gray-400 block">E-posta</span><span className="font-medium">{quote.user?.email || quote.customerEmail || '-'}</span></div>
              <div><span className="text-gray-400 block">Telefon</span><span className="font-medium">{quote.user?.phone || quote.customerPhone || '-'}</span></div>
              <div><span className="text-gray-400 block">Firma</span><span className="font-medium">{quote.user?.companyName || quote.customerCompany || '-'}</span></div>
            </div>
            {quote.isManual && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4 text-xs text-blue-600">
                Bu teklif admin tarafından manuel olarak oluşturulmuştur.
              </div>
            )}

            {quote.message && (
              <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-yellow-700 mb-1">Müşteri Notu:</p>
                <p className="text-sm text-yellow-600">{quote.message}</p>
              </div>
            )}

            {/* Ürün Tablosu — Fiyat Girişi */}
            <h2 className="font-semibold mb-3">Ürünler</h2>
            <div className="space-y-3">
              {quote.items?.map((item: any) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex gap-3 mb-3">
                    <img
                      src={item.product?.images?.[0]?.url || '/placeholder.jpg'}
                      alt={item.product?.name}
                      className="w-14 h-14 object-contain bg-gray-50 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product?.name}</p>
                      <p className="text-xs text-gray-400">{item.product?.brand?.name}</p>
                      <div className="flex gap-4 mt-1 text-xs">
                        <span>Miktar: <span className="font-semibold">{item.quantity}</span></span>
                        <span>Liste: <span className="font-semibold">{formatPrice(item.product?.priceTRY || 0)}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Teklif Fiyatı (Birim, ₺)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Fiyat girin"
                        className="input-field text-sm"
                        value={itemPrices[item.id]?.unitPrice || ''}
                        onChange={(e) => setItemPrices({
                          ...itemPrices,
                          [item.id]: { ...itemPrices[item.id], unitPrice: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Ürün Notu</label>
                      <input
                        type="text"
                        placeholder="Opsiyonel not"
                        className="input-field text-sm"
                        value={itemPrices[item.id]?.note || ''}
                        onChange={(e) => setItemPrices({
                          ...itemPrices,
                          [item.id]: { ...itemPrices[item.id], note: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  {itemPrices[item.id]?.unitPrice && (
                    <p className="text-xs text-right mt-2 text-green-600 font-medium">
                      Satır Toplam: {formatPrice(parseFloat(itemPrices[item.id].unitPrice) * item.quantity)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {quotedTotal > 0 && (
              <div className="mt-4 p-4 bg-primary-50 rounded-lg text-right">
                <span className="text-sm text-gray-600">Genel Toplam: </span>
                <span className="text-xl font-bold text-primary-500">{formatPrice(quotedTotal)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sağ: Durum & Aksiyonlar */}
        <div className="w-full lg:w-80">
          <div className="card p-6 sticky top-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
              <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
                {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notu</label>
              <textarea
                rows={3}
                placeholder="Müşteriye gösterilecek not..."
                className="input-field text-sm"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
              <FiSave className="w-4 h-4" /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>

            <hr />

            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteriye Gönder</p>

            <button onClick={handleSendWhatsApp} className="w-full bg-green-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm">
              <FiMessageCircle className="w-4 h-4" /> WhatsApp ile Gönder
            </button>

            <button onClick={handleSendEmail} className="w-full bg-blue-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm">
              <FiMail className="w-4 h-4" /> E-posta ile Gönder
            </button>

            {quote.sentAt && (
              <p className="text-xs text-gray-400 text-center">
                Son gönderim: {new Date(quote.sentAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
