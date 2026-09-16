import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-navy-50 text-navy-300 flex items-center justify-center mb-4">
        <Icon size={26} />
      </div>
      <h3 className="text-base font-semibold text-navy-800">{title}</h3>
      {description && <p className="text-sm text-navy-400 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
