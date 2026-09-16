const STATUS_STYLES = {
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  verified: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',

  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'under review': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',

  processing: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  info: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  awaiting: 'bg-blue-50 text-blue-700 ring-blue-600/20',

  rejected: 'bg-red-50 text-red-700 ring-red-600/20',
  suspended: 'bg-red-50 text-red-700 ring-red-600/20',
  error: 'bg-red-50 text-red-700 ring-red-600/20',
  disabled: 'bg-red-50 text-red-700 ring-red-600/20',

  default: 'bg-navy-50 text-navy-600 ring-navy-600/10',
}

export default function Badge({ children, status, className = '' }) {
  const key = (status || String(children)).toLowerCase()
  const style = STATUS_STYLES[key] || STATUS_STYLES.default
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset capitalize ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  )
}
