import SectionHeading from './SectionHeading'
import type { TechSpec } from '@/lib/product-descriptions'

type Props = {
  title: string
  specs: TechSpec[]
}

export default function TechSpecsTable({ title, specs }: Props) {
  return (
    <section>
      <SectionHeading>{title}</SectionHeading>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <dl className="divide-y divide-slate-200">
          {specs.map((s, i) => (
            <div
              key={i}
              className={`flex flex-col md:flex-row md:items-center px-4 py-3 ${
                i % 2 === 0 ? 'bg-slate-50' : 'bg-white'
              }`}
            >
              <dt className="md:w-1/3 text-sm font-medium text-slate-700">
                {s.label}
              </dt>
              <dd className="md:w-2/3 text-sm text-slate-900 mt-1 md:mt-0">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
