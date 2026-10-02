import { useMemo, useState } from 'react'
import { Search, ScrollText } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import Table, { Tr, Td } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import AgentFilter, { AgentCell, useAgentFilter } from '../../components/admin/AgentFilter'
import { useDataStore } from '../../context/DataStoreContext'
import { formatDate } from '../../utils/formatDate'

export default function AuditLogs() {
  const { auditLogs } = useDataStore()
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const agentFilter = useAgentFilter()

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return auditLogs.filter((log) => {
      const matchesSearch =
        !q ||
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        String(log.reference).toLowerCase().includes(q) ||
        agentFilter.searchMatches(log.agentCode, search)
      return matchesSearch && agentFilter.matches(log.agentCode)
    })
  }, [auditLogs, search, agentFilter])

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="A record of administrative actions taken across the platform." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <Input placeholder="Search admin, action, reference or agent..." icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} />
        <AgentFilter filter={agentFilter} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ScrollText} title="No activity found" />
      ) : (
        <Table columns={['Date', 'User', 'Action', 'Reference', 'Agent', 'Status']}>
          {filtered.map((log) => (
            <Tr key={log.id} className="cursor-pointer" onClick={() => setSelected(log)}>
              <Td>{formatDate(log.date, { withTime: true })}</Td>
              <Td>
                <p className="text-navy-800">{log.user}</p>
                {log.role && <p className="text-[11px] text-navy-400">{log.role}</p>}
              </Td>
              <Td className="font-semibold text-navy-900">{log.action}</Td>
              <Td className="font-mono text-xs">{log.reference}</Td>
              <Td><AgentCell code={log.agentCode} /></Td>
              <Td><Badge status={log.status}>{log.status}</Badge></Td>
            </Tr>
          ))}
        </Table>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.action} subtitle={selected && formatDate(selected.date, { withTime: true })}>
        {selected && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-navy-400">Performed by</span>
              <span className="font-semibold text-navy-900">
                {selected.user}{selected.role ? ` (${selected.role})` : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-400">Reference</span>
              <span className="font-semibold text-navy-900 font-mono">{selected.reference}</span>
            </div>
            {selected.agentCode && (
              <div className="flex justify-between">
                <span className="text-navy-400">Agent</span>
                <div className="text-right"><AgentCell code={selected.agentCode} /></div>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-navy-400">Status</span>
              <Badge status={selected.status}>{selected.status}</Badge>
            </div>
            <div className="pt-3 border-t border-navy-50">
              <p className="text-navy-400 mb-1">Details</p>
              <p className="text-navy-700">{selected.details}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
