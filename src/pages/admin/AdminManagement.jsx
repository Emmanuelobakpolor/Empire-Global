import { useEffect, useMemo, useState } from 'react'
import { Search, UserPlus, Pencil, Trash2, Power, User, Mail, Lock, ShieldCheck } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Table, { Tr, Td } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import LoadingState from '../../components/ui/LoadingState'
import { useDataStore } from '../../context/DataStoreContext'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatDate'
import { ROLES } from '../../data/admins'

const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: 'Admin — can view and recommend payment slips' },
  { value: ROLES.SUPER_ADMIN, label: 'Super Admin — final approval and admin management' },
]

const EMPTY_FORM = { fullName: '', email: '', role: ROLES.ADMIN, password: '' }

export default function AdminManagement() {
  const { admins, refreshAdmins, createAdmin, updateAdmin, toggleAdminStatus, deleteAdmin } = useDataStore()
  const { admin: currentAdmin } = useAdminAuth()
  const { showToast } = useToast()

  const [search, setSearch] = useState('')
  // null = closed, 'new' = creating, otherwise the admin being edited
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [statusTarget, setStatusTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    refreshAdmins().then((result) => {
      if (!result.success) showToast(result.error, 'error')
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return admins.filter((a) => !q || a.fullName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.role.toLowerCase().includes(q))
  }, [admins, search])

  const isNew = editing === 'new'
  const editingSelf = !isNew && editing?.id === currentAdmin?.id

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setEditing('new')
  }

  const openEdit = (a) => {
    setForm({ fullName: a.fullName, email: a.email, role: a.role, password: '' })
    setErrors({})
    setEditing(a)
  }

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = async () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.'
    if (!form.email.trim()) errs.email = 'Email is required.'
    if (isNew && !form.password) errs.password = 'A temporary password is required.'
    if (form.password && form.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setBusy(true)
    const result = isNew ? await createAdmin(form) : await updateAdmin(editing.id, form)
    setBusy(false)
    if (!result.success) {
      // The server checks for duplicate emails and weak passwords
      if (Object.keys(result.fieldErrors).length) setErrors(result.fieldErrors)
      else showToast(result.error, 'error')
      return
    }
    showToast(isNew ? 'Admin account created.' : 'Admin account updated.', 'success')
    setEditing(null)
  }

  const handleToggleStatus = async () => {
    setBusy(true)
    const result = await toggleAdminStatus(statusTarget.id)
    setBusy(false)
    if (result.success) showToast(statusTarget.status === 'active' ? 'Admin deactivated.' : 'Admin activated.', 'success')
    else showToast(result.error, 'error')
    setStatusTarget(null)
  }

  const handleDelete = async () => {
    setBusy(true)
    const result = await deleteAdmin(deleteTarget.id)
    setBusy(false)
    if (result.success) showToast('Admin account deleted.', 'success')
    else showToast(result.error, 'error')
    setDeleteTarget(null)
  }

  return (
    <div>
      <PageHeader
        title="Admin Management"
        subtitle="Create, edit, activate or deactivate, and delete admin accounts."
        actions={<Button icon={UserPlus} onClick={openCreate}>Add Admin</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <Input placeholder="Search by name, email or role..." icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} containerClassName="sm:col-span-2" />
      </div>

      {loading ? <LoadingState label="Loading admin accounts..." /> : (
      <Table columns={['Admin ID', 'Name', 'Email', 'Role', 'Status', 'Created', 'Actions']}>
        {filtered.map((a) => {
          const isSelf = a.id === currentAdmin?.id
          return (
            <Tr key={a.id}>
              <Td className="font-mono text-xs">{a.id}</Td>
              <Td className="font-semibold text-navy-900">
                {a.fullName}
                {isSelf && <span className="ml-1.5 text-xs font-normal text-navy-400">(you)</span>}
              </Td>
              <Td>{a.email}</Td>
              <Td>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 ${a.role === ROLES.SUPER_ADMIN ? 'bg-navy-900 text-white' : 'bg-navy-50 text-navy-600'}`}>
                  {a.role === ROLES.SUPER_ADMIN && <ShieldCheck size={12} />}
                  {a.role}
                </span>
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
                    disabled={isSelf}
                    className={`p-1.5 rounded-lg hover:bg-navy-50 disabled:opacity-30 disabled:cursor-not-allowed ${a.status === 'active' ? 'text-amber-500 hover:text-amber-700' : 'text-emerald-500 hover:text-emerald-700'}`}
                    title={isSelf ? "You can't deactivate your own account" : a.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <Power size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(a)}
                    disabled={isSelf}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-navy-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    title={isSelf ? "You can't delete your own account" : 'Delete'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Td>
            </Tr>
          )
        })}
      </Table>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={isNew ? 'Add Admin' : 'Edit Admin'}
        subtitle={isNew ? 'The new admin can log in with this email and temporary password.' : 'Update this admin’s details or role.'}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} loading={busy}>{isNew ? 'Create Admin' : 'Save Changes'}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Full Name" icon={User} value={form.fullName} onChange={update('fullName')} error={errors.fullName} required />
          <Input label="Email" type="email" icon={Mail} value={form.email} onChange={update('email')} error={errors.email} required />
          <Select
            label="Role"
            value={form.role}
            onChange={update('role')}
            options={ROLE_OPTIONS}
            disabled={editingSelf}
            hint={editingSelf ? "You can't change your own role." : undefined}
            required
          />
          <Input
            label={isNew ? 'Temporary Password' : 'New Password'}
            type="password"
            icon={Lock}
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            hint={isNew ? 'At least 8 characters. Avoid common or all-number passwords.' : 'Leave blank to keep the current password. Changing it signs this admin out.'}
            required={isNew}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleToggleStatus}
        title={statusTarget?.status === 'active' ? 'Deactivate this admin?' : 'Activate this admin?'}
        description={
          statusTarget?.status === 'active'
            ? `${statusTarget?.fullName} will be signed out and won't be able to log in until reactivated.`
            : `${statusTarget?.fullName} will be able to log in again.`
        }
        confirmLabel={statusTarget?.status === 'active' ? 'Deactivate' : 'Activate'}
        loading={busy}
        variant={statusTarget?.status === 'active' ? 'danger' : 'accent'}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this admin?"
        description={`${deleteTarget?.fullName}'s account will be permanently removed. Their past actions stay in the audit log.`}
        confirmLabel="Delete"
        variant="danger"
        loading={busy}
      />
    </div>
  )
}
