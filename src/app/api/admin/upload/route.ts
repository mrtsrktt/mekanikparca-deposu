import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { put } from '@vercel/blob'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const folder = (formData.get('folder') as string) || 'products'

    if (!files.length) {
      return NextResponse.json({ error: 'Dosya seçilmedi' }, { status: 400 })
    }

    const uploaded: { url: string; alt: string }[] = []

    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `${folder}/${randomUUID()}.${ext}`

      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: false,
      })

      uploaded.push({
        url: blob.url,
        alt: file.name.replace(/\.[^.]+$/, ''),
      })
    }

    return NextResponse.json({ files: uploaded })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
