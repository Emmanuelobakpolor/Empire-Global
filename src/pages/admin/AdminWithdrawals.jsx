import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownToLine, Eye, Search } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Table, { Tr, Td } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import LoadingState from '../../components/ui/LoadingState'
import { useDataStore } from '../../context/DataStoreContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { WITHDRAWAL_STATUS } from '../customer/Withdrawals'

const STATUS_OPTIONS = Object.entries(WITHDRAWAL_STATUS).map(([value, s]) => ({ value, label: s.label }))

export default function AdminWithdrawals() {
  const { withdrawals, withdrawalsLoaded } = useDataStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return withdrawals.filter((w) => {
      const matches = !q || [w.reference, w.customerName, w.customerId, w.accountNumber, w.productName].some((v) => v?.toLowerCase().includes(q))
      return matches && (!statusFilter || w.status === statusFilter)
    })
  }, [withdrawals, search, statusFilter])

  const counts = {
    review: withdrawals.filter((w) => w.status === 'pending').length,
    payout: withdrawals.filter((w) => w.status === 'approved').length,
  }

  return (
    <div>
      <PageHeader
        title="Withdrawals"
        subtitle={`${counts.review} awaiting review · ${counts.payout} approved and waiting to be paid`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <Input placeholder="Search reference, customer, account..." icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} containerClassName="sm:col-span-2" />
        <Select placeholder="All statuses" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={STATUS_OPTIONS} />
      </div>

      {!withdrawalsLoaded ? (
        <LoadingState label="Loading withdrawals..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={ArrowDownToLine} title="No withdrawals" description="Customer withdrawal requests appear here." />
      ) : (
        <Table columns={['Reference', 'Customer', 'Plan', 'Amount', 'Pay out', 'Status', 'Requested', '']}>
          {filtered.map((w) => (
            <Tr key={w.id}>
              <Td className="font-mono text-xs">{w.reference}</Td>
              <Td>
                <p className="font-semibold text-navy-900">{w.customerName}</p>
                <p className="text-xs text-navy-400">{w.customerId}</p>
              </Td>
              <Td>{w.productName}</Td>
              <Td>{formatCurrency(w.amount)}</Td>
              <Td className="font-semibold">{formatCurrency(w.payoutAmount)}</Td>
              <Td><Badge status={WITHDRAWAL_STATUS[w.status]?.badge}>{WITHDRAWAL_STATUS[w.status]?.label || w.status}</Badge></Td>
              <Td>{formatDate(w.createdAt)}</Td>
              <Td>
                <Link to={`/admin/withdrawals/${w.reference}`} className="p-1.5 rounded-lg text-navy-400 hover:text-navy-800 hover:bg-navy-50 inline-flex" title="Review">
                  <Eye size={16} />
                </Link>
              </Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  )
}
