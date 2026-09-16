import { Landmark } from 'lucide-react'
import ProductCategoryPage from './ProductCategoryPage'

export default function Loans() {
  return (
    <ProductCategoryPage
      type="loan"
      title="Loans"
      subtitle="Access personal and business loan products with flexible repayment."
      icon={Landmark}
      balanceKey="outstandingLoan"
    />
  )
}
