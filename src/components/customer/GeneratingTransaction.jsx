import { useEffect, useState } from 'react'
import { Check, Loader2, ReceiptText } from 'lucide-react'

// Shown while a transaction is being created. The server call runs at the same time;
// the steps are paced over GENERATING_MS so the customer sees what's happening.
export const GENERATING_MS = 3000

export default function GeneratingTransaction({ isApplication }) {
  const steps = [
    'Checking your details',
    isApplication ? 'Uploading your documents' : 'Creating your transaction reference',
    'Preparing your payment instructions',
  ]
  const [done, setDone] = useState(0)

  useEffect(() => {
    const step = GENERATING_MS / steps.length
    const timers = steps.map((_, i) => setTimeout(() => setDone(i + 1), step * (i + 1) - 150))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="flex flex-col items-center text-center py-6" role="status" aria-live="polite">
      <div className="relative w-20 h-20 mb-5">
        <span className="absolute inset-0 rounded-full border-4 border-emerald-100" />
        <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
        <span className="absolute inset-3 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <ReceiptText size={26} />
        </span>
      </div>

      <h3 className="text-lg font-bold text-navy-900">
        {isApplication ? 'Submitting your application…' : 'Generating your transaction…'}
      </h3>
      <p className="text-sm text-navy-400 mt-1">This only takes a moment. Please don't close this page.</p>

      <div className="w-full max-w-sm h-1.5 rounded-full bg-navy-100 overflow-hidden mt-6">
        <div className="h-full bg-emerald-500 rounded-full animate-progress-3s" />
      </div>

      <ul className="w-full max-w-sm mt-6 flex flex-col gap-3 text-left">
        {steps.map((label, i) => {
          const complete = i < done
          const active = i === done
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                  complete ? 'bg-emerald-500 text-white' : active ? 'bg-emerald-50 text-emerald-600' : 'bg-navy-50 text-navy-300'
                }`}
              >
                {complete ? <Check size={14} className="animate-check-pop" /> : active ? <Loader2 size={14} className="animate-spin" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
              </span>
              <span className={`transition-colors duration-300 ${complete ? 'text-navy-900 font-semibold' : active ? 'text-navy-700' : 'text-navy-300'}`}>
                {label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
