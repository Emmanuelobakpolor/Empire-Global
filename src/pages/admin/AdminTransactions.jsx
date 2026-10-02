import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import TransactionTable from '../../components/customer/TransactionTable'
import { useDataStore } from '../../context/DataStoreContext'
import { productTypes } from '../../data/products'
import AgentFilter, { useAgentFilter } from '../../components/admin/AgentFilter'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export default function AdminTransactions() {
  const { transactions } = useDataStore()
  const [search, setSearch] = useState('')
  const [productFilter, setProductFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const agentFilter = useAgentFilter()

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (t.status === 'draft') return false
      const matchesSearch =
        !search ||
        t.reference.toLowerCase().includes(search.toLowerCase()) ||
        t.customerName.toLowerCase().includes(search.toLowerCase()) ||
        agentFilter.searchMatches(agentFilter.agentCodeForCustomer(t.customerId), search)
      const matchesProduct = !productFilter || t.productType === productFilter
      const matchesStatus = !statusFilter || t.status === statusFilter
      return matchesSearch && matchesProduct && matchesStatus && agentFilter.matchesCustomer(t.customerId)
    })
  }, [transactions, search, productFilter, statusFilter, agentFilter])

  return (
    <div>
      <PageHeader title="Transaction Management" subtitle="View and manage all customer transactions across the platform." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <Input placeholder="Search reference, customer or agent..." icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select placeholder="Filter by product" value={productFilter} onChange={(e) => setProductFilter(e.target.value)} options={productTypes} />
        <Select placeholder="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={STATUS_OPTIONS} />
        <AgentFilter filter={agentFilter} />
      </div>

      <TransactionTable transactions={filtered} basePath="/admin/transactions" showCustomer />
    </div>
  )
}
