import { useEffect, useMemo, useState } from 'react'
import { ArrowDownToLine, Landmark, Lock, User, Hash, Info, Wallet, AlertTriangle, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import LoadingState from '../../components/ui/LoadingState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useDataStore } from '../../context/DataStoreContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

const NIGERIAN_BANKS = [
  'Access Bank', 'Ecobank', 'Fidelity Bank', 'First Bank', 'FCMB', 'GTBank', 'Kuda', 'Moniepoint', 'Opay',
  'PalmPay', 'Polaris Bank', 'Stanbic IBTC', 'Sterling Bank', 'UBA', 'Union Bank', 'Wema Bank', 'Zenith Bank',
]

export const WITHDRAWAL_STATUS = {
  pending: { label: 'Under review', badge: 'pending' },
  approved: { label: 'Approved · awaiting payout', badge: 'processing' },
  paid: { label: 'Paid', badge: 'approved' },
  rejected: { label: 'Rejected', badge: 'rejected' },
  cancelled: { label: 'Cancelled', badge: 'default' },
}

const EMPTY_FORM = { amount: '', bankName: '', accountNumber: '', accountName: '', note: '', password: '' }

export default function Withdrawals() {
  const { withdrawals, withdrawalsLoaded, refreshWithdrawals, getWithdrawablePlans, quoteWithdrawal, requestWithdrawal, cancelWithdrawal } = useDataStore()
  const { showToast } = useToast()
  const [plans, setPlans] = useState(null)
  const [planRef, setPlanRef] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [quote, setQuote] = useState(null)
  const [quoting, setQuoting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)

  const loadPlans = async () => {
    const result = await getWithdrawablePlans()
    setPlans(result.success ? result.plans : [])
  }

  useEffect(() => {
    loadPlans()
    refreshWithdrawals('customer')
  }, [])

  const plan = useMemo(() => plans?.find((p) => p.reference === planRef), [plans, planRef])
  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const choosePlan = (p) => {
    setPlanRef(p.reference)
    setErrors({})
    // Before partial withdrawals open, only the whole plan can be taken out
    setForm((f) => ({ ...f, amount: p.partialAllowed ? '' : String(p.available) }))
  }

  // Ask the server what this amount means (penalty, payout, date) as the customer types
  useEffect(() => {
    if (!plan || !form.amount) {
      setQuote(null)
      return
    }
    setQuoting(true)
    const timer = setTimeout(async () => {
      const result = await quoteWithdrawal(plan.reference, form.amount)
      setQuote(result.success ? result.quote : null)
      setQuoting(false)
    }, 350)
    return () => clearTimeout(timer)
  }, [plan, form.amount])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.bankName.trim()) errs.bankName = 'Bank name is required.'
    if (!/^\d{10}$/.test(form.accountNumber.trim())) errs.accountNumber = 'Enter the 10-digit account number.'
    if (!form.accountName.trim()) errs.accountName = 'Account name is required.'
    if (!form.password) errs.password = 'Enter your password to confirm.'
    setErrors(errs)
    if (Object.keys(errs).length || !quote || quote.error) return

    setSubmitting(true)
    const result = await requestWithdrawal({
      planReference: plan.reference,
      amount: form.amount,
      bankName: form.bankName.trim(),
      accountNumber: form.accountNumber.trim(),
      accountName: form.accountName.trim(),
      note: form.note.trim(),
      password: form.password,
    })
    setSubmitting(false)
    if (!result.success) {
      if (Object.keys(result.fieldErrors).length) setErrors(result.fieldErrors)
      else showToast(result.error, 'error')
      return
    }
    showToast(`Withdrawal requested. We've emailed you the details (${result.withdrawal.reference}).`, 'success')
    setPlanRef('')
    setForm(EMPTY_FORM)
    setQuote(null)
    loadPlans()
  }

  const handleCancel = async () => {
    const result = await cancelWithdrawal(cancelTarget.reference)
    if (result.success) {
      showToast('Withdrawal cancelled.', 'success')
      loadPlans()
    } else showToast(result.error, 'error')
    setCancelTarget(null)
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title="Withdrawals" subtitle="Take money out of your savings and investment plans." />

      <Card className="mb-6">
        <h3 className="text-sm font-bold text-navy-800 mb-1">New withdrawal</h3>
        <p className="text-xs text-navy-400 mb-5">Choose the plan to withdraw from. Each plan follows its product's withdrawal rules.</p>

        {plans === null ? (
          <LoadingState label="Loading your plans..." />
        ) : plans.length === 0 ? (
          <EmptyState icon={Wallet} title="Nothing to withdraw yet" description="Once a savings or investment payment is approved, the plan appears here." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plans.map((p) => {
              const selected = p.reference === planRef
              return (
                <button
                  key={p.reference}
                  type="button"
                  disabled={!p.allowed}
                  onClick={() => choosePlan(p)}
                  className={`text-left rounded-xl border p-4 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    selected ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20' : 'border-navy-100 hover:border-navy-200'
                  }`}
                >
                  <p className="text-sm font-bold text-navy-900">{p.productName}</p>
                  <p className="text-xs text-navy-400 font-mono mt-0.5">{p.reference}</p>
                  <p className="text-xs text-navy-500 mt-2">Available</p>
                  <p className="text-lg font-bold text-navy-900">{formatCurrency(p.available)}</p>
                  <p className={`text-xs mt-1 ${p.allowed ? 'text-navy-400' : 'text-amber-600'}`}>
                    {p.allowed ? (p.partialAllowed ? 'Any amount can be withdrawn' : 'Whole plan only (early termination)') : p.reason}
                  </p>
                </button>
              )
            })}
          </div>
        )}

        {plan && (
          <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t border-navy-50 flex flex-col gap-4">
            <div className="flex items-end gap-2">
              <Input
                label="Amount (₦)"
                type="number"
                inputMode="decimal"
                min="0"
                value={form.amount}
                onChange={update('amount')}
                disabled={!plan.partialAllowed}
                error={errors.amount}
                containerClassName="flex-1"
                required
              />
              {plan.partialAllowed && (
                <Button variant="outline" onClick={() => setForm((f) => ({ ...f, amount: String(plan.available) }))} className="shrink-0">
                  Withdraw all
                </Button>
              )}
            </div>

            <QuotePanel quote={quote} quoting={quoting} notes={plan.notes} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Bank Name" icon={Landmark} list="nigerian-banks" value={form.bankName} onChange={update('bankName')} error={errors.bankName} required />
              <datalist id="nigerian-banks">{NIGERIAN_BANKS.map((b) => <option key={b} value={b} />)}</datalist>
              <Input label="Account Number" icon={Hash} inputMode="numeric" maxLength={10} value={form.accountNumber} onChange={update('accountNumber')} error={errors.accountNumber} required />
            </div>
            <Input label="Account Name" icon={User} value={form.accountName} onChange={update('accountName')} error={errors.accountName} hint="As it appears on the bank account." required />
            <Input label="Note (optional)" value={form.note} onChange={update('note')} />
            <Input
              label="Your Password"
              type="password"
              icon={Lock}
              autoComplete="current-password"
              value={form.password}
              onChange={update('password')}
              error={errors.password}
              hint="Confirms it's really you, since the money goes to the account above."
              required
            />
            <Button type="submit" size="lg" icon={ArrowDownToLine} loading={submitting} disabled={!quote || !!quote.error || quoting}>
              Request Withdrawal
            </Button>
          </form>
        )}
      </Card>

      <h3 className="text-sm font-bold text-navy-800 mb-3">Your withdrawal requests</h3>
      {!withdrawalsLoaded ? (
        <LoadingState label="Loading withdrawals..." />
      ) : withdrawals.length === 0 ? (
        <EmptyState icon={ArrowDownToLine} title="No withdrawals yet" description="Requests you make will appear here with their status." />
      ) : (
        <div className="flex flex-col gap-3">
          {withdrawals.map((w) => (
            <Card key={w.id} className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-navy-900">{formatCurrency(w.payoutAmount)}</p>
                  <Badge status={WITHDRAWAL_STATUS[w.status]?.badge}>{WITHDRAWAL_STATUS[w.status]?.label || w.status}</Badge>
                </div>
                <p className="text-xs text-navy-500 mt-1">
                  From {w.productName} · to {w.bankName} {w.accountNumber}
                  {w.penalty > 0 && ` · ${formatCurrency(w.penalty)} penalty`}
                </p>
                <p className="text-xs text-navy-400 mt-0.5 font-mono">{w.reference} · requested {formatDate(w.createdAt)}</p>
                {w.status === 'approved' && <p className="text-xs text-blue-600 mt-1">Payout from {formatDate(w.earliestPayoutDate)}</p>}
                {w.status === 'paid' && <p className="text-xs text-emerald-600 mt-1">Sent {formatDate(w.paidAt)} · transfer ref {w.payoutReference}</p>}
                {w.status === 'rejected' && <p className="text-xs text-red-500 mt-1">Reason: {w.rejectionReason}</p>}
              </div>
              {w.status === 'pending' && (
                <Button variant="outline" size="sm" onClick={() => setCancelTarget(w)} className="shrink-0">Cancel</Button>
              )}
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel this withdrawal?"
        description={`Your request to withdraw ${cancelTarget ? formatCurrency(cancelTarget.amount) : ''} will be cancelled. The money stays on your plan.`}
        confirmLabel="Cancel withdrawal"
        cancelLabel="Keep it"
      />
    </div>
  )
}

function QuotePanel({ quote, quoting, notes }) {
  if (!quote) {
    return notes?.length ? (
      <div className="flex items-start gap-2 rounded-xl bg-navy-50 text-navy-600 text-xs px-3.5 py-2.5">
        <Info size={15} className="mt-0.5 shrink-0" />
        <ul className="space-y-1">{notes.map((n) => <li key={n}>{n}</li>)}</ul>
      </div>
    ) : null
  }
  if (quote.error) {
    return (
      <div className="flex items-start gap-2 rounded-xl bg-red-50 text-red-700 text-sm px-3.5 py-2.5">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {quote.error}
      </div>
    )
  }
  return (
    <div className={`rounded-xl border border-navy-100 divide-y divide-navy-50 transition-opacity ${quoting ? 'opacity-60' : ''}`}>
      {[
        { label: quote.kind === 'full' ? 'Withdrawing (whole plan)' : 'Withdrawing', value: formatCurrency(quote.payoutAmount + quote.penalty) },
        ...(quote.penalty > 0 ? [{ label: `Early termination penalty (${quote.penaltyPercent}%)`, value: `− ${formatCurrency(quote.penalty)}`, tone: 'text-red-500' }] : []),
        { label: 'You receive', value: formatCurrency(quote.payoutAmount), bold: true },
        { label: 'Earliest payout', value: formatDate(quote.earliestPayoutDate) },
      ].map((row) => (
        <div key={row.label} className="flex justify-between gap-3 px-4 py-2.5 text-sm">
          <span className="text-navy-500">{row.label}</span>
          <span className={`${row.bold ? 'font-bold text-navy-900' : 'font-semibold text-navy-800'} ${row.tone || ''}`}>{row.value}</span>
        </div>
      ))}
      {quote.notes?.length > 0 && (
        <div className="px-4 py-2.5 text-xs text-navy-500 flex items-start gap-2">
          <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
          <ul className="space-y-1">{quote.notes.map((n) => <li key={n}>{n}</li>)}</ul>
        </div>
      )}
    </div>
  )
}
