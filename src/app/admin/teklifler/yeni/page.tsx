'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSearch, FiPlus, FiTrash2, FiSave, FiMessageCircle, FiMail, FiDownload } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/pricing'

interface SelectedProduct {
  productId: string
  product: any
  quantity: number
  unitPrice: string
  note: string
}

export default function AdminNewQuotePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [createdQuote, setCreatedQuote] = useState<any>(null)

  // Müşteri bilgileri
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerCompany, setCustomerCompany] = useState('')
  const [adminNote, setAdminNote] = useState('Bu teklif 3 gün geçerlidir.')

  // Ürün arama
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Seçili ürünler
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])

  // Dışarı tıklayınca arama sonuçlarını kapat
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Ürün arama
  const handleSearch = async (q: string) => {
    setSearchQuery(q)
    if (q.length < 2) { setSearchResults([]); setShowResults(false); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/admin/products/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data)
        setShowResults(true)
      }
    } catch {}
    setSearching(false)
  }

  const addProduct = (product: any) => {
    if (selectedProducts.find(p => p.productId === product.id)) {
      toast.error('Bu ürün zaten ekli.')
      return
    }
    setSelectedProducts([...selectedProducts, {
      productId: product.id,
      product,
      quantity: 1,
      unitPrice: String(product.priceTRY),
      note: '',
    }])
    setSearchQuery('')
    setShowResults(false)
    toast.success('Ürün eklendi.')
  }

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId))
  }

  const updateProduct = (productId: string, field: string, value: any) => {
    setSelectedProducts(selectedProducts.map(p =>
      p.productId === productId ? { ...p, [field]: value } : p
    ))
  }

  const quotedTotal = selectedProducts.reduce((sum, p) => {
    const price = parseFloat(p.unitPrice) || 0
    return sum + price * p.quantity
  }, 0)

  const handleDownloadPdf = () => {
    if (!createdQuote) { toast.error('Önce teklifi kaydedin.'); return }
    window.open(`/hesabim/teklifler/${createdQuote.id}`, '_blank')
  }

  const handleSave = async (sendVia?: 'whatsapp' | 'email') => {
    if (!customerName.trim()) { toast.error('Müşteri adı gerekli.'); return }
    if (selectedProducts.length === 0) { toast.error('En az bir ürün ekleyin.'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          customerCompany,
          adminNote,
          items: selectedProducts.map(p => ({
            productId: p.productId,
            quantity: p.quantity,
            unitPrice: parseFloat(p.unitPrice) || null,
            note: p.note || null,
          })),
        }),
      })

      if (res.ok) {
        const quote = await res.json()
        toast.success('Teklif oluşturuldu!')
        setCreatedQuote(quote)

        if (sendVia === 'whatsapp' && customerPhone) {
          const phone = customerPhone.replace(/\D/g, '')
          const msg = encodeURIComponent(
            `Merhaba ${customerName},\n\n` +
            `${quote.quoteNumber} numaralı teklifiniz hazırlanmıştır.\n\n` +
            `İKİ M İKLİMLENDİRME SİSTEMLERİ`
          )
          window.open(`https://wa.me/90${phone}?text=${msg}`, '_blank')
        } else if (sendVia === 'email' && customerEmail) {
          const subject = encodeURIComponent(`Teklif: ${quote.quoteNumber} - Mekanik Parça Deposu`)
          const body = encodeURIComponent(
            `Sayın ${customerName},\n\n` +
            `${quote.quoteNumber} numaralı teklifiniz hazırlanmıştır.\n\n` +
            `Saygılarımızla,\nİKİ M İKLİMLENDİRME SİSTEMLERİ`
          )
          window.open(`mailto:${customerEmail}?subject=${subject}&body=${body}`, '_blank')
        }

        if (!sendVia) {
          router.push(`/admin/teklifler/${quote.id}`)
        }
      } else {
        const err = await res.json()
        toast.error(err.error || 'Hata oluştu.')
      }
    } catch {
      toast.error('Hata oluştu.')
    }
    setSaving(false)
  }

  return (
    <div>
      <Link href="/admin/teklifler" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-6">
        <FiArrowLeft className="w-4 h-4" /> Teklif Listesi
      </Link>

      <h1 className="text-2xl font-bold mb-6">Yeni Teklif Oluştur</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sol: Müşteri + Ürünler */}
        <div className="flex-1 space-y-6">
          {/* Müşteri Bilgileri */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Müşteri Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
                <input type="text" className="input-field" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Müşteri adı" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
                <input type="text" className="input-field" value={customerCompany} onChange={(e) => setCustomerCompany(e.target.value)} placeholder="Firma adı" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input type="email" className="input-field" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="E-posta adresi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input type="text" className="input-field" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="05XX XXX XX XX" />
              </div>
            </div>
          </div>

          {/* Ürün Ekleme */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Ürünler</h2>

            {/* Ürün Arama */}
            <div ref={searchRef} className="relative mb-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="Ürün adı veya kodu ile arayın..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                />
              </div>
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto mt-1">
                  {searchResults.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => addProduct(p)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b last:border-b-0"
                    >
                      <img src={p.images?.[0]?.url || '/placeholder.jpg'} alt={p.name} className="w-10 h-10 object-contain bg-gray-50 rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.brand?.name} {p.sku ? `• ${p.sku}` : ''}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary-500 whitespace-nowrap">{formatPrice(p.priceTRY)}</span>
                      <FiPlus className="w-4 h-4 text-green-500 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
              {showResults && searching && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-xl z-50 p-4 text-center text-sm text-gray-500 mt-1">
                  Aranıyor...
                </div>
              )}
            </div>

            {/* Seçili Ürünler */}
            {selectedProducts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Henüz ürün eklenmedi. Yukarıdan ürün arayarak ekleyin.</p>
            ) : (
              <div className="space-y-3">
                {selectedProducts.map((item) => (
                  <div key={item.productId} className="border rounded-lg p-4">
                    <div className="flex gap-3 mb-3">
                      <img
                        src={item.product?.images?.[0]?.url || '/placeholder.jpg'}
                        alt={item.product?.name}
                        className="w-14 h-14 object-contain bg-gray-50 rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product?.name}</p>
                        <p className="text-xs text-gray-400">{item.product?.brand?.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Liste: {formatPrice(item.product?.priceTRY || 0)}</p>
                      </div>
                      <button onClick={() => removeProduct(item.productId)} className="p-2 text-red-500 hover:bg-red-50 rounded self-start" title="Kaldır">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Miktar</label>
                        <input
                          type="number"
                          min="1"
                          className="input-field text-sm"
                          value={item.quantity}
                          onChange={(e) => updateProduct(item.productId, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Teklif Fiyatı (₺)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input-field text-sm"
                          value={item.unitPrice}
                          onChange={(e) => updateProduct(item.productId, 'unitPrice', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Not</label>
                        <input
                          type="text"
                          className="input-field text-sm"
                          placeholder="Opsiyonel"
                          value={item.note}
                          onChange={(e) => updateProduct(item.productId, 'note', e.target.value)}
                        />
                      </div>
                    </div>
                    {parseFloat(item.unitPrice) > 0 && (
                      <p className="text-xs text-right mt-2 text-green-600 font-medium">
                        Satır Toplam: {formatPrice(parseFloat(item.unitPrice) * item.quantity)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {quotedTotal > 0 && (
              <div className="mt-4 p-4 bg-primary-50 rounded-lg text-right">
                <span className="text-sm text-gray-600">Genel Toplam: </span>
                <span className="text-xl font-bold text-primary-500">{formatPrice(quotedTotal)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sağ: Açıklama & Aksiyonlar */}
        <div className="w-full lg:w-80">
          <div className="card p-6 sticky top-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teklif Açıklaması</label>
              <textarea
                rows={4}
                placeholder="Müşteriye gösterilecek açıklama..."
                className="input-field text-sm"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>

            <button onClick={() => handleSave()} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
              <FiSave className="w-4 h-4" /> {saving ? 'Kaydediliyor...' : 'Teklifi Kaydet'}
            </button>

            <button
              onClick={() => handleDownloadPdf()}
              disabled={!createdQuote}
              className="w-full bg-gray-700 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              title={!createdQuote ? 'Önce teklifi kaydedin' : ''}
            >
              <FiDownload className="w-4 h-4" /> PDF Görüntüle / İndir
            </button>

            {createdQuote && (
              <button
                onClick={() => router.push(`/admin/teklifler/${createdQuote.id}`)}
                className="w-full border border-primary-500 text-primary-500 px-4 py-2.5 rounded-lg font-medium hover:bg-primary-50 transition-colors text-sm"
              >
                Teklif Detayına Git →
              </button>
            )}

            <hr />

            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kaydet & Gönder</p>

            <button
              onClick={() => handleSave('whatsapp')}
              disabled={saving || !customerPhone}
              className="w-full bg-green-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <FiMessageCircle className="w-4 h-4" /> WhatsApp ile Gönder
            </button>

            <button
              onClick={() => handleSave('email')}
              disabled={saving || !customerEmail}
              className="w-full bg-blue-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <FiMail className="w-4 h-4" /> E-posta ile Gönder
            </button>

            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
              <p className="font-medium mb-1">Bilgi</p>
              <p>Teklif kaydedildikten sonra detay sayfasından düzenleme yapabilir ve tekrar gönderebilirsiniz.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
