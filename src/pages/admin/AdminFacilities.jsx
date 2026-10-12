import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Eye, Landmark, FileSearch, Banknote, Receipt, AlertTriangle } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import StatCard from '../../components/ui/StatCard'
import Table, { Tr, Td } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import AgentFilter, { AgentCell, useAgentFilter } from '../../components/admin/AgentFilter'
import { useDataStore } from '../../context/DataStoreContext'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { facilityStatus, needsAction, receiptsToVerify } from '../../utils/facility'

const VIEW_OPTIONS = [
  { value: 'action', label: 'Needs action' },
  { value: 'under_review', label: 'Applications under review' },
  { value: 'awaiting_disbursement', label: 'Awaiting disbursement / delivery' },
  { value: 'active', label: 'Repaying' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'completed', label: 'Fully repaid' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
]

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'loan', label: 'Loans' },
  { value: 'hire-purchase', label: 'Hire-purchase' },
]

function matchesView(t, view) {
  if (view === 'all') return true
  if (view === 'action') return needsAction(t)
  if (view === 'overdue') return t.facility.overdueCount > 0
  return t.facility.status === view
}

export default function AdminFacilities() {
  const { transactions } = useDataStore()
  const { isSuperAdmin } = useAdminAuth()
  const [search, setSearch] = useState('')
  const [view, setView] = useState('action')
  const [typeFilter, setTypeFilter] = useState('all')
  const agentFilter = useAgentFilter()

  const facilities = transactions.filter((t) => t.facility && agentFilter.matchesCustomer(t.customerId))

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return facilities.filter((t) =>
      (!q || t.reference.toLowerCase().includes(q) || t.customerName.toLowerCase().includes(q)
        || agentFilter.searchMatches(agentFilter.agentCodeForCustomer(t.customerId), search))
      && (typeFilter === 'all' || t.productType === typeFilter)
      && matchesView(t, view || 'action'))
  }, [facilities, search, typeFilter, view, agentFilter])

  const count = (fn) => facilities.filter(fn).length
  const pendingReceipts = facilities.reduce((sum, t) => sum + receiptsToVerify(t), 0)

  return (
    <div>
      <PageHeader
        title="Loans & Hire-Purchase"
        subtitle={
          isSuperAdmin
            ? 'Approve applications and set their interest rate, record payouts and deliveries, and confirm repayments.'
            : 'Review applications, record payouts and deliveries, and check repayment receipts for Super Admin approval.'
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        <StatCard label="Applications to Review" value={count((t) => t.facility.status === 'under_review')} icon={FileSearch} tone="amber" />
        <StatCard label="Awaiting Payout / Delivery" value={count((t) => t.facility.status === 'awaiting_disbursement')} icon={Banknote} tone="navy" />
        <StatCard label="Repayment Receipts" value={pendingReceipts} icon={Receipt} tone="emerald" />
        <StatCard label="With Overdue Instalments" value={count((t) => t.facility.overdueCount > 0)} icon={AlertTriangle} tone="amber" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Input placeholder="Search reference, customer or agent..." icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={view} onChange={(e) => setView(e.target.value)} options={VIEW_OPTIONS} />
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={TYPE_OPTIONS} />
        <AgentFilter filter={agentFilter} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Landmark} title={view === 'action' ? 'Nothing needs your attention' : 'No loans or hire-purchase found'} />
      ) : (
        <Table columns={['Reference', 'Customer', 'Agent', 'Product', 'Amount', 'Status', 'Repayments', '']}>
          {filtered.map((t) => {
            const status = facilityStatus(t)
            const receipts = receiptsToVerify(t)
            const paid = t.facility.repayments.filter((r) => r.state === 'paid').length
            return (
              <Tr key={t.id}>
                <Td className="font-semibold">{t.reference}</Td>
                <Td>{t.customerName}</Td>
                <Td><AgentCell code={agentFilter.agentCodeForCustomer(t.customerId)} /></Td>
                <Td>{t.productName}</Td>
                <Td className="font-semibold">{formatCurrency(t.amount)}</Td>
                <Td><Badge status={status.badge} className="!normal-case whitespace-nowrap">{status.label}</Badge></Td>
                <Td className="text-xs whitespace-nowrap">
                  {t.facility.repayments.length ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-navy-600">{paid}/{t.facility.repayments.length} paid{t.facility.nextRepayment ? ` · next ${formatDate(t.facility.nextRepayment.dueDate)}` : ''}</span>
                      {receipts > 0 && <Badge status="processing" className="!normal-case w-fit">{receipts} receipt{receipts === 1 ? '' : 's'} to verify</Badge>}
                      {t.facility.overdueCount > 0 && <Badge status="rejected" className="!normal-case w-fit">{t.facility.overdueCount} overdue</Badge>}
                    </div>
                  ) : '—'}
                </Td>
                <Td>
                  <Link to={`/admin/facilities/${t.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                    <Eye size={14} /> Open
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
