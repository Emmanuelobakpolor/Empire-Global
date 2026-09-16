import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  PiggyBank,
  Landmark,
  ShoppingBag,
  Receipt,
  UploadCloud,
  User,
  HelpCircle,
  X,
} from 'lucide-react'
import Logo from '../Logo'

const NAV_ITEMS = [
  { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customer/investments', label: 'My Investments', icon: TrendingUp },
  { to: '/customer/savings', label: 'Savings', icon: PiggyBank },
  { to: '/customer/loans', label: 'Loans', icon: Landmark },
  { to: '/customer/hire-purchase', label: 'Hire-Purchase', icon: ShoppingBag },
  { to: '/customer/transactions', label: 'Transactions', icon: Receipt },
  { to: '/customer/upload-receipt', label: 'Payment Upload', icon: UploadCloud },
  { to: '/customer/profile', label: 'Profile', icon: User },
]

export default function CustomerSidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-navy-950/50 z-40 lg:hidden" onClick={onClose} />
      )}
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

        <div className="p-3">
          <NavLink
            to="/customer/support"
            onClick={onClose}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:bg-navy-800 hover:text-white transition-colors"
          >
            <HelpCircle size={18} />
            Support
          </NavLink>
        </div>
      </aside>
    </>
  )
}
