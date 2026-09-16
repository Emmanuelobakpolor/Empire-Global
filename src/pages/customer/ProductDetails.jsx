import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, CheckCircle2, ArrowRight } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { PRODUCT_ICONS, PRODUCT_COLORS } from '../../components/customer/ProductCard'
import { useDataStore } from '../../context/DataStoreContext'
import { formatCurrency } from '../../utils/formatCurrency'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products } = useDataStore()
  const product = products.find((p) => p.id === id)

  if (!product) {
    return <EmptyState title="Product not found" description="This product may have been removed." action={<Link to="/customer/products"><Button>Back to Products</Button></Link>} />
  }

  const Icon = PRODUCT_ICONS[product.type]

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-navy-800 mb-5"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <span className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${PRODUCT_COLORS[product.type]}`}>
            <Icon size={30} />
          </span>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-navy-900">{product.name}</h1>
            <p className="text-sm text-navy-400 mt-2 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Minimum Amount', value: formatCurrency(product.minAmount) },
          { label: 'Maximum Amount', value: formatCurrency(product.maxAmount) },
          { label: 'Duration', value: product.duration },
          { label: 'Frequency', value: product.frequency },
        ].map((item) => (
          <Card key={item.label} padded={false} className="p-4">
            <p className="text-xs text-navy-400">{item.label}</p>
            <p className="text-sm font-bold text-navy-900 mt-1">{item.value}</p>
          </Card>
        ))}
      </div>

      {product.expectedReturn && (
        <Card className="mb-6 !bg-emerald-50 !border-emerald-100">
          <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">Expected Return</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{product.expectedReturn}</p>
        </Card>
      )}

      <Card className="mb-6">
        <h3 className="text-sm font-bold text-navy-800 mb-4">Benefits</h3>
        <ul className="flex flex-col gap-3">
          {product.benefits.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-navy-600">
              <CheckCircle2 size={17} className="text-emerald-500 shrink-0 mt-0.5" />
              {b}
            </li>
          ))}
        </ul>
      </Card>

      <div className="sticky bottom-4 sm:static">
        <Button
          size="lg"
          fullWidth
          icon={ArrowRight}
          iconPosition="right"
          onClick={() => navigate(`/customer/transactions/new?productId=${product.id}`)}
        >
          Start This Plan
        </Button>
      </div>
    </div>
  )
}
