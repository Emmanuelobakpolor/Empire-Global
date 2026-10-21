import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronLeft, CheckCircle2, XCircle, ThumbsUp, ThumbsDown, ShieldCheck, Clock, Landmark, Banknote, Truck,
  Eye, ChevronDown, ChevronUp, User, Hash, Calendar, Repeat,
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import EmptyState from '../../components/ui/EmptyState'
import LoadingState from '../../components/ui/LoadingState'
import ReceiptPreview from '../../components/ReceiptPreview'
import TransactionTimeline from '../../components/customer/TransactionTimeline'
import ApplicationDetails from '../../components/admin/ApplicationDetails'
import { DetailList, bankAccountRows } from '../../components/customer/ApplicationForms'
import { useDataStore } from '../../context/DataStoreContext'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { formatTerm } from '../../utils/planPeriod'
import { TRAIL_LABELS, latestRecommendation } from '../../utils/slipReview'
import { REPAYMENT_STATE, estimateFees, estimateRepayment, facilityStatus, frequencyLabel, repayableTotal } from '../../utils/facility'

const TRAIL_ICONS = {
  viewed: { icon: Eye, tone: 'bg-navy-50 text-navy-500' },
  recommended_approval: { icon: ThumbsUp, tone: 'bg-blue-50 text-blue-600' },
  recommended_rejection: { icon: ThumbsDown, tone: 'bg-amber-50 text-amber-600' },
  approved: { icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600' },
  rejected: { icon: XCircle, tone: 'bg-red-50 text-red-600' },
}

function Trail({ steps }) {
  if (!steps?.length) return <p className="text-sm text-navy-400">No review activity yet.</p>
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, idx) => {
        const style = TRAIL_ICONS[step.action] || TRAIL_ICONS.viewed
        return (
          <li key={idx} className="flex items-start gap-3">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${style.tone}`}>
              <style.icon size={14} />
            </span>
            <div className="min-w-0 text-sm">
              <p className="text-navy-800">
                <strong>{TRAIL_LABELS[step.action] || step.action}</strong> by {step.by}
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

function Stat({ icon: Icon, label, children }) {
  return (
    <div>
      <p className="text-xs text-navy-400 flex items-center gap-1">{Icon && <Icon size={12} />} {label}</p>
      <div className="text-sm font-bold text-navy-900 mt-1">{children}</div>
    </div>
  )
}

// Recommend (any admin) or decide (Super Admin) buttons, shared by the application and each repayment
function ReviewButtons({ isSuperAdmin, busy, onRecommend, onApprove, onReject, approveLabel = 'Give Final Approval' }) {
  return isSuperAdmin ? (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button variant="danger" icon={XCircle} fullWidth onClick={onReject} disabled={busy}>Reject</Button>
      <Button variant="accent" icon={CheckCircle2} fullWidth onClick={onApprove} disabled={busy}>{approveLabel}</Button>
    </div>
  ) : (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button variant="outline" icon={ThumbsDown} fullWidth onClick={() => onRecommend('reject')} disabled={busy}>Recommend Rejection</Button>
      <Button variant="accent" icon={ThumbsUp} fullWidth onClick={() => onRecommend('approve')} disabled={busy}>Recommend Approval</Button>
    </div>
  )
}

function RecommendationNote({ trail, what }) {
  const rec = latestRecommendation({ slipTrail: trail })
  if (!rec) return null
  return (
    <div className={`rounded-xl px-4 py-3 text-sm mb-4 ${rec.action === 'recommended_approval' ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800'}`}>
      <p>
        <strong>{rec.by}</strong> ({rec.role}) recommended {rec.action === 'recommended_approval' ? 'approving' : 'rejecting'} this {what} on{' '}
        {formatDate(rec.at, { withTime: true })}.
      </p>
      {rec.note && <p className="mt-1 opacity-80">“{rec.note}”</p>}
    </div>
  )
}

function RepaymentRow({ repayment, isSuperAdmin, onAction }) {
  const [open, setOpen] = useState(repayment.state === 'pending')
  const state = REPAYMENT_STATE[repayment.state]
  const hasDetail = repayment.receipt || repayment.trail?.length || repayment.rejectionReason
  return (
    <div className="px-4 py-3">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-3 text-left text-sm disabled:cursor-default"
        onClick={() => setOpen((o) => !o)}
        disabled={!hasDetail}
      >
        <div className="min-w-0">
          <p className="font-semibold text-navy-900">#{repayment.number} · {formatCurrency(repayment.amount)}</p>
          <p className="text-xs text-navy-400">
            Due {formatDate(repayment.dueDate)}
            {repayment.paidAt && ` · confirmed ${formatDate(repayment.paidAt)}`}
            {' · '}<span className="font-mono">{repayment.reference}</span>
          </p>
        </div>
        <span className="flex items-center gap-2 shrink-0">
          <Badge status={state.badge} className="!normal-case">{state.label}</Badge>
          {hasDetail && (open ? <ChevronUp size={16} className="text-navy-400" /> : <ChevronDown size={16} className="text-navy-400" />)}
        </span>
      </button>

      {open && hasDetail && (
        <div className="mt-4 flex flex-col gap-4">
          {repayment.rejectionReason && repayment.state !== 'pending' && (
            <p className="bg-red-50 text-red-700 text-xs rounded-xl px-3 py-2"><strong>Last receipt rejected:</strong> {repayment.rejectionReason}</p>
          )}
          {repayment.receipt && <ReceiptPreview receipt={repayment.receipt} />}
          {repayment.paidTo && (
            <p className="text-xs text-navy-500">
              Paid into <strong>{repayment.paidTo.bankName} · {repayment.paidTo.accountNumber}</strong> ({repayment.paidTo.accountName})
            </p>
          )}
          {repayment.trail?.length > 0 && <Trail steps={repayment.trail} />}
          {repayment.state === 'pending' && (
            <>
              <RecommendationNote trail={repayment.trail} what="repayment" />
              <ReviewButtons
                isSuperAdmin={isSuperAdmin}
                onRecommend={(decision) => onAction(repayment, 'recommend', decision)}
                onApprove={() => onAction(repayment, 'approve')}
                onReject={() => onAction(repayment, 'reject')}
                approveLabel="Confirm Repayment"
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminFacilityDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { transactions, transactionsLoaded, products, recommendPayment, approvePayment, rejectPayment, disburseFacility, changeInterestRate, repaymentAction } = useDataStore()
  const { isSuperAdmin } = useAdminAuth()
  const { showToast } = useToast()
  const transaction = transactions.find((t) => t.id === id)

  // { kind: 'application' | 'repayment' | 'rate', action: 'recommend' | 'approve' | 'reject' | 'change', decision?, repayment? }
  const [dialog, setDialog] = useState(null)
  const [note, setNote] = useState('')
  const [rate, setRate] = useState('')
  // Fees set on approval: legal %, inspection ₦ (depends on location), application ₦
  const [fees, setFees] = useState({ legalPercent: '', inspection: '', application: '' })
  const [disburseOpen, setDisburseOpen] = useState(false)
  const [reference, setReference] = useState('')
  const [busy, setBusy] = useState(false)

  if (!transaction && !transactionsLoaded) return <LoadingState label="Loading..." />
  if (!transaction?.facility) {
    return <EmptyState title="Loan or hire-purchase not found" action={<Link to="/admin/facilities"><Button>Back to Loans & Hire-Purchase</Button></Link>} />
  }

  const facility = transaction.facility
  const isLoan = transaction.productType === 'loan'
  const status = facilityStatus(transaction)
  const product = products.find((p) => p.id === transaction.productId)
  const productRate = product?.effectiveInterestRate ?? product?.interestRate
  const rateValue = rate === '' ? productRate : Number(rate)
  const feePreview = estimateFees(transaction.amount, fees)
  const preview = estimateRepayment(transaction.amount, rateValue, transaction.termMonths, facility.repaymentFrequency, feePreview, transaction.productType)
  const hpFees = isLoan ? 0 : facility.fees?.total || 0
  // The rate can be changed from approval until the last instalment is confirmed
  const canChangeRate = isSuperAdmin && (facility.status === 'awaiting_disbursement' || facility.status === 'active')
  const unpaidCount = facility.repayments.filter((r) => r.state !== 'paid').length
  const repricePreview = dialog?.kind === 'rate' && rate !== '' && facility.status === 'active' && unpaidCount > 0
    ? { total: repayableTotal(transaction.amount, Number(rate)) + hpFees, count: unpaidCount }
    : null
  const asksRate = dialog?.kind === 'rate' || (dialog?.kind === 'application' && dialog.action === 'approve')

  const openDialog = (next) => {
    setNote('')
    if (next.kind === 'rate') setRate(String(facility.interestRate))
    else setRate(next.kind === 'application' && next.action === 'approve' && productRate != null ? String(productRate) : '')
    if (next.kind === 'application' && next.action === 'approve') {
      setFees({
        legalPercent: String(product?.fees?.legalPercent ?? 1),
        inspection: String(product?.fees?.inspection ?? 2000),
        application: String(product?.fees?.application ?? 3000),
      })
    }
    setDialog(next)
  }

  const run = async (action, success) => {
    setBusy(true)
    const result = await action()
    setBusy(false)
    if (!result.success) {
      showToast(result.error, 'error')
      return
    }
    showToast(success, 'success')
    setDialog(null)
    setDisburseOpen(false)
  }

  const submitDialog = () => {
    const { kind, action, decision, repayment } = dialog
    if (asksRate && (rate === '' || Number(rate) < 0)) {
      showToast('Enter the interest rate for this application.', 'error')
      return
    }
    if (kind === 'rate') return run(() => changeInterestRate(transaction.id, rate, note.trim()), 'Interest rate updated. The customer has been notified.')
    if (kind === 'application') {
      if (action === 'recommend') return run(() => recommendPayment(transaction.id, decision, note.trim()), 'Recommendation sent to a Super Admin.')
      if (action === 'approve') {
        if (Object.values(fees).some((v) => v === '' || Number(v) < 0)) {
          showToast('Enter each fee (0 for none).', 'error')
          return
        }
        return run(() => approvePayment(transaction.id, note.trim(), rate, {
          legalFeePercent: fees.legalPercent, inspectionFee: fees.inspection, applicationFee: fees.application,
        }), 'Application approved. The customer has been notified.')
      }
      return run(() => rejectPayment(transaction.id, note.trim()), 'Application rejected. The customer has been notified.')
    }
    if (action === 'recommend') return run(() => repaymentAction(repayment.id, 'recommend', { decision, note: note.trim() }), 'Recommendation sent to a Super Admin.')
    return run(() => repaymentAction(repayment.id, action, { note: note.trim() }), action === 'approve' ? 'Repayment confirmed.' : 'Receipt rejected. The customer can pay again.')
  }

  const dialogTitle = !dialog ? '' : {
    change: 'Change Interest Rate',
    recommend: dialog.decision === 'approve' ? 'Recommend Approval' : 'Recommend Rejection',
    approve: dialog.kind === 'application' ? 'Approve Application' : 'Confirm Repayment',
    reject: dialog.kind === 'application' ? 'Reject Application' : 'Reject Receipt',
  }[dialog.action]

  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-navy-800 mb-5">
        <ChevronLeft size={16} /> Back
      </button>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-navy-400 font-mono">{transaction.reference}</p>
            <h1 className="text-xl font-bold text-navy-900 mt-1">{transaction.productName}</h1>
          </div>
          <Badge status={status.badge} className="!text-sm !px-3 !py-1.5 !normal-case">{status.label}</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-navy-50">
          <Stat icon={User} label="Customer">
            <Link to={`/admin/customers/${transaction.customerId}`} className="text-emerald-600 hover:text-emerald-700">{transaction.customerName}</Link>
          </Stat>
          <Stat icon={Hash} label={isLoan ? 'Loan Amount' : 'Item Value'}>{formatCurrency(transaction.amount)}</Stat>
          <Stat icon={Calendar} label="Applied">{formatDate(transaction.date)}</Stat>
          <Stat icon={Repeat} label="Repayment">{frequencyLabel(facility.repaymentFrequency)} · {formatTerm(transaction.termMonths)}</Stat>
          <Stat label="Interest">
            {facility.interestRate != null ? `${facility.interestRate}% flat` : productRate != null ? `Product rate ${productRate}%` : 'Not set'}
            {canChangeRate && (
              <button type="button" onClick={() => openDialog({ kind: 'rate', action: 'change' })} className="ml-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                Change
              </button>
            )}
          </Stat>
          <Stat label="Fees">{facility.fees ? formatCurrency(facility.fees.total) : 'Set on approval'}</Stat>
          {isLoan && facility.payoutAmount != null && <Stat label="Pay Out">{formatCurrency(facility.payoutAmount)}</Stat>}
          <Stat label="Total to Repay">{facility.totalRepayable != null ? formatCurrency(facility.totalRepayable) : '—'}</Stat>
          <Stat label="Confirmed Paid">{formatCurrency(facility.amountPaid)}</Stat>
          <Stat label="Outstanding">{facility.outstanding != null ? formatCurrency(facility.outstanding) : '—'}</Stat>
        </div>
        {transaction.status === 'rejected' && transaction.rejectionReason && (
          <div className="mt-5 bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3"><strong>Rejection Reason:</strong> {transaction.rejectionReason}</div>
        )}
      </Card>

      {facility.status === 'under_review' && (
        <Card className="mb-6">
          <h3 className="text-sm font-bold text-navy-800 mb-4">Application Review</h3>
          <RecommendationNote trail={transaction.slipTrail} what="application" />
          <p className="text-sm text-navy-500 mb-4 flex items-start gap-2">
            {isSuperAdmin ? <ShieldCheck size={16} className="text-emerald-500 mt-0.5 shrink-0" /> : <Clock size={16} className="text-amber-500 mt-0.5 shrink-0" />}
            {isSuperAdmin
              ? 'Check the documents, guarantor and bank account below. Approving sets the interest rate and the total the customer repays.'
              : 'Check the documents, guarantor and bank account below, then recommend. A Super Admin gives the final decision.'}
          </p>
          <ReviewButtons
            isSuperAdmin={isSuperAdmin}
            busy={busy}
            onRecommend={(decision) => openDialog({ kind: 'application', action: 'recommend', decision })}
            onApprove={() => openDialog({ kind: 'application', action: 'approve' })}
            onReject={() => openDialog({ kind: 'application', action: 'reject' })}
          />
        </Card>
      )}

      {facility.status === 'awaiting_disbursement' && (
        <Card className="mb-6 !border-blue-100">
          <h3 className="text-sm font-bold text-navy-800 mb-2 flex items-center gap-2">
            {isLoan ? <Banknote size={16} className="text-blue-500" /> : <Truck size={16} className="text-blue-500" />}
            {isLoan ? 'Pay Out the Loan' : 'Deliver the Item'}
          </h3>
          <p className="text-sm text-navy-500 mb-4">
            {isLoan
              ? `Transfer ${formatCurrency(facility.payoutAmount ?? transaction.amount)} (the loan after ${formatCurrency(facility.fees?.total || 0)} fees) to the customer's account below, then record the transfer reference. The repayment schedule starts today.`
              : 'Once the item has been handed over, record the delivery note. The repayment schedule starts today.'}
          </p>
          <Button icon={isLoan ? Banknote : Truck} onClick={() => { setReference(''); setDisburseOpen(true) }}>
            {isLoan ? 'Record Payout' : 'Record Delivery'}
          </Button>
        </Card>
      )}

      {facility.disbursementAccount && (
        <Card className="mb-6">
          <h3 className="text-sm font-bold text-navy-800 mb-4 flex items-center gap-2">
            <Landmark size={16} className="text-navy-400" /> Customer’s Bank Account
          </h3>
          <DetailList
            rows={[
              ...bankAccountRows(facility.disbursementAccount),
              ...(facility.disbursedAt ? [
                { label: isLoan ? 'Paid Out On' : 'Delivered On', value: formatDate(facility.disbursedAt, { withTime: true }) },
                { label: isLoan ? 'Transfer Reference' : 'Delivery Note', value: facility.disbursementReference },
              ] : []),
            ]}
          />
          {isLoan && facility.disbursementAccount.accountName && transaction.customerName
            && !facility.disbursementAccount.accountName.toLowerCase().includes(transaction.customerName.split(' ')[0].toLowerCase()) && (
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
              The account name doesn’t appear to match the customer’s name. Confirm it before paying out.
            </p>
          )}
        </Card>
      )}

      {facility.repayments.length > 0 && (
        <Card className="mb-6" padded={false}>
          <div className="flex items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-3">
            <h3 className="text-sm font-bold text-navy-800">Repayment Schedule</h3>
            <span className="text-xs text-navy-400">
              {facility.repayments.filter((r) => r.state === 'paid').length} of {facility.repayments.length} confirmed
              {facility.overdueCount > 0 && <span className="text-red-600 font-semibold"> · {facility.overdueCount} overdue</span>}
            </span>
          </div>
          <div className="divide-y divide-navy-50 border-t border-navy-50 max-h-[36rem] overflow-y-auto">
            {facility.repayments.map((r) => (
              <RepaymentRow
                key={r.id}
                repayment={r}
                isSuperAdmin={isSuperAdmin}
                onAction={(repayment, action, decision) => openDialog({ kind: 'repayment', action, decision, repayment })}
              />
            ))}
          </div>
        </Card>
      )}

      <ApplicationDetails transaction={transaction} />

      <Card className="mb-6">
        <h3 className="text-sm font-bold text-navy-800 mb-1">Application Review Trail</h3>
        <p className="text-xs text-navy-400 mb-4">Who recommended and decided on this application.</p>
        <Trail steps={transaction.slipTrail} />
      </Card>

      <Card>
        <h3 className="text-sm font-bold text-navy-800 mb-5">Timeline</h3>
        <TransactionTimeline steps={transaction.timeline} />
      </Card>

      <Modal
        open={!!dialog}
        onClose={() => setDialog(null)}
        title={dialogTitle}
        subtitle={
          dialog?.action === 'recommend' ? 'Your recommendation is sent to a Super Admin for the final decision.'
            : dialog?.action === 'reject' ? 'The customer will see this reason.'
            : dialog?.kind === 'repayment' ? `Confirms ${formatCurrency(dialog.repayment.amount)} for instalment ${dialog.repayment.number}. This is final.`
            : dialog?.kind === 'rate' ? (facility.status === 'active'
              ? 'Confirmed repayments stay as they are; the rest of the new total is spread evenly over the unpaid instalments. The customer is notified.'
              : 'Changes the total the customer repays. The customer is notified.')
            : 'This is the final decision. You can still change the rate later, until it’s fully repaid.'
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button
              variant={dialog?.action === 'reject' || dialog?.decision === 'reject' ? 'danger' : 'accent'}
              loading={busy}
              onClick={submitDialog}
            >
              {dialog?.action === 'recommend' ? 'Submit Recommendation' : dialog?.action === 'reject' ? 'Confirm Rejection' : 'Confirm'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {asksRate && (
            <>
              <Input
                label="Interest Rate (% of the amount, flat)"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                hint={dialog.kind === 'rate'
                  ? `Currently ${facility.interestRate}%. Charged once on ${formatCurrency(transaction.amount)}, whatever the term.`
                  : productRate != null ? `The product’s rate is ${productRate}%. Charged once, whatever the term.` : undefined}
                required
              />
              {repricePreview ? (
                <p className="rounded-xl bg-emerald-50/60 border border-emerald-100 px-4 py-3 text-sm text-navy-700">
                  New total <strong>{formatCurrency(repricePreview.total)}</strong>. After the {formatCurrency(facility.amountPaid)} already repaid,{' '}
                  {repricePreview.count} instalment{repricePreview.count === 1 ? '' : 's'} of about{' '}
                  <strong>{formatCurrency(Math.max(0, repricePreview.total - facility.amountPaid) / repricePreview.count)}</strong> remain.
                </p>
              ) : preview && rate !== '' && (
                <p className="rounded-xl bg-emerald-50/60 border border-emerald-100 px-4 py-3 text-sm text-navy-700">
                  {preview.payout != null && <>Customer receives <strong>{formatCurrency(preview.payout)}</strong> after fees and repays </>}
                  {preview.payout == null && <>Customer repays </>}
                  <strong>{formatCurrency(preview.total)}</strong>{preview.payout == null && feePreview ? ' (fees included)' : ''}: {preview.count} {frequencyLabel(facility.repaymentFrequency).toLowerCase()} instalment{preview.count === 1 ? '' : 's'} of about{' '}
                  <strong>{formatCurrency(preview.each)}</strong>.
                </p>
              )}
            </>
          )}
          {dialog?.kind === 'application' && dialog.action === 'approve' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Legal Fee (%)"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={fees.legalPercent}
                onChange={(e) => setFees((f) => ({ ...f, legalPercent: e.target.value }))}
                hint={feePreview ? formatCurrency(feePreview.legal) : undefined}
              />
              <Input
                label="Inspection Fee (₦)"
                type="number"
                min="0"
                value={fees.inspection}
                onChange={(e) => setFees((f) => ({ ...f, inspection: e.target.value }))}
                hint="Depends on the customer’s location."
              />
              <Input
                label="Application Fee (₦)"
                type="number"
                min="0"
                value={fees.application}
                onChange={(e) => setFees((f) => ({ ...f, application: e.target.value }))}
              />
              {feePreview && (
                <p className="sm:col-span-3 text-xs text-navy-500">
                  Fees total <strong>{formatCurrency(feePreview.total)}</strong>,{' '}
                  {isLoan ? 'taken from the loan when it’s paid out.' : 'added to the customer’s repayments.'}
                </p>
              )}
            </div>
          )}
          <Input
            label={dialog?.action === 'reject' ? 'Reason' : 'Note (optional)'}
            placeholder={dialog?.action === 'reject' ? (dialog.kind === 'application' ? 'e.g. Income could not be verified' : 'e.g. Amount does not match') : ''}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={disburseOpen}
        onClose={() => setDisburseOpen(false)}
        title={isLoan ? 'Record Payout' : 'Record Delivery'}
        subtitle={isLoan
          ? `Only after ${formatCurrency(facility.payoutAmount ?? transaction.amount)} has been sent to ${facility.disbursementAccount?.bankName} ${facility.disbursementAccount?.accountNumber}.`
          : 'Only after the item has been handed to the customer.'}
        footer={
          <>
            <Button variant="outline" onClick={() => setDisburseOpen(false)}>Cancel</Button>
            <Button
              variant="accent"
              loading={busy}
              disabled={!reference.trim()}
              onClick={() => run(() => disburseFacility(transaction.id, reference.trim()), isLoan ? 'Payout recorded. Repayments have started.' : 'Delivery recorded. Repayments have started.')}
            >
              Confirm
            </Button>
          </>
        }
      >
        <Input
          label={isLoan ? 'Transfer Reference' : 'Delivery Note / Reference'}
          placeholder={isLoan ? 'e.g. FT2610120045' : 'e.g. Delivered to customer at Ikeja office, waybill 2231'}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          required
        />
      </Modal>
    </div>
  )
}
