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
import { slipStage } from '../../utils/slipReview'
import AgentFilter, { AgentCell, useAgentFilter } from '../../components/admin/AgentFilter'
import { useAdminAuth } from '../../context/AdminAuthContext'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const STAGE_OPTIONS = [
  { value: 'all', label: 'All review stages' },
  { value: 'Not reviewed', label: 'Not reviewed' },
  { value: 'Viewed', label: 'Viewed' },
  { value: 'awaiting', label: 'Awaiting Super Admin' },
  { value: 'final', label: 'Final decision made' },
]

function matchesStage(txn, stage) {
  if (!stage || stage === 'all') return true
  const { label } = slipStage(txn)
  if (stage === 'awaiting') return label.includes('awaiting Super Admin')
  if (stage === 'final') return label.startsWith('Final')
  return label === stage
}

export default function Payments() {
  const { transactions } = useDataStore()
  const { isSuperAdmin } = useAdminAuth()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const agentFilter = useAgentFilter()

  const paymentTransactions = transactions.filter((t) => t.status !== 'draft')

  const filtered = useMemo(() => {
    return paymentTransactions.filter((t) => {
      const matchesSearch =
        !search ||
        t.reference.toLowerCase().includes(search.toLowerCase()) ||
        t.customerName.toLowerCase().includes(search.toLowerCase()) ||
        agentFilter.searchMatches(agentFilter.agentCodeForCustomer(t.customerId), search)
      const matchesStatus = !statusFilter || t.status === statusFilter
      return matchesSearch && matchesStatus && matchesStage(t, stageFilter) && agentFilter.matchesCustomer(t.customerId)
    })
  }, [paymentTransactions, search, statusFilter, stageFilter, agentFilter])

  return (
    <div>
      <PageHeader
        title="Payment Management"
        subtitle={
          isSuperAdmin
            ? 'Review payment slips and give final approval. Customers are only credited after your approval.'
            : 'Review payment slips and recommend them for Super Admin approval.'
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <Input placeholder="Search reference, customer or agent..." icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select placeholder="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={STATUS_OPTIONS} />
        <Select placeholder="Filter by review stage" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} options={STAGE_OPTIONS} />
        <AgentFilter filter={agentFilter} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No payments found" />
      ) : (
        <Table columns={['Reference', 'Customer', 'Agent', 'Product', 'Amount', 'Date', 'Status', 'Review Stage', '']}>
          {filtered.map((t) => {
            const stage = slipStage(t)
            return (
            <Tr key={t.id}>
              <Td className="font-semibold">{t.reference}</Td>
              <Td>{t.customerName}</Td>
              <Td><AgentCell code={agentFilter.agentCodeForCustomer(t.customerId)} /></Td>
              <Td>{t.productName}</Td>
              <Td className="font-semibold">{formatCurrency(t.amount)}</Td>
              <Td>{formatDate(t.date)}</Td>
              <Td><Badge status={t.status}>{t.status}</Badge></Td>
              <Td><Badge status={stage.status} className="!normal-case whitespace-nowrap">{stage.label}</Badge></Td>
              <Td>
                <Link to={`/admin/payments/${t.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                  <Eye size={14} /> Review
                </Link>
              </Td>
            </Tr>
            )
          })}
        </Table>
      )}
    </div>
  )
}
