export default function Logo({ variant = 'dark', size = 'md' }) {
  const sizes = {
    sm: { box: 'w-7 h-7', text: 'text-sm', sub: 'text-[9px]' },
    md: { box: 'w-9 h-9', text: 'text-base', sub: 'text-[10px]' },
    lg: { box: 'w-11 h-11', text: 'text-lg', sub: 'text-[11px]' },
  }
  const s = sizes[size]
  const light = variant === 'light'

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${s.box} rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-soft`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-[55%] h-[55%]">
          <path d="M4 17V9L12 14L20 9V17" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="leading-tight">
        <p className={`font-extrabold tracking-tight ${s.text} ${light ? 'text-white' : 'text-navy-900'}`}>
          EMPIRE <span className="text-emerald-500">GLOBAL</span>
        </p>
        <p className={`${s.sub} font-semibold tracking-widest uppercase ${light ? 'text-navy-300' : 'text-navy-400'}`}>
          Financial Services
        </p>
      </div>
    </div>
  )
}
