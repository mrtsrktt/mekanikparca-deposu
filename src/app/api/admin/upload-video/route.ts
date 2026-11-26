import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<NextResponse> {
  const { error, session } = await requireAdmin()
  if (error || !session) return error!

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'video/x-msvideo',
            'video/mpeg',
            'video/ogg',
            'video/3gpp',
            'video/x-matroska',
          ],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100 MB limit
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {
        // Client upload completed
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Video yükleme belirteci oluşturulamadı.' },
      { status: 400 }
    )
  }
}
