export default function Logo({ variant = 'dark', size = 'md' }) {
  const sizes = {
    sm: { box: 'w-9 h-9', text: 'text-sm', sub: 'text-[9px]' },
    md: { box: 'w-11 h-11', text: 'text-base', sub: 'text-[10px]' },
    lg: { box: 'w-14 h-14', text: 'text-lg', sub: 'text-[11px]' },
  }
  const s = sizes[size]
  const light = variant === 'light'

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${s.box} shrink-0 flex items-center justify-center`}>
        <img
          src={light ? '/logo-light.png' : '/logo.png'}
          alt="Empire Global logo"
          className="w-full h-full object-contain drop-shadow-sm"
          draggable={false}
        />
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
