import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://mekanikparcadeposu.com'

// Statik sayfalar için sabit lastmod — her sitemap üretiminde "şimdi" yazmamak
// için. Google "her gün değişiyor" yalanını güvenilmez bulup yok sayar.
// İçerik gerçekten değişince bu tarihi manuel güncelleyin.
const STATIC_LAST_MODIFIED = new Date('2026-05-21')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // En son güncellenen ürün/blog tarihini ana sayfa lastmod'u olarak kullan
  const [latestProduct, latestBlogPost] = await Promise.all([
    prisma.product.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    }),
    prisma.blogPost.findFirst({
      where: { isPublished: true },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    }),
  ])

  const homepageLastMod = [
    latestProduct?.updatedAt,
    latestBlogPost?.updatedAt,
    STATIC_LAST_MODIFIED,
  ]
    .filter((d): d is Date => d instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0]

  // Statik sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: homepageLastMod,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/urunler`,
      lastModified: latestProduct?.updatedAt ?? STATIC_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/kategoriler`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/markalar`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/kampanyalar`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: latestBlogPost?.updatedAt ?? STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/hakkimizda`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/iletisim`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/sikca-sorulan-sorular`,
      lastModified: STATIC_LAST_MODIFIED,
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
