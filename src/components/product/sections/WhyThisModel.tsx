import Icon from './Icon'
import SectionHeading from './SectionHeading'
import type { FeatureCard } from '@/lib/product-descriptions'

type Props = {
  title: string
  features: FeatureCard[]
}

export default function WhyThisModel({ title, features }: Props) {
  return (
    <section>
      <SectionHeading>{title}</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Icon name={f.icon} className="w-6 h-6 text-amber-600" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mt-4">
              {f.title}
            </h3>
            <p className="text-base text-slate-600 mt-2 leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
