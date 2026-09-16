import { Link } from 'react-router-dom'
import { PiggyBank, TrendingUp, Coins, Landmark, ShoppingBag, ArrowRight } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'

export const PRODUCT_ICONS = {
  savings: PiggyBank,
  investment: TrendingUp,
  thrift: Coins,
  loan: Landmark,
  'hire-purchase': ShoppingBag,
}

export const PRODUCT_COLORS = {
  savings: 'bg-emerald-50 text-emerald-600',
  investment: 'bg-blue-50 text-blue-600',
  thrift: 'bg-amber-50 text-amber-600',
  loan: 'bg-purple-50 text-purple-600',
  'hire-purchase': 'bg-rose-50 text-rose-600',
}

export default function ProductCard({ product }) {
  const Icon = PRODUCT_ICONS[product.type] || PiggyBank
  const colorClass = PRODUCT_COLORS[product.type] || 'bg-navy-50 text-navy-600'

  return (
    <div className="bg-white rounded-2xl border border-navy-100 shadow-card p-5 sm:p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200">
      <div className="flex items-start justify-between mb-4">
        <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon size={22} />
        </span>
        {product.expectedReturn && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            {product.expectedReturn}
          </span>
        )}
      </div>
      <h3 className="text-base font-bold text-navy-900">{product.name}</h3>
      <p className="text-sm text-navy-400 mt-1.5 line-clamp-2 flex-1">{product.description}</p>

      <div className="flex items-center justify-between text-xs text-navy-400 mt-4 pt-4 border-t border-navy-50">
        <span>
          Min <span className="font-semibold text-navy-700">{formatCurrency(product.minAmount, { compact: true })}</span>
        </span>
        <span>
          Duration <span className="font-semibold text-navy-700">{product.duration}</span>
        </span>
      </div>

      <div className="flex items-center gap-2 mt-5">
        <Link
          to={`/customer/products/${product.id}`}
          className="flex-1 text-center text-sm font-semibold text-navy-700 border border-navy-200 rounded-xl px-4 py-2.5 hover:bg-navy-50 transition-colors"
        >
          View Details
        </Link>
        <Link
          to={`/customer/products/${product.id}`}
          className="flex items-center justify-center gap-1 text-sm font-semibold text-white bg-emerald-500 rounded-xl px-4 py-2.5 hover:bg-emerald-600 transition-colors shrink-0"
        >
          Start Now <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}
