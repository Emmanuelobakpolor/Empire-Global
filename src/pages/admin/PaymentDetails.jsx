import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronLeft, FileText, CheckCircle2, XCircle, User, Calendar, Hash, BadgeCheck,
  Eye, ThumbsUp, ThumbsDown, ShieldCheck, Clock,
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { AgentCell } from '../../components/admin/AgentFilter'
import ApplicationDetails from '../../components/admin/ApplicationDetails'
import PlanPeriodCard from '../../components/PlanPeriod'
import { useDataStore } from '../../context/DataStoreContext'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { TRAIL_LABELS, latestRecommendation, slipStage } from '../../utils/slipReview'

const TRAIL_STYLE = {
  viewed: { icon: Eye, tone: 'bg-navy-50 text-navy-500' },
  recommended_approval: { icon: ThumbsUp, tone: 'bg-blue-50 text-blue-600' },
  recommended_rejection: { icon: ThumbsDown, tone: 'bg-amber-50 text-amber-600' },
  approved: { icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600' },
  rejected: { icon: XCircle, tone: 'bg-red-50 text-red-600' },
}

export default function PaymentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { transactions, customers, recordSlipView, recommendPayment, approvePayment, rejectPayment } = useDataStore()
  const { admin, isSuperAdmin } = useAdminAuth()
  const { showToast } = useToast()
  const transaction = transactions.find((t) => t.id === id)

  // 'approve' | 'reject' while the recommend modal is open
  const [recommendDecision, setRecommendDecision] = useState(null)
  const [note, setNote] = useState('')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [processing, setProcessing] = useState(false)

  // Every admin who opens a slip is recorded in its review trail
  useEffect(() => {
    if (transaction) recordSlipView(transaction.id)
  }, [transaction?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!transaction) {
    return (
      <EmptyState title="Payment not found" action={<Link to="/admin/payments"><Button>Back to Payments</Button></Link>} />
    )
  }

  const customer = customers.find((c) => c.id === transaction.customerId)
  const stage = slipStage(transaction)
  const recommendation = latestRecommendation(transaction)
  const trail = transaction.slipTrail || []
  const isResolved = transaction.status === 'approved' || transaction.status === 'rejected'

  const simulate = async (fn) => {
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 700))
    fn()
    setProcessing(false)
  }

  const handleRecommend = () =>
    simulate(() => {
      recommendPayment(transaction.id, recommendDecision, note.trim())
      showToast(
        recommendDecision === 'approve'
          ? 'Recommended for approval. A Super Admin will give final approval.'
          : 'Flagged for rejection. A Super Admin will make the final decision.',
        'success'
      )
      setRecommendDecision(null)
      setNote('')
    })

  const handleApprove = () =>
    simulate(() => {
      approvePayment(transaction.id)
      setApproveOpen(false)
      showToast('Payment approved. The customer has been credited.', 'success')
    })

  const handleReject = () =>
    simulate(() => {
      rejectPayment(transaction.id, reason)
      setRejectOpen(false)
      setReason('')
      showToast('Payment Rejected', 'error')
    })

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-navy-800 mb-5">
        <ChevronLeft size={16} /> Back
      </button>

      <Card className="mb-6">
        <div className="flex items-center justify-between gap-3 mb-5 pb-5 border-b border-navy-50">
          <div>
            <p className="text-xs text-navy-400">Payment Verification</p>
            <h1 className="text-lg font-bold text-navy-900 font-mono mt-1">{transaction.reference}</h1>
          </div>
          <Badge status={transaction.status} className="!text-sm !px-3 !py-1.5">{transaction.status}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-5 mb-5">
          <div>
            <p className="text-xs text-navy-400 flex items-center gap-1"><User size={12} /> Customer</p>
            <p className="text-sm font-bold text-navy-900 mt-1">{transaction.customerName}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400 flex items-center gap-1"><Hash size={12} /> Product</p>
            <p className="text-sm font-bold text-navy-900 mt-1">{transaction.productName}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400">Amount</p>
            <p className="text-sm font-bold text-navy-900 mt-1">{formatCurrency(transaction.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400 flex items-center gap-1"><Calendar size={12} /> Payment Date</p>
            <p className="text-sm font-bold text-navy-900 mt-1">{formatDate(transaction.date)}</p>
          </div>
          <div className="col-span-2 text-sm">
            <p className="text-xs text-navy-400 flex items-center gap-1 mb-1"><BadgeCheck size={12} /> Agent</p>
            <AgentCell code={customer?.agentCode} />
          </div>
        </div>

        <div>
          <p className="text-xs text-navy-400 mb-2">Receipt</p>
          <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-4 flex items-center gap-3">
            <span className="w-11 h-11 rounded-lg bg-white border border-navy-100 flex items-center justify-center shrink-0">
              <FileText size={20} className="text-navy-400" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy-800 truncate">{transaction.receipt?.fileName || 'No receipt uploaded'}</p>
              {transaction.receipt?.uploadedAt && (
                <p className="text-xs text-navy-400">Uploaded {formatDate(transaction.receipt.uploadedAt, { withTime: true })}</p>
              )}
            </div>
          </div>
        </div>

        {transaction.status === 'rejected' && transaction.rejectionReason && (
          <div className="mt-5 bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">
            <strong>Rejection Reason:</strong> {transaction.rejectionReason}
          </div>
        )}
      </Card>

      <PlanPeriodCard transaction={transaction} />

      <ApplicationDetails transaction={transaction} />

      {/* ---- Review stage + actions ---- */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold text-navy-800">Review Status</h3>
          <Badge status={stage.status} className="!normal-case">{stage.label}</Badge>
        </div>

        {recommendation && !isResolved && (
          <div className={`rounded-xl px-4 py-3 text-sm mb-4 ${recommendation.action === 'recommended_approval' ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800'}`}>
            <p>
              <strong>{recommendation.by}</strong> ({recommendation.role}){' '}
              {recommendation.action === 'recommended_approval' ? 'recommended this slip for approval' : 'recommended rejecting this slip'}{' '}
              on {formatDate(recommendation.at, { withTime: true })}.
            </p>
            {recommendation.note && <p className="mt-1 opacity-80">“{recommendation.note}”</p>}
          </div>
        )}

        {isResolved ? (
          <p className="text-sm text-navy-500">A Super Admin has made the final decision on this slip. No further action is needed.</p>
        ) : isSuperAdmin ? (
          <>
            <p className="text-sm text-navy-500 mb-4 flex items-start gap-2">
              <ShieldCheck size={16} className="text-emerald-500 mt-0.5 shrink-0" />
              As Super Admin, your decision is final. The customer is only credited once you approve.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="danger" icon={XCircle} fullWidth onClick={() => setRejectOpen(true)} disabled={processing}>
                Reject
              </Button>
              <Button variant="accent" icon={CheckCircle2} fullWidth onClick={() => setApproveOpen(true)} disabled={processing}>
                Give Final Approval
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-navy-500 mb-4 flex items-start gap-2">
              <Clock size={16} className="text-amber-500 mt-0.5 shrink-0" />
              You can recommend this slip. A Super Admin must still give final approval before the customer is credited.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" icon={ThumbsDown} fullWidth onClick={() => setRecommendDecision('reject')} disabled={processing}>
                Recommend Rejection
              </Button>
              <Button variant="accent" icon={ThumbsUp} fullWidth onClick={() => setRecommendDecision('approve')} disabled={processing}>
                Recommend Approval
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* ---- Audit trail ---- */}
      <Card>
        <h3 className="text-sm font-bold text-navy-800 mb-1">Slip Review Trail</h3>
        <p className="text-xs text-navy-400 mb-5">Who viewed, recommended and gave final approval on this slip.</p>
        {trail.length === 0 ? (
          <p className="text-sm text-navy-400">No review activity yet.</p>
        ) : (
          <ol className="flex flex-col gap-4">
            {trail.map((step, idx) => {
              const style = TRAIL_STYLE[step.action] || TRAIL_STYLE.viewed
              const isYou = step.by === admin?.fullName
              return (
                <li key={idx} className="flex items-start gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${style.tone}`}>
                    <style.icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-navy-800">
                      <strong>{TRAIL_LABELS[step.action] || step.action}</strong> by {step.by}
                      {isYou && <span className="text-navy-400"> (you)</span>}
                      {step.role && <span className="ml-1.5 text-[11px] font-semibold text-navy-500 bg-navy-50 rounded-full px-2 py-0.5">{step.role}</span>}
                    </p>
                    <p className="text-xs text-navy-400 mt-0.5">{formatDate(step.at, { withTime: true })}</p>
                    {step.note && <p className="text-xs text-navy-600 mt-1">“{step.note}”</p>}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </Card>

      <Modal
        open={!!recommendDecision}
        onClose={() => setRecommendDecision(null)}
        title={recommendDecision === 'approve' ? 'Recommend Approval' : 'Recommend Rejection'}
        subtitle="Your recommendation is sent to a Super Admin for final approval."
        footer={
          <>
            <Button variant="outline" onClick={() => setRecommendDecision(null)}>Cancel</Button>
            <Button variant={recommendDecision === 'approve' ? 'accent' : 'danger'} loading={processing} onClick={handleRecommend}>
              Submit Recommendation
            </Button>
          </>
        }
      >
        <Input
          label="Note (optional)"
          placeholder={recommendDecision === 'approve' ? 'e.g. Amount and bank match the receipt' : 'e.g. Receipt image unclear, amount mismatch...'}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Modal>

      <ConfirmDialog
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onConfirm={handleApprove}
        loading={processing}
        title="Give final approval?"
        description={`${transaction.customerName} will be credited ${formatCurrency(transaction.amount)} for ${transaction.productName}. This is the final decision.`}
        confirmLabel="Approve"
        variant="accent"
      />

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject Payment"
        subtitle="Provide a reason for rejecting this payment. The customer will be notified."
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="danger" loading={processing} onClick={handleReject}>Confirm Rejection</Button>
          </>
        }
      >
        <Input
          label="Rejection Reason"
          placeholder="e.g. Receipt image unclear, amount mismatch..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>
    </div>
  )
}
