import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Copy, CheckCircle2, UploadCloud, Landmark } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { useDataStore } from '../../context/DataStoreContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'

export default function PaymentInstructions() {
  const [searchParams] = useSearchParams()
  const ref = searchParams.get('ref')
  const navigate = useNavigate()
  const { transactions, bankDetails } = useDataStore()
  const { showToast } = useToast()
  const [copied, setCopied] = useState('')

  const transaction = transactions.find((t) => t.reference === ref)

  const copy = (value, key) => {
    navigator.clipboard?.writeText(value)
    setCopied(key)
    showToast('Copied to clipboard.', 'info')
    setTimeout(() => setCopied(''), 1500)
  }

  if (!transaction) {
    return (
      <EmptyState
        title="Transaction not found"
        description="We couldn't find payment instructions for this reference."
        action={<Link to="/customer/products"><Button>Browse Products</Button></Link>}
      />
    )
  }

  const rows = [
    { key: 'reference', label: 'Transaction Reference', value: transaction.reference, mono: true },
    { key: 'amount', label: 'Amount', value: formatCurrency(transaction.amount) },
    { key: 'bank', label: 'Bank', value: bankDetails.bankName },
    { key: 'accountNumber', label: 'Account Number', value: bankDetails.accountNumber, mono: true },
    { key: 'accountName', label: 'Account Name', value: bankDetails.accountName },
  ]

  return (
    <div className="max-w-2xl">
      <PageHeader title="Payment Instructions" subtitle="Make a bank transfer using the details below, then confirm your payment." />

      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-11 h-11 rounded-xl bg-navy-900 text-emerald-400 flex items-center justify-center">
            <Landmark size={20} />
          </span>
          <div>
            <p className="text-sm font-bold text-navy-900">Bank Transfer Details</p>
            <p className="text-xs text-navy-400">These are mock payment details for demonstration only.</p>
          </div>
        </div>

        <div className="rounded-xl border border-navy-100 divide-y divide-navy-50">
          {rows.map((row) => (
            <div key={row.key} className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="min-w-0">
                <p className="text-xs text-navy-400">{row.label}</p>
                <p className={`text-sm font-bold text-navy-900 mt-0.5 truncate ${row.mono ? 'font-mono tracking-wide' : ''}`}>
                  {row.value}
                </p>
              </div>
              <button
                onClick={() => copy(row.value, row.key)}
                className="p-2 rounded-lg text-navy-400 hover:text-emerald-600 hover:bg-emerald-50 shrink-0"
              >
                {copied === row.key ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-6 !bg-amber-50 !border-amber-100">
        <p className="text-sm text-amber-800">
          Please make your transfer using the exact amount shown above, then upload proof of payment. Your transaction
          will remain <strong>Pending</strong> until an administrator verifies your receipt.
        </p>
      </Card>

      <Button
        size="lg"
        fullWidth
        icon={UploadCloud}
        onClick={() => navigate(`/customer/upload-receipt?ref=${transaction.reference}`)}
      >
        I Have Made Payment
      </Button>
    </div>
  )
}
