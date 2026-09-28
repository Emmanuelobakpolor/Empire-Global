import { useEffect, useRef, useState } from 'react'

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

/**
 * Animates a number from its previous value to `target` (from 0 on mount).
 * Jumps straight to the target when the user prefers reduced motion.
 */
export function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)
  const fromRef = useRef(0)

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      fromRef.current = target
      setValue(target)
      return
    }

    const from = fromRef.current
    let frame
    let start

    const tick = (now) => {
      if (start === undefined) start = now
      const progress = Math.min((now - start) / duration, 1)
      const next = from + (target - from) * easeOutCubic(progress)
      fromRef.current = next
      setValue(next)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
