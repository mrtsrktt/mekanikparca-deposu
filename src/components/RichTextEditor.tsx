'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { useRef, useCallback } from 'react'
import {
  FiBold, FiItalic, FiUnderline, FiAlignLeft, FiAlignCenter, FiAlignRight,
  FiList, FiImage, FiLink, FiType, FiMinus
} from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Props {
  content: string
  onChange: (html: string) => void
}

export default function RichTextEditor({ content, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Link.configure({ openOnClick: false }),
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none',
      },
    },
  })

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    try {
      const fd = new FormData()
      fd.append('files', file)
      fd.append('folder', 'blog')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.files?.[0]?.url) {
        editor.chain().focus().setImage({ src: data.files[0].url }).run()
        toast.success('Görsel eklendi')
      } else {
        toast.error('Yükleme hatası')
      }
    } catch {
      toast.error('Görsel yüklenemedi')
    }
    e.target.value = ''
  }, [editor])

  const addLink = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Link URL:')
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])

  if (!editor) return null

  const ToolBtn = ({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title: string }) => (
    <button type="button" onClick={onClick} title={title}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
      {children}
    </button>
  )

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-gray-50">
        {/* Heading */}
        <select
          value={
            editor.isActive('heading', { level: 1 }) ? '1' :
            editor.isActive('heading', { level: 2 }) ? '2' :
            editor.isActive('heading', { level: 3 }) ? '3' :
            editor.isActive('heading', { level: 4 }) ? '4' : '0'
          }
          onChange={(e) => {
            const level = parseInt(e.target.value)
            if (level === 0) editor.chain().focus().setParagraph().run()
            else editor.chain().focus().toggleHeading({ level: level as 1|2|3|4 }).run()
          }}
          className="text-xs border rounded px-2 py-1.5 bg-white text-gray-700 mr-1"
        >
          <option value="0">Normal</option>
          <option value="1">Başlık 1</option>
          <option value="2">Başlık 2</option>
          <option value="3">Başlık 3</option>
          <option value="4">Başlık 4</option>
        </select>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Font size via heading */}
        <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Kalın">
          <FiBold className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="İtalik">
          <FiItalic className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Altı Çizili">
          <FiUnderline className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Üstü Çizili">
          <FiType className="w-4 h-4" />
        </ToolBtn>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Color */}
        <input
          type="color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-7 h-7 rounded cursor-pointer border border-gray-200"
          title="Yazı Rengi"
        />

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Alignment */}
        <ToolBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Sola Hizala">
          <FiAlignLeft className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Ortala">
          <FiAlignCenter className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Sağa Hizala">
          <FiAlignRight className="w-4 h-4" />
        </ToolBtn>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Lists */}
        <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Madde İşareti">
          <FiList className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numaralı Liste">
          <span className="text-xs font-bold">1.</span>
        </ToolBtn>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Blockquote */}
        <ToolBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Alıntı">
          <span className="text-sm font-bold">&ldquo;</span>
        </ToolBtn>

        {/* Horizontal Rule */}
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Yatay Çizgi">
          <FiMinus className="w-4 h-4" />
        </ToolBtn>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Link */}
        <ToolBtn active={editor.isActive('link')} onClick={addLink} title="Link Ekle">
          <FiLink className="w-4 h-4" />
        </ToolBtn>

        {/* Image */}
        <ToolBtn onClick={() => fileInputRef.current?.click()} title="Görsel Ekle">
          <FiImage className="w-4 h-4" />
        </ToolBtn>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
