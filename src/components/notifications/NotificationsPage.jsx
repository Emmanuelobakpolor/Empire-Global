import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCheck, Bell, ChevronRight } from 'lucide-react'
import PageHeader from '../ui/PageHeader'
import Card from '../ui/Card'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import NotificationIcon from './NotificationIcon'
import { useDataStore } from '../../context/DataStoreContext'
import { timeAgo } from '../../utils/formatDate'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
]

function dayGroup(date) {
  const d = new Date(date)
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffDays = Math.floor((startOfToday - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000)
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return 'This week'
  return 'Earlier'
}

// The full list, shared by the customer and admin portals
export default function NotificationsPage({ subtitle }) {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useDataStore()
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  const groups = useMemo(() => {
    const visible = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications
    const out = []
    visible.forEach((n) => {
      const label = dayGroup(n.date)
      const group = out.find((g) => g.label === label)
      if (group) group.items.push(n)
      else out.push({ label, items: [n] })
    })
    return out
  }, [notifications, filter])

  const open = (n) => {
    markNotificationRead(n.id)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Notifications"
        subtitle={subtitle}
        actions={
          unreadCount > 0 && (
            <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllNotificationsRead}>
              Mark all as read
            </Button>
          )
        }
      />

      <div className="inline-flex rounded-xl bg-navy-50 p-1 mb-5" role="tablist" aria-label="Filter notifications">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              filter === f.value ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500 hover:text-navy-800'
            }`}
          >
            {f.label}
            {f.value === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? "You're all caught up" : 'No notifications yet'}
          description={filter === 'unread' ? 'There are no unread notifications.' : "We'll let you know here when something happens."}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.label}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-400 mb-2">{group.label}</h3>
              <Card padded={false} className="divide-y divide-navy-50 overflow-hidden">
                {group.items.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => open(n)}
                    className={`group w-full text-left flex items-start gap-3.5 p-4 transition-colors hover:bg-navy-50/60 ${n.read ? '' : 'bg-emerald-50/40'}`}
                  >
                    <NotificationIcon notification={n} />
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2">
                        <span className={`text-sm ${n.read ? 'font-semibold text-navy-700' : 'font-bold text-navy-900'}`}>{n.title}</span>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-label="Unread" />}
                      </span>
                      <span className="block text-sm text-navy-500 mt-0.5">{n.message}</span>
                      <span className="block text-xs text-navy-300 mt-1.5">{timeAgo(n.date)}</span>
                    </span>
                    {n.link && <ChevronRight size={16} className="text-navy-300 mt-1 shrink-0 transition-transform group-hover:translate-x-0.5" />}
                  </button>
                ))}
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
