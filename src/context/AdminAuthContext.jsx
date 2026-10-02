import { createContext, useContext, useState } from 'react'
import { useDataStore } from './DataStoreContext'
import { ROLES } from '../data/admins'

const AdminAuthContext = createContext(null)
const STORAGE_KEY = 'empire_admin_session_id'

export const DEMO_ADMIN_EMAIL = 'admin@empireglobal.com'
export const DEMO_ADMIN_PASSWORD = 'admin123'
export const DEMO_REGULAR_ADMIN_EMAIL = 'michael@empireglobal.com'

export function AdminAuthProvider({ children }) {
  const { admins, setActor } = useDataStore()
  const [adminId, setAdminId] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  })
  const loading = false

  // Always read the live account, so a deactivated or deleted admin loses access immediately
  const found = admins.find((a) => a.id === adminId)
  const admin = found && found.status === 'active' ? found : null

  // Set during render (it's only a ref) so page effects, which run before this
  // provider's effects, already see who is acting.
  setActor(admin)

  const persist = (id) => {
    setAdminId(id)
    if (id) localStorage.setItem(STORAGE_KEY, id)
    else localStorage.removeItem(STORAGE_KEY)
  }

  const login = async (email, password) => {
    await new Promise((r) => setTimeout(r, 600))
    const account = admins.find((a) => a.email.toLowerCase() === email?.trim().toLowerCase())
    if (!account || account.password !== password) {
      return { success: false, error: 'Invalid admin email or password.' }
    }
    if (account.status !== 'active') {
      return { success: false, error: 'This admin account has been deactivated. Contact a Super Admin.' }
    }
    persist(account.id)
    setActor(account)
    return { success: true }
  }

  const logout = () => persist(null)

  const isSuperAdmin = admin?.role === ROLES.SUPER_ADMIN

  return (
    <AdminAuthContext.Provider value={{ admin, loading, isAuthenticated: !!admin, isSuperAdmin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
