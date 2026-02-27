'use client'

import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle, FiBox } from 'react-icons/fi'
import { formatPrice } from '@/lib/pricing'
import Link from 'next/link'

const statusConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  PENDING: { label: 'Beklemede', icon: FiClock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  CONFIRMED: { label: 'Onaylandı', icon: FiCheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  SHIPPED: { label: 'Kargoda', icon: FiTruck, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  DELIVERED: { label: 'Teslim Edildi', icon: FiPackage, color: 'text-green-600', bgColor: 'bg-green-50' },
  CANCELLED: { label: 'İptal Edildi', icon: FiXCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
}

export default function OrderDetailPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/giris')
      return
    }

    if (status === 'authenticated' && orderId) {
      fetchOrder()
    }
  }, [status, orderId, router])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/account/orders/${orderId}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      } else {
        console.error('Sipariş bulunamadı')
      }
    } catch (error) {
      console.error('Sipariş yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Sipariş Bulunamadı</h1>
        <p className="text-gray-500 mb-6">Bu sipariş mevcut değil veya erişim izniniz yok.</p>
        <Link href="/hesabim" className="btn-primary">
          <FiArrowLeft className="inline mr-2" /> Hesabıma Dön
        </Link>
      </div>
    )
  }

  const statusInfo = statusConfig[order.status] || statusConfig.PENDING
  const StatusIcon = statusInfo.icon

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Sipariş Detayı</h1>
          <p className="text-gray-500">Sipariş No: {order.orderNumber}</p>
        </div>
        <Link href="/hesabim" className="btn-secondary">
          <FiArrowLeft className="inline mr-2" /> Siparişlerime Dön
        </Link>
      </div>

      {/* Status Card */}
      <div className={`card p-6 mb-6 ${statusInfo.bgColor}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${statusInfo.color} bg-white`}>
            <StatusIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold">Sipariş Durumu: {statusInfo.label}</h3>
            <p className="text-sm text-gray-600">
              Sipariş tarihi: {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2">
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

        {/* Right Column - Order Info */}
        <div className="space-y-6">
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

          {/* Cargo Info (if shipped) */}
          {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiBox className="text-primary-500" /> Kargo Bilgileri
              </h2>
              <div className="space-y-3 text-sm">
                {order.cargoCompany && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kargo Firması:</span>
                    <span className="font-medium">{order.cargoCompany}</span>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Takip Numarası:</span>
                    <span className="font-medium">{order.trackingNumber}</span>
                  </div>
                )}
                {order.status === 'DELIVERED' && (
                  <div className="mt-2 p-2 bg-green-50 text-green-700 rounded text-center">
                    <FiPackage className="inline mr-2" />
                    Siparişiniz teslim edilmiştir.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Notes */}
          {order.notes && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Sipariş Notu</h2>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}