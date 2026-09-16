import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, Mail, Phone, Calendar, Receipt } from 'lucide-react'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import TransactionTable from '../../components/customer/TransactionTable'
import { useDataStore } from '../../context/DataStoreContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { PiggyBank, TrendingUp, Landmark, Wallet } from 'lucide-react'

export default function CustomerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { customers, transactions } = useDataStore()
  const customer = customers.find((c) => c.id === id)

  if (!customer) {
    return (
      <EmptyState
        title="Customer not found"
        action={<Link to="/admin/customers"><Button>Back to Customers</Button></Link>}
      />
    )
  }

  const customerTransactions = transactions.filter((t) => t.customerId === customer.id)

  return (
    <div className="max-w-5xl">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-navy-800 mb-5">
        <ChevronLeft size={16} /> Back
      </button>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="w-14 h-14 rounded-full bg-navy-900 text-white flex items-center justify-center text-lg font-bold shrink-0">
              {customer.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
            </span>
            <div>
              <h1 className="text-lg font-bold text-navy-900">{customer.fullName}</h1>
              <p className="text-xs text-navy-400 font-mono">{customer.id}</p>
            </div>
          </div>
          <Badge status={customer.status} className="!text-sm !px-3 !py-1.5 self-start sm:self-auto">{customer.status}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-navy-50 text-sm">
          <div className="flex items-center gap-2 text-navy-600"><Mail size={15} className="text-navy-300" /> {customer.email}</div>
          <div className="flex items-center gap-2 text-navy-600"><Phone size={15} className="text-navy-300" /> {customer.phone}</div>
          <div className="flex items-center gap-2 text-navy-600"><Calendar size={15} className="text-navy-300" /> Joined {formatDate(customer.joined)}</div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        <StatCard label="Savings" value={formatCurrency(customer.savingsBalance)} icon={PiggyBank} tone="emerald" />
        <StatCard label="Investments" value={formatCurrency(customer.investmentBalance)} icon={TrendingUp} tone="navy" />
        <StatCard label="Outstanding Loan" value={formatCurrency(customer.outstandingLoan)} icon={Landmark} tone="amber" />
        <StatCard label="Transaction Count" value={customerTransactions.length} icon={Receipt} tone="navy" />
      </div>

      <h3 className="text-sm font-bold text-navy-800 mb-4">Transaction History</h3>
      <TransactionTable transactions={customerTransactions} basePath="/admin/transactions" />
    </div>
  )
}
