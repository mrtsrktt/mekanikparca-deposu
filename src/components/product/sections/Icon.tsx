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
  Building2,
  Store,
  Hammer,
  Coffee,
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
  Building2,
  Store,
  Hammer,
  Coffee,
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
