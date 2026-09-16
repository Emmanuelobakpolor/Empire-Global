import { PiggyBank } from 'lucide-react'
import ProductCategoryPage from './ProductCategoryPage'

export default function Savings() {
  return (
    <ProductCategoryPage
      type="savings"
      title="Savings"
      subtitle="Save towards your financial goals with flexible or target plans."
      icon={PiggyBank}
      balanceKey="savingsBalance"
    />
  )
}
