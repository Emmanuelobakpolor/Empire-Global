import { useState } from 'react'
import { CalendarClock, CheckCircle2, Clock, Landmark, Lock, PartyPopper, UploadCloud, AlertTriangle } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import FileUpload from '../ui/FileUpload'
import ReceiptPreview from '../ReceiptPreview'
import PaymentAccountCard from './PaymentAccountCard'
import { DetailList, bankAccountRows } from './ApplicationForms'
import { useDataStore } from '../../context/DataStoreContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { formatTerm } from '../../utils/planPeriod'
import { REPAYMENT_STATE, dueIn, frequencyLabel } from '../../utils/facility'

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024
// Long daily schedules show this many upcoming instalments until expanded
const PREVIEW_ROWS = 6

function Stat({ label, value, tone = 'text-navy-900' }) {
  return (
    <div className="rounded-xl border border-navy-100 px-3 py-2.5">
      <p className="text-[11px] text-navy-400">{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${tone}`}>{value}</p>
    </div>
  )
}

// One instalment that's due: where to pay, then the receipt
function DueInstalment({ transaction, repayment }) {
  const { uploadRepaymentReceipt } = useDataStore()
  const { showToast } = useToast()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const state = REPAYMENT_STATE[repayment.state]
  const pending = repayment.state === 'pending'

  const pick = (selected) => {
    if (selected.size > MAX_RECEIPT_BYTES) {
      showToast('Receipts must be 5 MB or smaller.', 'error')
      return
    }
    setFile(selected)
  }

  const submit = async () => {
    setUploading(true)
    const result = await uploadRepaymentReceipt(repayment.id, file)
    setUploading(false)
    if (!result.success) {
      showToast(result.error, 'error')
      return
    }
    setFile(null)
    showToast('Receipt uploaded. We’ll confirm your repayment shortly.', 'success')
  }

  return (
    <Card className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs text-navy-400">Instalment {repayment.number} of {transaction.facility.repayments.length}</p>
          <p className="text-lg font-bold text-navy-900">{formatCurrency(repayment.amount)}</p>
          <p className="text-xs text-navy-500 mt-0.5">
            {formatDate(repayment.dueDate)} · {pending ? 'Receipt sent' : dueIn(repayment.dueDate)}
          </p>
        </div>
        <Badge status={state.badge} className="!normal-case">{state.label}</Badge>
      </div>

      {repayment.rejectionReason && !pending && (
        <div className="mb-4 bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">
          <strong>Your last receipt wasn’t accepted:</strong> {repayment.rejectionReason}
        </div>
      )}

      {pending ? (
        <>
          <p className="text-sm text-navy-500 mb-3 flex items-start gap-2">
            <Clock size={16} className="text-blue-500 mt-0.5 shrink-0" />
            We’re checking your receipt. You can replace it if you uploaded the wrong file.
          </p>
          <ReceiptPreview receipt={repayment.receipt} />
        </>
      ) : (
        <PaymentAccountCard
          transaction={transaction}
          className="mb-4 !shadow-none"
          payment={{
            account: repayment.paymentAccount,
            amount: repayment.amount,
            reference: repayment.reference,
            label: `${transaction.productName}, instalment ${repayment.number}`,
          }}
        />
      )}

      <div className="mt-4">
        <p className="text-sm font-semibold text-navy-800 mb-2">{pending ? 'Replace receipt' : 'After paying, upload your receipt'}</p>
        <FileUpload file={file} onFileSelect={pick} onRemove={() => setFile(null)} accept="image/jpeg,image/png,image/webp,application/pdf" />
        {file && (
          <Button className="mt-3" fullWidth icon={UploadCloud} loading={uploading} onClick={submit}>
            Upload Receipt
          </Button>
        )}
      </div>
    </Card>
  )
}

function ScheduleRow({ repayment }) {
  const state = REPAYMENT_STATE[repayment.state]
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
      <div className="min-w-0">
        <p className="font-semibold text-navy-900">
          #{repayment.number} · {formatCurrency(repayment.amount)}
        </p>
        <p className="text-xs text-navy-400">
          Due {formatDate(repayment.dueDate)}
          {repayment.state === 'paid' && repayment.paidAt && ` · paid ${formatDate(repayment.paidAt)}`}
          {repayment.state === 'upcoming' && ` · payment details from ${formatDate(repayment.opensOn)}`}
        </p>
      </div>
      <Badge status={state.badge} className="!normal-case shrink-0">{state.label}</Badge>
    </div>
  )
}

// A loan or hire-purchase as the customer follows it: review, payout or delivery, then repayments.
export default function FacilityPanel({ transaction }) {
  const [showAll, setShowAll] = useState(false)
  const facility = transaction.facility
  const isLoan = transaction.productType === 'loan'
  const { status, repayments } = facility
  const due = repayments.filter((r) => r.paymentAccount || r.state === 'pending')
  const rest = repayments.filter((r) => !due.includes(r))
  const visibleRest = showAll ? rest : rest.filter((r) => r.state !== 'paid').slice(0, PREVIEW_ROWS)
  const next = facility.nextRepayment

  return (
    <>
      <Card className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Stat label={isLoan ? 'Loan Amount' : 'Item Value'} value={formatCurrency(transaction.amount)} />
          <Stat label="Duration" value={formatTerm(transaction.termMonths)} />
          <Stat label="Repayment" value={frequencyLabel(facility.repaymentFrequency)} />
          <Stat label="Interest" value={facility.interestRate != null ? `${facility.interestRate}% flat` : 'Set on approval'} />
          <Stat label="Total to Repay" value={facility.totalRepayable != null ? formatCurrency(facility.totalRepayable) : '—'} />
          {status === 'active' || status === 'completed' ? (
            <Stat
              label="Outstanding"
              value={formatCurrency(facility.outstanding)}
              tone={facility.outstanding > 0 ? 'text-amber-600' : 'text-emerald-600'}
            />
          ) : (
            <Stat label="Paid So Far" value={formatCurrency(facility.amountPaid)} />
          )}
        </div>

        {status === 'under_review' && (
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <Clock size={16} className="mt-0.5 shrink-0" />
            We’re reviewing your application. There’s nothing to pay now; we’ll notify you of the decision.
          </p>
        )}
        {status === 'awaiting_disbursement' && (
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            {isLoan
              ? `Approved! We’re paying ${formatCurrency(transaction.amount)} into your ${facility.disbursementAccount?.bankName} account ending ${facility.disbursementAccount?.accountNumber?.slice(-4)}. Your repayment schedule starts the day it’s paid.`
              : 'Approved! We’ll contact you to arrange delivery. Your repayment schedule starts on delivery.'}
          </p>
        )}
        {status === 'active' && next && (
          <p className={`mt-5 flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${facility.overdueCount ? 'bg-red-50 text-red-700' : 'bg-navy-50/70 text-navy-700'}`}>
            {facility.overdueCount ? <AlertTriangle size={16} className="mt-0.5 shrink-0" /> : <CalendarClock size={16} className="mt-0.5 shrink-0" />}
            <span>
              {facility.overdueCount
                ? `${facility.overdueCount} instalment${facility.overdueCount === 1 ? ' is' : 's are'} overdue. Please pay as soon as possible.`
                : <>Next repayment: <strong>{formatCurrency(next.amount)}</strong> on <strong>{formatDate(next.dueDate)}</strong>.</>}
            </span>
          </p>
        )}
        {status === 'completed' && (
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <PartyPopper size={16} className="mt-0.5 shrink-0" />
            Fully repaid. Thank you!{transaction.productType === 'hire-purchase' && ' Ownership of the item is now yours.'}
          </p>
        )}
      </Card>

      {status === 'active' && due.map((r) => <DueInstalment key={r.id} transaction={transaction} repayment={r} />)}

      {status === 'active' && due.length === 0 && next && (
        <Card className="mb-6">
          <p className="text-sm text-navy-600 flex items-start gap-2">
            <Lock size={16} className="text-navy-400 mt-0.5 shrink-0" />
            The account to pay into appears here {facility.noticeDays} days before each instalment is due (from{' '}
            <strong className="text-navy-900">{formatDate(next.opensOn)}</strong> for your next one). We’ll remind you too.
          </p>
        </Card>
      )}

      {repayments.length > 0 && (
        <Card className="mb-6" padded={false}>
          <div className="flex items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-3">
            <h3 className="text-sm font-bold text-navy-800">Repayment Schedule</h3>
            <span className="text-xs text-navy-400">
              {repayments.filter((r) => r.state === 'paid').length} of {repayments.length} paid
            </span>
          </div>
          <div className="divide-y divide-navy-50 border-t border-navy-50">
            {visibleRest.map((r) => <ScheduleRow key={r.id} repayment={r} />)}
            {visibleRest.length === 0 && <p className="px-4 py-3 text-sm text-navy-400">Nothing else scheduled.</p>}
          </div>
          {rest.length > visibleRest.length || showAll ? (
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="w-full border-t border-navy-50 px-4 py-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              {showAll ? 'Show less' : `Show full schedule (${repayments.length} instalments)`}
            </button>
          ) : null}
        </Card>
      )}

      {facility.disbursementAccount && (
        <Card className="mb-6">
          <h3 className="text-sm font-bold text-navy-800 mb-4 flex items-center gap-2">
            <Landmark size={16} className="text-navy-400" /> Your Bank Account
          </h3>
          <DetailList
            rows={[
              ...bankAccountRows(facility.disbursementAccount),
              ...(facility.disbursedAt
                ? [
                    { label: isLoan ? 'Paid Out On' : 'Delivered On', value: formatDate(facility.disbursedAt) },
                    { label: isLoan ? 'Transfer Reference' : 'Delivery Note', value: facility.disbursementReference },
                  ]
                : []),
            ]}
          />
        </Card>
      )}
    </>
  )
}
