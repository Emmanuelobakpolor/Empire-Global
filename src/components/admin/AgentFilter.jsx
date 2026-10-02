import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import Select from '../ui/Select'
import Badge from '../ui/Badge'
import { useDataStore } from '../../context/DataStoreContext'
import { findAgent, normalizeAgentCode } from '../../data/agents'

const ALL = 'all'
const NO_AGENT = 'none'

// Filter state for "by Agent Code / Agent name / Agent location".
// matches(agentCode) tells whether a record linked to that code passes the filter;
// matchesCustomer(customerId) does the same for records linked through a customer.
export function useAgentFilter(initialAgentCode = '') {
  const { customers, agents } = useDataStore()
  const [agentCode, setAgentCode] = useState(initialAgentCode)
  const [location, setLocation] = useState('')

  const agentByCustomer = useMemo(() => new Map(customers.map((c) => [c.id, c.agentCode || null])), [customers])

  const agentActive = agentCode && agentCode !== ALL
  const locationActive = location && location !== ALL

  const matches = (code) => {
    if (agentActive) {
      if (agentCode === NO_AGENT ? !!code : normalizeAgentCode(code) !== agentCode) return false
    }
    if (locationActive && findAgent(agents, code)?.location !== location) return false
    return true
  }

  // Free-text search: does the agent behind this code match the query?
  const searchMatches = (code, query) => {
    if (!code) return false
    const q = query.toLowerCase()
    const agent = findAgent(agents, code)
    return code.toLowerCase().includes(q) || !!agent?.name.toLowerCase().includes(q) || !!agent?.location.toLowerCase().includes(q)
  }

  return {
    agents,
    agentCode,
    setAgentCode,
    location,
    setLocation,
    active: agentActive || locationActive,
    reset: () => {
      setAgentCode('')
      setLocation('')
    },
    matches,
    searchMatches,
    matchesCustomer: (customerId) => matches(agentByCustomer.get(customerId)),
    agentCodeForCustomer: (customerId) => agentByCustomer.get(customerId) || null,
  }
}

export default function AgentFilter({ filter, withLabels = false }) {
  const agentOptions = [
    { value: ALL, label: 'All agents' },
    ...filter.agents.map((a) => ({ value: a.code, label: `${a.name} (${a.code})${a.status === 'active' ? '' : ' · inactive'}` })),
    { value: NO_AGENT, label: 'No agent' },
  ]
  const locationOptions = [
    { value: ALL, label: 'All locations' },
    ...[...new Set(filter.agents.map((a) => a.location))].sort().map((l) => ({ value: l, label: l })),
  ]

  return (
    <>
      <Select
        label={withLabels ? 'Agent' : undefined}
        placeholder="Filter by agent"
        value={filter.agentCode}
        onChange={(e) => filter.setAgentCode(e.target.value)}
        options={agentOptions}
      />
      <div className="flex items-end gap-2">
        <Select
          label={withLabels ? 'Agent Location' : undefined}
          placeholder="Filter by agent location"
          value={filter.location}
          onChange={(e) => filter.setLocation(e.target.value)}
          options={locationOptions}
          containerClassName="flex-1"
        />
        {filter.active && (
          <button
            type="button"
            onClick={filter.reset}
            className="shrink-0 h-[42px] w-[42px] rounded-xl border border-navy-200 bg-white flex items-center justify-center text-navy-400 hover:text-navy-800 hover:bg-navy-50"
            title="Clear agent filters"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </>
  )
}

export function AgentCell({ code }) {
  const { agents } = useDataStore()
  if (!code) return <span className="text-navy-300">—</span>
  const agent = findAgent(agents, code)
  return (
    <div className="leading-tight">
      <p className="text-navy-800 font-medium">
        {agent?.name || 'Unknown agent'}
        {agent && agent.status !== 'active' && <Badge status="disabled" className="ml-1.5 !px-1.5 !py-0 !text-[10px]">inactive</Badge>}
      </p>
      <p className="text-[11px] text-navy-400 font-mono">{code}{agent ? ` · ${agent.location}` : ''}</p>
    </div>
  )
}
