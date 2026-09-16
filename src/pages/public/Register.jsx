import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Phone } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.'
    if (!form.email.trim()) errs.email = 'Email is required.'
    if (!form.phone.trim()) errs.phone = 'Phone number is required.'
    if (!form.password) errs.password = 'Password is required.'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.'
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const result = await register(form)
    setLoading(false)
    if (result.success) {
      showToast('Account created successfully! Welcome to Empire Global.', 'success')
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
          label="Password"
          type="password"
          icon={Lock}
          placeholder="Create a password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
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
