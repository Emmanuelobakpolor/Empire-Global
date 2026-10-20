import { Landmark } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { INTEREST_OPTIONS, INTEREST_PAYMENT_STATE, interestOptionLabel, rateLabel } from '../../utils/investment'

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-navy-50/60 px-3 py-2.5">
      <p className="text-[11px] text-navy-400">{label}</p>
      <p className="text-sm font-bold text-navy-900 mt-0.5">{value}</p>
    </div>
  )
}

// An investment's interest: how it's paid, where to, and each payment. `onRecord` (admins only)
// adds a button to record a due payment once it has been transferred.
export default function InvestmentPanel({ transaction, onRecord }) {
  const inv = transaction.investment
  const account = inv.payoutAccount

  return (
    <Card className="mb-6">
      <h3 className="text-sm font-bold text-navy-800 mb-1">Interest</h3>
      <p className="text-xs text-navy-400 mb-4">{INTEREST_OPTIONS[inv.option]?.when}.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Paid" value={interestOptionLabel(inv.option)} />
        <Stat label="Rate" value={inv.rate != null ? rateLabel(inv.option, inv.rate) : 'Set on approval'} />
        <Stat label="Total Interest" value={inv.totalInterest != null ? formatCurrency(inv.totalInterest) : '—'} />
        <Stat label="Interest Paid" value={formatCurrency(inv.interestPaid)} />
      </div>
      {inv.partialRate != null && inv.rate !== inv.partialRate && (
        <p className="text-xs text-navy-500 mt-4">
          A partial withdrawal before maturity lowers the rate to {inv.partialRate}% a year on what’s left.
          Ending the plan early forfeits all interest.
        </p>
      )}
      {account && (
        <p className="text-xs text-navy-500 mt-4 flex items-center gap-1.5">
          <Landmark size={13} className="text-navy-400" />
          Sent to <strong className="text-navy-700">{account.bankName} · {account.accountNumber}</strong> ({account.accountName})
        </p>
      )}

      {inv.payments.length === 0 ? (
        <p className="text-sm text-navy-500 mt-4">
          {transaction.status === 'rejected' ? 'This investment did not start.' : 'Your interest schedule starts once your payment is confirmed.'}
        </p>
      ) : (
        <div className="mt-5 divide-y divide-navy-50 border-t border-navy-50 max-h-[28rem] overflow-y-auto">
          {inv.payments.map((p) => {
            const state = INTEREST_PAYMENT_STATE[p.state] || INTEREST_PAYMENT_STATE.upcoming
            return (
              <div key={p.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold text-navy-900">
                    {inv.payments.length > 1 && `#${p.number} · `}{formatCurrency(p.amount)}
                  </p>
                  <p className="text-xs text-navy-400">
                    {p.state === 'paid' ? `Sent ${formatDate(p.paidAt)} · ref ${p.payoutReference}` : `Due ${formatDate(p.dueDate)}`}
                    {p.paidBy && ` · by ${p.paidBy}`}
                    {' · '}<span className="font-mono">{p.reference}</span>
                  </p>
                </div>
                <span className="flex items-center gap-2 shrink-0">
                  <Badge status={state.badge} className="!normal-case">{state.label}</Badge>
                  {onRecord && p.state === 'due' && <Button size="sm" variant="accent" onClick={() => onRecord(p)}>Record Payment</Button>}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
