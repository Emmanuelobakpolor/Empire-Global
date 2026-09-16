import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-navy-900 text-white hover:bg-navy-800 focus-visible:ring-navy-900/30 shadow-soft',
  accent: 'bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-500/30 shadow-soft',
  outline: 'bg-white text-navy-800 border border-navy-200 hover:bg-navy-50 focus-visible:ring-navy-900/20',
  ghost: 'bg-transparent text-navy-700 hover:bg-navy-100 focus-visible:ring-navy-900/20',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500/30 shadow-soft',
  subtle: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus-visible:ring-emerald-500/20',
}

const SIZES = {
  sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
  lg: 'text-sm px-6 py-3.5 gap-2 rounded-xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {!loading && Icon && iconPosition === 'left' && <Icon size={16} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={16} />}
    </button>
  )
}
