'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { FiArrowLeft, FiDownload } from 'react-icons/fi'
import { formatPrice } from '@/lib/pricing'

const statusLabels: Record<string, { label: string; class: string }> = {
  PENDING: { label: 'Beklemede', class: 'badge-warning' },
  REVIEWING: { label: 'İnceleniyor', class: 'badge-warning' },
  QUOTED: { label: 'Teklif Verildi', class: 'badge-success' },
  ACCEPTED: { label: 'Kabul Edildi', class: 'badge-success' },
  REJECTED: { label: 'Reddedildi', class: 'badge-danger' },
}

export default function QuoteDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status: authStatus } = useSession()
  const [quote, setQuote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetch(`/api/quotes/${params.id}`)
        .then(r => r.json())
        .then(setQuote)
        .finally(() => setLoading(false))
    }
  }, [authStatus, params.id])

  if (authStatus === 'loading' || loading) return <div className="max-w-7xl mx-auto px-4 py-16 text-center">Yükleniyor...</div>
  if (!session) redirect('/giris')
  if (!quote) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">Teklif bulunamadı.</div>

  const st = statusLabels[quote.status] || { label: quote.status, class: 'badge-warning' }
  const hasQuotedPrices = quote.items?.some((i: any) => i.unitPrice != null)
  const quotedTotal = hasQuotedPrices
    ? quote.items.reduce((s: number, i: any) => s + (i.unitPrice || 0) * i.quantity, 0)
    : null
  const listTotal = hasQuotedPrices
    ? quote.items.reduce((s: number, i: any) => s + (i.product?.priceTRY || 0) * i.quantity, 0)
    : null
  const totalDiscount = listTotal != null && quotedTotal != null ? listTotal - quotedTotal : null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/hesabim/teklifler" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-6 no-print">
        <FiArrowLeft className="w-4 h-4" /> Tekliflerime Dön
      </Link>

      {/* Print/PDF area */}
      <div ref={printRef} className="print-area">
        <div className="card p-6 mb-6">

          {/* === PDF Header: Logo + Firma Bilgileri === */}
          <div className="print-header hidden">
            <div className="flex items-start justify-between border-b-2 border-gray-800 pb-4 mb-4">
              <div>
                <img src="/images/logo.png" alt="Mekanik Parça Deposu" className="h-14 w-auto mb-2" />
                <p className="text-xs text-gray-600 font-semibold">İKİ M İKLİMLENDİRME SİSTEMLERİ TİCARET LİMİTED ŞİRKETİ</p>
              </div>
              <div className="text-right text-xs text-gray-600 leading-relaxed">
                <p className="font-semibold text-gray-800 mb-1">İletişim Bilgileri</p>
                <p>ATATÜRK MAH. ALEMDAĞ CAD. NO:140-144</p>
                <p>İÇ KAPI NO:19, Ümraniye, İSTANBUL</p>
                <p>Tel: 0216 232 40 52</p>
                <p>GSM: 0532 640 40 86</p>
                <p>E-posta: info@2miklimlendirme.com.tr</p>
              </div>
            </div>
          </div>

          {/* Teklif Başlık */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-bold print-title">TEKLİF</h1>
              <p className="text-sm text-gray-500 mt-1">
                Teklif No: <span className="font-semibold text-gray-800">{quote.quoteNumber}</span>
              </p>
              <p className="text-sm text-gray-500">
                Tarih: {new Date(quote.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`badge ${st.class} text-sm no-print`}>{st.label}</span>
              {hasQuotedPrices && (
                <button onClick={handlePrint} className="btn-secondary text-sm inline-flex items-center gap-1 no-print">
                  <FiDownload className="w-4 h-4" /> PDF İndir
                </button>
              )}
            </div>
          </div>

          {/* Müşteri Bilgileri (print'te görünür) */}
          <div className="print-customer hidden mb-4">
            <div className="border rounded-lg p-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 mb-1">Müşteri Bilgileri</p>
              <p className="text-sm font-semibold">{quote.user?.name}</p>
              {quote.user?.companyName && <p className="text-sm text-gray-600">{quote.user.companyName}</p>}
              <p className="text-xs text-gray-500">{quote.user?.email}</p>
              {quote.user?.phone && <p className="text-xs text-gray-500">Tel: {quote.user.phone}</p>}
            </div>
          </div>

          {/* Açıklama Metni (print'te görünür) */}
          <div className="print-description hidden mb-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              Sayın {quote.user?.name}, teklif isteğinizi inceledik ve yapılabilecek en uygun fiyatlarla teklifinizi hazırladık. 
              Sizin için uygun olmasını temenni eder, hayırlı işler dileriz.
            </p>
          </div>

          {quote.message && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-700 mb-1">Notunuz:</p>
              <p className="text-sm text-gray-600">{quote.message}</p>
            </div>
          )}

          {quote.adminNote && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-blue-700 mb-1">Satıcı Notu:</p>
              <p className="text-sm text-blue-600">{quote.adminNote}</p>
            </div>
          )}

          {/* Ürün Tablosu */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm print-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Ürün</th>
                  <th className="text-center p-3 print-narrow">Miktar</th>
                  <th className="text-right p-3">Liste Fiyatı</th>
                  {hasQuotedPrices && <th className="text-right p-3">Teklif Fiyatı</th>}
                  {hasQuotedPrices && <th className="text-center p-3 print-narrow">İskonto</th>}
                  {hasQuotedPrices && <th className="text-right p-3">Toplam</th>}
                </tr>
              </thead>
              <tbody>
                {quote.items?.map((item: any) => {
                  const listPrice = item.product?.priceTRY || 0
                  const offerPrice = item.unitPrice
                  const discountPct = offerPrice != null && listPrice > 0
                    ? Math.round((1 - offerPrice / listPrice) * 100)
                    : 0
                  return (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product?.images?.[0]?.url || '/placeholder.jpg'}
                            alt={item.product?.name}
                            className="w-12 h-12 object-contain bg-gray-50 rounded print-img"
                          />
                          <div>
                            <p className="font-medium">{item.product?.name}</p>
                            <p className="text-xs text-gray-400">{item.product?.brand?.name}</p>
                            {item.note && <p className="text-xs text-blue-500 mt-0.5">{item.note}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right text-gray-500">{formatPrice(listPrice)}</td>
                      {hasQuotedPrices && (
                        <td className="p-3 text-right font-semibold text-green-600">
                          {offerPrice != null ? formatPrice(offerPrice) : '-'}
                        </td>
                      )}
                      {hasQuotedPrices && (
                        <td className="p-3 text-center">
                          {offerPrice != null && discountPct > 0 ? (
                            <span className="text-red-500 font-semibold">%{discountPct}</span>
                          ) : '-'}
                        </td>
                      )}
                      {hasQuotedPrices && (
                        <td className="p-3 text-right font-semibold">
                          {offerPrice != null ? formatPrice(offerPrice * item.quantity) : '-'}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
              {hasQuotedPrices && quotedTotal != null && listTotal != null && (
                <tfoot>
                  <tr className="border-t bg-gray-50">
                    <td colSpan={4} className="p-3 text-right text-gray-500 text-xs">Liste Toplam:</td>
                    <td colSpan={2} className="p-3 text-right text-gray-400 line-through">{formatPrice(listTotal)}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="p-3 text-right text-red-500 font-medium text-xs">Toplam İskonto:</td>
                    <td colSpan={2} className="p-3 text-right text-red-500 font-bold">
                      -{formatPrice(totalDiscount!)} (%{listTotal > 0 ? Math.round((totalDiscount! / listTotal) * 100) : 0})
                    </td>
                  </tr>
                  <tr className="border-t-2 bg-primary-50">
                    <td colSpan={4} className="p-3 text-right font-bold text-lg">Teklif Genel Toplam:</td>
                    <td colSpan={2} className="p-3 text-right font-bold text-lg text-primary-500">{formatPrice(quotedTotal)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* PDF Footer */}
          <div className="print-footer hidden mt-6 pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              Bu teklif {new Date(quote.createdAt).toLocaleDateString('tr-TR')} tarihinde düzenlenmiştir. 
              Fiyatlar KDV hariçtir. Teklif geçerlilik süresi 15 gündür.
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              İKİ M İKLİMLENDİRME SİSTEMLERİ TİC. LTD. ŞTİ. | Tel: 0216 232 40 52 | info@2miklimlendirme.com.tr
            </p>
          </div>
        </div>
      </div>

      {/* Print CSS */}
      <style jsx global>{`
        @media print {
          @page { margin: 10mm 8mm; size: A4 portrait; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 0 10px;
            font-size: 11px;
          }
          .no-print { display: none !important; }
          .print-header { display: block !important; }
          .print-customer { display: block !important; }
          .print-description { display: block !important; }
          .print-footer { display: block !important; }
          .print-table { border-collapse: collapse; width: 100%; font-size: 11px; }
          .print-table th { 
            background-color: #f3f4f6 !important; 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-weight: 600;
            font-size: 10px;
            white-space: nowrap;
          }
          .print-table td, .print-table th { 
            border: 1px solid #e5e7eb; 
            padding: 5px 6px;
          }
          .print-table .print-narrow { width: 50px; }
          .print-img { width: 30px; height: 30px; }
          .card { box-shadow: none !important; border: none !important; padding: 0 !important; }
          .print-title { font-size: 20px; color: #1a1a1a; }
          .badge { border: 1px solid #ccc; padding: 2px 8px; font-size: 10px; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}
