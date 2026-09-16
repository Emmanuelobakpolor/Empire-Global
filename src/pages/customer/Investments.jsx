import { TrendingUp } from 'lucide-react'
import ProductCategoryPage from './ProductCategoryPage'

export default function Investments() {
  return (
    <ProductCategoryPage
      type="investment"
      title="Investments"
      subtitle="Grow your money with fixed and short-term investment plans."
      icon={TrendingUp}
      balanceKey="investmentBalance"
    />
  )
}
