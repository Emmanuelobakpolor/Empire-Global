import { useState } from 'react'
import { CalendarClock, Clock, Info, PartyPopper, Printer, Wallet } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import PaymentAccountCard from './PaymentAccountCard'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { CONTRIBUTION_STATE, METHOD_LABELS, contributionLabel } from '../../utils/ajo'
import { printStatement } from '../../utils/exportReport'

// Long daily schedules show this many contributions until expanded
const PREVIEW_ROWS = 7

function Stat({ label, value, tone = 'text-navy-900' }) {
  return (
    <div className="rounded-xl border border-navy-100 px-3 py-2.5">
      <p className="text-[11px] text-navy-400">{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${tone}`}>{value}</p>
    </div>
  )
}

// Saved so far, the charge and what's paid out at the end
export function AjoSummary({ transaction }) {
  const ajo = transaction.ajo
  const progress = ajo.count ? Math.round((ajo.paidCount / ajo.count) * 100) : 0
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="Ajo Balance" value={formatCurrency(ajo.payout ? 0 : ajo.saved)} tone="text-emerald-600" />
        <Stat label="Contribution" value={`${formatCurrency(ajo.contribution)} ${contributionLabel(ajo.frequency).toLowerCase()}`} />
        <Stat label="Contributions Paid" value={`${ajo.paidCount} of ${ajo.count}`} />
        <Stat label="Service Charge" value={formatCurrency(ajo.payout?.serviceCharge ?? ajo.serviceCharge)} />
        <Stat label={ajo.payout ? 'Payout' : 'Payout So Far'} value={formatCurrency(ajo.payout?.payoutAmount ?? ajo.netPayout)} />
        <Stat label="Cycle Ends" value={formatDate(ajo.cycleEnds)} />
      </div>
      <div className="mt-4">
        <div className="h-2 rounded-full bg-navy-50 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-navy-400 mt-1.5">
          {formatCurrency(ajo.saved)} of {formatCurrency(ajo.target)} if every contribution is paid
        </p>
      </div>
    </div>
  )
}

export function StatementCard({ transaction }) {
  const { statement } = transaction.ajo
  const print = () => printStatement({ transaction, formatAmount: formatCurrency, formatDate })
  return (
    <Card className="mb-6" padded={false}>
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-3">
        <h3 className="text-sm font-bold text-navy-800">Statement</h3>
        <Button variant="outline" size="sm" icon={Printer} onClick={print} disabled={!statement.length}>Print / PDF</Button>
      </div>
      {statement.length === 0 ? (
        <p className="px-5 sm:px-6 pb-5 text-sm text-navy-400">Confirmed contributions will appear here.</p>
      ) : (
        <div className="overflow-x-auto border-t border-navy-50">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-navy-400">
                <th className="px-4 py-2 font-semibold">Date</th>
                <th className="px-4 py-2 font-semibold">Description</th>
                <th className="px-4 py-2 font-semibold text-right">Credit</th>
                <th className="px-4 py-2 font-semibold text-right">Debit</th>
                <th className="px-4 py-2 font-semibold text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {statement.map((r, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 whitespace-nowrap text-navy-500">{formatDate(r.date)}</td>
                  <td className="px-4 py-2 text-navy-800">{r.description}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap text-emerald-600">{r.credit ? formatCurrency(r.credit) : '—'}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap text-red-500">{r.debit ? formatCurrency(r.debit) : '—'}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap font-semibold text-navy-900">{formatCurrency(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

function ScheduleRow({ contribution }) {
  const state = CONTRIBUTION_STATE[contribution.state]
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
      <div className="min-w-0">
        <p className="font-semibold text-navy-900">#{contribution.number} · {formatCurrency(contribution.amount)}</p>
        <p className="text-xs text-navy-400">
          Due {formatDate(contribution.dueDate)}
          {contribution.receivedOn && ` · received ${formatDate(contribution.receivedOn)}`}
          {contribution.method && ` · ${METHOD_LABELS[contribution.method].toLowerCase()}`}
        </p>
      </div>
      <Badge status={state.badge} className="!normal-case shrink-0">{state.label}</Badge>
    </div>
  )
}

// An Ajo plan as the customer sees it. View only: our staff record every contribution and arrange
// the payout, and the balance here updates as they do.
export default function AjoPanel({ transaction }) {
  const [showAll, setShowAll] = useState(false)
  const ajo = transaction.ajo
  const { contributions, state } = ajo
  const shown = showAll ? contributions : contributions.filter((c) => c.state !== 'paid').slice(0, PREVIEW_ROWS)
  const overdue = contributions.filter((c) => c.state === 'overdue').length
  const waiting = contributions.filter((c) => c.state === 'pending').length
  const next = ajo.nextContribution

  return (
    <>
      <Card className="mb-6">
        <AjoSummary transaction={transaction} />

        {state === 'active' && (
          <p className={`mt-5 flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${overdue ? 'bg-red-50 text-red-700' : 'bg-navy-50/70 text-navy-700'}`}>
            <CalendarClock size={16} className="mt-0.5 shrink-0" />
            <span>
              {overdue
                ? `${overdue} contribution${overdue === 1 ? ' is' : 's are'} overdue. Missed contributions aren’t carried over, so pay before the cycle ends on ${formatDate(ajo.cycleEnds)}.`
                : next && <>Next contribution: <strong>{formatCurrency(next.amount)}</strong> on <strong>{formatDate(next.dueDate)}</strong>.</>}
              {waiting > 0 && ` ${waiting} payment${waiting === 1 ? ' is' : 's are'} being confirmed.`}
            </span>
          </p>
        )}
        {state === 'ended' && (
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <Wallet size={16} className="mt-0.5 shrink-0" />
            Your cycle has ended. Our staff will arrange your payout of {formatCurrency(ajo.netPayout)} ({formatCurrency(ajo.saved)} saved, less the {formatCurrency(ajo.serviceCharge)} service charge).
          </p>
        )}
        {state === 'payout_requested' && (
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <Clock size={16} className="mt-0.5 shrink-0" />
            Your payout of {formatCurrency(ajo.payout.payoutAmount)} ({ajo.payout.reference}) is being processed.
          </p>
        )}
        {state === 'paid_out' && (
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <PartyPopper size={16} className="mt-0.5 shrink-0" />
            {formatCurrency(ajo.payout.payoutAmount)} was paid to you on {formatDate(ajo.payout.paidAt)}. Well done on completing your cycle!
          </p>
        )}
      </Card>

      {state === 'active' && (
        <Card className="mb-6">
          <p className="text-sm text-navy-600 flex items-start gap-2 mb-4">
            <Info size={16} className="text-navy-400 mt-0.5 shrink-0" />
            Pay your contributions in cash to our staff, or by transfer to the account below. Our staff record every payment, and your Ajo balance updates once it’s confirmed.
          </p>
          {next && (
            <PaymentAccountCard
              transaction={transaction}
              className="!shadow-none"
              payment={{
                account: ajo.paymentAccount,
                amount: next.amount,
                reference: next.reference,
                label: `${transaction.productName}, contribution ${next.number}`,
              }}
            />
          )}
        </Card>
      )}

      <Card className="mb-6" padded={false}>
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-3">
          <h3 className="text-sm font-bold text-navy-800">Contributions</h3>
          <span className="text-xs text-navy-400">{ajo.paidCount} of {ajo.count} paid</span>
        </div>
        <div className="divide-y divide-navy-50 border-t border-navy-50">
          {shown.map((c) => <ScheduleRow key={c.id} contribution={c} />)}
          {shown.length === 0 && <p className="px-4 py-3 text-sm text-navy-400">Every contribution is paid.</p>}
        </div>
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="w-full border-t border-navy-50 px-4 py-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          {showAll ? 'Show less' : `Show all ${contributions.length} contributions`}
        </button>
      </Card>

      <StatementCard transaction={transaction} />
    </>
  )
}
