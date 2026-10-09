import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, LogOut, ShieldCheck, Calendar, BadgeCheck, Copy, Check } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Modal from '../../components/ui/Modal'
import ChangeEmailModal from '../../components/customer/ChangeEmailModal'
import AvatarUploader from '../../components/ui/AvatarUploader'
import { useAuth } from '../../context/AuthContext'
import { useDataStore } from '../../context/DataStoreContext'
import { NextOfKinForm, EMPTY_NEXT_OF_KIN, nextOfKinErrors } from '../../components/customer/ApplicationForms'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatDate'
import { copyText } from '../../utils/clipboard'

export default function Profile() {
  const { user, updateProfile, changePassword, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' })
  const [emailOpen, setEmailOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [copied, setCopied] = useState(false)

  const copyCustomerId = async () => {
    if (!(await copyText(user.id))) {
      showToast("Couldn't copy. Please copy the ID manually.", 'error')
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const [changingPassword, setChangingPassword] = useState(false)

  const { customers, updateCustomer } = useDataStore()
  const savedNextOfKin = customers.find((c) => c.id === user?.id)?.nextOfKin || user?.nextOfKin
  const [nextOfKin, setNextOfKin] = useState(savedNextOfKin || EMPTY_NEXT_OF_KIN)
  const [nokErrors, setNokErrors] = useState({})
  const [savingNok, setSavingNok] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const result = await updateProfile({ fullName: form.fullName, phone: form.phone })
    setSaving(false)
    if (result.success) showToast('Profile updated successfully.', 'success')
    else showToast(result.error, 'error')
  }

  const handleSaveNextOfKin = async (e) => {
    e.preventDefault()
    const errs = nextOfKinErrors(nextOfKin)
    setNokErrors(errs)
    if (Object.keys(errs).length) return
    setSavingNok(true)
    const result = await updateProfile({ nextOfKin })
    setSavingNok(false)
    if (!result.success) {
      showToast(result.error, 'error')
      return
    }
    updateCustomer(user.id, { nextOfKin })
    showToast('Next of kin saved.', 'success')
  }

  const closePasswordModal = () => {
    setPasswordOpen(false)
    setPasswordForm({ current: '', next: '', confirm: '' })
    setPasswordErrors({})
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!passwordForm.current) {
      setPasswordErrors({ current: 'Enter your current password.' })
      return
    }
    if (!passwordForm.next || passwordForm.next !== passwordForm.confirm) {
      setPasswordErrors({ confirm: 'Passwords do not match.' })
      return
    }
    setChangingPassword(true)
    const result = await changePassword(passwordForm.current, passwordForm.next)
    setChangingPassword(false)
    if (!result.success) {
      const { currentPassword, newPassword } = result.fieldErrors
      if (currentPassword || newPassword) setPasswordErrors({ current: currentPassword, next: newPassword })
      else showToast(result.error, 'error')
      return
    }
    closePasswordModal()
    showToast('Password changed successfully.', 'success')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Profile" subtitle="Manage your personal information and account security." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <h3 className="text-sm font-bold text-navy-800 mb-5">Personal Information</h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <Input label="Full Name" icon={User} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <div className="flex items-end gap-2">
                <Input label="Email" icon={Mail} type="email" value={user?.email || ''} readOnly disabled containerClassName="flex-1" />
                <Button variant="outline" onClick={() => setEmailOpen(true)} className="shrink-0">Change</Button>
              </div>
              <Input label="Phone Number" icon={Phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <div>
                <Button type="submit" loading={saving}>Save Changes</Button>
              </div>
            </form>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3 mb-1">
              <h3 className="text-sm font-bold text-navy-800">Next of Kin</h3>
              {!savedNextOfKin && <Badge status="pending">Not provided</Badge>}
            </div>
            <p className="text-xs text-navy-400 mb-5">Required for Savings and Investment plans.</p>
            <form onSubmit={handleSaveNextOfKin} className="flex flex-col gap-4">
              <NextOfKinForm value={nextOfKin} onChange={setNextOfKin} errors={nokErrors} />
              <div>
                <Button type="submit" loading={savingNok}>Save Next of Kin</Button>
              </div>
            </form>
          </Card>

          <Card>
            <h3 className="text-sm font-bold text-navy-800 mb-4">Security</h3>
            <div className="flex flex-col divide-y divide-navy-50">
              {user?.hasPassword === false ? (
                <div className="flex items-center gap-3 py-3.5">
                  <span className="w-9 h-9 rounded-lg bg-navy-50 text-navy-600 flex items-center justify-center shrink-0"><Lock size={16} /></span>
                  <div>
                    <p className="text-sm font-semibold text-navy-800">Signed in with Google</p>
                    <p className="text-xs text-navy-400">
                      Your account has no password. To also sign in with email and password, use “Forgot password” on the login page.
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setPasswordOpen(true)}
                  className="flex items-center justify-between py-3.5 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-navy-50 text-navy-600 flex items-center justify-center"><Lock size={16} /></span>
                    <div>
                      <p className="text-sm font-semibold text-navy-800">Change Password</p>
                      <p className="text-xs text-navy-400">Update your account password</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">Change</span>
                </button>
              )}
              <button
                onClick={() => setLogoutOpen(true)}
                className="flex items-center justify-between py-3.5 text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center"><LogOut size={16} /></span>
                  <div>
                    <p className="text-sm font-semibold text-navy-800">Logout</p>
                    <p className="text-xs text-navy-400">Sign out of your account</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-red-500">Logout</span>
              </button>
            </div>
          </Card>
        </div>

        <div>
          <Card padded={false} className="overflow-hidden">
            <div className="relative flex flex-col items-center text-center px-6 pt-8 pb-6 bg-gradient-to-b from-navy-50/60 to-transparent">
              <div className="relative mb-3">
                <span className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-20 blur-md" />
                <AvatarUploader className="relative w-[84px] h-[84px] bg-gradient-to-br from-navy-800 to-navy-950 text-white text-2xl" />
              </div>
              <p className="font-bold text-navy-900 text-base">{user?.fullName}</p>
              <p className="text-xs text-navy-400 mt-0.5">{user?.email}</p>
            </div>

            <dl className="flex flex-col divide-y divide-navy-50 border-t border-navy-50">
              <DetailRow icon={BadgeCheck} label="Customer ID">
                <span className="flex items-center gap-1.5">
                  <span className="font-mono font-semibold text-navy-900 text-sm tracking-wide">{user?.id}</span>
                  <button
                    type="button"
                    onClick={copyCustomerId}
                    className="p-1 rounded-md text-navy-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    aria-label="Copy customer ID"
                    title="Copy customer ID"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </span>
              </DetailRow>
              <DetailRow icon={ShieldCheck} label="Account Status">
                <Badge status={user?.status || 'active'}>{user?.status || 'active'}</Badge>
              </DetailRow>
              <DetailRow icon={Calendar} label="Member Since">
                <span className="font-semibold text-navy-900 text-sm">{formatDate(user?.joined)}</span>
              </DetailRow>
            </dl>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        title="Log out of Empire Global?"
        description="You will need to log in again to access your dashboard."
        confirmLabel="Logout"
      />

      <ChangeEmailModal open={emailOpen} onClose={() => setEmailOpen(false)} />

      <Modal open={passwordOpen} onClose={closePasswordModal} title="Change Password">
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <Input label="Current Password" type="password" autoComplete="current-password" value={passwordForm.current} error={passwordErrors.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} />
          <Input label="New Password" type="password" autoComplete="new-password" value={passwordForm.next} error={passwordErrors.next} hint="At least 8 characters. Avoid common or all-number passwords." onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })} />
          <Input label="Confirm New Password" type="password" autoComplete="new-password" value={passwordForm.confirm} error={passwordErrors.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
          <Button type="submit" fullWidth loading={changingPassword}>Update Password</Button>
        </form>
      </Modal>
    </div>
  )
}

// One line of the account summary: icon, then the label above its value
function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <span className="w-9 h-9 rounded-xl bg-navy-50 text-navy-500 flex items-center justify-center shrink-0">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-medium uppercase tracking-wider text-navy-400">{label}</dt>
        <dd className="mt-0.5">{children}</dd>
      </div>
    </div>
  )
}
