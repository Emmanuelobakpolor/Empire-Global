import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { REPAYMENT_STATE, dueIn } from '../../utils/facility'

// Instalments the customer should act on: due (payment details showing), overdue or under review,
// else each facility's next one. Links to the facility, where the account to pay into is shown.
export default function UpcomingRepayments({ transactions, className = 'mb-6' }) {
  const active = transactions.filter((t) => t.facility?.status === 'active')
  const actionable = active.flatMap((t) =>
    t.facility.repayments
      .filter((r) => r.paymentAccount || r.state === 'pending')
      .map((r) => ({ txn: t, rep: r }))
  )
  const rows = actionable.length
    ? actionable
    : active.filter((t) => t.facility.nextRepayment).map((t) => ({ txn: t, rep: t.facility.nextRepayment }))
  if (!rows.length) return null
  rows.sort((a, b) => a.rep.dueDate.localeCompare(b.rep.dueDate))

  return (
    <Card className={`${className} animate-rise-in !p-0 overflow-hidden`}>
      <div className="flex items-center gap-2 px-5 pt-5 pb-3">
        <CalendarClock size={16} className="text-amber-500" />
        <h3 className="text-sm font-bold text-navy-800">{actionable.length ? 'Repayments Due' : 'Next Repayments'}</h3>
        {actionable.length > 0 && (
          <span className="text-[11px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{actionable.length}</span>
        )}
      </div>
      <div className="divide-y divide-navy-50">
        {rows.map(({ txn, rep }) => {
          const state = REPAYMENT_STATE[rep.state]
          return (
            <Link
              key={rep.id}
              to={`/customer/transactions/${txn.id}`}
              className="group flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-navy-50/40"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-navy-900 truncate">
                  {formatCurrency(rep.amount)} · {txn.productName}
                </p>
                <p className="text-xs text-navy-400">
                  Instalment {rep.number} · {formatDate(rep.dueDate)}
                  {rep.state === 'upcoming' ? ` · payment details from ${formatDate(rep.opensOn)}` : ` · ${dueIn(rep.dueDate)}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={state.badge} className="!normal-case">{state.label}</Badge>
                <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                  {rep.paymentAccount && rep.state !== 'pending' ? 'Pay now' : 'View'}
                  <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
