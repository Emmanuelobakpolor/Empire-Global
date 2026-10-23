import { useState } from 'react'
import {
  CheckCircle2, XCircle, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Banknote, PenLine, Eye, Send,
} from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { BankAccountForm, EMPTY_BANK_ACCOUNT } from '../customer/ApplicationForms'
import { AjoSummary, StatementCard } from '../customer/AjoPanel'
import { useDataStore } from '../../context/DataStoreContext'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { TRAIL_LABELS } from '../../utils/slipReview'
import { bankAccountErrors } from '../../utils/facility'
import { AJO_STATE, CONTRIBUTION_STATE, METHOD_LABELS } from '../../utils/ajo'

const TRAIL_ICONS = {
  recorded: { icon: PenLine, tone: 'bg-navy-50 text-navy-500' },
  recommended_approval: { icon: ThumbsUp, tone: 'bg-blue-50 text-blue-600' },
  recommended_rejection: { icon: ThumbsDown, tone: 'bg-amber-50 text-amber-600' },
  approved: { icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600' },
  rejected: { icon: XCircle, tone: 'bg-red-50 text-red-600' },
}
const ACTION_LABELS = { ...TRAIL_LABELS, recorded: 'Payment recorded' }
const METHOD_OPTIONS = Object.entries(METHOD_LABELS).map(([value, label]) => ({ value, label }))
// Rows shown before "show all": anything to review or record first
const PREVIEW_ROWS = 8

function Trail({ steps }) {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, idx) => {
        const style = TRAIL_ICONS[step.action] || { icon: Eye, tone: 'bg-navy-50 text-navy-500' }
        return (
          <li key={idx} className="flex items-start gap-3">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${style.tone}`}>
              <style.icon size={14} />
            </span>
            <div className="min-w-0 text-sm">
              <p className="text-navy-800">
                <strong>{ACTION_LABELS[step.action] || step.action}</strong> by {step.by}
                {step.role && <span className="ml-1.5 text-[11px] font-semibold text-navy-500 bg-navy-50 rounded-full px-2 py-0.5">{step.role}</span>}
              </p>
              <p className="text-xs text-navy-400">{formatDate(step.at, { withTime: true })}</p>
              {step.note && <p className="text-xs text-navy-600 mt-0.5">“{step.note}”</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function ContributionRow({ contribution, canRecord, isSuperAdmin, onAction, onRecord }) {
  const [open, setOpen] = useState(contribution.state === 'pending')
  const state = CONTRIBUTION_STATE[contribution.state]
  const pending = contribution.state === 'pending'
  const recordable = canRecord && !['paid', 'pending', 'missed'].includes(contribution.state)
  const hasDetail = pending || contribution.trail?.length || contribution.rejectionReason

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <button type="button" className="min-w-0 text-left disabled:cursor-default" onClick={() => setOpen((o) => !o)} disabled={!hasDetail}>
          <p className="font-semibold text-navy-900 flex items-center gap-1.5">
            #{contribution.number} · {formatCurrency(contribution.amount)}
            {hasDetail && (open ? <ChevronUp size={14} className="text-navy-400" /> : <ChevronDown size={14} className="text-navy-400" />)}
          </p>
          <p className="text-xs text-navy-400">
            Due {formatDate(contribution.dueDate)}
            {contribution.method && ` · ${METHOD_LABELS[contribution.method]}`}
            {contribution.paidAt && ` · confirmed ${formatDate(contribution.paidAt)}`}
            {' · '}<span className="font-mono">{contribution.reference}</span>
          </p>
        </button>
        <span className="flex items-center gap-2 shrink-0">
          {recordable && (
            <Button size="sm" variant="outline" icon={Banknote} onClick={() => onRecord(contribution)}>Record</Button>
          )}
          <Badge status={state.badge} className="!normal-case">{state.label}</Badge>
        </span>
      </div>

      {open && hasDetail && (
        <div className="mt-4 flex flex-col gap-4">
          {contribution.rejectionReason && !pending && (
            <p className="bg-red-50 text-red-700 text-xs rounded-xl px-3 py-2"><strong>Last payment rejected:</strong> {contribution.rejectionReason}</p>
          )}
          {contribution.recordedBy && (
            <p className="text-xs text-navy-500">
              {METHOD_LABELS[contribution.method]} received {formatDate(contribution.receivedOn)}, recorded by <strong>{contribution.recordedBy}</strong>
              {contribution.paymentReference && <> · reference <span className="font-mono">{contribution.paymentReference}</span></>}
            </p>
          )}
          {contribution.paidTo && (
            <p className="text-xs text-navy-500">
              Paid into <strong>{contribution.paidTo.bankName} · {contribution.paidTo.accountNumber}</strong> ({contribution.paidTo.accountName})
            </p>
          )}
          {contribution.trail?.length > 0 && <Trail steps={contribution.trail} />}
          {pending && (
            isSuperAdmin ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="danger" icon={XCircle} fullWidth onClick={() => onAction(contribution, 'reject')}>Reject</Button>
                <Button variant="accent" icon={CheckCircle2} fullWidth onClick={() => onAction(contribution, 'approve')}>Confirm Contribution</Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" icon={ThumbsDown} fullWidth onClick={() => onAction(contribution, 'recommend', 'reject')}>Recommend Rejection</Button>
                <Button variant="accent" icon={ThumbsUp} fullWidth onClick={() => onAction(contribution, 'recommend', 'approve')}>Recommend Approval</Button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}

const today = () => new Date().toISOString().slice(0, 10)

// An Ajo plan as admins run it: confirm receipts, record cash and transfers, and see the statement
export default function AjoAdminPanel({ transaction }) {
  const { contributionAction, arrangeAjoPayout } = useDataStore()
  const { isSuperAdmin } = useAdminAuth()
  const { showToast } = useToast()
  const [showAll, setShowAll] = useState(false)
  // { contribution, action: 'recommend' | 'approve' | 'reject', decision? }
  const [dialog, setDialog] = useState(null)
  const [note, setNote] = useState('')
  const [recording, setRecording] = useState(null)
  const [form, setForm] = useState({ method: 'cash', receivedOn: today(), reference: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [payoutOpen, setPayoutOpen] = useState(false)
  const [payoutAccount, setPayoutAccount] = useState(EMPTY_BANK_ACCOUNT)

  const ajo = transaction.ajo
  const state = AJO_STATE[ajo.state]
  const canRecord = ajo.state === 'active'
  const toReview = ajo.contributions.filter((c) => c.state === 'pending')
  const rest = ajo.contributions.filter((c) => c.state !== 'pending')
  const shown = showAll ? rest : rest.filter((c) => c.state !== 'paid').slice(0, PREVIEW_ROWS)

  const openAction = (contribution, action, decision) => {
    setNote('')
    setDialog({ contribution, action, decision })
  }

  const openRecord = (contribution) => {
    setForm({ method: 'cash', receivedOn: today(), reference: '' })
    setErrors({})
    setRecording(contribution)
  }

  const submitAction = async () => {
    const { contribution, action, decision } = dialog
    setBusy(true)
    const result = await contributionAction(contribution.id, action, action === 'recommend' ? { decision, note } : { note })
    setBusy(false)
    if (!result.success) {
      showToast(result.error, 'error')
      return
    }
    setDialog(null)
    showToast(action === 'approve' ? 'Contribution confirmed and credited.' : action === 'reject' ? 'Contribution rejected.' : 'Recommendation sent to the Super Admins.', 'success')
  }

  const submitRecord = async () => {
    if (form.method === 'transfer' && !form.reference.trim()) {
      setErrors({ reference: 'Enter the transfer reference.' })
      return
    }
    setBusy(true)
    const result = await contributionAction(recording.id, 'record', { ...form, reference: form.reference.trim() })
    setBusy(false)
    if (!result.success) {
      setErrors(result.fieldErrors || {})
      showToast(result.error, 'error')
      return
    }
    setRecording(null)
    showToast(isSuperAdmin ? 'Payment recorded and confirmed.' : 'Payment recorded. A Super Admin will confirm it.', 'success')
  }

  const openPayout = () => {
    setPayoutAccount({ ...EMPTY_BANK_ACCOUNT, accountName: transaction.customerName })
    setErrors({})
    setPayoutOpen(true)
  }

  const submitPayout = async () => {
    const accountErrors = bankAccountErrors(payoutAccount)
    setErrors(accountErrors)
    if (Object.keys(accountErrors).length) return
    setBusy(true)
    const result = await arrangeAjoPayout(transaction.id, {
      bankName: payoutAccount.bankName.trim(), accountNumber: payoutAccount.accountNumber.trim(), accountName: payoutAccount.accountName.trim(),
    })
    setBusy(false)
    if (!result.success) {
      setErrors(result.fieldErrors || {})
      showToast(result.error, 'error')
      return
    }
    setPayoutOpen(false)
    showToast('Payout arranged. It now goes through withdrawal approval.', 'success')
  }

  const dialogTitle = dialog && (dialog.action === 'approve' ? 'Confirm Contribution'
    : dialog.action === 'reject' ? 'Reject Contribution'
      : dialog.decision === 'approve' ? 'Recommend Approval' : 'Recommend Rejection')

  return (
    <>
      <Card className="mb-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold text-navy-800">Ajo Plan</h3>
          <Badge status={state.badge} className="!normal-case">{state.label}</Badge>
        </div>
        <AjoSummary transaction={transaction} />
        {ajo.state === 'ended' && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p>
              The cycle has ended. Pay out {formatCurrency(ajo.netPayout)} ({formatCurrency(ajo.saved)} saved, less the {formatCurrency(ajo.serviceCharge)} service charge).
              {toReview.length > 0 && ' Confirm or reject the contributions waiting below first.'}
            </p>
            <Button size="sm" variant="accent" icon={Send} onClick={openPayout} disabled={toReview.length > 0 || ajo.saved <= 0} className="shrink-0">
              Arrange Payout
            </Button>
          </div>
        )}
        {ajo.payout && (
          <p className="mt-4 text-sm text-navy-600">
            Payout <span className="font-mono">{ajo.payout.reference}</span>: {formatCurrency(ajo.payout.payoutAmount)} after the{' '}
            {formatCurrency(ajo.payout.serviceCharge)} service charge · <strong className="capitalize">{ajo.payout.status}</strong>
            {ajo.payout.payoutReference && <> · transfer {ajo.payout.payoutReference}</>}
          </p>
        )}
      </Card>

      {ajo.contributions.length > 0 && (
        <Card className="mb-6" padded={false}>
          <div className="flex items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-3">
            <h3 className="text-sm font-bold text-navy-800">Contributions</h3>
            <span className="text-xs text-navy-400">
              {ajo.paidCount} of {ajo.count} paid{toReview.length > 0 && ` · ${toReview.length} to confirm`}
            </span>
          </div>
          <div className="divide-y divide-navy-50 border-t border-navy-50">
            {[...toReview, ...shown].map((c) => (
              <ContributionRow key={c.id} contribution={c} canRecord={canRecord} isSuperAdmin={isSuperAdmin} onAction={openAction} onRecord={openRecord} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            className="w-full border-t border-navy-50 px-4 py-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            {showAll ? 'Show less' : `Show all ${ajo.contributions.length} contributions`}
          </button>
        </Card>
      )}

      <StatementCard transaction={transaction} />

      <Modal
        open={!!dialog}
        onClose={() => setDialog(null)}
        title={dialogTitle}
        subtitle={dialog && `Contribution ${dialog.contribution.number} · ${formatCurrency(dialog.contribution.amount)} · ${transaction.customerName}`}
        footer={(
          <>
            <Button variant="outline" onClick={() => setDialog(null)} disabled={busy}>Cancel</Button>
            <Button variant={dialog?.action === 'reject' ? 'danger' : 'accent'} onClick={submitAction} loading={busy}>{dialogTitle}</Button>
          </>
        )}
      >
        {dialog?.action === 'approve' && (
          <p className="text-sm text-navy-600 mb-4">This credits {formatCurrency(dialog.contribution.amount)} to the customer’s savings.</p>
        )}
        <Input
          label={dialog?.action === 'reject' ? 'Reason (shown to the customer)' : 'Note (optional)'}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={dialog?.action === 'reject' ? 'e.g. Amount on the receipt doesn’t match' : ''}
        />
      </Modal>

      <Modal
        open={payoutOpen}
        onClose={() => setPayoutOpen(false)}
        title="Arrange Ajo Payout"
        subtitle={`${transaction.customerName} · ${formatCurrency(ajo.netPayout)} to pay out`}
        footer={(
          <>
            <Button variant="outline" onClick={() => setPayoutOpen(false)} disabled={busy}>Cancel</Button>
            <Button variant="accent" onClick={submitPayout} loading={busy}>Arrange Payout</Button>
          </>
        )}
      >
        <p className="text-sm text-navy-600 mb-4">
          The customer’s own account. The payout then appears under Withdrawals for final approval, and is marked paid once the transfer is sent.
        </p>
        <BankAccountForm value={payoutAccount} onChange={setPayoutAccount} errors={errors} />
      </Modal>

      <Modal
        open={!!recording}
        onClose={() => setRecording(null)}
        title="Record Payment"
        subtitle={recording && `Contribution ${recording.number} · ${formatCurrency(recording.amount)} · ${transaction.customerName}`}
        footer={(
          <>
            <Button variant="outline" onClick={() => setRecording(null)} disabled={busy}>Cancel</Button>
            <Button variant="accent" onClick={submitRecord} loading={busy}>{isSuperAdmin ? 'Record & Confirm' : 'Record Payment'}</Button>
          </>
        )}
      >
        <div className="flex flex-col gap-4">
          <Select label="Payment Method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} options={METHOD_OPTIONS} />
          <Input label="Date Received" type="date" max={today()} value={form.receivedOn} onChange={(e) => setForm({ ...form, receivedOn: e.target.value })} error={errors.receivedOn} />
          <Input
            label={form.method === 'transfer' ? 'Transfer Reference' : 'Receipt Number (optional)'}
            value={form.reference}
            onChange={(e) => setForm({ ...form, reference: e.target.value })}
            error={errors.reference}
          />
          <p className="text-xs text-navy-500">
            {isSuperAdmin
              ? 'As a Super Admin, recording this confirms it and credits the customer straight away.'
              : 'A Super Admin confirms it before the customer is credited.'}
          </p>
        </div>
      </Modal>
    </>
  )
}
