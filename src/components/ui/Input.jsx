import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, type = 'text', className = '', containerClassName = '', required, ...rest },
  ref
) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-navy-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300" />
        )}
        <input
          ref={ref}
          type={resolvedType}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 ${
            Icon ? 'pl-11' : ''
          } ${isPassword ? 'pr-11' : ''} ${
            error ? 'border-red-400' : 'border-navy-200'
          } ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-500"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {hint && !error && <span className="text-xs text-navy-400">{hint}</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
})

export default Input
