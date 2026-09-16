import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(function Select(
  { label, error, hint, options = [], placeholder = 'Select...', className = '', containerClassName = '', required, ...rest },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-navy-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`w-full appearance-none rounded-xl border bg-white px-4 py-2.5 pr-10 text-sm text-navy-900 transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 ${
            error ? 'border-red-400' : 'border-navy-200'
          } ${className}`}
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
      </div>
      {hint && !error && <span className="text-xs text-navy-400">{hint}</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
})

export default Select
