'use client'

import { useState } from 'react'
import type { BrandFAQ } from '@/lib/brand-content'

export default function BrandFaqAccordion({ faq }: { faq: BrandFAQ[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0)
  return (
    <div className="space-y-3">
      {faq.map((item, i) => {
        const open = openIdx === i
        return (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIdx(open ? null : i)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-gray-50"
              aria-expanded={open}
            >
              <span className="text-sm md:text-base font-semibold text-gray-800">
                {item.question}
              </span>
              <svg
                className={`flex-shrink-0 w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {open && (
              <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                {item.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
