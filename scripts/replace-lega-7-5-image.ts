import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SLUG = 'lega-75-kva-monofaze-servo-voltaj-regulatoru'
const NEW_URL = '/images/lega-7-5-kva-monofaze-servo-voltaj-regulatoru.png'
const NEW_ALT = 'Lega 7.5 kVA Monofaze Servo Voltaj Regülatörü'

// Eski Blob görselleri (yedek/galeri olarak korunacak)
const LEGACY_URLS = [
  'https://qr1cfwrbu4rown5i.public.blob.vercel-storage.com/products/356ae0b9-46ee-47e8-854b-b84b8c746dbd.jpg',
  'https://qr1cfwrbu4rown5i.public.blob.vercel-storage.com/products/94b25963-b084-4ea9-9a2d-28d405e8f0e1.jpg',
  'https://qr1cfwrbu4rown5i.public.blob.vercel-storage.com/products/ecc90523-cf93-4f18-abb8-4fae36814ec1.jpg',
  'https://qr1cfwrbu4rown5i.public.blob.vercel-storage.com/products/17207309-7fa9-45c3-a4d8-869f32fb37bd.jpg',
]

async function main() {
  const product = await prisma.product.findUnique({
    where: { slug: SLUG },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!product) {
    console.error(`Ürün bulunamadı: ${SLUG}`)
    process.exit(1)
  }

  console.log(`Ürün: ${product.name} (id=${product.id})`)
  console.log(`Mevcut görsel sayısı: ${product.images.length}`)
  product.images.forEach((img, i) =>
    console.log(`  [${i}] sort=${img.sortOrder} ${img.url}`)
  )

  await prisma.productImage.deleteMany({ where: { productId: product.id } })

  await prisma.productImage.create({
    data: {
      productId: product.id,
      url: NEW_URL,
      alt: NEW_ALT,
      sortOrder: 0,
    },
  })

  for (let i = 0; i < LEGACY_URLS.length; i++) {
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: LEGACY_URLS[i],
        alt: NEW_ALT,
        sortOrder: i + 1,
      },
    })
  }

  const updated = await prisma.product.findUnique({
    where: { id: product.id },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  })
  console.log('\nGüncel görseller:')
  updated?.images.forEach((img, i) =>
    console.log(`  [${i}] sort=${img.sortOrder} ${img.url}  alt="${img.alt}"`)
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
