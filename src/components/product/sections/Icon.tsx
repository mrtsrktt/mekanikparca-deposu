import {
  Shield,
  ShieldCheck,
  BadgeCheck,
  Truck,
  PackageCheck,
  Zap,
  Monitor,
  Wrench,
  Home,
  Building,
  Building2,
  Store,
  Hammer,
  Coffee,
  Flame,
  Activity,
  Gauge,
  Mountain,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  ShieldCheck,
  BadgeCheck,
  Truck,
  PackageCheck,
  Zap,
  Monitor,
  Wrench,
  Home,
  Building,
  Building2,
  Store,
  Hammer,
  Coffee,
  Flame,
  Activity,
  Gauge,
  Mountain,
}

type Props = {
  name: string
  className?: string
  strokeWidth?: number
}

export default function Icon({ name, className, strokeWidth }: Props) {
  const Cmp = ICON_MAP[name] || HelpCircle
  return <Cmp className={className} strokeWidth={strokeWidth} />
}
