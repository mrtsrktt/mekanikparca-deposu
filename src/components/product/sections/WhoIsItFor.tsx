import Icon from './Icon'
import SectionHeading from './SectionHeading'
import type { UseCase } from '@/lib/product-descriptions'

type Props = {
  title: string
  cases: UseCase[]
  summary: string
}

export default function WhoIsItFor({ title, cases, summary }: Props) {
  return (
    <section>
      <SectionHeading>{title}</SectionHeading>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {cases.map((c, i) => (
          <div
            key={i}
            className="bg-slate-50 rounded-lg p-4 text-center border border-slate-100"
          >
            <Icon
              name={c.icon}
              className="w-10 h-10 text-slate-700 mx-auto"
              strokeWidth={1.75}
            />
            <p className="text-sm font-medium text-slate-700 mt-2 leading-snug">
              {c.label}
            </p>
          </div>
        ))}
      </div>
      <p className="text-base text-slate-600 mt-6 leading-relaxed">{summary}</p>
    </section>
  )
}
