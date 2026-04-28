import {
  FiCpu,
  FiShield,
  FiTarget,
  FiMonitor,
  FiAward,
  FiCheckCircle,
  FiZap,
  FiGlobe,
} from 'react-icons/fi'
import type { TechSpec } from '@/lib/brand-content'

const ICONS = {
  cpu: FiCpu,
  shield: FiShield,
  target: FiTarget,
  monitor: FiMonitor,
  badge: FiAward,
  'shield-check': FiCheckCircle,
  zap: FiZap,
  globe: FiGlobe,
} as const

export default function BrandTechSpecs({
  title,
  subtitle,
  specs,
}: {
  title: string
  subtitle: string
  specs: TechSpec[]
}) {
  return (
    <section className="bg-slate-900 text-white">
      <div
        className="absolute inset-x-0 -mt-px h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"
        aria-hidden
      />
      <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-400 mb-4">
            <span className="w-6 h-px bg-amber-500/60" aria-hidden />
            Teknik Üstünlük
            <span className="w-6 h-px bg-amber-500/60" aria-hidden />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
          <p className="mt-3 text-slate-300 text-sm md:text-base max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {specs.map((spec) => {
            const Icon = ICONS[spec.iconKey] ?? FiCheckCircle
            return (
              <div
                key={spec.title}
                className="group relative bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 md:p-6 hover:bg-slate-800/70 hover:border-amber-500/40 transition-colors"
              >
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-white leading-snug">
                  {spec.title}
                </h3>
                <p className="mt-1.5 text-xs md:text-sm text-slate-400 leading-relaxed">
                  {spec.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
