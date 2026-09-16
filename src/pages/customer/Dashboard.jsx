import { Link } from 'react-router-dom'
import { Wallet, PiggyBank, TrendingUp, Landmark, PlusCircle, Coins, ShoppingBag, Receipt, ArrowRight } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import TransactionTable from '../../components/customer/TransactionTable'
import { useAuth } from '../../context/AuthContext'
import { useDataStore } from '../../context/DataStoreContext'
import { formatCurrency } from '../../utils/formatCurrency'

const QUICK_ACTIONS = [
  { to: '/customer/savings', label: 'Start Saving', icon: PiggyBank },
  { to: '/customer/investments', label: 'Invest', icon: TrendingUp },
  { to: '/customer/loans', label: 'Apply for Loan', icon: Landmark },
  { to: '/customer/hire-purchase', label: 'Hire Purchase', icon: ShoppingBag },
  { to: '/customer/transactions', label: 'View Transactions', icon: Receipt },
]

export default function Dashboard() {
  const { user } = useAuth()
  const { transactions } = useDataStore()

  const myTransactions = transactions.filter((t) => t.customerId === user?.id).slice(0, 5)
  const totalBalance = (user?.savingsBalance || 0) + (user?.investmentBalance || 0)

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.fullName?.split(' ')[0] || 'there'}`}
        subtitle="Here's the snapshot of your financial accounts today."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        <StatCard label="Total Balance" value={formatCurrency(totalBalance)} icon={Wallet} delta={4.2} tone="navy" />
        <StatCard label="Savings Balance" value={formatCurrency(user?.savingsBalance || 0)} icon={PiggyBank} delta={2.1} tone="emerald" />
        <StatCard label="Investments" value={formatCurrency(user?.investmentBalance || 0)} icon={TrendingUp} delta={12.5} tone="emerald" />
        <StatCard label="Outstanding Loan" value={formatCurrency(user?.outstandingLoan || 0)} icon={Landmark} delta={-8.4} tone="amber" />
      </div>

      <Card className="mb-6 animate-rise-in">
        <h3 className="text-sm font-bold text-navy-800 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="flex items-center gap-2 text-sm font-semibold text-navy-700 border border-navy-200 rounded-xl px-4 py-2.5 hover:bg-navy-50 hover:border-navy-300 transition-colors"
            >
              <action.icon size={16} className="text-emerald-500" />
              {action.label}
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-rise-in">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-navy-800">Recent Transactions</h3>
            <Link to="/customer/transactions" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowRight size={13} />
            </Link>
          </div>
          <TransactionTable transactions={myTransactions} />
        </div>

        <div>
          <h3 className="text-sm font-bold text-navy-800 mb-4">Available Products</h3>
          <Card className="!p-0 divide-y divide-navy-50">
            {[
              { name: 'Thrift Gold Plan', tag: 'Thrift', desc: 'Daily or weekly automated contributions. Enjoy up to 8.5% annual yield.' },
              { name: 'Fixed Investment 12-Month', tag: 'Investment', desc: 'Lock funds for a year and reap high-yield stable interest up to 14.2% per annum.' },
              { name: 'Hire-Purchase Electronics', tag: 'Hire-Purchase', desc: 'Acquire premium corporate electronics and pay flexibly over a 6 to 12 month cycle.' },
            ].map((p) => (
              <div key={p.name} className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-bold text-navy-900">{p.name}</p>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase">{p.tag}</span>
                </div>
                <p className="text-xs text-navy-400 leading-relaxed">{p.desc}</p>
                <Link to="/customer/products" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 mt-2">
                  View Details <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
