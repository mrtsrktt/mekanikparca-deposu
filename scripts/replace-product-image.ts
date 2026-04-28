/**
 * Genel ürün görseli değiştirme script'i.
 * Yeni görseli ana görsel (sortOrder=0) yapar, mevcut görselleri sortOrder=1+ olarak korur.
 *
 * Kullanım: yukarıdaki TARGET sabitini güncelle, sonra:
 *   npx tsx scripts/replace-product-image.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGET = {
  slug: 'lega-500-va-kombi-voltaj-regulatoru',
  newUrl: '/images/lega-500-va-kombi-voltaj-regulatoru.png',
  newAlt: 'Lega 500 VA Kombi Voltaj Regülatörü',
}

async function main() {
  const product = await prisma.product.findUnique({
    where: { slug: TARGET.slug },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!product) {
    console.error(`Ürün bulunamadı: ${TARGET.slug}`)
    process.exit(1)
  }

  console.log(`Ürün: ${product.name} (id=${product.id})`)
  console.log(`Mevcut görsel sayısı: ${product.images.length}`)
  product.images.forEach((img, i) =>
    console.log(`  [${i}] sort=${img.sortOrder} ${img.url}`)
  )

  // Eski görselleri yedekle (galeri olarak korunacak)
  const legacyUrls = product.images.map((img) => img.url)

  await prisma.productImage.deleteMany({ where: { productId: product.id } })

  await prisma.productImage.create({
    data: {
      productId: product.id,
      url: TARGET.newUrl,
      alt: TARGET.newAlt,
      sortOrder: 0,
    },
  })

  for (let i = 0; i < legacyUrls.length; i++) {
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: legacyUrls[i],
        alt: TARGET.newAlt,
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
