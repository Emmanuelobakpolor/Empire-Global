import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import TransactionsChart from '../../components/admin/charts/TransactionsChart'
import RevenueChart from '../../components/admin/charts/RevenueChart'
import { useDataStore } from '../../context/DataStoreContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { productTypes } from '../../data/products'
import { Receipt, CheckCircle2, Clock, XCircle } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export default function Reports() {
  const { transactions, customers } = useDataStore()
  const { showToast } = useToast()
  const [productFilter, setProductFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = transactions.filter((t) => {
    if (t.status === 'draft') return false
    if (productFilter && t.productType !== productFilter) return false
    if (statusFilter && t.status !== statusFilter) return false
    if (dateFrom && t.date < dateFrom) return false
    if (dateTo && t.date > dateTo) return false
    return true
  })

  const approved = filtered.filter((t) => t.status === 'approved')
  const pending = filtered.filter((t) => t.status === 'pending' || t.status === 'processing')
  const rejected = filtered.filter((t) => t.status === 'rejected')
  const totalPayments = approved.reduce((sum, t) => sum + t.amount, 0)
  const savingsTotal = approved.filter((t) => t.productType === 'savings').reduce((sum, t) => sum + t.amount, 0)
  const investmentTotal = approved.filter((t) => t.productType === 'investment').reduce((sum, t) => sum + t.amount, 0)
  const loansTotal = approved.filter((t) => t.productType === 'loan').reduce((sum, t) => sum + t.amount, 0)

  const handleExport = (format) => {
    showToast(`Report export simulated successfully (${format}).`, 'info')
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Analyze transaction and payment performance across Empire Global."
        actions={
          <>
            <Button variant="outline" icon={Download} onClick={() => handleExport('CSV')}>Export CSV</Button>
            <Button variant="outline" icon={FileText} onClick={() => handleExport('PDF')}>Export PDF</Button>
          </>
        }
      />

      <Card className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input label="From" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input label="To" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <Select label="Product" placeholder="All Products" value={productFilter} onChange={(e) => setProductFilter(e.target.value)} options={productTypes} />
          <Select label="Status" placeholder="All Statuses" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={STATUS_OPTIONS} />
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        <StatCard label="Total Transactions" value={filtered.length} icon={Receipt} tone="navy" />
        <StatCard label="Approved Transactions" value={approved.length} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Pending Transactions" value={pending.length} icon={Clock} tone="amber" />
        <StatCard label="Rejected Transactions" value={rejected.length} icon={XCircle} tone="red" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        <StatCard label="Total Payments" value={formatCurrency(totalPayments, { compact: true })} tone="navy" />
        <StatCard label="Savings" value={formatCurrency(savingsTotal, { compact: true })} tone="emerald" />
        <StatCard label="Investments" value={formatCurrency(investmentTotal, { compact: true })} tone="navy" />
        <StatCard label="Loans" value={formatCurrency(loansTotal, { compact: true })} tone="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-rise-in">
        <Card>
          <h3 className="text-sm font-bold text-navy-800 mb-4">Transaction Volume</h3>
          <TransactionsChart />
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-navy-800 mb-4">Revenue by Product</h3>
          <RevenueChart />
        </Card>
      </div>
    </div>
  )
}
