import { createContext, useContext } from 'react'
import { useSession } from './SessionContext'
import { api, failure } from '../utils/api'
import { requestGoogleCode } from '../utils/googleAuth'

const AuthContext = createContext(null)
// Email sign-ups wait here (no password) until their OTP is confirmed
const PENDING_KEY = 'empire_pending_registration'

export const OTP_LENGTH = 6
export const OTP_RESEND_SECONDS = 60

const GOOGLE_NOT_READY = 'Google sign-in is not available yet. Please use your email and password.'

function savePending({ email, fullName = '', resendIn = OTP_RESEND_SECONDS }) {
  // Store when the current code was sent, so the page can show the resend countdown
  const otpSentAt = Date.now() - (OTP_RESEND_SECONDS - resendIn) * 1000
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ email, fullName, otpSentAt }))
}

function clearPending() {
  sessionStorage.removeItem(PENDING_KEY)
}

export function AuthProvider({ children }) {
  const { account, setAccount, loading, signOut } = useSession()
  const user = account?.role === 'customer' ? account : null

  const login = async (email, password) => {
    try {
      const data = await api('/auth/login/', { method: 'POST', body: { email: email.trim(), password } })
      setAccount(data.user)
      return { success: true }
    } catch (err) {
      if (err.code === 'email_not_verified') {
        savePending({ email: err.data.email, resendIn: err.data.resendIn })
        return { ...failure(err), needsVerification: true }
      }
      return failure(err)
    }
  }

  const getPendingRegistration = () => {
    try {
      return JSON.parse(sessionStorage.getItem(PENDING_KEY))
    } catch {
      return null
    }
  }

  const startRegistration = async (form) => {
    const body = {
      fullName: form.fullName,
      email: form.email.trim(),
      phone: form.phone,
      agentCode: form.agentCode,
      password: form.password,
    }
    try {
      const data = await api('/auth/register/', { method: 'POST', body })
      savePending({ email: data.email, fullName: form.fullName, resendIn: data.resendIn })
      return { success: true, email: data.email }
    } catch (err) {
      // Re-registering within the cooldown: the earlier code is still valid
      if (err.code === 'otp_cooldown') {
        savePending({ email: body.email.toLowerCase(), fullName: form.fullName, resendIn: err.data.retryAfter })
        return { success: true, email: body.email.toLowerCase() }
      }
      return failure(err)
    }
  }

  const resendOtp = async () => {
    const pending = getPendingRegistration()
    if (!pending) return { success: false, expired: true, error: 'Your sign-up session has expired. Please register again.' }
    try {
      const data = await api('/auth/resend-otp/', { method: 'POST', body: { email: pending.email } })
      savePending({ ...pending, resendIn: data.resendIn })
      return { success: true }
    } catch (err) {
      if (err.code === 'otp_cooldown') {
        savePending({ ...pending, resendIn: err.data.retryAfter })
        return { ...failure(err), retryAfter: err.data.retryAfter }
      }
      if (err.code === 'signup_not_found') {
        clearPending()
        return { ...failure(err), expired: true }
      }
      return failure(err)
    }
  }

  const verifyOtp = async (code) => {
    const pending = getPendingRegistration()
    if (!pending) return { success: false, expired: true, error: 'Your sign-up session has expired. Please register again.' }
    try {
      const data = await api('/auth/verify-email/', { method: 'POST', body: { email: pending.email, code } })
      clearPending()
      setAccount(data.user)
      return { success: true }
    } catch (err) {
      if (err.code === 'signup_not_found') {
        clearPending()
        return { ...failure(err), expired: true }
      }
      return failure(err)
    }
  }

  // Google's popup returns a one-time code; the backend verifies it with Google and either
  // signs the customer in or returns { isNewUser, googleProfile } so they can complete their
  // profile. Call it straight from the button's click handler so the popup isn't blocked.
  const continueWithGoogle = async () => {
    let google
    try {
      google = await requestGoogleCode()
    } catch (err) {
      return failure(err)
    }
    if (google.disabled) return { success: false, error: GOOGLE_NOT_READY }
    if (google.cancelled) return { success: false, cancelled: true }
    if (google.error) return { success: false, error: google.error }
    try {
      const data = await api('/auth/google/', { method: 'POST', body: { code: google.code } })
      if (data.isNewUser) return { success: true, isNewUser: true, googleProfile: data.googleProfile }
      setAccount(data.user)
      return { success: true }
    } catch (err) {
      return failure(err)
    }
  }

  // Second half for a first-time Google user (CompleteProfile page). The verified Google
  // identity is held in their server session, so only these details are sent.
  const completeGoogleSignup = async ({ fullName, phone, agentCode }) => {
    try {
      const data = await api('/auth/google/complete/', { method: 'POST', body: { fullName, phone, agentCode } })
      setAccount(data.user)
      return { success: true }
    } catch (err) {
      return { ...failure(err), expired: err.code === 'google_signup_expired' }
    }
  }

  const logout = () => signOut()

  // Accepts fullName, phone and nextOfKin
  const updateProfile = async (updates) => {
    try {
      const data = await api('/auth/me/', { method: 'PATCH', body: updates })
      setAccount(data.user)
      return { success: true }
    } catch (err) {
      return failure(err)
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api('/auth/change-password/', { method: 'POST', body: { currentPassword, newPassword } })
      return { success: true }
    } catch (err) {
      return failure(err)
    }
  }

  const requestPasswordReset = async (email) => {
    try {
      await api('/auth/password-reset/', { method: 'POST', body: { email: email.trim() } })
      return { success: true }
    } catch (err) {
      return failure(err)
    }
  }

  const confirmPasswordReset = async ({ uid, token, password }) => {
    try {
      await api('/auth/password-reset/confirm/', { method: 'POST', body: { uid, token, password } })
      return { success: true }
    } catch (err) {
      return failure(err)
    }
  }

  // Changing email: the password confirms it's the owner, then a code sent to the
  // new address proves they can receive mail there. The old address is told too.
  const requestEmailChange = async (newEmail, password) => {
    try {
      const data = await api('/auth/change-email/', { method: 'POST', body: { newEmail: newEmail.trim(), password } })
      return { success: true, email: data.email, resendIn: data.resendIn }
    } catch (err) {
      return { ...failure(err), retryAfter: err.data?.retryAfter }
    }
  }

  const resendEmailChange = async () => {
    try {
      const data = await api('/auth/change-email/resend/', { method: 'POST' })
      return { success: true, resendIn: data.resendIn }
    } catch (err) {
      return { ...failure(err), retryAfter: err.data?.retryAfter }
    }
  }

  const confirmEmailChange = async (code) => {
    try {
      const data = await api('/auth/change-email/confirm/', { method: 'POST', body: { code } })
      setAccount(data.user)
      return { success: true, email: data.user.email }
    } catch (err) {
      return failure(err)
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    startRegistration,
    getPendingRegistration,
    resendOtp,
    verifyOtp,
    continueWithGoogle,
    completeGoogleSignup,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    confirmPasswordReset,
    requestEmailChange,
    resendEmailChange,
    confirmEmailChange,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
