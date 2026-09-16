import { useState } from 'react'
import { User, Shield, Bell, SlidersHorizontal, Save } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'

const SECTIONS = [
  { id: 'general', label: 'General Settings', icon: SlidersHorizontal },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notification Preferences', icon: Bell },
]

export default function AdminSettings() {
  const { admin } = useAdminAuth()
  const { showToast } = useToast()
  const [active, setActive] = useState('general')
  const [saving, setSaving] = useState(false)

  const [general, setGeneral] = useState({ platformName: 'Empire Global', supportEmail: 'support@empireglobal.com', timezone: 'Africa/Lagos' })
  const [profile, setProfile] = useState({ fullName: admin?.fullName || '', email: admin?.email || '' })
  const [security, setSecurity] = useState({ current: '', next: '', confirm: '' })
  const [notifications, setNotifications] = useState({ paymentAlerts: true, newCustomer: true, weeklyDigest: false })

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 700))
    setSaving(false)
    showToast('Settings saved successfully.', 'success')
  }

  const toggleNotification = (key) => setNotifications((n) => ({ ...n, [key]: !n[key] }))

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure Empire Global admin console preferences." />

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
            {active === 'general' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-navy-800 mb-1">General Settings</h3>
                <Input label="Platform Name" value={general.platformName} onChange={(e) => setGeneral({ ...general, platformName: e.target.value })} />
                <Input label="Support Email" value={general.supportEmail} onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })} />
                <Select
                  label="Timezone"
                  value={general.timezone}
                  onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}
                  options={[{ value: 'Africa/Lagos', label: 'Africa/Lagos (WAT)' }, { value: 'UTC', label: 'UTC' }]}
                />
              </div>
            )}

            {active === 'profile' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-navy-800 mb-1">Profile</h3>
                <Input label="Full Name" icon={User} value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
                <Input label="Email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                <Input label="Role" value={admin?.role} disabled />
              </div>
            )}

            {active === 'security' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-navy-800 mb-1">Security</h3>
                <Input label="Current Password" type="password" value={security.current} onChange={(e) => setSecurity({ ...security, current: e.target.value })} />
                <Input label="New Password" type="password" value={security.next} onChange={(e) => setSecurity({ ...security, next: e.target.value })} />
                <Input label="Confirm New Password" type="password" value={security.confirm} onChange={(e) => setSecurity({ ...security, confirm: e.target.value })} />
              </div>
            )}

            {active === 'notifications' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-navy-800 mb-1">Notification Preferences</h3>
                {[
                  { key: 'paymentAlerts', label: 'Payment Alerts', desc: 'Get notified when a new payment needs verification.' },
                  { key: 'newCustomer', label: 'New Customer Signups', desc: 'Get notified when a new customer registers.' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Receive a weekly summary of platform activity.' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center justify-between py-2 cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-navy-800">{item.label}</p>
                      <p className="text-xs text-navy-400">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleNotification(item.key)}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${notifications[item.key] ? 'bg-emerald-500' : 'bg-navy-200'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </label>
                ))}
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-navy-50">
              <Button icon={Save} loading={saving} onClick={handleSave}>Save Changes</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
