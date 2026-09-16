import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '../../../utils/formatCurrency'

const data = [
  { category: 'Savings', value: 3200000 },
  { category: 'Investment', value: 8600000 },
  { category: 'Thrift', value: 1450000 },
  { category: 'Loans', value: 2100000 },
  { category: 'Hire-Purchase', value: 4300000 },
]

const COLORS = ['#10B981', '#0B1B33', '#f59e0b', '#8b5cf6', '#f43f5e']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-900 text-white text-xs rounded-lg px-3 py-2 shadow-soft">
      <p className="font-semibold">{label}</p>
      <p className="text-emerald-300">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export default function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
        <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#8397b8' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: '#8397b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCurrency(v, { compact: true })}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f7fa' }} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={44}>
          {data.map((entry, idx) => (
            <Cell key={entry.category} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
