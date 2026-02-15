import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } })
  if (!post) return { title: 'Yazı Bulunamadı' }
  return { title: post.metaTitle || post.title, description: post.metaDesc || post.excerpt }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } })
  if (!post || !post.isPublished) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-500">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-primary-500">Blog</Link>
        <span>/</span>
        <span className="text-gray-800">{post.title}</span>
      </div>

      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className="w-full h-64 object-cover rounded-xl mb-6" />
      )}

      <time className="text-sm text-gray-400">{new Date(post.createdAt).toLocaleDateString('tr-TR')}</time>
      <h1 className="text-3xl font-bold mt-2 mb-6">{post.title}</h1>
      <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  )
}
