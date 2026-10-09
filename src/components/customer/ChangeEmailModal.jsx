import { useEffect, useState } from 'react'
import { Mail, Lock, KeyRound } from 'lucide-react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const CODE_LENGTH = 6

// Two steps: new address + current password, then the code sent to the new address
export default function ChangeEmailModal({ open, onClose }) {
  const { user, requestEmailChange, resendEmailChange, confirmEmailChange } = useAuth()
  const { showToast } = useToast()
  const [step, setStep] = useState('details')
  const [form, setForm] = useState({ newEmail: '', password: '' })
  const [code, setCode] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (!open) {
      setStep('details')
      setForm({ newEmail: '', password: '' })
      setCode('')
      setErrors({})
    }
  }, [open])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft])

  const sendCode = async () => {
    const errs = {}
    if (!form.newEmail.trim()) errs.newEmail = 'Enter your new email address.'
    if (!form.password) errs.password = 'Enter your password to confirm.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setBusy(true)
    const result = await requestEmailChange(form.newEmail, form.password)
    setBusy(false)
    if (!result.success) {
      if (result.retryAfter) setErrors({ newEmail: result.error })
      else if (Object.keys(result.fieldErrors).length) setErrors(result.fieldErrors)
      else setErrors({ newEmail: result.error })
      return
    }
    setSentTo(result.email)
    setSecondsLeft(result.resendIn)
    setForm((f) => ({ ...f, password: '' }))
    setStep('code')
  }

  const confirm = async () => {
    if (code.length !== CODE_LENGTH) {
      setErrors({ code: `Enter the ${CODE_LENGTH}-digit code sent to ${sentTo}.` })
      return
    }
    setBusy(true)
    const result = await confirmEmailChange(code)
    setBusy(false)
    if (!result.success) {
      setErrors({ code: result.error })
      setCode('')
      return
    }
    showToast(`Your email is now ${result.email}.`, 'success')
    onClose()
  }

  const resend = async () => {
    setBusy(true)
    const result = await resendEmailChange()
    setBusy(false)
    if (result.success) {
      setSecondsLeft(result.resendIn)
      setErrors({})
      showToast(`A new code has been sent to ${sentTo}.`, 'info')
    } else if (result.retryAfter) setSecondsLeft(result.retryAfter)
    else showToast(result.error, 'error')
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (step === 'details') sendCode()
    else confirm()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change Email Address"
      subtitle={step === 'details'
        ? `You currently sign in with ${user?.email}.`
        : `Enter the code we sent to ${sentTo}. Your email changes once it's confirmed.`}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {step === 'details' ? (
          <>
            <Input
              label="New Email Address"
              type="email"
              icon={Mail}
              autoComplete="email"
              value={form.newEmail}
              onChange={(e) => setForm({ ...form, newEmail: e.target.value })}
              error={errors.newEmail}
              required
            />
            <Input
              label="Current Password"
              type="password"
              icon={Lock}
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              hint="We also let your current address know about this change."
              required
            />
            <Button type="submit" fullWidth loading={busy}>Send Confirmation Code</Button>
          </>
        ) : (
          <>
            <Input
              label="Confirmation Code"
              icon={KeyRound}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={CODE_LENGTH}
              placeholder={'0'.repeat(CODE_LENGTH)}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))
                setErrors({})
              }}
              error={errors.code}
              className="tracking-[0.4em] font-mono text-lg"
              required
            />
            <Button type="submit" fullWidth loading={busy}>Confirm New Email</Button>
            <div className="flex items-center justify-between text-xs">
              <button type="button" onClick={() => setStep('details')} className="font-semibold text-navy-500 hover:text-navy-800">
                Use a different email
              </button>
              {secondsLeft > 0 ? (
                <span className="text-navy-400">Resend in {secondsLeft}s</span>
              ) : (
                <button type="button" onClick={resend} disabled={busy} className="font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50">
                  Resend code
                </button>
              )}
            </div>
          </>
        )}
      </form>
    </Modal>
  )
}
