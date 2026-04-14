import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://mekanikparcadeposu.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Statik sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/urunler`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/kategoriler`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/markalar`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/kampanyalar`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/hakkimizda`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/iletisim`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/sikca-sorulan-sorular`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  // Dinamik ürün sayfaları
  const products = await prisma.product.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
    where: {
      isActive: true,
    },
  })

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/urun/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Dinamik blog sayfaları
  const blogPosts = await prisma.blogPost.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
    where: {
      isPublished: true,
    },
  })

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticPages, ...productPages, ...blogPages]
}
