import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import CustomerSidebar from './CustomerSidebar'
import CustomerNavbar from './CustomerNavbar'
import CustomerBottomNav from './CustomerBottomNav'

export default function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
