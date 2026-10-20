import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Coins, Eye, Search } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Table, { Tr, Td } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import LoadingState from '../../components/ui/LoadingState'
import RecordInterestModal from '../../components/admin/RecordInterestModal'
import { useDataStore } from '../../context/DataStoreContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { INTEREST_PAYMENT_STATE, interestOptionLabel } from '../../utils/investment'

const STATE_OPTIONS = Object.entries(INTEREST_PAYMENT_STATE).map(([value, s]) => ({ value, label: s.label }))

// Every investment's interest payments: admins send each by bank transfer as it comes due
export default function AdminInterestPayouts() {
  const { getInterestPayments } = useDataStore()
  const { showToast } = useToast()
  const [payments, setPayments] = useState(null)
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('due')
  const [recording, setRecording] = useState(null)

  const load = async () => {
    const result = await getInterestPayments()
    if (result.success) setPayments(result.payments)
    else {
      setPayments([])
      showToast(result.error, 'error')
    }
  }

  useEffect(() => {
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return (payments || []).filter((p) => {
      const matches = !q || [p.reference, p.customerName, p.customerId, p.productName, p.payoutAccount?.accountNumber].some((v) => v?.toLowerCase().includes(q))
      return matches && (!stateFilter || p.state === stateFilter)
    })
  }, [payments, search, stateFilter])

  const due = (payments || []).filter((p) => p.state === 'due')

  return (
    <div>
      <PageHeader
        title="Interest Payouts"
        subtitle={payments ? `${due.length} due · ${formatCurrency(due.reduce((sum, p) => sum + p.amount, 0))} to send` : 'Investment interest to send to customers'}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <Input placeholder="Search reference, customer, account..." icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} containerClassName="sm:col-span-2" />
        <Select placeholder="All payments" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} options={STATE_OPTIONS} />
      </div>

      {!payments ? (
        <LoadingState label="Loading interest payouts..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Coins} title="Nothing here" description="Interest payments on investments appear here as they're scheduled." />
      ) : (
        <Table columns={['Payment', 'Customer', 'Investment', 'Amount', 'Due', 'Pay to', 'Status', '']}>
          {filtered.map((p) => {
            const state = INTEREST_PAYMENT_STATE[p.state] || INTEREST_PAYMENT_STATE.upcoming
            return (
              <Tr key={p.id}>
                <Td>
                  <p className="font-mono text-xs">{p.reference}</p>
                  <p className="text-xs text-navy-400">{interestOptionLabel(p.option)}{p.count > 1 && ` · ${p.number} of ${p.count}`}</p>
                </Td>
                <Td>
                  <p className="font-semibold text-navy-900">{p.customerName}</p>
                  <p className="text-xs text-navy-400">{p.customerId}</p>
                </Td>
                <Td>{p.productName}</Td>
                <Td className="font-semibold">{formatCurrency(p.amount)}</Td>
                <Td>{formatDate(p.dueDate)}</Td>
                <Td>
                  <p>{p.payoutAccount?.bankName} · {p.payoutAccount?.accountNumber}</p>
                  <p className="text-xs text-navy-400">{p.payoutAccount?.accountName}</p>
                </Td>
                <Td>
                  <Badge status={state.badge} className="!normal-case">{state.label}</Badge>
                  {p.state === 'paid' && <p className="text-xs text-navy-400 mt-1">ref {p.payoutReference}</p>}
                </Td>
                <Td>
                  <span className="flex items-center gap-1">
                    {p.state === 'due' && <Button size="sm" variant="accent" onClick={() => setRecording(p)}>Record</Button>}
                    <Link to={`/admin/transactions/${p.planReference}`} className="p-1.5 rounded-lg text-navy-400 hover:text-navy-800 hover:bg-navy-50 inline-flex" title="Open investment">
                      <Eye size={16} />
                    </Link>
                  </span>
                </Td>
              </Tr>
            )
          })}
        </Table>
      )}

      <RecordInterestModal
        payment={recording}
        customerName={recording?.customerName}
        account={recording?.payoutAccount}
        onClose={() => setRecording(null)}
        onRecorded={load}
      />
    </div>
  )
}
