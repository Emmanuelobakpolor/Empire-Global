import { CalendarRange } from 'lucide-react'
import Card from './ui/Card'
import Badge from './ui/Badge'
import { useDataStore } from '../context/DataStoreContext'
import { formatDate } from '../utils/formatDate'
import { formatTerm, planPeriod, periodStatus } from '../utils/planPeriod'

export function usePlanPeriod(transaction) {
  const { products } = useDataStore()
  return transaction ? planPeriod(transaction, products) : null
}

// Compact "from → to" for table cells
export function PlanPeriodCell({ transaction }) {
  const period = usePlanPeriod(transaction)
  if (!period) return <span className="text-navy-300">—</span>
  const status = periodStatus(period)
  return (
    <div className="leading-tight whitespace-nowrap">
      <p className="text-navy-800">
        {formatDate(period.start)} <span className="text-navy-300">→</span> {period.end ? formatDate(period.end) : 'No expiry'}
      </p>
      <p className="text-[11px] text-navy-400">
        {formatTerm(period.termMonths)}
        {status && period.state !== 'open' && ` · ${status.label}`}
      </p>
    </div>
  )
}

// Full card for transaction detail pages
export default function PlanPeriodCard({ transaction }) {
  const period = usePlanPeriod(transaction)
  if (!period) return null
  const status = periodStatus(period)

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2">
          <CalendarRange size={16} className="text-navy-400" /> Plan Period
        </h3>
        {status && <Badge status={status.status} className="!normal-case">{status.label}</Badge>}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-navy-400">Start Date</p>
          <p className="text-sm font-bold text-navy-900 mt-1">{formatDate(period.start)}</p>
        </div>
        <div>
          <p className="text-xs text-navy-400">End / Expiry Date</p>
          <p className="text-sm font-bold text-navy-900 mt-1">{period.end ? formatDate(period.end) : 'No expiry'}</p>
        </div>
        <div>
          <p className="text-xs text-navy-400">Duration</p>
          <p className="text-sm font-bold text-navy-900 mt-1">{formatTerm(period.termMonths)}</p>
        </div>
      </div>
    </Card>
  )
}
