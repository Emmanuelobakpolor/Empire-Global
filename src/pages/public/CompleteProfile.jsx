import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Mail, User, Phone, BadgeCheck, CheckCircle2 } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function CompleteProfile() {
  const { state } = useLocation()
  const googleProfile = state?.googleProfile
  const [form, setForm] = useState({
    fullName: googleProfile?.fullName || '',
    phone: '',
    agentCode: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { completeGoogleSignup } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  // Only reachable straight after a first-time Google sign-in
  if (!googleProfile) return <Navigate to="/register" replace />

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.'
    if (!form.phone.trim()) errs.phone = 'Phone number is required.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const result = await completeGoogleSignup({ ...form, email: googleProfile.email })
    setLoading(false)
    if (result.success) {
      showToast('Account created successfully! Welcome to Empire Global.', 'success')
      navigate('/customer/dashboard')
    } else {
      showToast(result.error, 'error')
    }
  }

  return (
    <AuthLayout
      title="Complete Your Profile"
      subtitle="Just a few more details to finish setting up your account."
      footer={
        <>
          Not you?{' '}
          <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Use a different account
          </Link>
        </>
      }
    >
      <div className="flex items-start gap-2 bg-emerald-50 text-emerald-700 text-xs rounded-xl px-3.5 py-2.5 mb-6">
        <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
        <p>Signed in with Google as <strong>{googleProfile.email}</strong></p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          icon={User}
          placeholder="e.g. Adewale Alao"
          value={form.fullName}
          onChange={update('fullName')}
          error={errors.fullName}
          required
        />
        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          value={googleProfile.email}
          readOnly
          disabled
          hint="Linked to your Google account."
        />
        <Input
          label="Phone Number"
          icon={Phone}
          placeholder="+234 800 000 0000"
          value={form.phone}
          onChange={update('phone')}
          error={errors.phone}
          required
        />
        <Input
          label="Agent Code"
          icon={BadgeCheck}
          placeholder="e.g. AG-1001"
          value={form.agentCode}
          onChange={update('agentCode')}
          error={errors.agentCode}
          hint="Optional. Enter the code of the agent who referred you."
        />
        <Button type="submit" fullWidth loading={loading} size="lg" className="mt-1">
          Finish Setup
        </Button>
        <p className="text-xs text-navy-400 text-center">
          By continuing you agree to Empire Global's Terms & Conditions and Privacy Policy.
        </p>
      </form>
    </AuthLayout>
  )
}
