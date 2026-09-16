import { useEffect, useRef, useState } from 'react'
import { HERO_SLIDES as SLIDES } from '../data/images'

const INTERVAL = 5000

export default function HeroSlider() {
  const [active, setActive] = useState(0)
  const timerRef = useRef(null)

  const start = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setActive((a) => (a + 1) % SLIDES.length)
    }, INTERVAL)
  }

  useEffect(() => {
    start()
    return () => clearInterval(timerRef.current)
  }, [])

  const goTo = (idx) => {
    setActive(idx)
    start()
  }

  return (
    <div className="relative w-full h-full rounded-[1.75rem] overflow-hidden shadow-2xl ring-1 ring-white/15">
      {SLIDES.map((slide, idx) => (
        <div
          key={slide.url}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
            idx === active ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          aria-hidden={idx !== active}
        >
          <img
            src={slide.url}
            alt={slide.label}
            loading={idx === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className={`w-full h-full object-cover ${idx === active ? 'animate-ken-burns' : ''}`}
          />
          {/* Legibility scrim — deepest at the caption, clear at the top */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/35 to-navy-950/5" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
            <p className="text-white font-bold text-lg sm:text-xl tracking-tight">{slide.label}</p>
            <p className="text-navy-200 text-xs sm:text-sm mt-1">{slide.caption}</p>
          </div>
        </div>
      ))}

      {/* Progress dots */}
      <div className="absolute bottom-6 right-6 sm:bottom-7 sm:right-7 z-20 flex items-center gap-1.5">
        {SLIDES.map((slide, idx) => (
          <button
            key={slide.url}
            onClick={() => goTo(idx)}
            aria-label={`Show slide ${idx + 1}: ${slide.label}`}
            aria-current={idx === active}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === active ? 'w-7 bg-emerald-400' : 'w-1.5 bg-white/45 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
