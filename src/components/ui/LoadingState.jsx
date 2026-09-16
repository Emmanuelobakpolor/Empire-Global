import { Loader2 } from 'lucide-react'

export default function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-navy-400">
      <Loader2 size={28} className="animate-spin text-emerald-500" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-navy-100/70 rounded-lg ${className}`} />
}
