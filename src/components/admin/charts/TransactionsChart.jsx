import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Mar', transactions: 68 },
  { month: 'Apr', transactions: 92 },
  { month: 'May', transactions: 130 },
  { month: 'Jun', transactions: 111 },
  { month: 'Jul', transactions: 158 },
  { month: 'Aug', transactions: 184 },
  { month: 'Sep', transactions: 142 },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-900 text-white text-xs rounded-lg px-3 py-2 shadow-soft">
      <p className="font-semibold">{label}</p>
      <p className="text-emerald-300">{payload[0].value} transactions</p>
    </div>
  )
}

export default function TransactionsChart() {
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
        <YAxis tick={{ fontSize: 12, fill: '#8397b8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="transactions" stroke="#10B981" strokeWidth={2.5} fill="url(#txnGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
