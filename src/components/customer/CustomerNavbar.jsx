import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDataStore } from '../../context/DataStoreContext'

export default function CustomerNavbar({ onMenuClick, title }) {
  const { user, logout } = useAuth()
  const { notifications } = useDataStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = (user?.fullName || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur border-b border-navy-100/70">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-lg text-navy-500 hover:bg-navy-100"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <p className="text-xs text-navy-400 truncate">Welcome back,</p>
            <h2 className="text-base sm:text-lg font-bold text-navy-900 truncate">
              {title || user?.fullName?.split(' ')[0] || 'Customer'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/customer/notifications"
            className="relative p-2.5 rounded-xl text-navy-500 hover:bg-navy-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-50" />
            )}
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-navy-100 transition-colors"
            >
              <span className="w-9 h-9 rounded-full bg-navy-900 text-white flex items-center justify-center text-xs font-bold">
                {initials}
              </span>
              <ChevronDown size={16} className="text-navy-400 hidden sm:block" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-soft border border-navy-100 py-1.5 animate-fade-in">
                <div className="px-3.5 py-2 border-b border-navy-50">
                  <p className="text-sm font-semibold text-navy-800 truncate">{user?.fullName}</p>
                  <p className="text-xs text-navy-400 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/customer/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-navy-600 hover:bg-navy-50"
                >
                  <User size={16} /> Profile
                </Link>
                <Link
                  to="/customer/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-navy-600 hover:bg-navy-50"
                >
                  <Settings size={16} /> Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
