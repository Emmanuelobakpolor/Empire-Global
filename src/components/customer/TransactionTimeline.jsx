import { Check, X, Circle } from 'lucide-react'
import { formatDate } from '../../utils/formatDate'

export default function TransactionTimeline({ steps }) {
  return (
    <div className="flex flex-col">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1
        const rejected = step.rejected
        return (
          <div key={step.label} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  rejected
                    ? 'bg-red-500 text-white'
                    : step.done
                    ? 'bg-emerald-500 text-white'
                    : step.current
                    ? 'bg-amber-400 text-white'
                    : 'bg-navy-100 text-navy-300'
                }`}
              >
                {rejected ? <X size={16} /> : step.done ? <Check size={16} /> : <Circle size={10} fill="currentColor" />}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[28px] ${step.done && !rejected ? 'bg-emerald-300' : 'bg-navy-100'}`} />
              )}
            </div>
            <div className={`pb-7 ${isLast ? 'pb-0' : ''}`}>
              <p
                className={`text-sm font-semibold ${
                  rejected ? 'text-red-600' : step.done ? 'text-navy-900' : step.current ? 'text-amber-600' : 'text-navy-300'
                }`}
              >
                {step.label}
              </p>
              {step.date && <p className="text-xs text-navy-400 mt-0.5">{formatDate(step.date, { withTime: true })}</p>}
              {step.current && !step.date && <p className="text-xs text-amber-500 mt-0.5 font-medium">In Progress</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
