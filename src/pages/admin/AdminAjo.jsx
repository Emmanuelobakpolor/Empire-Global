import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Eye, Coins, Receipt, Wallet, Users } from 'lucide-react'
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
import { AJO_STATE, contributionLabel, contributionsToConfirm } from '../../utils/ajo'

const VIEW_OPTIONS = [
  { value: 'action', label: 'Needs action' },
  { value: 'active', label: 'Saving' },
  { value: 'ended', label: 'Cycle ended · payout due' },
  { value: 'payout_requested', label: 'Payout requested' },
  { value: 'paid_out', label: 'Paid out' },
  { value: 'all', label: 'All' },
]

// Payments to confirm, or a finished cycle to pay out
const needsAction = (t) => contributionsToConfirm(t) > 0 || t.ajo.state === 'ended'

function matchesView(t, view) {
  if (view === 'all') return true
  if (view === 'action') return needsAction(t)
  return t.ajo.state === view
}

export default function AdminAjo() {
  const { transactions } = useDataStore()
  const { isSuperAdmin } = useAdminAuth()
  const [search, setSearch] = useState('')
  const [view, setView] = useState('action')
  const agentFilter = useAgentFilter()

  const plans = transactions.filter((t) => t.ajo && agentFilter.matchesCustomer(t.customerId))

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return plans.filter((t) =>
      (!q || t.reference.toLowerCase().includes(q) || t.customerName.toLowerCase().includes(q)
        || agentFilter.searchMatches(agentFilter.agentCodeForCustomer(t.customerId), search))
      && matchesView(t, view))
  }, [plans, search, view, agentFilter])

  const running = plans.filter((t) => t.ajo.state === 'active')

  return (
    <div>
      <PageHeader
        title="Ajo (Esusu)"
        subtitle={
          isSuperAdmin
            ? 'Confirm contributions, record cash and transfers, and follow each cycle to its payout.'
            : 'Record cash and transfers, and check contributions for Super Admin confirmation.'
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        <StatCard label="Plans Saving" value={running.length} icon={Users} tone="emerald" />
        <StatCard label="Contributions to Confirm" value={plans.reduce((sum, t) => sum + contributionsToConfirm(t), 0)} icon={Receipt} tone="amber" />
        <StatCard label="Saved in Running Cycles" value={formatCurrency(running.reduce((sum, t) => sum + t.ajo.saved, 0))} icon={Coins} tone="navy" />
        <StatCard label="Cycles Due for Payout" value={plans.filter((t) => t.ajo.state === 'ended').length} icon={Wallet} tone="amber" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <Input placeholder="Search reference, customer or agent..." icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={view} onChange={(e) => setView(e.target.value)} options={VIEW_OPTIONS} />
        <AgentFilter filter={agentFilter} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Coins} title={view === 'action' ? 'Nothing needs your attention' : 'No Ajo plans found'} />
      ) : (
        <Table columns={['Reference', 'Customer', 'Agent', 'Contribution', 'Saved', 'Cycle Ends', 'Status', '']}>
          {filtered.map((t) => {
            const state = AJO_STATE[t.ajo.state]
            const toConfirm = contributionsToConfirm(t)
            return (
              <Tr key={t.id}>
                <Td className="font-semibold">{t.reference}</Td>
                <Td>{t.customerName}</Td>
                <Td><AgentCell code={agentFilter.agentCodeForCustomer(t.customerId)} /></Td>
                <Td className="whitespace-nowrap">{formatCurrency(t.ajo.contribution)} {contributionLabel(t.ajo.frequency).toLowerCase()}</Td>
                <Td className="whitespace-nowrap">
                  <span className="font-semibold">{formatCurrency(t.ajo.saved)}</span>
                  <span className="block text-xs text-navy-400">{t.ajo.paidCount}/{t.ajo.count} paid</span>
                </Td>
                <Td className="whitespace-nowrap">{t.ajo.cycleEnds ? formatDate(t.ajo.cycleEnds) : '—'}</Td>
                <Td>
                  <div className="flex flex-col gap-1">
                    <Badge status={state.badge} className="!normal-case whitespace-nowrap w-fit">{state.label}</Badge>
                    {toConfirm > 0 && <Badge status="processing" className="!normal-case w-fit">{toConfirm} to confirm</Badge>}
                  </div>
                </Td>
                <Td>
                  <Link
                    to={`/admin/ajo/${t.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
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
