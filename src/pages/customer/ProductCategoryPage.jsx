import { Link } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import ProductCard from '../../components/customer/ProductCard'
import TransactionTable from '../../components/customer/TransactionTable'
import EmptyState from '../../components/ui/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { useDataStore } from '../../context/DataStoreContext'
import { formatCurrency } from '../../utils/formatCurrency'

export default function ProductCategoryPage({ type, title, subtitle, icon: Icon, balanceKey }) {
  const { user } = useAuth()
  const { products, transactions } = useDataStore()

  const categoryProducts = products.filter((p) => p.type === type && p.status === 'active')
  const categoryTransactions = transactions.filter((t) => t.customerId === user?.id && t.productType === type && t.status !== 'draft')
  const balance = balanceKey ? user?.[balanceKey] || 0 : null

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />

      {balance !== null && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 stagger-children">
          <StatCard label={`${title} Balance`} value={formatCurrency(balance)} icon={Icon} tone="emerald" />
          <StatCard label="Active Plans" value={categoryTransactions.filter((t) => t.status === 'approved').length} icon={Icon} tone="navy" />
          <StatCard label="Pending Plans" value={categoryTransactions.filter((t) => t.status === 'pending' || t.status === 'processing').length} icon={Icon} tone="amber" />
        </div>
      )}

      <h3 className="text-sm font-bold text-navy-800 mb-4">Available Plans</h3>
      {categoryProducts.length === 0 ? (
        <EmptyState title={`No ${title.toLowerCase()} products available`} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8 stagger-children">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <h3 className="text-sm font-bold text-navy-800 mb-4">Your {title} Transactions</h3>
      <TransactionTable transactions={categoryTransactions} />
    </div>
  )
}
