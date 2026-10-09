import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const MONTHS = 7

// Transactions created in each of the last few months (drafts without a receipt included,
// since they're still customer activity)
function monthlyCounts(transactions) {
  const now = new Date()
  const buckets = Array.from({ length: MONTHS }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1 - i), 1)
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, month: d.toLocaleString('en', { month: 'short' }), transactions: 0 }
  })
  const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]))
  transactions.forEach((t) => {
    const bucket = byKey[(t.date || '').slice(0, 7)]
    if (bucket) bucket.transactions += 1
  })
  return buckets
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-900 text-white text-xs rounded-lg px-3 py-2 shadow-soft">
      <p className="font-semibold">{label}</p>
      <p className="text-emerald-300">{payload[0].value} transaction{payload[0].value === 1 ? '' : 's'}</p>
    </div>
  )
}

export default function TransactionsChart({ transactions = [] }) {
  const data = monthlyCounts(transactions)
  if (!data.some((d) => d.transactions)) {
    return <ChartEmpty message="No transactions in the last 7 months yet." />
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="txnGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8397b8' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#8397b8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="transactions" stroke="#10B981" strokeWidth={2.5} fill="url(#txnGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function ChartEmpty({ message }) {
  return (
    <div className="h-[260px] flex items-center justify-center rounded-xl border border-dashed border-navy-100 text-sm text-navy-400 text-center px-6">
      {message}
    </div>
  )
}
