import { CheckCheck, Bell } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { useDataStore } from '../../context/DataStoreContext'
import { timeAgo } from '../../utils/formatDate'

const TYPE_STYLES = {
  success: 'bg-emerald-50 text-emerald-600',
  error: 'bg-red-50 text-red-500',
  info: 'bg-blue-50 text-blue-600',
  warning: 'bg-amber-50 text-amber-600',
}

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useDataStore()
  const sorted = [...notifications].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Notifications"
        subtitle="Stay updated on your transactions and account activity."
        actions={
          notifications.some((n) => !n.read) && (
            <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllNotificationsRead}>
              Mark all as read
            </Button>
          )
        }
      />

      {sorted.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="We'll notify you here when something happens." />
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((n) => (
            <Card
              key={n.id}
              padded={false}
              className={`p-4 flex items-start gap-3.5 cursor-pointer ${!n.read ? '!border-emerald-200 !bg-emerald-50/30' : ''}`}
              onClick={() => markNotificationRead(n.id)}
            >
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${TYPE_STYLES[n.type] || TYPE_STYLES.info}`}>
                <Bell size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-navy-900">{n.title}</p>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                </div>
                <p className="text-sm text-navy-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-navy-300 mt-1.5">{timeAgo(n.date)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
