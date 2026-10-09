import { createContext, useContext, useMemo } from 'react'
import { useDataStore } from './DataStoreContext'
import { useSession } from './SessionContext'
import { ROLES, roleLabel } from '../data/admins'
import { api, failure } from '../utils/api'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const { setActor } = useDataStore()
  const { account, setAccount, loading, signOut } = useSession()

  // Deactivated admins are signed out by the backend, which also refuses their login
  const signedIn = roleLabel(account?.role) ? account : null
  const admin = useMemo(() => signedIn && { ...signedIn, role: roleLabel(signedIn.role) }, [signedIn])

  // Set during render (it's only a ref) so page effects, which run before this
  // provider's effects, already see who is acting.
  setActor(admin)

  // Step 1: email and password. Admins then confirm with an emailed code (step 2),
  // unless the backend has two-factor sign-in turned off.
  const login = async (email, password) => {
    try {
      const data = await api('/admin/auth/login/', { method: 'POST', body: { email: email.trim(), password } })
      if (data.twoFactorRequired) {
        return { success: true, twoFactorRequired: true, email: data.email, resendIn: data.resendIn, otpLength: data.otpLength }
      }
      setAccount(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return failure(err)
    }
  }

  const verifyLoginCode = async (code) => {
    try {
      const data = await api('/admin/auth/verify-code/', { method: 'POST', body: { code } })
      setAccount(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { ...failure(err), expired: err.code === 'two_factor_expired' }
    }
  }

  const resendLoginCode = async () => {
    try {
      const data = await api('/admin/auth/resend-code/', { method: 'POST' })
      return { success: true, resendIn: data.resendIn }
    } catch (err) {
      return { ...failure(err), retryAfter: err.data?.retryAfter, expired: err.code === 'two_factor_expired' }
    }
  }

  const logout = () => signOut()

  // The signed-in admin's own name (email and role are changed by a Super Admin)
  const updateProfile = async ({ fullName }) => {
    try {
      const data = await api('/auth/me/', { method: 'PATCH', body: { fullName } })
      setAccount(data.user)
      return { success: true }
    } catch (err) {
      return failure(err)
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      // Also clears mustChangePassword when an admin replaces a temporary password
      const data = await api('/auth/change-password/', { method: 'POST', body: { currentPassword, newPassword } })
      setAccount(data.user)
      return { success: true }
    } catch (err) {
      return failure(err)
    }
  }

  const isSuperAdmin = admin?.role === ROLES.SUPER_ADMIN

  return (
    <AdminAuthContext.Provider value={{ admin, loading, isAuthenticated: !!admin, isSuperAdmin, login, verifyLoginCode, resendLoginCode, logout, updateProfile, changePassword }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
