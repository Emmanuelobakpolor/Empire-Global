import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { AjoPlanFields, EMPTY_AJO_PLAN, ajoPlanBody } from './AjoPlanForm'
import { useDataStore } from '../../context/DataStoreContext'
import { useToast } from '../../context/ToastContext'

const EMPTY = { firstName: '', lastName: '', phone: '', email: '', agentCode: '' }

// Staff register a customer, e.g. someone joining Ajo who pays cash. Without an email they have no
// app access; staff record their contributions and can print their statement for them.
export default function RegisterCustomerModal({ open, onClose }) {
  const { registerCustomer } = useDataStore()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [withAjo, setWithAjo] = useState(true)
  const [plan, setPlan] = useState(EMPTY_AJO_PLAN)
  const [errors, setErrors] = useState({})
  const [planErrors, setPlanErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(EMPTY)
      setPlan(EMPTY_AJO_PLAN)
      setWithAjo(true)
      setErrors({})
      setPlanErrors({})
    }
  }, [open])

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const submit = async () => {
    const missing = {}
    if (!form.firstName.trim()) missing.firstName = 'First name is required.'
    if (!form.lastName.trim()) missing.lastName = 'Last name is required.'
    if (!form.phone.trim()) missing.phone = 'Phone number is required.'
    setErrors(missing)
    if (Object.keys(missing).length) return

    setSaving(true)
    const result = await registerCustomer({
      fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
      phone: form.phone.trim(),
      email: form.email.trim(),
      agentCode: form.agentCode.trim(),
      ...(withAjo && { ajo: ajoPlanBody(plan) }),
    })
    setSaving(false)
    if (!result.success) {
      const fields = result.fieldErrors || {}
      setErrors({ ...fields, firstName: fields.fullName })
      // Plan errors come back under `ajo`
      const ajo = result.data?.ajo || {}
      setPlanErrors(Object.fromEntries(Object.entries(ajo).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])))
      showToast(result.error, 'error')
      return
    }
    showToast(`${result.customer.fullName} registered${result.transaction ? ' and their Ajo plan started' : ''}.`, 'success')
    onClose()
    navigate(result.transaction ? `/admin/ajo/${result.transaction.id}` : `/admin/customers/${result.customer.id}`)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Register Customer"
      subtitle="For customers who join through our staff"
      size="xl"
      footer={(
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="accent" onClick={submit} loading={saving}>{withAjo ? 'Register & Start Ajo' : 'Register Customer'}</Button>
        </>
      )}
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="First Name" value={form.firstName} onChange={set('firstName')} error={errors.firstName} required />
          <Input label="Last Name" value={form.lastName} onChange={set('lastName')} error={errors.lastName} required />
          <Input label="Phone Number" inputMode="tel" value={form.phone} onChange={set('phone')} error={errors.phone} required />
          <Input
            label="Email (optional)"
            type="email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            hint="Leave blank if they won’t use the app."
          />
          <Input label="Agent Code (optional)" value={form.agentCode} onChange={set('agentCode')} error={errors.agentCode} />
        </div>

        <div className="border-t border-navy-50 pt-5">
          <label className="flex items-center gap-2 text-sm font-semibold text-navy-800 cursor-pointer mb-4">
            <input type="checkbox" checked={withAjo} onChange={(e) => setWithAjo(e.target.checked)} className="w-4 h-4 rounded accent-emerald-500" />
            Start an Ajo plan for them now
          </label>
          {withAjo && <AjoPlanFields value={plan} onChange={setPlan} errors={planErrors} />}
        </div>
      </div>
    </Modal>
  )
}
