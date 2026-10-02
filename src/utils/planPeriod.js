const DAY_MS = 24 * 60 * 60 * 1000

// Adds whole months to a YYYY-MM-DD date, clamping to the month's last day (31 Jan + 1 month = 28/29 Feb)
export function addMonths(dateStr, months) {
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number)
  const target = new Date(Date.UTC(y, m - 1 + months, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(d, lastDay))
  return target.toISOString().slice(0, 10)
}

export function formatTerm(months) {
  if (!months) return 'Open-ended'
  if (months === 1) return '1 month'
  if (months >= 24 && months % 12 === 0) return `${months} months (${months / 12} years)`
  return `${months} months`
}

// Term for transactions created before plan lengths were recorded: use the length in
// the product name ("Growth Fund 6-Month"), else the product's shortest option.
function inferTermMonths(txn, product) {
  const fromName = txn.productName?.match(/(\d+)[\s-]?month/i)
  if (fromName) return Number(fromName[1])
  if (product && product.termOptions === null) return null
  return product?.termOptions?.[0] ?? null
}

// The from / to dates of the plan a transaction belongs to.
// Starts on the day the customer completed the transaction and runs for the chosen term.
export function planPeriod(txn, products = []) {
  const product = products.find((p) => p.id === txn.productId)
  const termMonths = txn.termMonths !== undefined ? txn.termMonths : inferTermMonths(txn, product)
  const start = txn.startDate || txn.date
  if (!start) return null
  const end = termMonths ? addMonths(start, termMonths) : null

  let state = 'open'
  let daysLeft = null
  if (txn.status === 'rejected') state = 'cancelled'
  else if (end) {
    const today = new Date().toISOString().slice(0, 10)
    daysLeft = Math.round((Date.parse(end) - Date.parse(today)) / DAY_MS)
    state = today < start ? 'upcoming' : daysLeft < 0 ? 'expired' : 'running'
  }
  return { start, end, termMonths, state, daysLeft }
}

// Short label for the plan's status, with a Badge status key for its colour
export function periodStatus(period) {
  if (!period) return null
  if (period.state === 'cancelled') return { label: 'Cancelled', status: 'rejected' }
  if (period.state === 'open') return { label: 'No expiry', status: 'default' }
  if (period.state === 'expired') return { label: 'Expired', status: 'disabled' }
  if (period.state === 'upcoming') return { label: 'Not started', status: 'pending' }
  if (period.daysLeft === 0) return { label: 'Expires today', status: 'warning' }
  return { label: `${period.daysLeft} day${period.daysLeft === 1 ? '' : 's'} left`, status: period.daysLeft <= 30 ? 'warning' : 'active' }
}
