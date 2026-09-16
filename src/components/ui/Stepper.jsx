import { Check } from 'lucide-react'

export default function Stepper({ steps, currentStep }) {
  return (
    <div className="flex items-center w-full mb-8 overflow-x-auto scrollbar-none">
      {steps.map((step, idx) => {
        const isDone = idx < currentStep
        const isCurrent = idx === currentStep
        return (
          <div key={step} className={`flex items-center ${idx !== steps.length - 1 ? 'flex-1' : ''}`}>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  isDone
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-navy-900 border-navy-900 text-white'
                    : 'bg-white border-navy-200 text-navy-300'
                }`}
              >
                {isDone ? <Check size={16} /> : idx + 1}
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  isCurrent ? 'text-navy-900' : isDone ? 'text-emerald-600' : 'text-navy-300'
                }`}
              >
                {step}
              </span>
            </div>
            {idx !== steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 mb-5 min-w-[24px] ${isDone ? 'bg-emerald-500' : 'bg-navy-100'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
