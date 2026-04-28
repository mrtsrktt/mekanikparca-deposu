import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SLUG = 'lega-75-kva-monofaze-servo-voltaj-regulatoru'
const NEW_URL = '/images/lega-7-5-kva-monofaze-servo-voltaj-regulatoru.png'
const NEW_ALT = 'Lega 7.5 kVA Monofaze Servo Voltaj Regülatörü'

async function main() {
  const product = await prisma.product.findUnique({
    where: { slug: SLUG },
    include: { images: true },
  })

  if (!product) {
    console.error(`Ürün bulunamadı: ${SLUG}`)
    process.exit(1)
  }

  console.log(`Ürün: ${product.name} (id=${product.id})`)
  console.log(`Mevcut görsel sayısı: ${product.images.length}`)
  product.images.forEach((img, i) => console.log(`  [${i}] ${img.url}`))

  await prisma.productImage.deleteMany({ where: { productId: product.id } })
  await prisma.productImage.create({
    data: {
      productId: product.id,
      url: NEW_URL,
      alt: NEW_ALT,
      sortOrder: 0,
    },
  })

  const updated = await prisma.product.findUnique({
    where: { id: product.id },
    include: { images: true },
  })
  console.log('\nGüncel görseller:')
  updated?.images.forEach((img, i) => console.log(`  [${i}] ${img.url}  alt="${img.alt}"`))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
