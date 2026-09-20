'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FiBriefcase, FiClock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import QuickOrderTable from '@/components/b2b/QuickOrderTable'

type CorporateStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED'

/**
 * B2B Hizli Siparis sayfasi.
 *
 * - Giris yapilmamissa /giris'e yonlendirir.
 * - Kurumsal onayi olmayan kullanicilara bilgilendirici kart gosterir ve
 *   kurumsal basvuru sekmesine yonlendirir.
 * - ADMIN rolundeki kullanicilar ve onayli kurumsal musteriler tabloyu gorur.
 *
 * Not: Bu sayfa canli DB'ye YAZMAZ; yalnizca mevcut basvuru DURUMUNU okur.
 */
export default function HizliSiparisPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [corporateStatus, setCorporateStatus] = useState<CorporateStatus | null>(null)
  const [corporateLoading, setCorporateLoading] = useState(true)
  const [featureDisabled, setFeatureDisabled] = useState(false)

  // Giris yoksa yonlendir.
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/giris?redirect=/hizli-siparis')
    }
  }, [status, router])

  // Oturum varsa kurumsal basvuru durumunu kontrol et.
  useEffect(() => {
    if (status !== 'authenticated') return
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/corporate/application')
        if (res.status === 404) {
          if (active) setFeatureDisabled(true)
          return
        }
        if (!res.ok) return
        const data = (await res.json()) as { application?: { status?: CorporateStatus } | null }
        if (active) setCorporateStatus(data.application?.status ?? null)
      } catch {
        // Sessizce yoksay; kullaniciya tablo gosterilmez.
      } finally {
        if (active) setCorporateLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [status])

  const role = (session?.user as { role?: string } | undefined)?.role
  const isAdmin = role === 'ADMIN'
  const isApproved = corporateStatus === 'APPROVED'

  if (status === 'loading' || (status === 'authenticated' && corporateLoading)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">
        Yükleniyor...
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <FiAlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-2">Giriş yapmanız gerekiyor</h1>
        <p className="text-gray-500 mb-6">
          B2B Hızlı Sipariş özelliğini kullanmak için lütfen giriş yapın.
        </p>
        <Link href="/giris?redirect=/hizli-siparis" className="btn-primary inline-block">
          Giriş Yap
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">B2B Hızlı Sipariş (SKU)</h1>
        <p className="text-gray-500 mt-2 text-sm">
          SKU veya ürün adı ile arayın, adet girin ve tek tıkla sepete ekleyin.
          Yalnızca onaylı kurumsal müşteriler ve yöneticiler erişebilir.
        </p>
      </div>

      {featureDisabled ? (
        <InfoCard
          icon={<FiAlertCircle className="w-5 h-5 text-amber-500" />}
          title="Hızlı sipariş şu anda kullanılamıyor"
          text="Bu özellik geçici olarak devre dışı. Lütfen daha sonra tekrar deneyin."
        />
      ) : isAdmin || isApproved ? (
        <QuickOrderTable />
      ) : (
        <CorporateGate status={corporateStatus} />
      )}
    </div>
  )
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="flex gap-3 items-start bg-gray-50 border border-gray-200 rounded-xl p-4">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="font-semibold text-gray-800">{title}</p>
        <p className="text-sm text-gray-500 mt-0.5">{text}</p>
      </div>
    </div>
  )
}

/**
 * Kurumsal onayi olmayan kullanicilar icin bilgilendirici kart.
 * Kullaniciyi hesabim sayfasindaki kurumsal basvuru sekmesine yonlendirir.
 */
function CorporateGate({ status }: { status: CorporateStatus | null }) {
  const pending = status === 'PENDING'
  const rejected = status === 'REJECTED' || status === 'REVOKED'

  return (
    <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl p-8 text-center">
      {pending ? (
        <FiClock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
      ) : rejected ? (
        <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      ) : (
        <FiBriefcase className="w-12 h-12 text-primary-500 mx-auto mb-4" />
      )}

      <h2 className="text-xl font-semibold mb-2">
        {pending
          ? 'Kurumsal başvurunuz onay bekliyor'
          : rejected
          ? 'Kurumsal başvurunuz onaylanmadı'
          : 'Kurumsal müşteri onayı gerekli'}
      </h2>

      <p className="text-gray-500 mb-6 text-sm">
        {pending
          ? 'Başvurunuz değerlendirme aşamasında. Onaylandığında B2B Hızlı Sipariş özelliği otomatik olarak açılır.'
          : rejected
          ? 'B2B Hızlı Sipariş özelliğinden yararlanmak için yeni bir kurumsal başvuru oluşturabilirsiniz.'
          : 'B2B Hızlı Sipariş özelliği yalnızca onaylı kurumsal müşteriler için geçerlidir. Başvuru yapmak için hesabınıza gidin.'}
      </p>

      <Link
        href="/hesabim?tab=kurumsal"
        className="btn-primary inline-flex items-center gap-2"
      >
        <FiCheckCircle className="w-4 h-4" />
        Kurumsal Başvuru Sekmesine Git
      </Link>
    </div>
  )
}