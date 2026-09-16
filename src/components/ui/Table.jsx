export default function Table({ columns, children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card ${className}`}>
      <table className="w-full text-sm min-w-[640px]">
        {columns && (
          <thead>
            <tr className="border-b border-navy-100 bg-navy-50/50">
              {columns.map((col) => (
                <th
                  key={col.key || col}
                  className="text-left font-semibold text-navy-500 text-xs uppercase tracking-wide px-5 py-3.5 whitespace-nowrap"
                >
                  {col.label || col}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-navy-50 stagger-rows">{children}</tbody>
      </table>
    </div>
  )
}

export function Td({ children, className = '' }) {
  return <td className={`px-5 py-4 text-navy-700 whitespace-nowrap ${className}`}>{children}</td>
}

export function Tr({ children, className = '', ...rest }) {
  return (
    <tr className={`hover:bg-navy-50/40 transition-colors ${className}`} {...rest}>
      {children}
    </tr>
  )
}
