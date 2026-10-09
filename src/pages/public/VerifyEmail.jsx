import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { MailCheck, CheckCircle2, ArrowRight } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import Button from '../../components/ui/Button'
import { useAuth, OTP_LENGTH, OTP_RESEND_SECONDS as RESEND_SECONDS } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function VerifyEmail() {
  const { getPendingRegistration, verifyOtp, resendOtp } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [pending] = useState(getPendingRegistration)
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [verified, setVerified] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(() =>
    pending ? Math.max(0, RESEND_SECONDS - Math.floor((Date.now() - pending.otpSentAt) / 1000)) : 0
  )
  const inputs = useRef([])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  // Nothing to verify: send them back to sign up
  if (!pending && !verified) return <Navigate to="/register" replace />

  const focus = (i) => inputs.current[Math.max(0, Math.min(OTP_LENGTH - 1, i))]?.focus()

  const fill = (start, chars) => {
    const next = [...digits]
    chars.forEach((c, k) => {
      if (start + k < OTP_LENGTH) next[start + k] = c
    })
    setDigits(next)
    setError('')
    focus(start + chars.length)
  }

  const handleChange = (i) => (e) => {
    const chars = e.target.value.replace(/\D/g, '').split('')
    if (chars.length === 0) {
      const next = [...digits]
      next[i] = ''
      setDigits(next)
      return
    }
    fill(i, chars)
  }

  const handleKeyDown = (i) => (e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      const next = [...digits]
      next[i - 1] = ''
      setDigits(next)
      focus(i - 1)
      e.preventDefault()
    } else if (e.key === 'ArrowLeft') focus(i - 1)
    else if (e.key === 'ArrowRight') focus(i + 1)
  }

  const handlePaste = (e) => {
    const chars = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH).split('')
    if (chars.length === 0) return
    e.preventDefault()
    fill(0, chars)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit code sent to your email.`)
      return
    }
    setLoading(true)
    const result = await verifyOtp(code)
    setLoading(false)
    if (result.success) {
      setVerified(true)
    } else if (result.expired) {
      showToast(result.error, 'error')
      navigate('/register')
    } else {
      setError(result.error)
      setDigits(Array(OTP_LENGTH).fill(''))
      focus(0)
    }
  }

  const handleResend = async () => {
    setResending(true)
    const result = await resendOtp()
    setResending(false)
    if (result.retryAfter) {
      setSecondsLeft(result.retryAfter)
      return
    }
    if (!result.success) {
      showToast(result.error, 'error')
      if (result.expired) navigate('/register')
      return
    }
    setSecondsLeft(RESEND_SECONDS)
    setDigits(Array(OTP_LENGTH).fill(''))
    setError('')
    focus(0)
    showToast(`A new code has been sent to ${pending.email}.`, 'info')
  }

  if (verified) {
    return (
      <AuthLayout title="You're All Set" subtitle="Your email has been verified.">
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-lg font-bold text-navy-900">Account Created Successfully</h3>
          <p className="text-sm text-navy-400">
            Welcome to Empire Global{pending?.fullName ? `, ${pending.fullName.split(' ')[0]}` : ''}! Your account is ready.
            You can now start saving, investing and more.
          </p>
          <Button
            fullWidth
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            className="mt-3"
            onClick={() => navigate('/customer/dashboard', { replace: true })}
          >
            Go to Dashboard
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="Enter the verification code we sent to finish creating your account."
      footer={
        <>
          Wrong email?{' '}
          <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Go back to sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <MailCheck size={26} />
          </div>
          <p className="text-sm text-navy-500">
            We sent a {OTP_LENGTH}-digit code to <strong className="text-navy-900 break-all">{pending.email}</strong>
          </p>
        </div>

        <div>
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputs.current[i] = el)}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                maxLength={OTP_LENGTH}
                value={d}
                onChange={handleChange(i)}
                onKeyDown={handleKeyDown(i)}
                onFocus={(e) => e.target.select()}
                aria-label={`Digit ${i + 1}`}
                className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold text-navy-900 rounded-xl border bg-white focus:outline-none focus:ring-4 transition-colors ${
                  error
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-500/10'
                    : 'border-navy-200 focus:border-emerald-500 focus:ring-emerald-500/15'
                }`}
              />
            ))}
          </div>
          {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg">
          Verify & Create Account
        </Button>

        <p className="text-sm text-navy-500 text-center">
          Didn't get the code?{' '}
          {secondsLeft > 0 ? (
            <span className="text-navy-400">Resend in {secondsLeft}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
            >
              {resending ? 'Sending…' : 'Resend code'}
            </button>
          )}
        </p>

        {import.meta.env.DEV && (
          <p className="text-xs text-navy-400 text-center rounded-lg bg-navy-50 px-3 py-2">
            Development: unless Resend is configured, the code is printed in the Django server console.
          </p>
        )}
      </form>
    </AuthLayout>
  )
}
