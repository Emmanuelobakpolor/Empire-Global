import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { UploadCloud } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import LoadingState from '../../components/ui/LoadingState'
import { useDataStore } from '../../context/DataStoreContext'
import PlanPeriodCard from '../../components/PlanPeriod'
import PaymentAccountCard from '../../components/customer/PaymentAccountCard'

export default function PaymentInstructions() {
  const [searchParams] = useSearchParams()
  const ref = searchParams.get('ref')
  const navigate = useNavigate()
  const { transactions, transactionsLoaded } = useDataStore()

  const transaction = transactions.find((t) => t.reference === ref)

  if (!transaction && !transactionsLoaded) return <LoadingState label="Loading transaction..." />

  if (!transaction) {
    return (
      <EmptyState
        title="Transaction not found"
        description="We couldn't find payment instructions for this reference."
        action={<Link to="/customer/products"><Button>Browse Products</Button></Link>}
      />
    )
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Payment Instructions" subtitle="Make a bank transfer using the details below, then confirm your payment." />

      <PaymentAccountCard transaction={transaction} />

      <PlanPeriodCard transaction={transaction} />

      <Card className="mb-6 !bg-amber-50 !border-amber-100">
        <p className="text-sm text-amber-800">
          Please make your transfer using the exact amount shown above, then upload proof of payment. Your transaction
          will remain <strong>Pending</strong> until an administrator verifies your receipt.
        </p>
      </Card>

      <Button
        size="lg"
        fullWidth
        disabled={!transaction.paymentAccount}
        icon={UploadCloud}
        onClick={() => navigate(`/customer/upload-receipt?ref=${transaction.reference}`)}
      >
        I Have Made Payment
      </Button>
    </div>
  )
}
