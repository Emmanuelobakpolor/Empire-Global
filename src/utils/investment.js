// Interest on investments and savings plans, a percent a year earned pro-rata. An investment's
// customer chooses how it's paid; savings are paid at maturity. The server fixes the rate when the
// payment is approved, starts the plan and schedules each interest payment. These helpers only label
// things and estimate amounts before then.

export const INVESTMENT_TERM_MONTHS = 12

export const INTEREST_OPTIONS = {
  upfront: { label: 'Upfront', when: 'Paid to you at the start of the contract' },
  monthly: { label: 'Monthly', when: 'Paid to you every month for 12 months' },
  maturity: { label: 'At maturity', when: 'Paid to you when the plan matures, with your capital' },
}

export const interestOptionLabel = (option) => INTEREST_OPTIONS[option]?.label || option

// `badge` is a Badge status key, so the colour matches the rest of the UI
export const INTEREST_PAYMENT_STATE = {
  upcoming: { label: 'Upcoming', badge: 'default' },
  due: { label: 'Due', badge: 'warning' },
  paid: { label: 'Paid', badge: 'approved' },
  cancelled: { label: 'Cancelled', badge: 'rejected' },
}

const kobo = (n) => Math.round(n * 100) / 100

// "36% a year (3% monthly)" for monthly, "30% upfront" etc. for the others
export function rateLabel(option, rate) {
  if (rate === null || rate === undefined) return '—'
  if (option === 'monthly') return `${rate}% a year (${kobo(rate / 12)}% monthly)`
  if (option === 'upfront') return `${rate}% upfront`
  return `${rate}% a year, at maturity`
}

// Interest on `amount` at `rate`% a year over `termMonths`
export function interestEstimate(amount, rate, option, termMonths = INVESTMENT_TERM_MONTHS) {
  if (!amount || rate === null || rate === undefined || !option || !termMonths) return null
  const total = kobo((amount * rate * termMonths) / 1200)
  return option === 'monthly' ? { total, count: termMonths, each: kobo(total / termMonths) } : { total, count: 1, each: total }
}
