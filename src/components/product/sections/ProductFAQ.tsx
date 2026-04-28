'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import SectionHeading from './SectionHeading'
import type { ProductFAQItem } from '@/lib/product-descriptions'

type Props = {
  title: string
  items: ProductFAQItem[]
}

export default function ProductFAQ({ title, items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section>
      <SectionHeading>{title}</SectionHeading>
      <div className="space-y-2">
        {items.map((item, i) => {
          const isOpen = openIndex === i
          return (
            <div
              key={i}
              className={`border border-slate-200 rounded-lg overflow-hidden transition-colors ${
                isOpen ? 'bg-slate-50' : 'bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 p-4 text-left"
              >
                <span className="font-semibold text-slate-900">
                  {item.question}
                </span>
                {isOpen ? (
                  <Minus className="w-5 h-5 text-amber-600 flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-4 pb-4 text-slate-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
