import Icon from './Icon'
import type { TrustBadge } from '@/lib/product-descriptions'

type Props = {
  badges: TrustBadge[]
}

export default function TrustBadges({ badges }: Props) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {badges.map((badge, i) => (
        <div
          key={i}
          className="flex items-center gap-3 bg-white border border-emerald-200 border-l-4 border-l-emerald-500 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <Icon
            name={badge.icon}
            className="w-6 h-6 text-emerald-500 flex-shrink-0"
            strokeWidth={2}
          />
          <span className="text-sm font-medium text-slate-700 leading-snug">
            {badge.text}
          </span>
        </div>
      ))}
    </section>
  )
}
