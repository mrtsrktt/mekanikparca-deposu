import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
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

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
    await mkdir(uploadDir, { recursive: true })

    const uploaded: { url: string; alt: string }[] = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const ext = path.extname(file.name) || '.jpg'
      const filename = `${randomUUID()}${ext}`
      const filepath = path.join(uploadDir, filename)

      await writeFile(filepath, buffer)

      uploaded.push({
        url: `/uploads/${folder}/${filename}`,
        alt: file.name.replace(/\.[^.]+$/, ''),
      })
    }

    return NextResponse.json({ files: uploaded })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
