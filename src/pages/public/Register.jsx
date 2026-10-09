import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Phone, BadgeCheck } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import GoogleAuthButton, { AuthDivider } from '../../components/GoogleAuthButton'
import { useAuth } from '../../context/AuthContext'
import { useGoogleAvailable } from '../../utils/googleAuth'
import { useToast } from '../../context/ToastContext'

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', agentCode: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const googleAvailable = useGoogleAvailable()
  const { startRegistration, continueWithGoogle } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.'
    if (!form.email.trim()) errs.email = 'Email is required.'
    if (!form.phone.trim()) errs.phone = 'Phone number is required.'
    if (!form.password) errs.password = 'Password is required.'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const result = await startRegistration(form)
    setLoading(false)
    if (result.success) {
      showToast(`We sent a verification code to ${result.email}.`, 'info')
      navigate('/verify-email')
    } else if (Object.keys(result.fieldErrors).length) {
      // The server checks password strength and existing accounts
      setErrors(result.fieldErrors)
    } else {
      showToast(result.error, 'error')
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    const result = await continueWithGoogle()
    setGoogleLoading(false)
    if (result.cancelled) return
    if (!result.success) {
      showToast(result.error, 'error')
      return
    }
    if (result.isNewUser) {
      navigate('/complete-profile', { state: { googleProfile: result.googleProfile } })
    } else {
      showToast('Welcome back! You have logged in with Google.', 'success')
      navigate('/customer/dashboard')
    }
  }

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join Empire Global and start building your financial future."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Login
          </Link>
        </>
      }
    >
      {googleAvailable !== false && (
        <>
          <GoogleAuthButton onClick={handleGoogle} loading={googleLoading} disabled={googleAvailable === null} />
          <AuthDivider>or sign up with email</AuthDivider>
        </>
      )}

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
          placeholder="you@example.com"
          value={form.email}
          onChange={update('email')}
          error={errors.email}
          required
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
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="Create a password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
          hint="At least 8 characters. Avoid common or all-number passwords."
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          icon={Lock}
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={update('confirmPassword')}
          error={errors.confirmPassword}
          required
        />
        <Button type="submit" fullWidth loading={loading} size="lg" className="mt-1">
          Create Account
        </Button>
        <p className="text-xs text-navy-400 text-center">
          By continuing you agree to Empire Global's Terms & Conditions and Privacy Policy.
        </p>
      </form>
    </AuthLayout>
  )
}
