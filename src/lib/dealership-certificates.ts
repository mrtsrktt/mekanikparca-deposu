export type DealershipCertificate = {
  brand: string
  brandDisplayName: string
  certificateTitle: string
  description: string
  previewImage: string
  pdfPath: string
}

export const DEALERSHIP_CERTIFICATES: DealershipCertificate[] = [
  {
    brand: 'lega',
    brandDisplayName: 'Lega Energy',
    certificateTitle: 'Lega Energy Yetkili Satıcı Belgesi',
    description:
      "İstanbul Ümraniye merkezli, 22 ülkeye ihracat yapan Lega Energy'nin Türkiye'deki yetkili satıcılarından biriyiz.",
    previewImage: '/belgeler/onizleme/lega-bayi-yazisi.jpg',
    pdfPath: '/belgeler/lega-bayi-yazisi.pdf',
  },
  {
    brand: 'regen',
    brandDisplayName: 'REGEN',
    certificateTitle: 'REGEN Yetkili Satıcı Belgesi',
    description:
      'REGEN markasının Türkiye yetkili satıcılarından biri olarak orijinal ürünleri profesyonel destek ile sunuyoruz.',
    previewImage: '/belgeler/onizleme/regen-bayi-yazisi.jpg',
    pdfPath: '/belgeler/regen-bayi-yazisi.pdf',
  },
  {
    brand: 'testo',
    brandDisplayName: 'Testo',
    certificateTitle: 'Testo Yetkili Satıcı Belgesi',
    description:
      "Almanya menşeli Testo ölçüm cihazlarının Türkiye'deki resmi yetkili satıcısıyız.",
    previewImage: '/belgeler/onizleme/testo-bayi-yazisi.jpg',
    pdfPath: '/belgeler/testo-bayi-yazisi.pdf',
  },
  {
    brand: 'mru',
    brandDisplayName: 'MRU',
    certificateTitle: 'MRU Yetkili Satıcı Belgesi',
    description:
      'MRU baca gazı analiz cihazlarının Türkiye yetkili satıcılarından biriyiz.',
    previewImage: '/belgeler/onizleme/mru-bayi-yazisi.jpg',
    pdfPath: '/belgeler/mru-bayi-yazisi.pdf',
  },
]

export function getCertificateByBrand(
  brand: string
): DealershipCertificate | null {
  return (
    DEALERSHIP_CERTIFICATES.find(
      (c) => c.brand === brand.toLowerCase()
    ) || null
  )
}
