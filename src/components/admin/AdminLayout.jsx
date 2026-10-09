import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminNavbar from './AdminNavbar'
import { useDataStore } from '../../context/DataStoreContext'
import { useNotificationPolling } from '../../hooks/useNotificationPolling'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useNotificationPolling()
  const { refreshCustomers, refreshAgents, refreshTransactions, refreshProducts, refreshBankAccounts, refreshAuditLogs, refreshWithdrawals } = useDataStore()

  // Everything comes from the backend; load it for every admin page, and again when
  // the admin returns to the tab
  useEffect(() => {
    const load = () => {
      refreshCustomers()
      refreshAgents()
      refreshTransactions('admin')
      refreshProducts('admin')
      refreshBankAccounts()
      refreshAuditLogs()
      refreshWithdrawals('admin')
    }
    const onVisible = () => document.visibilityState === 'visible' && load()
    load()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
