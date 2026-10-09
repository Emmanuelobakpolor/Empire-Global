import { useEffect, useState } from 'react'
import { User, Shield, SlidersHorizontal, Save, Mail, Lock, Phone, Info, BadgeCheck } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import LoadingState from '../../components/ui/LoadingState'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'
import { setCachedPlatformSettings } from '../../hooks/usePlatformSettings'
import { api, failure } from '../../utils/api'

const SECTIONS = [
  { id: 'general', label: 'General Settings', icon: SlidersHorizontal },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
]

const TIMEZONE_OPTIONS = [
  { value: 'Africa/Lagos', label: 'Africa/Lagos (WAT)' },
  { value: 'UTC', label: 'UTC' },
]

const PASSWORD_HINT = 'At least 8 characters. Avoid common or all-number passwords.'

export default function AdminSettings() {
  const [active, setActive] = useState('general')

  return (
    <div>
      <PageHeader title="Settings" subtitle="Platform details and your own admin account." />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card padded={false} className="!p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  active === s.id ? 'bg-navy-900 text-white' : 'text-navy-600 hover:bg-navy-50'
                }`}
              >
                <s.icon size={16} />
                {s.label}
              </button>
            ))}
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            {active === 'general' && <GeneralSettings />}
            {active === 'profile' && <ProfileSettings />}
            {active === 'security' && <SecuritySettings />}
          </Card>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ title, description }) {
  return (
    <div className="mb-1">
      <h3 className="text-sm font-bold text-navy-800">{title}</h3>
      {description && <p className="text-xs text-navy-400 mt-1">{description}</p>}
    </div>
  )
}

function SaveBar({ saving, disabled, label = 'Save Changes' }) {
  return (
    <div className="mt-2 pt-5 border-t border-navy-50">
      <Button type="submit" icon={Save} loading={saving} disabled={disabled}>{label}</Button>
    </div>
  )
}

// Platform-wide details. Every admin can see them; only a Super Admin can change them.
function GeneralSettings() {
  const { isSuperAdmin } = useAdminAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    api('/admin/settings/')
      .then((data) => setForm(data.settings))
      .catch((err) => setLoadError(err.message))
  }, [])

  if (loadError) return <p className="text-sm text-red-500">{loadError}</p>
  if (!form) return <LoadingState label="Loading settings..." />

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    let result
    try {
      const { platformName, supportEmail, supportPhone, timezone } = form
      const data = await api('/admin/settings/', { method: 'PATCH', body: { platformName, supportEmail, supportPhone, timezone } })
      setForm(data.settings)
      setCachedPlatformSettings(data.settings)
      result = { success: true }
    } catch (err) {
      result = failure(err)
    }
    setSaving(false)
    setErrors(result.success ? {} : result.fieldErrors)
    if (!result.success) {
      if (!Object.keys(result.fieldErrors).length) showToast(result.error, 'error')
      return
    }
    showToast('Settings saved.', 'success')
  }

  const locked = !isSuperAdmin

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <SectionTitle title="General Settings" description="Shown to customers on the website and the Support page." />
      {locked && (
        <div className="flex items-start gap-2 bg-navy-50 text-navy-600 text-xs rounded-xl px-3.5 py-2.5">
          <Info size={15} className="mt-0.5 shrink-0" />
          <p>Only a Super Admin can change these settings.</p>
        </div>
      )}
      <Input label="Platform Name" value={form.platformName} onChange={update('platformName')} error={errors.platformName} disabled={locked} required />
      <Input label="Support Email" type="email" icon={Mail} value={form.supportEmail} onChange={update('supportEmail')} error={errors.supportEmail} disabled={locked} required />
      <Input label="Support Phone" icon={Phone} value={form.supportPhone} onChange={update('supportPhone')} error={errors.supportPhone} disabled={locked} required />
      <Select
        label="Timezone"
        value={form.timezone}
        onChange={update('timezone')}
        options={TIMEZONE_OPTIONS}
        error={errors.timezone}
        disabled={locked}
      />
      {!locked && <SaveBar saving={saving} />}
    </form>
  )
}

function ProfileSettings() {
  const { admin, updateProfile } = useAdminAuth()
  const { showToast } = useToast()
  const [fullName, setFullName] = useState(admin?.fullName || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setError('Full name is required.')
      return
    }
    setSaving(true)
    const result = await updateProfile({ fullName })
    setSaving(false)
    if (!result.success) {
      setError(result.fieldErrors.fullName || result.error)
      return
    }
    setError('')
    showToast('Profile updated.', 'success')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <SectionTitle title="Profile" description="Your name appears in the audit log and on payment reviews." />
      <Input label="Full Name" icon={User} value={fullName} onChange={(e) => setFullName(e.target.value)} error={error} required />
      <Input label="Email" icon={Mail} value={admin?.email || ''} disabled hint="Ask a Super Admin to change your email." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Role" icon={Shield} value={admin?.role || ''} disabled />
        <Input label="Admin ID" icon={BadgeCheck} value={admin?.id || ''} disabled />
      </div>
      <SaveBar saving={saving} disabled={fullName.trim() === admin?.fullName} />
    </form>
  )
}

const EMPTY_PASSWORDS = { current: '', next: '', confirm: '' }

function SecuritySettings() {
  const { changePassword } = useAdminAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState(EMPTY_PASSWORDS)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.current) errs.current = 'Enter your current password.'
    if (form.next.length < 8) errs.next = 'Password must be at least 8 characters.'
    if (form.confirm !== form.next) errs.confirm = 'Passwords do not match.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSaving(true)
    const result = await changePassword(form.current, form.next)
    setSaving(false)
    if (!result.success) {
      const { currentPassword, newPassword } = result.fieldErrors
      if (currentPassword || newPassword) setErrors({ current: currentPassword, next: newPassword })
      else showToast(result.error, 'error')
      return
    }
    setForm(EMPTY_PASSWORDS)
    showToast('Password changed. Other devices have been signed out.', 'success')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <SectionTitle title="Security" description="Changing your password signs you out on every other device." />
      <Input label="Current Password" type="password" icon={Lock} autoComplete="current-password" value={form.current} onChange={update('current')} error={errors.current} required />
      <Input label="New Password" type="password" icon={Lock} autoComplete="new-password" value={form.next} onChange={update('next')} error={errors.next} hint={PASSWORD_HINT} required />
      <Input label="Confirm New Password" type="password" icon={Lock} autoComplete="new-password" value={form.confirm} onChange={update('confirm')} error={errors.confirm} required />
      <SaveBar saving={saving} label="Update Password" />
    </form>
  )
}
