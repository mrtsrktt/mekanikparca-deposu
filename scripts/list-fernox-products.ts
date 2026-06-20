import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
;(async () => {
  const rows = await prisma.product.findMany({
    where: { brand: { slug: 'fernox' } },
    select: { slug: true, name: true, isActive: true },
    orderBy: { name: 'asc' },
  })
  console.log(JSON.stringify(rows, null, 2))
  await prisma.$disconnect()
})()
