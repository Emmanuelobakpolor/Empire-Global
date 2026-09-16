import { ShoppingBag } from 'lucide-react'
import ProductCategoryPage from './ProductCategoryPage'

export default function HirePurchase() {
  return (
    <ProductCategoryPage
      type="hire-purchase"
      title="Hire Purchase"
      subtitle="Acquire electronics and vehicles today, and pay gradually over time."
      icon={ShoppingBag}
      balanceKey={null}
    />
  )
}
