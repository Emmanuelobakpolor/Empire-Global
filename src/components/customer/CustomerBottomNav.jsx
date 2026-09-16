import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, ShoppingBag, User } from 'lucide-react'

const ITEMS = [
  { to: '/customer/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/customer/products', label: 'Products', icon: ShoppingBag },
  { to: '/customer/transactions', label: 'History', icon: Receipt },
  { to: '/customer/profile', label: 'Profile', icon: User },
]

export default function CustomerBottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-navy-100 flex items-stretch pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium ${
              isActive ? 'text-emerald-600' : 'text-navy-400'
            }`
          }
        >
          <item.icon size={20} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
