import { Link } from 'react-router-dom'
import { PiggyBank, TrendingUp, Landmark, ShoppingBag, Receipt, ArrowRight, ArrowUpRight, Clock, Sparkles } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import CountUp from '../../components/ui/CountUp'
import TransactionTable from '../../components/customer/TransactionTable'
import { useAuth } from '../../context/AuthContext'
import { useDataStore } from '../../context/DataStoreContext'
import { useCustomerAccount } from '../../hooks/useCustomerAccount'
import Badge from '../../components/ui/Badge'
import { formatCurrency } from '../../utils/formatCurrency'

const QUICK_ACTIONS = [
  { to: '/customer/savings', label: 'Start Saving', icon: PiggyBank },
  { to: '/customer/investments', label: 'Invest', icon: TrendingUp },
  { to: '/customer/loans', label: 'Apply for Loan', icon: Landmark },
  { to: '/customer/hire-purchase', label: 'Hire Purchase', icon: ShoppingBag },
  { to: '/customer/transactions', label: 'Transactions', icon: Receipt },
]

const FEATURED_PRODUCTS = [
  { name: 'Quarterly Collection (QC)', tag: 'Thrift', desc: 'Save daily or weekly, collected every quarter, and earn 2.5% interest on your savings.' },
  { name: 'One-Year Lump-Sum Investment', tag: 'Investment', desc: 'Invest a lump sum for 12 months and earn 18% interest on the invested amount.' },
  { name: 'Hire-Purchase: Electronics', tag: 'Hire-Purchase', desc: 'Get phones, laptops and home appliances now, and pay in weekly or monthly instalments.' },
]

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const { transactions } = useDataStore()
  const account = useCustomerAccount()

  const allMine = transactions.filter((t) => t.customerId === user?.id)
  const myTransactions = allMine.slice(0, 5)
  const pendingApplications = allMine.filter((t) => ['draft', 'pending', 'processing'].includes(t.status))

  const savings = account?.savingsBalance || 0
  const investments = account?.investmentBalance || 0
  const totalBalance = savings + investments
  const savingsShare = totalBalance ? Math.round((savings / totalBalance) * 100) : 0

  const today = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div>
      {/* Welcome banner */}
      <div className="mb-6 animate-rise-in">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-emerald-900 animate-gradient-pan text-white p-6 sm:p-8">
          <div className="absolute inset-0 bg-dot-grid mask-fade-edges" aria-hidden="true" />
          <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-emerald-500/25 blur-3xl animate-drift" aria-hidden="true" />
          <div className="absolute -bottom-28 left-1/3 w-64 h-64 rounded-full bg-emerald-300/10 blur-3xl animate-drift-delayed" aria-hidden="true" />
  
          <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300/90">{today}</p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
                {greeting()}, {user?.fullName?.split(' ')[0] || 'there'} <span className="animate-wave">👋</span>
              </h1>
              <p className="mt-1 text-sm text-navy-200">Here's the snapshot of your financial accounts today.</p>
  
              <p className="mt-6 text-xs font-medium text-navy-300">Total Balance</p>
              <div className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight">
                <CountUp value={totalBalance} duration={1400} />
              </div>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-400/15 text-emerald-300 text-xs font-semibold px-2.5 py-1 ring-1 ring-inset ring-emerald-400/25">
                <ArrowUpRight size={13} /> 4.2% vs last month
              </span>
            </div>
  
            {totalBalance > 0 && (
              <div className="w-full lg:w-72 glass-panel rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-navy-200">Portfolio mix</span>
                  <Sparkles size={14} className="text-emerald-300" />
                </div>
                <div className="mt-3 h-2.5 rounded-full bg-white/10 overflow-hidden flex">
                  <div className="h-full bg-emerald-400 animate-bar-fill" style={{ width: `${savingsShare}%` }} />
                  <div className="h-full bg-sky-400 animate-bar-fill" style={{ width: `${100 - savingsShare}%`, animationDelay: '0.5s' }} />
                </div>
                <div className="mt-3 flex justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-navy-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Savings {savingsShare}%
                  </span>
                  <span className="flex items-center gap-1.5 text-navy-100">
                    <span className="w-2 h-2 rounded-full bg-sky-400" /> Investments {100 - savingsShare}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 stagger-children">
        <StatCard label="Savings Balance" value={<CountUp value={savings} />} icon={PiggyBank} delta={2.1} tone="emerald" />
        <StatCard label="Investments" value={<CountUp value={investments} />} icon={TrendingUp} delta={12.5} tone="emerald" />
        <StatCard label="Outstanding Loan" value={<CountUp value={account?.outstandingLoan || 0} />} icon={Landmark} delta={-8.4} tone="amber" />
      </div>

      <Card className="mb-6 animate-rise-in">
        <h3 className="text-sm font-bold text-navy-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 stagger-pop">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group flex flex-col items-center gap-2.5 text-center rounded-2xl border border-navy-100 px-3 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-soft"
            >
              <span className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-colors duration-300 group-hover:bg-emerald-500 group-hover:text-white">
                <action.icon size={20} className="icon-bounce" />
              </span>
              <span className="text-xs sm:text-sm font-semibold text-navy-700">{action.label}</span>
            </Link>
          ))}
        </div>
      </Card>

      {pendingApplications.length > 0 && (
        <Card className="mb-6 animate-rise-in !p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-5 pb-3">
            <Clock size={16} className="text-amber-500" />
            <h3 className="text-sm font-bold text-navy-800">Pending Applications</h3>
            <span className="text-[11px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{pendingApplications.length}</span>
          </div>
          <div className="divide-y divide-navy-50 stagger-children">
            {pendingApplications.map((t) => {
              const awaitingPayment = t.status === 'draft'
              return (
                <div key={t.id} className="group flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-navy-50/40">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="relative flex w-2.5 h-2.5 shrink-0" aria-hidden="true">
                      <span className={`absolute inset-0 rounded-full animate-ping opacity-60 ${awaitingPayment ? 'bg-blue-400' : 'bg-amber-400'}`} />
                      <span className={`relative w-2.5 h-2.5 rounded-full ${awaitingPayment ? 'bg-blue-500' : 'bg-amber-500'}`} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-navy-900 truncate">{t.productName}</p>
                      <p className="text-xs text-navy-400">
                        {t.reference} · {formatCurrency(t.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={awaitingPayment ? 'awaiting' : 'pending'}>
                      {awaitingPayment ? 'Awaiting payment' : 'Under review'}
                    </Badge>
                    <Link
                      to={awaitingPayment ? `/customer/upload-receipt?ref=${t.reference}` : `/customer/transactions/${t.id}`}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                    >
                      {awaitingPayment ? 'Upload receipt' : 'Track'}
                      <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-rise-in">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-navy-800">Recent Transactions</h3>
            <Link to="/customer/transactions" className="group text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          <TransactionTable transactions={myTransactions} />
        </div>

        <div>
          <h3 className="text-sm font-bold text-navy-800 mb-4">Available Products</h3>
          <Card className="!p-0 divide-y divide-navy-50 overflow-hidden stagger-children">
            {FEATURED_PRODUCTS.map((p) => (
              <Link
                key={p.name}
                to="/customer/products"
                className="group block p-4 transition-colors duration-300 hover:bg-emerald-50/40"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-bold text-navy-900">{p.name}</p>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase">{p.tag}</span>
                </div>
                <p className="text-xs text-navy-400 leading-relaxed">{p.desc}</p>
                <span className="text-xs font-semibold text-emerald-600 group-hover:text-emerald-700 inline-flex items-center gap-1 mt-2">
                  View Details <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
