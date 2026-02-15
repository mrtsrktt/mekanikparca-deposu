'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const slides = [
  {
    image: '/images/toptanci.png',
    title: '',
    desc: '',
    btnText: '',
    btnLink: '/b2b-basvuru',
    hasOverlay: false,
  },
  {
    image: '/images/fernox.png',
    title: '',
    desc: '',
    btnText: '',
    btnLink: '/urunler?brand=fernox',
    hasOverlay: false,
  },
  {
    image: '/images/slide-3.png',
    title: 'Uzman Teknik Destek İçin Bize Her Zaman Ulaşabilirsiniz.',
    desc: '',
    btnText: 'WhatsApp ile Yazın',
    btnLink: 'https://wa.me/905326404086?text=Merhaba%2C%20siteniz%20%C3%BCzerinden%20size%20ula%C5%9F%C4%B1yorum.%20Bilgi%20alabilirmiyim',
    hasOverlay: 'whatsapp',
  },
  {
    image: '/images/slide-4.png',
    title: '',
    desc: '',
    btnText: '',
    btnLink: '/urunler',
    hasOverlay: false,
  },
]

export default function HeroSlider() {
  const [active, setActive] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startTimer() {
    stopTimer()
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % slides.length)
    }, 5000)
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    startTimer()
    return () => stopTimer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function goTo(index: number) {
    setActive(index)
    startTimer()
  }

  function goPrev() {
    setActive(prev => (prev - 1 + slides.length) % slides.length)
    startTimer()
  }

  function goNext() {
    setActive(prev => (prev + 1) % slides.length)
    startTimer()
  }

  return (
    <div className="relative w-full overflow-hidden bg-[#0f172a]">
      <div className="relative h-[220px] sm:h-[350px] md:h-[420px] lg:h-[480px]">
        <div
          className="flex h-full"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${active * (100 / slides.length)}%)`,
            transition: 'transform 0.5s ease-in-out',
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="relative h-full"
              style={{
                width: `${100 / slides.length}%`,
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Overlay'li slide'lar: metin göster */}
              {slide.hasOverlay === true && (
                <div className="absolute inset-0 bg-black/30 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 w-full">
                    <div className="max-w-xl">
                      <h2 className="text-lg sm:text-2xl md:text-4xl font-bold text-white mb-2 md:mb-3 drop-shadow-lg">
                        {slide.title}
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base text-white/90 mb-3 md:mb-5 drop-shadow line-clamp-2 md:line-clamp-none">
                        {slide.desc}
                      </p>
                      <Link
                        href={slide.btnLink}
                        className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 md:px-6 md:py-3 rounded-lg transition-colors text-sm md:text-base"
                      >
                        {slide.btnText}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              {/* WhatsApp slide */}
              {slide.hasOverlay === 'whatsapp' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center">
                  <div className="px-4">
                    <h2 className="text-lg sm:text-2xl md:text-4xl font-bold text-white mb-3 md:mb-5 drop-shadow-lg">
                      {slide.title}
                    </h2>
                    <a
                      href={slide.btnLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 md:px-7 md:py-3.5 rounded-lg transition-colors text-sm md:text-lg z-[25] relative"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      {slide.btnText}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Slide 1: tıklanabilir → bayi başvuru */}
      {active === 0 && (
        <Link href="/b2b-basvuru" className="absolute inset-0 z-20 cursor-pointer" aria-label="Hemen Kaydol - Bayi Başvuru" />
      )}

      {/* Slide 2: tıklanabilir → Fernox ürünleri */}
      {active === 1 && (
        <Link href="/urunler?brand=fernox" className="absolute inset-0 z-20 cursor-pointer" aria-label="Fernox Ürünlerini Gör" />
      )}

      {/* Slide 4: tıklanabilir → Ürünler */}
      {active === 3 && (
        <Link href="/urunler" className="absolute inset-0 z-20 cursor-pointer" aria-label="Ürünleri İncele" />
      )}

      {/* Sol ok */}
      <button
        onClick={goPrev}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-[30] w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
        aria-label="Önceki slide"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      {/* Sağ ok */}
      <button
        onClick={goNext}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-[30] w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
        aria-label="Sonraki slide"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      {/* Dot göstergeleri */}
      <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-[30] flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              i === active ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
