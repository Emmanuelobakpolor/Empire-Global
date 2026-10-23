import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, FileText, User, Calendar, Hash, UploadCloud } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import LoadingState from '../../components/ui/LoadingState'
import ReceiptPreview from '../../components/ReceiptPreview'
import TransactionTimeline from '../../components/customer/TransactionTimeline'
import PlanPeriodCard from '../../components/PlanPeriod'
import PaymentAccountCard from '../../components/customer/PaymentAccountCard'
import FacilityPanel from '../../components/customer/FacilityPanel'
import InvestmentPanel from '../../components/customer/InvestmentPanel'
import AjoPanel from '../../components/customer/AjoPanel'
import { AJO_STATE, contributionLabel } from '../../utils/ajo'
import { facilityStatus, frequencyLabel } from '../../utils/facility'
import { useDataStore } from '../../context/DataStoreContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

export default function TransactionDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { transactions, transactionsLoaded } = useDataStore()
  const transaction = transactions.find((t) => t.id === id)

  if (!transaction && !transactionsLoaded) return <LoadingState label="Loading transaction..." />

  if (!transaction) {
    return (
      <EmptyState
        title="Transaction not found"
        description="This transaction may not exist or was removed."
        action={<Link to="/customer/transactions"><Button>Back to Transactions</Button></Link>}
      />
    )
  }

  // Loans and hire-purchase are applied for, paid out, then repaid by instalment
  const facility = transaction.facility
  // Ajo plans follow their cycle once the first contribution is approved
  const ajo = transaction.ajo
  const badge = facility
    ? facilityStatus(transaction)
    : ajo && transaction.status === 'approved' ? AJO_STATE[ajo.state]
    : transaction.status === 'draft' ? { badge: 'awaiting', label: 'Awaiting payment' } : { badge: transaction.status, label: transaction.status }

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-navy-800 mb-5"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-navy-400 font-mono">{transaction.reference}</p>
            <h1 className="text-xl font-bold text-navy-900 mt-1">{transaction.productName}</h1>
          </div>
          <Badge status={badge.badge} className="!text-sm !px-3 !py-1.5 !normal-case">
            {badge.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-navy-50">
          <div>
            <p className="text-xs text-navy-400 flex items-center gap-1"><User size={12} /> Customer</p>
            <p className="text-sm font-bold text-navy-900 mt-1">{transaction.customerName}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400 flex items-center gap-1"><Hash size={12} /> Amount</p>
            <p className="text-sm font-bold text-navy-900 mt-1">{formatCurrency(transaction.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400 flex items-center gap-1"><Calendar size={12} /> Date</p>
            <p className="text-sm font-bold text-navy-900 mt-1">{formatDate(transaction.date)}</p>
          </div>
          {facility ? (
            <div>
              <p className="text-xs text-navy-400 flex items-center gap-1"><FileText size={12} /> Repayment</p>
              <p className="text-sm font-bold text-navy-900 mt-1">{frequencyLabel(facility.repaymentFrequency)}</p>
            </div>
          ) : ajo ? (
            <div>
              <p className="text-xs text-navy-400 flex items-center gap-1"><FileText size={12} /> Contributions</p>
              <p className="text-sm font-bold text-navy-900 mt-1">{contributionLabel(ajo.frequency)}</p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-navy-400 flex items-center gap-1"><FileText size={12} /> Receipt</p>
              <p className="text-sm font-bold text-navy-900 mt-1 truncate">{transaction.receipt?.fileName || 'Not uploaded'}</p>
            </div>
          )}
        </div>

        {transaction.status === 'rejected' && transaction.rejectionReason && (
          <div className="mt-5 bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">
            <strong>Rejection Reason:</strong> {transaction.rejectionReason}
          </div>
        )}
      </Card>

      {facility && <FacilityPanel transaction={transaction} />}

      {/* Until a decision is made, keep the account to pay into one tap away */}
      {!facility && !['approved', 'rejected'].includes(transaction.status) && (
        <>
          <PaymentAccountCard transaction={transaction} />
          {transaction.status === 'draft' && (
            <Link to={`/customer/upload-receipt?ref=${transaction.reference}`} className="block mb-6">
              <Button size="lg" fullWidth icon={UploadCloud} disabled={!transaction.paymentAccount}>I Have Made Payment</Button>
            </Link>
          )}
        </>
      )}

      {ajo ? <AjoPanel transaction={transaction} /> : !facility && <PlanPeriodCard transaction={transaction} />}

      {transaction.investment && <InvestmentPanel transaction={transaction} />}

      {transaction.receipt && (
        <Card className="mb-6">
          <h3 className="text-sm font-bold text-navy-800 mb-4">{ajo ? 'First Contribution Receipt' : 'Your Receipt'}</h3>
          <ReceiptPreview receipt={transaction.receipt} />
        </Card>
      )}

      <Card>
        <h3 className="text-sm font-bold text-navy-800 mb-5">Transaction Timeline</h3>
        <TransactionTimeline steps={transaction.timeline} />
      </Card>
    </div>
  )
}
