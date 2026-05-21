/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/urun/heat-transfer-fluid-hp-5c-10-litre-isi-transfer-sivisi-don-koruma',
        destination: '/urun/isi-pompasi-isi-transfer-sivisi-hp-5c-10-litre-fernox-heat-transfer-fluid-don-koruma',
        permanent: true,
      },
      {
        source: '/urun/tf1-sigma-manyetik-mini-filtre',
        destination: '/urun/fernox-tf1-sigma-kombi-alti-manyetik-mini-filtre',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
