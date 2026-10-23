import { HandCoins } from 'lucide-react'
import ProductCategoryPage from './ProductCategoryPage'

export default function Ajo() {
  return (
    <ProductCategoryPage
      type="ajo"
      title="Ajo"
      subtitle="Esusu: contribute a fixed amount every day or week and collect it all at the end of your cycle."
      icon={HandCoins}
      balanceKey="ajoBalance"
    />
  )
}
