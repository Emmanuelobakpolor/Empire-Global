import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import ProductCard from '../../components/customer/ProductCard'
import EmptyState from '../../components/ui/EmptyState'
import { useDataStore } from '../../context/DataStoreContext'
import { productTypes } from '../../data/products'
import { Package } from 'lucide-react'

export default function Products() {
  const { products } = useDataStore()
  const [filter, setFilter] = useState('all')

  const activeProducts = products.filter((p) => p.status === 'active')
  const filtered = filter === 'all' ? activeProducts : activeProducts.filter((p) => p.type === filter)

  return (
    <div>
      <PageHeader title="Financial Products" subtitle="Explore savings, investment, thrift, loan and hire-purchase plans." />

      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`shrink-0 text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${
            filter === 'all' ? 'bg-navy-900 text-white' : 'bg-white border border-navy-200 text-navy-600 hover:bg-navy-50'
          }`}
        >
          All Products
        </button>
        {productTypes.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`shrink-0 text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${
              filter === t.value ? 'bg-navy-900 text-white' : 'bg-white border border-navy-200 text-navy-600 hover:bg-navy-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="No products found" description="Try a different category filter." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
