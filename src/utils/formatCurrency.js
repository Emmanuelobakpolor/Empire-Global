export function formatCurrency(value, { compact = false } = {}) {
  const amount = Number(value) || 0
  if (compact) {
    if (Math.abs(amount) >= 1_000_000) {
      return `₦${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    }
    if (Math.abs(amount) >= 1_000) {
      return `₦${(amount / 1_000).toFixed(1).replace(/\.0$/, '')}K`
    }
  }
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-NG')
}
