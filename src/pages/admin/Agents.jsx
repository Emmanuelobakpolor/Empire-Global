import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus, Pencil, Power, Users, User, Phone, MapPin, BadgeCheck } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Table, { Tr, Td } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { useDataStore } from '../../context/DataStoreContext'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatDate'
import { nextAgentCode } from '../../data/agents'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const EMPTY_FORM = { name: '', phone: '', location: '' }

export default function Agents() {
  const { agents, customers, createAgent, updateAgent, toggleAgentStatus } = useDataStore()
  const { showToast } = useToast()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  // null = closed, 'new' = creating, otherwise the agent being edited
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [statusTarget, setStatusTarget] = useState(null)
  const [busy, setBusy] = useState(false)

  const customerCount = useMemo(() => {
    const counts = {}
    customers.forEach((c) => {
      if (c.agentCode) counts[c.agentCode] = (counts[c.agentCode] || 0) + 1
    })
    return counts
  }, [customers])

  const locations = useMemo(() => [...new Set(agents.map((a) => a.location))].sort(), [agents])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return agents.filter((a) => {
      const matchesSearch =
        !q || a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.location.toLowerCase().includes(q) || a.phone.includes(q)
      const matchesStatus = !statusFilter || statusFilter === 'all' || a.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [agents, search, statusFilter])

  const isNew = editing === 'new'

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setEditing('new')
  }

  const openEdit = (a) => {
    setForm({ name: a.name, phone: a.phone, location: a.location })
    setErrors({})
    setEditing(a)
  }

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = async () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Agent name is required.'
    if (!form.phone.trim()) errs.phone = 'Phone number is required.'
    if (!form.location.trim()) errs.location = 'Location is required.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setBusy(true)
    const result = isNew ? await createAgent(form) : await updateAgent(editing.code, form)
    setBusy(false)
    if (!result.success) {
      if (Object.keys(result.fieldErrors).length) setErrors(result.fieldErrors)
      else showToast(result.error, 'error')
      return
    }
    showToast(isNew ? `Agent created with code ${result.agent.code}.` : 'Agent updated.', 'success')
    setEditing(null)
  }

  const handleToggleStatus = async () => {
    setBusy(true)
    const result = await toggleAgentStatus(statusTarget.code)
    setBusy(false)
    if (result.success) showToast(statusTarget.status === 'active' ? 'Agent deactivated.' : 'Agent activated.', 'success')
    else showToast(result.error, 'error')
    setStatusTarget(null)
  }

  return (
    <div>
      <PageHeader
        title="Agents"
        subtitle="Create and manage the agents customers register under."
        actions={<Button icon={UserPlus} onClick={openCreate}>Add Agent</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <Input placeholder="Search code, name, location or phone..." icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} containerClassName="sm:col-span-2" />
        <Select placeholder="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={STATUS_OPTIONS} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BadgeCheck} title="No agents found" />
      ) : (
        <Table columns={['Agent Code', 'Name', 'Phone', 'Location', 'Customers', 'Status', 'Created', 'Actions']}>
          {filtered.map((a) => (
            <Tr key={a.code}>
              <Td className="font-mono text-xs font-semibold">{a.code}</Td>
              <Td className="font-semibold text-navy-900">{a.name}</Td>
              <Td>{a.phone}</Td>
              <Td>{a.location}</Td>
              <Td>
                <Link
                  to={`/admin/customers?agent=${a.code}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  title="View this agent's customers"
                >
                  <Users size={14} /> {customerCount[a.code] || 0}
                </Link>
              </Td>
              <Td><Badge status={a.status === 'active' ? 'active' : 'disabled'}>{a.status}</Badge></Td>
              <Td>{formatDate(a.createdAt)}</Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-navy-400 hover:text-navy-800 hover:bg-navy-50" title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setStatusTarget(a)}
                    className={`p-1.5 rounded-lg hover:bg-navy-50 ${a.status === 'active' ? 'text-amber-500 hover:text-amber-700' : 'text-emerald-500 hover:text-emerald-700'}`}
                    title={a.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <Power size={16} />
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={isNew ? 'Add Agent' : 'Edit Agent'}
        subtitle={
          isNew
            ? `This agent will get code ${nextAgentCode(agents)}. Customers enter it when they register.`
            : `Agent code ${editing?.code} can't be changed, since customers are already linked to it.`
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} loading={busy}>{isNew ? 'Create Agent' : 'Save Changes'}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Full Name" icon={User} placeholder="e.g. Kunle Adebayo" value={form.name} onChange={update('name')} error={errors.name} required />
          <Input label="Phone Number" icon={Phone} placeholder="+234 800 000 0000" value={form.phone} onChange={update('phone')} error={errors.phone} required />
          <Input
            label="Location"
            icon={MapPin}
            placeholder="e.g. Ikorodu, Lagos"
            value={form.location}
            onChange={update('location')}
            error={errors.location}
            list="agent-locations"
            hint="Pick an existing location or type a new one."
            required
          />
          <datalist id="agent-locations">
            {locations.map((l) => <option key={l} value={l} />)}
          </datalist>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleToggleStatus}
        title={statusTarget?.status === 'active' ? 'Deactivate this agent?' : 'Activate this agent?'}
        description={
          statusTarget?.status === 'active'
            ? `New customers won't be able to register with code ${statusTarget?.code}. Existing customers stay linked to ${statusTarget?.name}.`
            : `Customers will be able to register with code ${statusTarget?.code} again.`
        }
        confirmLabel={statusTarget?.status === 'active' ? 'Deactivate' : 'Activate'}
        variant={statusTarget?.status === 'active' ? 'danger' : 'accent'}
        loading={busy}
      />
    </div>
  )
}
