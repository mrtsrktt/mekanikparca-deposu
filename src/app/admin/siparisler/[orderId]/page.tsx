'use client'

import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle, FiUser, FiMail, FiPhone, FiEdit, FiSave, FiMessageSquare } from 'react-icons/fi'
import { formatPrice } from '@/lib/pricing'
import Link from 'next/link'
import toast from 'react-hot-toast'

const statusOptions = [
  { value: 'PENDING', label: 'Beklemede', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { value: 'CONFIRMED', label: 'Onaylandı', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { value: 'SHIPPED', label: 'Kargoda', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { value: 'DELIVERED', label: 'Teslim Edildi', color: 'text-green-600', bgColor: 'bg-green-50' },
  { value: 'CANCELLED', label: 'İptal Edildi', color: 'text-red-600', bgColor: 'bg-red-50' },
]

export default function AdminOrderDetailPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    status: '',
    trackingNumber: '',
    adminNotes: '',
    cargoCompany: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin')
      return
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
      return
    }

    if (orderId) {
      fetchOrder()
    }
  }, [status, orderId, router, session])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
        setFormData({
          status: data.status,
          trackingNumber: data.trackingNumber || '',
          adminNotes: data.adminNotes || '',
          cargoCompany: data.cargoCompany || ''
        })
      } else {
        console.error('Sipariş bulunamadı')
        toast.error('Sipariş bulunamadı')
      }
    } catch (error) {
      console.error('Sipariş yüklenirken hata:', error)
      toast.error('Sipariş yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const updatedOrder = await res.json()
        setOrder(updatedOrder)
        setEditing(false)
        toast.success('Sipariş güncellendi')
      } else {
        toast.error('Güncelleme başarısız')
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error)
      toast.error('Güncelleme sırasında hata oluştu')
    }
  }

  const getStatusInfo = (status: string) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0]
  }

  const cargoCompanies = [
    'Aras Kargo',
    'Yurtiçi Kargo',
    'MNG Kargo',
    'Sürat Kargo',
    'PTT Kargo',
    'HepsiJet',
    'UPS',
    'DHL',
    'FedEx',
    'Horoz Lojistik',
    'Ekol Lojistik',
    'Ceva Lojistik',
    'Diğer'
  ]

  const handleWhatsAppNotification = () => {
    if (!order?.user?.phone || !order.trackingNumber || !order.cargoCompany) {
      toast.error('Kargo bilgileri eksik!')
      return
    }

    // Telefon numarasını temizle: başındaki 0'ı kaldır, başına 90 ekle
    const phone = order.user.phone.replace(/^0/, '').replace(/\D/g, '')
    const whatsappNumber = `90${phone}`

    const message = `Sayın ${order.user.name}, #${order.orderNumber} numaralı siparişiniz kargoya verilmiştir.%0A%0AKargo Firması: ${order.cargoCompany}%0AKargo Takip No: ${order.trackingNumber}%0A%0AMekanik Parça Deposu`
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Sipariş Bulunamadı</h1>
        <p className="text-gray-500 mb-6">Bu sipariş mevcut değil.</p>
        <Link href="/admin/siparisler" className="btn-primary">
          <FiArrowLeft className="inline mr-2" /> Siparişlere Dön
        </Link>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Sipariş Detayı</h1>
          <p className="text-gray-500">Sipariş No: {order.orderNumber}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/siparisler" className="btn-secondary">
            <FiArrowLeft className="inline mr-2" /> Siparişlere Dön
          </Link>
          <button
            onClick={() => setEditing(!editing)}
            className={`btn ${editing ? 'btn-warning' : 'btn-primary'}`}
          >
            <FiEdit className="inline mr-2" /> {editing ? 'Düzenlemeyi İptal' : 'Düzenle'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2">
          {/* Status Card */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${statusInfo.color} ${statusInfo.bgColor}`}>
                  {order.status === 'SHIPPED' ? (
                    <FiTruck className="w-6 h-6" />
                  ) : order.status === 'DELIVERED' ? (
                    <FiPackage className="w-6 h-6" />
                  ) : order.status === 'CANCELLED' ? (
                    <FiXCircle className="w-6 h-6" />
                  ) : (
                    <FiCheckCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">Sipariş Durumu</h3>
                  {editing ? (
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="input-field mt-1"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <p className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.label}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Sipariş Tarihi</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Cargo Information */}
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kargo Firması</label>
                {editing ? (
                  <select
                    value={formData.cargoCompany}
                    onChange={(e) => setFormData({ ...formData, cargoCompany: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Seçiniz</option>
                    {cargoCompanies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm">{order.cargoCompany || 'Belirtilmemiş'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kargo Takip Numarası</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.trackingNumber}
                    onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                    className="input-field"
                    placeholder="Takip numarası girin"
                  />
                ) : (
                  <p className="text-sm">{order.trackingNumber || 'Belirtilmemiş'}</p>
                )}
              </div>

              {/* WhatsApp Notification Button */}
              {order.status === 'SHIPPED' && order.trackingNumber && order.cargoCompany && (
                <div className="mt-4">
                  <button
                    onClick={handleWhatsAppNotification}
                    className="btn-success w-full flex items-center justify-center gap-2"
                  >
                    <FiMessageSquare className="w-5 h-5" />
                    📱 WhatsApp ile Müşteriye Bildir
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Müşteriye kargo bilgilerini WhatsApp üzerinden gönderir
                  </p>
                </div>
              )}
            </div>

            {/* Admin Notes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notları</label>
              {editing ? (
                <textarea
                  value={formData.adminNotes}
                  onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Sipariş ile ilgili notlar"
                />
              ) : (
                <p className="text-sm text-gray-600">{order.adminNotes || 'Not bulunmuyor'}</p>
              )}
            </div>

            {editing && (
              <div className="mt-6">
                <button
                  onClick={handleUpdate}
                  className="btn-primary w-full"
                >
                  <FiSave className="inline mr-2" /> Değişiklikleri Kaydet
                </button>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Sipariş Edilen Ürünler</h2>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  {item.product?.images?.[0]?.url && (
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product?.name || 'Ürün'}</h4>
                    <p className="text-sm text-gray-500">SKU: {item.product?.sku || '-'}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm">Adet: {item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.unitPrice)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatPrice(item.total)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kargo</span>
                  <span className="text-green-600">Ücretsiz</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Toplam</span>
                  <span className="text-primary-500">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiUser className="text-primary-500" /> Müşteri Bilgileri
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Ad Soyad</p>
                <p className="font-medium">{order.user?.name || '-'}</p>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">E-posta</p>
                  <p className="font-medium">{order.user?.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="font-medium">{order.user?.phone || '-'}</p>
                </div>
              </div>
              {order.user?.companyName && (
                <div>
                  <p className="text-sm text-gray-500">Firma</p>
                  <p className="font-medium">{order.user.companyName}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Müşteri Tipi</p>
                <span className={`badge ${order.user?.role === 'B2B' ? 'badge-warning' : 'badge-info'}`}>
                  {order.user?.role === 'B2B' ? 'Bayi' : 'Bireysel'}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Teslimat Adresi</h2>
            <div className="space-y-2 text-sm">
              {order.shippingAddress ? (
                <div className="whitespace-pre-line">{order.shippingAddress}</div>
              ) : (
                <p className="text-gray-500">Adres bilgisi bulunamadı.</p>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Ödeme Bilgileri</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ödeme Durumu:</span>
                <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                  {order.paymentStatus === 'PAID' ? 'Ödendi' : 'Beklemede'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ödeme Yöntemi:</span>
                <span>Kredi Kartı (PayTR)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Para Birimi:</span>
                <span>{order.currency}</span>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Müşteri Notu</h2>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}