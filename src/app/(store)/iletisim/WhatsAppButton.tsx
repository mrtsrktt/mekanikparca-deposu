'use client'

import { FaWhatsapp } from 'react-icons/fa'
import { trackWhatsAppClick } from '@/lib/gtm'

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/905326404086?text=Merhaba%2C%20siteniz%20%C3%BCzerinden%20size%20ula%C5%9F%C4%B1yorum.%20Bilgi%20alabilirmiyim"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick('iletisim')}
      className="inline-flex items-center gap-2 mt-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
    >
      <FaWhatsapp className="w-4 h-4" />
      WhatsApp&apos;tan Yaz
    </a>
  )
}
