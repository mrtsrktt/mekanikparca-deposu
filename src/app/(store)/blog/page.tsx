import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-gray-500 text-center py-16">Henüz blog yazısı bulunmuyor.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="card hover:shadow-md transition-shadow">
              {post.coverImage && (
                <img src={post.coverImage} alt={post.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <time className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString('tr-TR')}</time>
                <h2 className="font-semibold text-lg mt-1 mb-2">{post.title}</h2>
                {post.excerpt && <p className="text-sm text-gray-500 line-clamp-3">{post.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
