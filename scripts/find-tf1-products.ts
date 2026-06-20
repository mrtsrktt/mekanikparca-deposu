import { prisma } from '../src/lib/prisma'

async function main() {
  const matches = await prisma.product.findMany({
    where: {
      OR: [
        { slug: { contains: 'tf1' } },
        { slug: { contains: 'mini-filtre' } },
        { slug: { contains: 'sigma' } },
      ],
    },
    select: { slug: true, name: true, isActive: true },
  })
  console.log(JSON.stringify(matches, null, 2))
}

main().finally(() => prisma.$disconnect())
