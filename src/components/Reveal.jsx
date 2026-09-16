import { useReveal } from '../hooks/useReveal'

/**
 * Wraps children in a scroll-triggered fade/slide-up reveal.
 * Pass `delay` (1-4) to stagger multiple items, or `as` to change the wrapper tag.
 */
export default function Reveal({ children, delay, className = '', as: Tag = 'div', ...rest }) {
  const [ref, visible] = useReveal()
  const delayClass = delay ? `reveal-delay-${delay}` : ''

  return (
    <Tag ref={ref} className={`reveal ${visible ? 'reveal-visible' : ''} ${delayClass} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
