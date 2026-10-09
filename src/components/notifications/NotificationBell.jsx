import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, BellOff } from 'lucide-react'
import NotificationIcon from './NotificationIcon'
import { useDataStore } from '../../context/DataStoreContext'
import { timeAgo } from '../../utils/formatDate'

const PREVIEW_COUNT = 6

// Bell with an unread count and a dropdown of the latest notifications.
// `basePath` is '/customer' or '/admin', for the "view all" page.
export default function NotificationBell({ basePath }) {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useDataStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const allPath = `${basePath}/notifications`

  useEffect(() => {
    if (!open) return
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const openNotification = (n) => {
    markNotificationRead(n.id)
    setOpen(false)
    navigate(n.link || allPath)
  }

  const preview = notifications.slice(0, PREVIEW_COUNT)
  const badge = unreadCount > 9 ? '9+' : String(unreadCount)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative p-2.5 rounded-xl transition-colors ${open ? 'bg-navy-100 text-navy-800' : 'text-navy-500 hover:bg-navy-100'}`}
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell size={19} className={unreadCount ? 'origin-top animate-[bell-ring_1s_ease-in-out_1]' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-[18px] text-center ring-2 ring-white">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] bg-white rounded-2xl shadow-xl border border-navy-100 overflow-hidden z-50 animate-[modal-in_0.18s_ease-out]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-navy-50">
            <div>
              <p className="text-sm font-bold text-navy-900">Notifications</p>
              <p className="text-xs text-navy-400">{unreadCount ? `${unreadCount} unread` : "You're all caught up"}</p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {preview.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <BellOff size={22} className="mx-auto text-navy-300" />
              <p className="text-sm font-semibold text-navy-700 mt-2">No notifications yet</p>
              <p className="text-xs text-navy-400 mt-0.5">We'll let you know when something happens.</p>
            </div>
          ) : (
            <ul className="max-h-[22rem] overflow-y-auto divide-y divide-navy-50">
              {preview.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => openNotification(n)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-navy-50/70 ${n.read ? '' : 'bg-emerald-50/40'}`}
                  >
                    <NotificationIcon notification={n} size="sm" />
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className={`text-sm truncate ${n.read ? 'font-medium text-navy-700' : 'font-bold text-navy-900'}`}>{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-label="Unread" />}
                      </span>
                      <span className="block text-xs text-navy-500 mt-0.5 line-clamp-2">{n.message}</span>
                      <span className="block text-[11px] text-navy-300 mt-1">{timeAgo(n.date)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Link
            to={allPath}
            onClick={() => setOpen(false)}
            className="block text-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-navy-50/60 py-3 border-t border-navy-50"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  )
}
