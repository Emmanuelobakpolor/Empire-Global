import { HandCoins } from 'lucide-react'
import ProductCategoryPage from './ProductCategoryPage'

export default function Ajo() {
  return (
    <ProductCategoryPage
      type="ajo"
      title="Ajo"
      subtitle="Esusu: contribute a fixed amount every day or week, and withdraw what you’ve saved when you need it."
      icon={HandCoins}
      balanceKey="ajoBalance"
    />
  )
}
