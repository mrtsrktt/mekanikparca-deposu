import { BadgeCheck, CheckCircle2 } from 'lucide-react'
import { getCertificateByBrand } from '@/lib/dealership-certificates'
import CertificateCard from '@/components/CertificateCard'

type Props = {
  brand: string
}

export default function DealershipCertificate({ brand }: Props) {
  const cert = getCertificateByBrand(brand)
  if (!cert) return null

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-br from-slate-50 to-amber-50 rounded-2xl p-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="max-w-md mx-auto md:mx-0 w-full">
              <CertificateCard certificate={cert} />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
                <BadgeCheck className="w-4 h-4" />
                YETKİLİ SATICI
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mt-4">
                {cert.certificateTitle}
              </h3>
              <p className="text-slate-700 mt-4 leading-relaxed">
                {cert.description}
              </p>
              <p className="text-slate-700 mt-3 leading-relaxed">
                Tüm {cert.brandDisplayName} ürünlerimiz orijinal, faturalı ve
                üretici garantilidir. Yetkili satıcı belgemize sol taraftaki
                görseli tıklayarak ulaşabilirsiniz.
              </p>
              <ul className="mt-6 space-y-2">
                <li className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  Orijinal ürün garantisi
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  Üretici garantisi geçerli
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  Profesyonel teknik destek
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
