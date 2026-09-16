import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function StatCard({ label, value, icon: Icon, delta, deltaLabel = 'vs last month', tone = 'navy' }) {
  const positive = delta !== undefined && delta >= 0
  const toneStyles = {
    navy: 'bg-navy-50 text-navy-700',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-white rounded-2xl border border-navy-100 shadow-card p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm text-navy-400 font-medium">{label}</span>
        {Icon && (
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${toneStyles[tone]}`}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-navy-900 tracking-tight">{value}</div>
      {delta !== undefined && (
        <div className="flex items-center gap-1 text-xs font-semibold">
          <span className={`flex items-center gap-0.5 ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
            {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(delta)}%
          </span>
          <span className="text-navy-300 font-normal">{deltaLabel}</span>
        </div>
      )}
    </div>
  )
}
