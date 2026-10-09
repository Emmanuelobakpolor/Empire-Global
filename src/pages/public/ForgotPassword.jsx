import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, CheckCircle2 } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { requestPasswordReset } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setError('')
    setLoading(true)
    const result = await requestPasswordReset(email)
    setLoading(false)
    if (result.success) setSent(true)
    else setError(result.error)
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a link to reset your password."
      footer={
        <>
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Back to Login
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="font-bold text-navy-900">Check Your Inbox</h3>
          <p className="text-sm text-navy-400">
            If an account exists for <strong>{email}</strong>, we've sent a link to reset your password. It expires in 1 hour.
          </p>
          <Link to="/login" className="w-full mt-2">
            <Button fullWidth>Back to Login</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            required
          />
          <Button type="submit" fullWidth loading={loading} size="lg">
            Send Reset Link
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
