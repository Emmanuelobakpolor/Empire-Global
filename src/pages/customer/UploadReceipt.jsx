import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, Clock } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import FileUpload from '../../components/ui/FileUpload'
import EmptyState from '../../components/ui/EmptyState'
import { useDataStore } from '../../context/DataStoreContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'

export default function UploadReceipt() {
  const [searchParams] = useSearchParams()
  const ref = searchParams.get('ref')
  const navigate = useNavigate()
  const { transactions, attachReceipt } = useDataStore()
  const { showToast } = useToast()

  const transaction = transactions.find((t) => t.reference === ref)
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!transaction) {
    return (
      <EmptyState
        title="Transaction not found"
        description="We couldn't find a transaction for this reference."
        action={<Link to="/customer/transactions"><Button>View Transactions</Button></Link>}
      />
    )
  }

  const handleSubmit = async () => {
    if (!file) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 900))
    attachReceipt(transaction.id, { fileName: file.name, uploadedAt: new Date().toISOString() })
    setSubmitting(false)
    setSubmitted(true)
    showToast('Receipt submitted successfully.', 'success')
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-10">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={30} />
        </div>
        <h2 className="text-xl font-bold text-navy-900">Receipt Submitted Successfully</h2>
        <p className="text-sm text-navy-400 mt-2">Your payment for {formatCurrency(transaction.amount)} is now under review.</p>
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-sm font-semibold rounded-full px-4 py-2 mt-5">
          <Clock size={15} /> Pending Verification
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link to={`/customer/transactions/${transaction.id}`} className="flex-1">
            <Button variant="outline" fullWidth>View Transaction</Button>
          </Link>
          <Link to="/customer/dashboard" className="flex-1">
            <Button fullWidth>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Upload Payment Receipt" subtitle="Attach proof of your payment so we can verify it." />

      <Card className="mb-6">
        <div className="flex items-center justify-between text-sm mb-5 pb-5 border-b border-navy-50">
          <div>
            <p className="text-xs text-navy-400">Reference</p>
            <p className="font-mono font-bold text-navy-900">{transaction.reference}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-navy-400">Amount</p>
            <p className="font-bold text-navy-900">{formatCurrency(transaction.amount)}</p>
          </div>
        </div>

        <FileUpload file={file} onFileSelect={setFile} onRemove={() => setFile(null)} />
      </Card>

      <Button size="lg" fullWidth disabled={!file} loading={submitting} onClick={handleSubmit}>
        Submit Receipt
      </Button>
    </div>
  )
}
