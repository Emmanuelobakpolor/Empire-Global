import { Link } from 'react-router-dom'
import { Users, Clock, CheckCircle2, Receipt, ArrowRight } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Table, { Tr, Td } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import TransactionsChart from '../../components/admin/charts/TransactionsChart'
import RevenueChart from '../../components/admin/charts/RevenueChart'
import { useDataStore } from '../../context/DataStoreContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate, timeAgo } from '../../utils/formatDate'

export default function AdminDashboard() {
  const { customers, transactions, auditLogs } = useDataStore()

  const pendingPayments = transactions.filter((t) => t.status === 'pending' || t.status === 'processing')
  const approvedTotal = transactions.filter((t) => t.status === 'approved').reduce((sum, t) => sum + t.amount, 0)
  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)
  const recentActivity = auditLogs.slice(0, 5)

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Overview of Empire Global platform activity." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        <StatCard label="Total Customers" value={customers.length.toLocaleString()} icon={Users} delta={6.3} tone="navy" />
        <StatCard label="Pending Payments" value={pendingPayments.length} icon={Clock} delta={-3.1} tone="amber" />
        <StatCard label="Approved Payments" value={formatCurrency(approvedTotal, { compact: true })} icon={CheckCircle2} delta={12.4} tone="emerald" />
        <StatCard label="Total Transactions" value={transactions.length.toLocaleString()} icon={Receipt} delta={8.9} tone="navy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 animate-rise-in">
        <Card>
          <h3 className="text-sm font-bold text-navy-800 mb-4">Transaction Volume</h3>
          <TransactionsChart />
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-navy-800 mb-4">Revenue by Product</h3>
          <RevenueChart />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-rise-in">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-navy-800">Recent Transactions</h3>
            <Link to="/admin/transactions" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowRight size={13} />
            </Link>
          </div>
          <Table columns={['Reference', 'Customer', 'Amount', 'Date', 'Status']}>
            {recentTransactions.map((t) => (
              <Tr key={t.id}>
                <Td className="font-semibold">{t.reference}</Td>
                <Td>{t.customerName}</Td>
                <Td>{formatCurrency(t.amount)}</Td>
                <Td>{formatDate(t.date)}</Td>
                <Td><Badge status={t.status}>{t.status}</Badge></Td>
              </Tr>
            ))}
          </Table>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-navy-800">Pending Verification</h3>
            <Link to="/admin/payments" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowRight size={13} />
            </Link>
          </div>
          <Card className="!p-0 divide-y divide-navy-50 mb-6">
            {pendingPayments.length === 0 ? (
              <p className="text-sm text-navy-400 p-5 text-center">No payments awaiting verification.</p>
            ) : (
              pendingPayments.slice(0, 4).map((p) => (
                <Link key={p.id} to={`/admin/payments/${p.id}`} className="flex items-center justify-between p-4 hover:bg-navy-50/50">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy-900 truncate">{p.customerName}</p>
                    <p className="text-xs text-navy-400 truncate">{p.reference}</p>
                  </div>
                  <span className="text-sm font-bold text-navy-900 shrink-0">{formatCurrency(p.amount, { compact: true })}</span>
                </Link>
              ))
            )}
          </Card>

          <h3 className="text-sm font-bold text-navy-800 mb-4">Recent Activity</h3>
          <Card className="!p-0 divide-y divide-navy-50">
            {recentActivity.map((log) => (
              <div key={log.id} className="p-4">
                <p className="text-sm font-semibold text-navy-800">{log.action}</p>
                <p className="text-xs text-navy-400 mt-0.5">{log.reference} · {timeAgo(log.date)}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
