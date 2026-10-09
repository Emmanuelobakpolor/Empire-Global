import { useEffect, useRef } from 'react'
import { useDataStore } from '../context/DataStoreContext'
import { useToast } from '../context/ToastContext'

const POLL_MS = 30 * 1000

// Keeps the bell up to date: checks for new notifications every 30s while the tab is
// visible (and straight away when it becomes visible), and pops a toast for anything new.
export function useNotificationPolling() {
  const { notifications, refreshNotifications } = useDataStore()
  const { showToast } = useToast()
  // Ids already shown; null until the first load, which never toasts
  const seen = useRef(null)

  useEffect(() => {
    let active = true
    refreshNotifications().then((result) => {
      if (active && result.success && !seen.current) seen.current = new Set(result.notifications.map((n) => n.id))
    })
    const tick = () => document.visibilityState === 'visible' && refreshNotifications()
    const timer = setInterval(tick, POLL_MS)
    document.addEventListener('visibilitychange', tick)
    return () => {
      active = false
      clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  useEffect(() => {
    if (!seen.current) return
    const fresh = notifications.filter((n) => !n.read && !seen.current.has(n.id))
    notifications.forEach((n) => seen.current.add(n.id))
    if (fresh.length === 1) showToast(`${fresh[0].title}: ${fresh[0].message}`, fresh[0].type === 'error' ? 'error' : 'info')
    else if (fresh.length > 1) showToast(`You have ${fresh.length} new notifications.`, 'info')
  }, [notifications])
}
