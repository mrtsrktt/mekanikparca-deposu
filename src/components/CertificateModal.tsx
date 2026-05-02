'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { X, Download } from 'lucide-react'
import type { DealershipCertificate } from '@/lib/dealership-certificates'

type Props = {
  certificate: DealershipCertificate
  onClose: () => void
}

export default function CertificateModal({ certificate, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  const pdfFilename = certificate.pdfPath.split('/').pop() || 'belge.pdf'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={certificate.certificateTitle}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-base md:text-lg font-bold text-slate-900 pr-4">
            {certificate.certificateTitle}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50 p-4 md:p-6">
          <div className="relative w-full aspect-[1/1.414] max-w-2xl mx-auto bg-white shadow-md">
            <Image
              src={certificate.previewImage}
              alt={certificate.certificateTitle}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 px-5 py-4 border-t border-slate-200 bg-white">
          <a
            href={certificate.pdfPath}
            download={pdfFilename}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF Olarak İndir
          </a>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}
