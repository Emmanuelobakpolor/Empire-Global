import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, failure, setSessionExpiredHandler } from '../utils/api'

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

  // Display picture: pass a File to upload or replace it, null to remove it
  const updateAvatar = useCallback(async (file) => {
    try {
      let data
      if (file) {
        const form = new FormData()
        form.append('avatar', file)
        data = await api('/auth/me/avatar/', { method: 'POST', body: form })
      } else {
        data = await api('/auth/me/avatar/', { method: 'DELETE' })
      }
      setAccount(data.user)
      return { success: true }
    } catch (err) {
      return failure(err)
    }
  }, [])

  return (
    <SessionContext.Provider value={{ account, setAccount, loading, refresh, signOut, updateAvatar }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
