import { useState } from 'react'
import { Landmark, Plus, Pencil, Power, Trash2, ArrowRight } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { useDataStore } from '../../context/DataStoreContext'
import { useToast } from '../../context/ToastContext'
import { FACILITIES, facilityLabel, resolveBankAccount } from '../../data/bankAccounts'

const EMPTY_FORM = { bankName: '', accountName: '', accountNumber: '', notes: '' }
const USE_DEFAULT = 'use-default'

export default function BankDetailsPage() {
  const {
    bankAccounts, accountAssignments,
    addBankAccount, updateBankAccount, toggleBankAccountStatus, removeBankAccount, assignBankAccount,
  } = useDataStore()
  const { showToast } = useToast()

  // null = closed, 'new' = creating, otherwise the account being edited
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [statusTarget, setStatusTarget] = useState(null)
  const [removeTarget, setRemoveTarget] = useState(null)

  const isNew = editing === 'new'
  const activeAccounts = bankAccounts.filter((a) => a.status === 'active')
  const facilitiesUsing = (id) => Object.entries(accountAssignments).filter(([, accId]) => accId === id).map(([f]) => facilityLabel(f))

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setEditing('new')
  }

  const openEdit = (a) => {
    setForm({ bankName: a.bankName, accountName: a.accountName, accountNumber: a.accountNumber, notes: a.notes || '' })
    setErrors({})
    setEditing(a)
  }

  const handleSave = () => {
    const errs = {}
    if (!form.bankName.trim()) errs.bankName = 'Bank name is required.'
    if (!form.accountName.trim()) errs.accountName = 'Account name is required.'
    if (!/^\d{10}$/.test(form.accountNumber.trim())) errs.accountNumber = 'Enter a 10-digit account number.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    if (isNew) addBankAccount(form)
    else updateBankAccount(editing.id, form)
    showToast(isNew ? 'Bank account added.' : 'Bank account updated.', 'success')
    setEditing(null)
  }

  const handleAssign = (facility, value) => {
    assignBankAccount(facility, value === USE_DEFAULT ? '' : value, facilityLabel(facility))
    showToast(`${facilityLabel(facility)} account updated.`, 'success')
  }

  const accountOptions = (facility) => [
    ...(facility === 'default' ? [] : [{ value: USE_DEFAULT, label: 'Use default account' }]),
    ...activeAccounts.map((a) => ({ value: a.id, label: `${a.bankName} · ${a.accountNumber}` })),
  ]

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Bank Accounts"
        subtitle="Manage the accounts customers pay into, and choose which account each facility uses."
        actions={<Button icon={Plus} onClick={openCreate}>Add Account</Button>}
      />

      {/* ---- Accounts ---- */}
      <h3 className="text-sm font-bold text-navy-800 mb-3">Collection Accounts</h3>
      {bankAccounts.length === 0 ? (
        <EmptyState icon={Landmark} title="No bank accounts yet" description="Add an account so customers know where to pay." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {bankAccounts.map((a) => {
            const usedBy = facilitiesUsing(a.id)
            return (
              <Card key={a.id} className={a.status === 'active' ? '' : 'opacity-70'}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-navy-900 text-emerald-400 flex items-center justify-center shrink-0">
                      <Landmark size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-navy-900 truncate">{a.bankName}</p>
                      <p className="text-xs text-navy-400 truncate">{a.accountName}</p>
                    </div>
                  </div>
                  <Badge status={a.status === 'active' ? 'active' : 'disabled'}>{a.status}</Badge>
                </div>
                <p className="font-mono text-lg font-bold text-navy-900 tracking-wide">{a.accountNumber}</p>
                {a.notes && <p className="text-xs text-navy-500 mt-1">{a.notes}</p>}
                <p className="text-xs text-navy-400 mt-3">
                  {usedBy.length ? <>Used for: <span className="font-semibold text-navy-600">{usedBy.join(', ')}</span></> : 'Not assigned to any facility'}
                </p>
                <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-navy-50">
                  <Button size="sm" variant="outline" icon={Pencil} onClick={() => openEdit(a)}>Edit</Button>
                  <Button size="sm" variant="outline" icon={Power} onClick={() => setStatusTarget(a)}>
                    {a.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                  <button
                    onClick={() => setRemoveTarget(a)}
                    className="ml-auto p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                    title="Remove account"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ---- Facility mapping ---- */}
      <h3 className="text-sm font-bold text-navy-800 mb-1">Account per Facility</h3>
      <p className="text-xs text-navy-400 mb-3">Customers see the account mapped to the facility they're paying for.</p>
      <Card padded={false} className="divide-y divide-navy-50">
        {FACILITIES.map((f) => {
          const mapped = accountAssignments[f.value]
          const mappedActive = activeAccounts.some((a) => a.id === mapped)
          const effective = resolveBankAccount(bankAccounts, accountAssignments, f.value)
          return (
            <div key={f.value} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
              <div className="sm:w-56 shrink-0">
                <p className="text-sm font-semibold text-navy-900">{f.label}</p>
                <p className="text-xs text-navy-400 flex items-center gap-1 mt-0.5">
                  <ArrowRight size={11} />
                  {effective ? `${effective.bankName} · ${effective.accountNumber}` : 'No active account — customers can’t pay'}
                </p>
              </div>
              <Select
                placeholder={f.value === 'default' ? 'Choose the default account' : 'Choose an account'}
                value={mappedActive ? mapped : f.value === 'default' ? '' : USE_DEFAULT}
                onChange={(e) => handleAssign(f.value, e.target.value)}
                options={accountOptions(f.value)}
                containerClassName="flex-1"
              />
            </div>
          )
        })}
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={isNew ? 'Add Bank Account' : 'Edit Bank Account'}
        subtitle={isNew ? 'After adding it, assign the account to one or more facilities below.' : 'Changes apply to new payment instructions straight away.'}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave}>{isNew ? 'Add Account' : 'Save Changes'}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Bank Name" placeholder="e.g. Zenith Bank" value={form.bankName} onChange={update('bankName')} error={errors.bankName} required />
          <Input label="Account Name" placeholder="e.g. EMPIRE GLOBAL LTD" value={form.accountName} onChange={update('accountName')} error={errors.accountName} required />
          <Input label="Account Number" placeholder="10 digits" inputMode="numeric" maxLength={10} value={form.accountNumber} onChange={update('accountNumber')} error={errors.accountNumber} required />
          <Input label="Reference Notes" placeholder="e.g. Use transaction reference as narration" value={form.notes} onChange={update('notes')} hint="Optional. Shown to customers with the payment instructions." />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={() => {
          toggleBankAccountStatus(statusTarget.id)
          showToast(statusTarget.status === 'active' ? 'Bank account deactivated.' : 'Bank account activated.', 'success')
          setStatusTarget(null)
        }}
        title={statusTarget?.status === 'active' ? 'Deactivate this account?' : 'Activate this account?'}
        description={
          statusTarget?.status === 'active'
            ? `Customers will stop seeing ${statusTarget?.bankName} · ${statusTarget?.accountNumber}. Facilities using it will fall back to the default account.`
            : `${statusTarget?.bankName} · ${statusTarget?.accountNumber} can be used for payments again.`
        }
        confirmLabel={statusTarget?.status === 'active' ? 'Deactivate' : 'Activate'}
        variant={statusTarget?.status === 'active' ? 'danger' : 'accent'}
      />

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => {
          removeBankAccount(removeTarget.id)
          showToast('Bank account removed.', 'success')
          setRemoveTarget(null)
        }}
        title="Remove this account?"
        description={`${removeTarget?.bankName} · ${removeTarget?.accountNumber} will be deleted and unassigned from all facilities. Past transactions keep the details they were paid to.`}
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  )
}
