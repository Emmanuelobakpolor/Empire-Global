import { createContext, useContext, useEffect, useState } from 'react'

const AdminAuthContext = createContext(null)
const STORAGE_KEY = 'empire_admin_session'

export const DEMO_ADMIN_EMAIL = 'admin@empireglobal.com'
export const DEMO_ADMIN_PASSWORD = 'admin123'

const demoAdmin = {
  id: 'ADM-001',
  fullName: 'Sarah Johnson',
  email: DEMO_ADMIN_EMAIL,
  role: 'Super Admin',
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setAdmin(JSON.parse(raw))
    } catch {
      // ignore
    }
    setLoading(false)
  }, [])

  const persist = (nextAdmin) => {
    setAdmin(nextAdmin)
    if (nextAdmin) localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAdmin))
    else localStorage.removeItem(STORAGE_KEY)
  }

  const login = async (email, password) => {
    await new Promise((r) => setTimeout(r, 600))
    if (email?.trim().toLowerCase() === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
      persist(demoAdmin)
      return { success: true }
    }
    if (email && password) {
      persist({ ...demoAdmin, email })
      return { success: true }
    }
    return { success: false, error: 'Please enter a valid admin email and password.' }
  }

  const logout = () => persist(null)

  return (
    <AdminAuthContext.Provider value={{ admin, loading, isAuthenticated: !!admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
