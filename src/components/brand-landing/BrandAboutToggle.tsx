'use client'

import { useState } from 'react'

export default function BrandAboutToggle({ longText }: { longText: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      {open && (
        <div className="mt-4 text-gray-700 text-sm leading-relaxed whitespace-pre-line">
          {longText}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 text-sm font-medium text-primary-500 hover:text-primary-600 inline-flex items-center gap-1"
      >
        {open ? 'Daha Az Göster' : 'Daha Fazla Bilgi'}
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  )
}
