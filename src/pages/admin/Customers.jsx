import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Eye, Ban, CheckCircle, MoreVertical } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Table, { Tr, Td } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useDataStore } from '../../context/DataStoreContext'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatDate'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending', label: 'Pending' },
]

export default function Customers() {
  const { customers, suspendCustomer } = useDataStore()
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [confirmTarget, setConfirmTarget] = useState(null)

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        !search ||
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = !statusFilter || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [customers, search, statusFilter])

  const handleToggleSuspend = () => {
    if (!confirmTarget) return
    suspendCustomer(confirmTarget.id)
    showToast(
      confirmTarget.status === 'suspended' ? 'Customer reactivated successfully.' : 'Customer suspended successfully.',
      'success'
    )
    setConfirmTarget(null)
  }

  return (
    <div>
      <PageHeader title="Customers" subtitle="Manage all registered Empire Global customers." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <Input placeholder="Search by name, email or ID..." icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} containerClassName="sm:col-span-2" />
        <Select placeholder="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={STATUS_OPTIONS} />
      </div>

      <Table columns={['Customer ID', 'Name', 'Email', 'Phone', 'Status', 'Joined', 'Actions']}>
        {filtered.map((c) => (
          <Tr key={c.id}>
            <Td className="font-mono text-xs">{c.id}</Td>
            <Td className="font-semibold text-navy-900">{c.fullName}</Td>
            <Td>{c.email}</Td>
            <Td>{c.phone}</Td>
            <Td><Badge status={c.status}>{c.status}</Badge></Td>
            <Td>{formatDate(c.joined)}</Td>
            <Td>
              <div className="flex items-center gap-1.5">
                <Link to={`/admin/customers/${c.id}`} className="p-1.5 rounded-lg text-navy-400 hover:text-navy-800 hover:bg-navy-50" title="View">
                  <Eye size={16} />
                </Link>
                <button
                  onClick={() => setConfirmTarget(c)}
                  className={`p-1.5 rounded-lg hover:bg-navy-50 ${c.status === 'suspended' ? 'text-emerald-500 hover:text-emerald-700' : 'text-red-400 hover:text-red-600'}`}
                  title={c.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                >
                  {c.status === 'suspended' ? <CheckCircle size={16} /> : <Ban size={16} />}
                </button>
              </div>
            </Td>
          </Tr>
        ))}
      </Table>

      <ConfirmDialog
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleToggleSuspend}
        title={confirmTarget?.status === 'suspended' ? 'Reactivate this customer?' : 'Suspend this customer?'}
        description={`This will ${confirmTarget?.status === 'suspended' ? 're-enable' : 'restrict'} ${confirmTarget?.fullName}'s account access.`}
        confirmLabel={confirmTarget?.status === 'suspended' ? 'Reactivate' : 'Suspend'}
        variant={confirmTarget?.status === 'suspended' ? 'accent' : 'danger'}
      />
    </div>
  )
}
