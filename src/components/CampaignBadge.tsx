import { FiGift } from 'react-icons/fi'

export default function CampaignBadge() {
  return (
    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10">
      <FiGift className="w-3 h-3" />
      Kampanya
    </span>
  )
}
