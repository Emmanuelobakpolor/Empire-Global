// Ajo (Esusu): a fixed contribution every day or week for a cycle of calendar months, withdrawn
// when the customer asks, less one contribution for each month saved in. The server builds the
// schedule and does the sums; these helpers label things and estimate a plan before it starts.
import { instalmentCount } from './facility'

export const CONTRIBUTION_FREQUENCY = {
  daily: { label: 'Daily', per: 'a day', unit: 'day' },
  weekly: { label: 'Weekly', per: 'a week', unit: 'week' },
  monthly: { label: 'Monthly', per: 'a month', unit: 'month' },
}

export const contributionLabel = (frequency) => CONTRIBUTION_FREQUENCY[frequency]?.label || frequency

// `badge` is a Badge status key, so the colour matches the rest of the UI
export const AJO_STATE = {
  active: { label: 'Saving', badge: 'active' },
  ended: { label: 'Cycle ended · payout due', badge: 'warning' },
  payout_requested: { label: 'Payout requested', badge: 'processing' },
  paid_out: { label: 'Paid out', badge: 'completed' },
}

export const CONTRIBUTION_STATE = {
  upcoming: { label: 'Upcoming', badge: 'default' },
  due: { label: 'Due today', badge: 'warning' },
  overdue: { label: 'Overdue', badge: 'rejected' },
  missed: { label: 'Missed', badge: 'default' },
  pending: { label: 'Awaiting confirmation', badge: 'processing' },
  paid: { label: 'Paid', badge: 'approved' },
}

export const METHOD_LABELS = { transfer: 'Bank transfer', cash: 'Cash' }

// Cycles run on calendar months: a plan joined today starts on the 1st of this month
export const cycleStart = (today = new Date().toISOString().slice(0, 10)) => `${today.slice(0, 7)}-01`

// Before the plan starts: how many contributions, the total, the charge (one contribution a month) and the payout
export function estimateAjo(amount, frequency, termMonths) {
  if (!amount || !frequency || !termMonths) return null
  const count = instalmentCount(termMonths, frequency, cycleStart())
  const total = amount * count
  const charge = amount * termMonths
  return { count, total, charge, payout: total - charge }
}

export const contributionsToConfirm = (txn) => txn.ajo?.contributions.filter((c) => c.state === 'pending').length || 0
