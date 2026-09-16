import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Table, { Tr, Td } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useDataStore } from '../../context/DataStoreContext'
import { formatDate } from '../../utils/formatDate'

export default function AuditLogs() {
  const { auditLogs } = useDataStore()
  const [selected, setSelected] = useState(null)

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="A record of administrative actions taken across the platform." />

      <Table columns={['Date', 'User', 'Action', 'Reference', 'Status']}>
        {auditLogs.map((log) => (
          <Tr key={log.id} className="cursor-pointer" onClick={() => setSelected(log)}>
            <Td>{formatDate(log.date, { withTime: true })}</Td>
            <Td>{log.user}</Td>
            <Td className="font-semibold text-navy-900">{log.action}</Td>
            <Td className="font-mono text-xs">{log.reference}</Td>
            <Td><Badge status={log.status}>{log.status}</Badge></Td>
          </Tr>
        ))}
      </Table>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.action} subtitle={selected && formatDate(selected.date, { withTime: true })}>
        {selected && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-navy-400">Performed by</span>
              <span className="font-semibold text-navy-900">{selected.user}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-400">Reference</span>
              <span className="font-semibold text-navy-900 font-mono">{selected.reference}</span>
            </div>
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
