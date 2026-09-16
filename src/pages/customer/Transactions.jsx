import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, PlusCircle } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import TransactionTable from '../../components/customer/TransactionTable'
import { useAuth } from '../../context/AuthContext'
import { useDataStore } from '../../context/DataStoreContext'
import { productTypes } from '../../data/products'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export default function Transactions() {
  const { user } = useAuth()
  const { transactions } = useDataStore()
  const [search, setSearch] = useState('')
  const [productFilter, setProductFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const myTransactions = useMemo(
    () => transactions.filter((t) => t.customerId === user?.id && t.status !== 'draft'),
    [transactions, user]
  )

  const filtered = myTransactions.filter((t) => {
    const matchesSearch =
      !search ||
      t.reference.toLowerCase().includes(search.toLowerCase()) ||
      t.productName.toLowerCase().includes(search.toLowerCase())
    const matchesProduct = !productFilter || t.productType === productFilter
    const matchesStatus = !statusFilter || t.status === statusFilter
    return matchesSearch && matchesProduct && matchesStatus
  })

  return (
    <div>
      <PageHeader
        title="Transaction History"
        subtitle="Search, filter and track all your transactions."
        actions={
          <Link to="/customer/transactions/new">
            <Button icon={PlusCircle}>New Transaction</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <Input
          placeholder="Search by reference or product..."
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          placeholder="Filter by product"
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          options={productTypes}
        />
        <Select
          placeholder="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={STATUS_OPTIONS}
        />
      </div>

      <TransactionTable transactions={filtered} />
    </div>
  )
}
