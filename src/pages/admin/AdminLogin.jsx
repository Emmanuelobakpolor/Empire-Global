import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, KeyRound } from 'lucide-react'
import AdminAuthShell from '../../components/admin/AdminAuthShell'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // Set once the password is accepted and a sign-in code has been emailed
  const [challenge, setChallenge] = useState(null)
  const { login } = useAdminAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const finish = (user) => {
    if (user.mustChangePassword) {
      navigate('/admin/set-password', { replace: true })
      return
    }
    showToast('Welcome back.', 'success')
    navigate('/admin/dashboard')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (!result.success) {
      setError(result.error)
    } else if (result.twoFactorRequired) {
      setPassword('')
      setChallenge(result)
    } else {
      finish(result.user)
    }
  }

  if (challenge) {
    return <CodeStep challenge={challenge} onDone={finish} onRestart={() => setChallenge(null)} />
  }

  return (
    <AdminAuthShell title="Admin Portal" subtitle="Sign in to manage Empire Global operations.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Admin Email" type="email" icon={Mail} autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" icon={Lock} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-xs text-red-500 -mt-1" role="alert">{error}</p>}
        <div className="flex justify-end -mt-1">
          <Link to="/forgot-password" className="text-xs font-semibold text-navy-500 hover:text-emerald-600">
            Forgot Password?
          </Link>
        </div>
        <Button type="submit" fullWidth loading={loading} size="lg">
          Continue
        </Button>
      </form>
    </AdminAuthShell>
  )
}

// Step 2: the 6-digit code emailed after the password is accepted
function CodeStep({ challenge, onDone, onRestart }) {
  const { verifyLoginCode, resendLoginCode } = useAdminAuth()
  const { showToast } = useToast()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(challenge.resendIn)
  const length = challenge.otpLength || 6

  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft])

  const expired = (message) => {
    showToast(message, 'error')
    onRestart()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (code.length !== length) {
      setError(`Enter the ${length}-digit code from your email.`)
      return
    }
    setLoading(true)
    const result = await verifyLoginCode(code)
    setLoading(false)
    if (result.success) onDone(result.user)
    else if (result.expired) expired(result.error)
    else {
      setError(result.error)
      setCode('')
    }
  }

  const handleResend = async () => {
    setResending(true)
    const result = await resendLoginCode()
    setResending(false)
    if (result.success) {
      setSecondsLeft(result.resendIn)
      setError('')
      showToast('A new code is on its way.', 'info')
    } else if (result.retryAfter) setSecondsLeft(result.retryAfter)
    else if (result.expired) expired(result.error)
    else showToast(result.error, 'error')
  }

  return (
    <AdminAuthShell title="Check Your Email" icon={KeyRound} subtitle={`We sent a ${length}-digit sign-in code to ${challenge.email}.`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Sign-in Code"
          icon={KeyRound}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={length}
          placeholder={'0'.repeat(length)}
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, '').slice(0, length))
            setError('')
          }}
          error={error}
          className="tracking-[0.4em] font-mono text-lg"
          required
        />
        <Button type="submit" fullWidth loading={loading} size="lg">
          Verify & Sign In
        </Button>
        <div className="flex items-center justify-between text-xs">
          <button type="button" onClick={onRestart} className="font-semibold text-navy-500 hover:text-navy-800">
            Use a different account
          </button>
          {secondsLeft > 0 ? (
            <span className="text-navy-400">Resend in {secondsLeft}s</span>
          ) : (
            <button type="button" onClick={handleResend} disabled={resending} className="font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50">
              {resending ? 'Sending…' : 'Resend code'}
            </button>
          )}
        </div>
        {import.meta.env.DEV && (
          <p className="text-xs text-navy-400 text-center rounded-lg bg-navy-50 px-3 py-2">
            Development: unless Resend is configured, the code is printed in the Django server console.
          </p>
        )}
      </form>
    </AdminAuthShell>
  )
}
