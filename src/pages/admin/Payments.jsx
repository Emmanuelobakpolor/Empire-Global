import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Eye, FileText } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Table, { Tr, Td } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { useDataStore } from '../../context/DataStoreContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export default function Payments() {
  const { transactions } = useDataStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const paymentTransactions = transactions.filter((t) => t.status !== 'draft')

  const filtered = useMemo(() => {
    return paymentTransactions.filter((t) => {
      const matchesSearch =
        !search ||
        t.reference.toLowerCase().includes(search.toLowerCase()) ||
        t.customerName.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = !statusFilter || t.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [paymentTransactions, search, statusFilter])

  return (
    <div>
      <PageHeader title="Payment Management" subtitle="Review and verify customer payment receipts." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <Input placeholder="Search by reference or customer..." icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} containerClassName="sm:col-span-2" />
        <Select placeholder="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={STATUS_OPTIONS} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No payments found" />
      ) : (
        <Table columns={['Reference', 'Customer', 'Product', 'Amount', 'Date', 'Status', '']}>
          {filtered.map((t) => (
            <Tr key={t.id}>
              <Td className="font-semibold">{t.reference}</Td>
              <Td>{t.customerName}</Td>
              <Td>{t.productName}</Td>
              <Td className="font-semibold">{formatCurrency(t.amount)}</Td>
              <Td>{formatDate(t.date)}</Td>
              <Td><Badge status={t.status}>{t.status}</Badge></Td>
              <Td>
                <Link to={`/admin/payments/${t.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                  <Eye size={14} /> Review
                </Link>
              </Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  )
}
