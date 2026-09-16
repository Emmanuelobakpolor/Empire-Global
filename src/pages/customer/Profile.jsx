import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, LogOut, ShieldCheck, Calendar, BadgeCheck } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatDate'

export default function Profile() {
  const { user, updateProfile, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '' })
  const [saving, setSaving] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    await new Promise((r) => setTimeout(r, 700))
    updateProfile(form)
    setSaving(false)
    showToast('Profile updated successfully.', 'success')
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    if (!passwordForm.next || passwordForm.next !== passwordForm.confirm) {
      showToast('Passwords do not match.', 'error')
      return
    }
    setPasswordOpen(false)
    setPasswordForm({ current: '', next: '', confirm: '' })
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
              <Input label="Email" icon={Mail} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Phone Number" icon={Phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <div>
                <Button type="submit" loading={saving}>Save Changes</Button>
              </div>
            </form>
          </Card>

          <Card>
            <h3 className="text-sm font-bold text-navy-800 mb-4">Security</h3>
            <div className="flex flex-col divide-y divide-navy-50">
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
          <Card>
            <div className="flex flex-col items-center text-center pb-5 mb-5 border-b border-navy-50">
              <span className="w-16 h-16 rounded-full bg-navy-900 text-white flex items-center justify-center text-lg font-bold mb-3">
                {(user?.fullName || 'U').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
              </span>
              <p className="font-bold text-navy-900">{user?.fullName}</p>
              <p className="text-xs text-navy-400">{user?.email}</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-400 flex items-center gap-1.5"><BadgeCheck size={14} /> Customer ID</span>
                <span className="font-semibold text-navy-900">{user?.id}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-400 flex items-center gap-1.5"><ShieldCheck size={14} /> Account Status</span>
                <Badge status={user?.status || 'active'}>{user?.status || 'active'}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-400 flex items-center gap-1.5"><Calendar size={14} /> Member Since</span>
                <span className="font-semibold text-navy-900">{formatDate(user?.joined)}</span>
              </div>
            </div>
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

      <Modal open={passwordOpen} onClose={() => setPasswordOpen(false)} title="Change Password">
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <Input label="Current Password" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} />
          <Input label="New Password" type="password" value={passwordForm.next} onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })} />
          <Input label="Confirm New Password" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
          <Button type="submit" fullWidth>Update Password</Button>
        </form>
      </Modal>
    </div>
  )
}
