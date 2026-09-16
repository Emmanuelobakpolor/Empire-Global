const PRODUCT_CODES = {
  savings: 'SAV',
  investment: 'INV',
  thrift: 'THR',
  loan: 'LN',
  'hire-purchase': 'HP',
}

export function generateReference(productType = 'savings') {
  const code = PRODUCT_CODES[productType] || 'TXN'
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const seq = String(Math.floor(Math.random() * 900) + 100)
  return `EMP-${code}-${y}${m}${d}-${seq}`
}

export function generateCustomerId() {
  const seq = String(Math.floor(Math.random() * 90000) + 10000)
  return `EMP-${seq}`
}
