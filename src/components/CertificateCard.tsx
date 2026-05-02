'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import type { DealershipCertificate } from '@/lib/dealership-certificates'
import CertificateModal from './CertificateModal'

type Props = {
  certificate: DealershipCertificate
}

export default function CertificateCard({ certificate }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`${certificate.certificateTitle} — büyük göster`}
        className="group block w-full text-left bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 overflow-hidden"
      >
        <div className="relative h-[200px] bg-slate-50">
          <Image
            src={certificate.previewImage}
            alt={certificate.certificateTitle}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded">
            YETKİLİ SATICI
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-slate-900">
            {certificate.brandDisplayName}
          </h3>
          <p className="text-sm text-slate-600 mt-2 line-clamp-2">
            {certificate.description}
          </p>
          <span className="inline-flex items-center gap-1 text-amber-600 text-sm font-medium mt-3 group-hover:gap-1.5 transition-all">
            Belgeyi İncele <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </button>

      {isOpen && (
        <CertificateModal
          certificate={certificate}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
