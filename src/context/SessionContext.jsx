import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, setSessionExpiredHandler } from '../utils/api'

// The account signed in to the Django session. Customers and admins share one
// session cookie; AuthContext and AdminAuthContext each expose the role they own.
const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await api('/auth/me/')
      setAccount(data.user)
      return data.user
    } catch {
      // Signed out (403) or server unreachable: treat both as no session
      setAccount(null)
      return null
    }
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
    setSessionExpiredHandler(() => setAccount(null))
    return () => setSessionExpiredHandler(null)
  }, [refresh])

  const signOut = useCallback(async () => {
    setAccount(null)
    try {
      await api('/auth/logout/', { method: 'POST' })
    } catch {
      // The local session is already cleared; the server one expires on its own
    }
  }, [])

  return (
    <SessionContext.Provider value={{ account, setAccount, loading, refresh, signOut }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
