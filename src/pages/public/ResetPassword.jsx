import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Lock, CheckCircle2, AlertTriangle } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

// Opened from the emailed reset link: /reset-password?uid=…&token=… (or /admin/reset-password)
export default function ResetPassword({ admin = false }) {
  const [params] = useSearchParams()
  const uid = params.get('uid')
  const token = params.get('token')
  const loginPath = admin ? '/admin/login' : '/login'

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [linkInvalid, setLinkInvalid] = useState(!uid || !token)
  const { confirmPasswordReset } = useAuth()

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    const result = await confirmPasswordReset({ uid, token, password: form.password })
    setLoading(false)
    if (result.success) setDone(true)
    else if (result.code === 'reset_link_invalid') setLinkInvalid(true)
    else setErrors({ password: result.fieldErrors.password || result.error })
  }

  const footer = (
    <>
      Remembered your password?{' '}
      <Link to={loginPath} className="font-semibold text-emerald-600 hover:text-emerald-700">
        Back to Login
      </Link>
    </>
  )

  if (done || linkInvalid) {
    const Icon = done ? CheckCircle2 : AlertTriangle
    return (
      <AuthLayout title={done ? 'Password Reset' : 'Link Expired'} subtitle="" footer={done ? null : footer}>
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${done ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
            <Icon size={28} />
          </div>
          <h3 className="font-bold text-navy-900">{done ? 'Your password has been changed' : 'This reset link is no longer valid'}</h3>
          <p className="text-sm text-navy-400">
            {done
              ? 'You can now log in with your new password.'
              : 'Reset links expire after 1 hour and can only be used once. Request a new one to continue.'}
          </p>
          <Link to={done ? loginPath : '/forgot-password'} className="w-full mt-2">
            <Button fullWidth>{done ? 'Go to Login' : 'Request a New Link'}</Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Choose a New Password" subtitle="Enter a new password for your account." footer={footer}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="New Password"
          type="password"
          icon={Lock}
          placeholder="Create a password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
          hint="At least 8 characters. Avoid common or all-number passwords."
          autoComplete="new-password"
          required
        />
        <Input
          label="Confirm New Password"
          type="password"
          icon={Lock}
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={update('confirmPassword')}
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />
        <Button type="submit" fullWidth loading={loading} size="lg">
          Reset Password
        </Button>
      </form>
    </AuthLayout>
  )
}
