import { useEffect, useState } from 'react'
import { useReveal } from '../hooks/useReveal'

export default function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1400 }) {
  const [ref, visible] = useReveal()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!visible) return
    let start = null
    let frame

    const step = (timestamp) => {
      if (start === null) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(eased * value))
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [visible, value, duration])

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString('en-NG')}
      {suffix}
    </span>
  )
}
