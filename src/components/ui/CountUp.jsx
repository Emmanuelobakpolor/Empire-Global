import { useCountUp } from '../../hooks/useCountUp'
import { formatCurrency } from '../../utils/formatCurrency'

export default function CountUp({ value, duration, format = formatCurrency }) {
  const current = useCountUp(value, duration)
  return <span className="tabular-nums">{format(current)}</span>
}
