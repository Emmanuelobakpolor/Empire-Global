import { Bell, Wallet, Receipt, FileText, UserPlus, Sparkles, ArrowDownToLine } from 'lucide-react'

// The icon says what it's about (kind); the colour says how it went (type)
const KIND_ICONS = {
  payment: Wallet,
  receipt: Receipt,
  application: FileText,
  customer: UserPlus,
  account: Sparkles,
  withdrawal: ArrowDownToLine,
}

const TYPE_STYLES = {
  success: 'bg-emerald-50 text-emerald-600',
  error: 'bg-red-50 text-red-500',
  warning: 'bg-amber-50 text-amber-600',
  info: 'bg-blue-50 text-blue-600',
}

export default function NotificationIcon({ notification, size = 'md' }) {
  const Icon = KIND_ICONS[notification.kind] || Bell
  const box = size === 'sm' ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl'
  return (
    <span className={`${box} flex items-center justify-center shrink-0 ${TYPE_STYLES[notification.type] || TYPE_STYLES.info}`}>
      <Icon size={size === 'sm' ? 15 : 18} />
    </span>
  )
}
