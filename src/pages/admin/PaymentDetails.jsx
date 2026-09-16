import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, FileText, CheckCircle2, XCircle, User, Calendar, Hash } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import EmptyState from '../../components/ui/EmptyState'
import { useDataStore } from '../../context/DataStoreContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

export default function PaymentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { transactions, approvePayment, rejectPayment } = useDataStore()
  const { showToast } = useToast()
  const transaction = transactions.find((t) => t.id === id)

  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [processing, setProcessing] = useState(false)

  if (!transaction) {
    return (
      <EmptyState title="Payment not found" action={<Link to="/admin/payments"><Button>Back to Payments</Button></Link>} />
    )
  }

  const handleApprove = async () => {
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 700))
    approvePayment(transaction.id)
    setProcessing(false)
    showToast('Payment Approved Successfully', 'success')
  }

  const handleReject = async () => {
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 700))
    rejectPayment(transaction.id, reason)
    setProcessing(false)
    setRejectOpen(false)
    setReason('')
    showToast('Payment Rejected', 'error')
  }

  const isResolved = transaction.status === 'approved' || transaction.status === 'rejected'

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-navy-800 mb-5">
        <ChevronLeft size={16} /> Back
      </button>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-5 pb-5 border-b border-navy-50">
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

      {!isResolved && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="danger" icon={XCircle} fullWidth onClick={() => setRejectOpen(true)} disabled={processing}>
            Reject
          </Button>
          <Button variant="accent" icon={CheckCircle2} fullWidth onClick={handleApprove} loading={processing}>
            Approve
          </Button>
        </div>
      )}

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
