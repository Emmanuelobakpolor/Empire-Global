import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import CustomerSidebar from './CustomerSidebar'
import CustomerNavbar from './CustomerNavbar'
import CustomerBottomNav from './CustomerBottomNav'
import { useAuth } from '../../context/AuthContext'
import { useDataStore } from '../../context/DataStoreContext'
import { useSession } from '../../context/SessionContext'
import { useNotificationPolling } from '../../hooks/useNotificationPolling'

export default function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const { ensureCustomer, refreshTransactions } = useDataStore()
  const { refresh: refreshSession } = useSession()
  useNotificationPolling()

  useEffect(() => {
    ensureCustomer(user)
  }, [user])

  // Load from the server, and again whenever the customer returns to the tab, so an
  // approval (new balance, notification) shows up without a reload
  useEffect(() => {
    const load = () => {
      refreshTransactions('customer')
    }
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      load()
      refreshSession()
    }
    load()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  return (
    <div className="flex min-h-screen bg-slate-50">
      <CustomerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <CustomerNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 py-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>
      <CustomerBottomNav />
    </div>
  )
}
