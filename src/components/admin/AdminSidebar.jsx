import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  Package,
  BarChart3,
  Landmark,
  ScrollText,
  Settings,
  X,
  ShieldCheck,
} from 'lucide-react'
import Logo from '../Logo'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/payments', label: 'Payments', icon: Wallet },
  { to: '/admin/transactions', label: 'Transactions', icon: Receipt },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/bank-details', label: 'Bank Details', icon: Landmark },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-navy-950/50 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 bg-navy-900 text-white flex flex-col z-50 transition-transform duration-200 shrink-0 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <Logo variant="light" size="sm" />
          <button onClick={onClose} className="lg:hidden text-navy-300 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="mx-4 mb-3 px-3 py-2 rounded-xl bg-navy-800 flex items-center gap-2 text-navy-300 text-xs font-semibold">
          <ShieldCheck size={14} className="text-emerald-400" />
          ADMIN PORTAL
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1 scrollbar-none">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-soft'
                    : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
