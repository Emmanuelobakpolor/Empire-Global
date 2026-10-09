import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ChevronLeft, ThumbsUp, ThumbsDown, CheckCircle2, XCircle, Banknote, Copy, Info, ShieldCheck } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import LoadingState from '../../components/ui/LoadingState'
import { useDataStore } from '../../context/DataStoreContext'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { copyText } from '../../utils/clipboard'
import { WITHDRAWAL_STATUS } from '../customer/Withdrawals'

const TRAIL_LABELS = {
  recommended_approval: 'Recommended approval',
  recommended_rejection: 'Recommended rejection',
  approved: 'Final approval · balance deducted',
  rejected: 'Final rejection',
  paid: 'Marked as paid',
  cancelled: 'Cancelled by customer',
}

export default function AdminWithdrawalDetails() {
  const { reference } = useParams()
  const navigate = useNavigate()
  const { getAdminWithdrawal, withdrawalAction } = useDataStore()
  const { isSuperAdmin } = useAdminAuth()
  const { showToast } = useToast()
  const [wd, setWd] = useState(null)
  const [loadError, setLoadError] = useState('')
  // { action: 'recommend-approve' | 'recommend-reject' | 'approve' | 'reject' | 'mark-paid' }
  const [dialog, setDialog] = useState(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    const result = await getAdminWithdrawal(reference)
    if (result.success) setWd(result.withdrawal)
    else setLoadError(result.error)
  }

  useEffect(() => {
    load()
  }, [reference])

  if (loadError) return <EmptyState title="Withdrawal not found" description={loadError} action={<Link to="/admin/withdrawals"><Button>Back to Withdrawals</Button></Link>} />
  if (!wd) return <LoadingState label="Loading withdrawal..." />

  const pending = wd.status === 'pending'
  const status = WITHDRAWAL_STATUS[wd.status]

  const run = async () => {
    const map = {
      'recommend-approve': ['recommend', { decision: 'approve', note: text.trim() }, 'Recommended for approval.'],
      'recommend-reject': ['recommend', { decision: 'reject', note: text.trim() }, 'Flagged for rejection.'],
      approve: ['approve', { note: text.trim() }, 'Approved. The balance has been deducted.'],
      reject: ['reject', { note: text.trim() }, 'Withdrawal rejected. The customer has been told why.'],
      'mark-paid': ['mark-paid', { payoutReference: text.trim() }, 'Marked as paid. The customer has been emailed.'],
    }
    const [action, body, message] = map[dialog]
    setBusy(true)
    const result = await withdrawalAction(wd.reference, action, body)
    setBusy(false)
    if (!result.success) {
      showToast(result.error, 'error')
      return
    }
    setWd({ ...result.withdrawal })
    showToast(message, 'success')
    setDialog(null)
    setText('')
  }

  const copy = async (value, label) => {
    if (await copyText(value)) showToast(`${label} copied.`, 'success')
    else showToast(`Couldn't copy the ${label.toLowerCase()}.`, 'error')
  }

  const dialogs = {
    'recommend-approve': { title: 'Recommend approval', label: 'Note (optional)', confirm: 'Recommend', variant: 'accent' },
    'recommend-reject': { title: 'Recommend rejection', label: 'Reason', confirm: 'Flag for rejection', variant: 'danger', required: true },
    approve: { title: 'Approve withdrawal', label: 'Note (optional)', confirm: 'Approve & deduct', variant: 'accent',
      intro: `${formatCurrency(wd.amount)} will be taken off the plan and the customer's balance now.` },
    reject: { title: 'Reject withdrawal', label: 'Reason (shown to the customer)', confirm: 'Reject', variant: 'danger', required: true },
    'mark-paid': { title: 'Mark as paid', label: 'Bank transfer reference', confirm: 'Mark paid', variant: 'accent', required: true,
      intro: `Only do this after sending ${formatCurrency(wd.payoutAmount)} to ${wd.accountName} (${wd.bankName} ${wd.accountNumber}). The customer is emailed.` },
  }
  const current = dialog && dialogs[dialog]

  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-navy-800 mb-5">
        <ChevronLeft size={16} /> Back
      </button>

      <Card className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-xs text-navy-400">Withdrawal</p>
            <h1 className="text-lg font-bold text-navy-900 font-mono">{wd.reference}</h1>
            <p className="text-sm text-navy-500 mt-1">
              <Link to={`/admin/customers/${wd.customerId}`} className="font-semibold text-emerald-600 hover:text-emerald-700">{wd.customerName}</Link>
              {' '}· {wd.customerEmail}{wd.agentCode && ` · agent ${wd.agentCode}`}
            </p>
          </div>
          <Badge status={status?.badge} className="!text-sm !px-3 !py-1.5">{status?.label || wd.status}</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Withdrawing', value: formatCurrency(wd.amount) },
            { label: 'Penalty', value: wd.penalty ? formatCurrency(wd.penalty) : '—' },
            { label: 'To pay out', value: formatCurrency(wd.payoutAmount), strong: true },
            { label: 'Pay from', value: formatDate(wd.earliestPayoutDate) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-navy-100 px-3 py-2.5">
              <p className="text-[11px] text-navy-400">{s.label}</p>
              <p className={`mt-0.5 ${s.strong ? 'text-base font-bold text-emerald-700' : 'text-sm font-bold text-navy-900'}`}>{s.value}</p>
            </div>
          ))}
        </div>
        {wd.kind === 'full' && <p className="text-xs text-navy-500 mt-3">Whole-plan withdrawal{wd.penalty ? ' (early termination)' : ''}.</p>}
        {wd.note && <p className="text-sm text-navy-600 mt-3"><strong>Customer's note:</strong> {wd.note}</p>}
        {wd.status === 'rejected' && <p className="text-sm text-red-600 mt-3"><strong>Rejected:</strong> {wd.rejectionReason}</p>}
        {wd.status === 'paid' && <p className="text-sm text-emerald-700 mt-3"><strong>Paid</strong> {formatDate(wd.paidAt, { withTime: true })} · transfer ref {wd.payoutReference}</p>}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-sm font-bold text-navy-800 mb-4 flex items-center gap-2"><Banknote size={16} className="text-navy-400" /> Pay to</h3>
          <div className="rounded-xl border border-navy-100 divide-y divide-navy-50">
            {[
              { label: 'Bank', value: wd.bankName },
              { label: 'Account Number', value: wd.accountNumber, mono: true },
              { label: 'Account Name', value: wd.accountName },
              { label: 'Amount to send', value: formatCurrency(wd.payoutAmount), copyValue: String(wd.payoutAmount) },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs text-navy-400">{row.label}</p>
                  <p className={`text-sm font-bold text-navy-900 break-all ${row.mono ? 'font-mono tracking-wide' : ''}`}>{row.value}</p>
                </div>
                <button type="button" onClick={() => copy(row.copyValue || row.value, row.label)} className="p-2 rounded-lg text-navy-400 hover:text-emerald-600 hover:bg-emerald-50" aria-label={`Copy ${row.label.toLowerCase()}`}>
                  <Copy size={15} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-3">
            The customer entered these details for this withdrawal. Check the account name matches {wd.customerName} before paying.
          </p>
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-navy-800 mb-4 flex items-center gap-2"><Info size={16} className="text-navy-400" /> Plan today</h3>
          <p className="text-sm font-semibold text-navy-900">{wd.productName}</p>
          <p className="text-xs text-navy-400 font-mono">{wd.plan.reference}</p>
          <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
            <div><p className="text-xs text-navy-400">Plan amount</p><p className="font-bold text-navy-900">{formatCurrency(wd.plan.amount)}</p></div>
            <div><p className="text-xs text-navy-400">Left on plan after this</p><p className="font-bold text-navy-900">{formatCurrency(wd.plan.available)}</p></div>
            <div><p className="text-xs text-navy-400">Started</p><p className="font-semibold text-navy-800">{formatDate(wd.plan.startDate)}</p></div>
            <div><p className="text-xs text-navy-400">Matures</p><p className="font-semibold text-navy-800">{wd.plan.endDate ? formatDate(wd.plan.endDate) : 'Open-ended'}</p></div>
          </div>
          {wd.plan.notes?.length > 0 && (
            <ul className="text-xs text-navy-500 mt-4 space-y-1 list-disc pl-4">{wd.plan.notes.map((n) => <li key={n}>{n}</li>)}</ul>
          )}
        </Card>
      </div>

      {(pending || wd.status === 'approved') && (
        <Card className="mb-6">
          {pending && isSuperAdmin && (
            <>
              <p className="text-sm text-navy-500 mb-4 flex items-start gap-2">
                <ShieldCheck size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                As Super Admin your decision is final. Approving deducts the amount from the customer's balance.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="danger" icon={XCircle} fullWidth onClick={() => setDialog('reject')}>Reject</Button>
                <Button variant="accent" icon={CheckCircle2} fullWidth onClick={() => setDialog('approve')}>Approve</Button>
              </div>
            </>
          )}
          {pending && !isSuperAdmin && (
            <>
              <p className="text-sm text-navy-500 mb-4">Recommend this withdrawal. A Super Admin gives the final approval.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" icon={ThumbsDown} fullWidth onClick={() => setDialog('recommend-reject')}>Recommend Rejection</Button>
                <Button variant="accent" icon={ThumbsUp} fullWidth onClick={() => setDialog('recommend-approve')}>Recommend Approval</Button>
              </div>
            </>
          )}
          {wd.status === 'approved' && (
            <>
              <p className="text-sm text-navy-500 mb-4">
                Approved. Send {formatCurrency(wd.payoutAmount)} by bank transfer from {formatDate(wd.earliestPayoutDate)}, then record the transfer reference here.
              </p>
              <Button icon={Banknote} onClick={() => setDialog('mark-paid')}>Mark as Paid</Button>
            </>
          )}
        </Card>
      )}

      <Card>
        <h3 className="text-sm font-bold text-navy-800 mb-4">Review trail</h3>
        {wd.trail.length === 0 ? (
          <p className="text-sm text-navy-400">No one has reviewed this withdrawal yet.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {wd.trail.map((t, i) => (
              <li key={i} className="text-sm">
                <p className="font-semibold text-navy-900">{TRAIL_LABELS[t.action] || t.action} <span className="font-normal text-navy-400">by {t.by} ({t.role})</span></p>
                <p className="text-xs text-navy-400">{formatDate(t.at, { withTime: true })}</p>
                {t.note && <p className="text-xs text-navy-600 mt-0.5">“{t.note}”</p>}
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Modal
        open={!!current}
        onClose={() => { setDialog(null); setText('') }}
        title={current?.title}
        footer={
          <>
            <Button variant="outline" onClick={() => { setDialog(null); setText('') }}>Cancel</Button>
            <Button variant={current?.variant} loading={busy} disabled={current?.required && !text.trim()} onClick={run}>{current?.confirm}</Button>
          </>
        }
      >
        {current?.intro && <p className="text-sm text-navy-600 mb-4">{current.intro}</p>}
        <Input label={current?.label} value={text} onChange={(e) => setText(e.target.value)} autoFocus />
      </Modal>
    </div>
  )
}
