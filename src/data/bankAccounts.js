import { productTypes } from './products'

// Collection accounts live on the backend (GET /api/admin/bank-accounts/). Each facility
// (product type) maps to one account; facilities without a mapping use `default`.
export const FACILITIES = [{ value: 'default', label: 'Default (all other facilities)' }, ...productTypes]

export function facilityLabel(value) {
  return FACILITIES.find((f) => f.value === value)?.label || value
}

// The active account customers should pay into for a product type, or null if none is set up
export function resolveBankAccount(accounts, assignments, productType) {
  const active = (id) => accounts.find((a) => a.id === id && a.status === 'active')
  return active(assignments[productType]) || active(assignments.default) || accounts.find((a) => a.status === 'active') || null
}
