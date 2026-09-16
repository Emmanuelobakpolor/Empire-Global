import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, FileText, User, Calendar, Hash } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import TransactionTimeline from '../../components/customer/TransactionTimeline'
import { useDataStore } from '../../context/DataStoreContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

export default function AdminTransactionDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { transactions } = useDataStore()
  const transaction = transactions.find((t) => t.id === id)

  if (!transaction) {
    return (
      <EmptyState title="Transaction not found" action={<Link to="/admin/transactions"><Button>Back to Transactions</Button></Link>} />
    )
  }

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
          <Badge status={transaction.status} className="!text-sm !px-3 !py-1.5">{transaction.status}</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-navy-50">
          <div>
            <p className="text-xs text-navy-400 flex items-center gap-1"><User size={12} /> Customer</p>
            <Link to={`/admin/customers/${transaction.customerId}`} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 mt-1 block">
              {transaction.customerName}
            </Link>
          </div>
          <div>
            <p className="text-xs text-navy-400 flex items-center gap-1"><Hash size={12} /> Amount</p>
            <p className="text-sm font-bold text-navy-900 mt-1">{formatCurrency(transaction.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400 flex items-center gap-1"><Calendar size={12} /> Date</p>
            <p className="text-sm font-bold text-navy-900 mt-1">{formatDate(transaction.date)}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400 flex items-center gap-1"><FileText size={12} /> Receipt</p>
            <p className="text-sm font-bold text-navy-900 mt-1 truncate">{transaction.receipt?.fileName || 'Not uploaded'}</p>
          </div>
        </div>

        {(transaction.status === 'pending' || transaction.status === 'processing') && (
          <Link to={`/admin/payments/${transaction.id}`} className="inline-block mt-5">
            <Button variant="accent" size="sm">Go to Payment Verification</Button>
          </Link>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-bold text-navy-800 mb-5">Transaction Timeline</h3>
        <TransactionTimeline steps={transaction.timeline} />
      </Card>
    </div>
  )
}
