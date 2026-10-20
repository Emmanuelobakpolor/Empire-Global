// Loans and hire-purchase: credit facilities repaid by instalments. The server fixes the rate,
// builds the schedule and decides when each instalment's payment details appear; these helpers
// only label things and estimate repayments before an application is approved.
import { addMonths } from './planPeriod'

export const FREQUENCY_LABELS = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  once: 'One-time (end of term)',
}

export const frequencyLabel = (value) => FREQUENCY_LABELS[value] || value

// `badge` is a Badge status key, so the colour matches the rest of the UI
export const FACILITY_STATUS = {
  under_review: { label: 'Under review', badge: 'pending' },
  awaiting_disbursement: { label: 'Approved · awaiting disbursement', badge: 'processing' },
  active: { label: 'Repaying', badge: 'active' },
  completed: { label: 'Fully repaid', badge: 'completed' },
  rejected: { label: 'Rejected', badge: 'rejected' },
}

export function facilityStatus(txn) {
  const status = FACILITY_STATUS[txn.facility?.status] || FACILITY_STATUS.under_review
  // Hire-purchase items are delivered rather than disbursed
  if (txn.facility?.status === 'awaiting_disbursement' && txn.productType === 'hire-purchase') {
    return { ...status, label: 'Approved · awaiting delivery' }
  }
  return status
}

export const receiptsToVerify = (txn) => txn.facility?.repayments.filter((r) => r.state === 'pending').length || 0

// Admin work waiting on a loan or hire-purchase: a decision, a payout or delivery, or a receipt
export function needsAction(txn) {
  const status = txn.facility?.status
  return status === 'under_review' || status === 'awaiting_disbursement' || receiptsToVerify(txn) > 0
}

export const REPAYMENT_STATE = {
  upcoming: { label: 'Upcoming', badge: 'default' },
  due: { label: 'Due', badge: 'warning' },
  overdue: { label: 'Overdue', badge: 'rejected' },
  pending: { label: 'Receipt under review', badge: 'processing' },
  paid: { label: 'Paid', badge: 'approved' },
}

const DAY_MS = 24 * 60 * 60 * 1000

export function instalmentCount(termMonths, frequency, start = new Date().toISOString().slice(0, 10)) {
  const term = termMonths || 1
  if (frequency === 'once') return 1
  if (frequency === 'monthly') return term
  const days = Math.round((Date.parse(addMonths(start, term)) - Date.parse(start)) / DAY_MS)
  return Math.max(1, Math.ceil(days / (frequency === 'daily' ? 1 : 7)))
}

export const repayableTotal = (amount, rate) => Math.round(amount * (1 + rate / 100) * 100) / 100

// Flat interest: a percent of the amount, charged once whatever the term
export function estimateRepayment(amount, rate, termMonths, frequency) {
  if (rate === null || rate === undefined || !amount || !frequency) return null
  const total = repayableTotal(amount, rate)
  const count = instalmentCount(termMonths, frequency)
  return { total, count, each: Math.round((total / count) * 100) / 100 }
}

export function daysUntil(dateStr) {
  const today = new Date().toISOString().slice(0, 10)
  return Math.round((Date.parse(dateStr) - Date.parse(today)) / DAY_MS)
}

export function dueIn(dateStr) {
  const days = daysUntil(dateStr)
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days > 1) return `Due in ${days} days`
  return `${-days} day${days === -1 ? '' : 's'} overdue`
}

export function bankAccountErrors(account) {
  const errs = {}
  if (!account.bankName?.trim()) errs.bankName = 'Bank name is required.'
  if (!/^\d{10}$/.test(account.accountNumber?.trim() || '')) errs.accountNumber = 'Enter the 10-digit NUBAN account number.'
  if (!account.accountName?.trim()) errs.accountName = 'Account name is required.'
  return errs
}
