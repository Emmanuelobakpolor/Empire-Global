import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Lock, KeyRound } from 'lucide-react'
import AdminAuthShell from '../../components/admin/AdminAuthShell'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import LoadingState from '../../components/ui/LoadingState'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'

// Shown when a Super Admin set this admin's password: they must choose their own first
export default function AdminSetPassword() {
  const { admin, loading, changePassword, logout } = useAdminAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  if (loading) return <LoadingState label="Loading..." />
  if (!admin) return <Navigate to="/admin/login" replace />
  if (!admin.mustChangePassword) return <Navigate to="/admin/dashboard" replace />

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.current) errs.current = 'Enter the temporary password you were given.'
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
    showToast('Password set. Welcome to the admin console.', 'success')
    navigate('/admin/dashboard', { replace: true })
  }

  const handleSignOut = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <AdminAuthShell
      title="Choose Your Password"
      icon={KeyRound}
      subtitle={`Hi ${admin.fullName.split(' ')[0]}, your account was set up with a temporary password. Choose your own to continue.`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Temporary Password" type="password" icon={Lock} autoComplete="current-password" value={form.current} onChange={update('current')} error={errors.current} required />
        <Input
          label="New Password"
          type="password"
          icon={Lock}
          autoComplete="new-password"
          value={form.next}
          onChange={update('next')}
          error={errors.next}
          hint="At least 8 characters. Avoid common or all-number passwords."
          required
        />
        <Input label="Confirm New Password" type="password" icon={Lock} autoComplete="new-password" value={form.confirm} onChange={update('confirm')} error={errors.confirm} required />
        <Button type="submit" fullWidth loading={saving} size="lg">
          Set Password & Continue
        </Button>
        <button type="button" onClick={handleSignOut} className="text-xs font-semibold text-navy-500 hover:text-navy-800">
          Sign out
        </button>
      </form>
    </AdminAuthShell>
  )
}
