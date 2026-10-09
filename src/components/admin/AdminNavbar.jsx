import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, ChevronDown, LogOut } from 'lucide-react'
import NotificationBell from '../notifications/NotificationBell'
import Avatar from '../ui/Avatar'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function AdminNavbar({ onMenuClick, title }) {
  const { admin, logout } = useAdminAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

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
          <h2 className="text-base sm:text-lg font-bold text-navy-900 truncate">{title || 'Admin Overview'}</h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <NotificationBell basePath="/admin" />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-navy-100 transition-colors"
            >
              <Avatar src={admin?.avatarUrl} name={admin?.fullName} fallback="A" className="w-9 h-9 bg-emerald-500 text-white text-xs" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-navy-800 leading-tight">{admin?.fullName}</p>
                <p className="text-[11px] text-navy-400 leading-tight">{admin?.role}</p>
              </div>
              <ChevronDown size={16} className="text-navy-400 hidden sm:block" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-soft border border-navy-100 py-1.5 animate-fade-in">
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
