export default function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-rise-in">
      <div>
        {breadcrumb && <div className="text-xs text-navy-400 mb-1">{breadcrumb}</div>}
        <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-navy-400 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
    </div>
  )
}
