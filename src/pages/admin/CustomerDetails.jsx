import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, Mail, Phone, Calendar, Receipt } from 'lucide-react'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import TransactionTable from '../../components/customer/TransactionTable'
import { useDataStore } from '../../context/DataStoreContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { PiggyBank, TrendingUp, Landmark, BadgeCheck, Users, HandCoins } from 'lucide-react'
import { DetailList, nextOfKinRows } from '../../components/customer/ApplicationForms'
import { AgentCell } from '../../components/admin/AgentFilter'
import { StartAjoModal } from '../../components/admin/AjoPlanForm'

export default function CustomerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { customers, transactions } = useDataStore()
  const customer = customers.find((c) => c.id === id)
  const [startingAjo, setStartingAjo] = useState(false)

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
            <Avatar src={customer.avatarUrl} name={customer.fullName} className="w-14 h-14 bg-navy-900 text-white text-lg" />
            <div>
              <h1 className="text-lg font-bold text-navy-900">{customer.fullName}</h1>
              <p className="text-xs text-navy-400 font-mono">{customer.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {customer.status === 'active' && (
              <Button variant="accent" size="sm" icon={HandCoins} onClick={() => setStartingAjo(true)}>Start Ajo Plan</Button>
            )}
            <Badge status={customer.status} className="!text-sm !px-3 !py-1.5">{customer.status}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-navy-50 text-sm">
          <div className="flex items-center gap-2 text-navy-600">
            <Mail size={15} className="text-navy-300" />
            {customer.hasEmail === false ? <span className="text-navy-400">No email · registered by staff, no app access</span> : customer.email}
          </div>
          <div className="flex items-center gap-2 text-navy-600"><Phone size={15} className="text-navy-300" /> {customer.phone}</div>
          <div className="flex items-center gap-2 text-navy-600"><Calendar size={15} className="text-navy-300" /> Joined {formatDate(customer.joined)}</div>
        </div>
        <div className="mt-4 pt-4 border-t border-navy-50 flex items-start gap-2 text-sm">
          <BadgeCheck size={15} className="text-navy-300 mt-0.5" />
          <div>
            <p className="text-xs text-navy-400 mb-0.5">Agent</p>
            <AgentCell code={customer.agentCode} />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-navy-50">
          <p className="text-xs text-navy-400 mb-2 flex items-center gap-1.5"><Users size={13} /> Next of Kin</p>
          {customer.nextOfKin ? (
            <DetailList rows={nextOfKinRows(customer.nextOfKin)} />
          ) : (
            <p className="text-sm text-navy-400">Not provided yet.</p>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6 stagger-children">
        <StatCard label="Savings" value={formatCurrency(customer.savingsBalance)} icon={PiggyBank} tone="emerald" />
        <StatCard label="Investments" value={formatCurrency(customer.investmentBalance)} icon={TrendingUp} tone="navy" />
        <StatCard label="Ajo" value={formatCurrency(customer.ajoBalance || 0)} icon={HandCoins} tone="emerald" />
        <StatCard label="Outstanding Loan" value={formatCurrency(customer.outstandingLoan)} icon={Landmark} tone="amber" />
        <StatCard label="Transaction Count" value={customerTransactions.length} icon={Receipt} tone="navy" />
      </div>

      <StartAjoModal customer={customer} open={startingAjo} onClose={() => setStartingAjo(false)} />

      <h3 className="text-sm font-bold text-navy-800 mb-4">Transaction History</h3>
      <TransactionTable transactions={customerTransactions} basePath="/admin/transactions" />
    </div>
  )
}
