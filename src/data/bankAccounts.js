import { productTypes } from './products'

// Collection accounts customers pay into. Each facility (product type) is mapped to
// one account in `accountAssignments`; facilities without a mapping use `default`.
export const initialBankAccounts = [
  {
    id: 'ba1',
    bankName: 'Empire Global Bank',
    accountName: 'EMPIRE GLOBAL LTD',
    accountNumber: '1234567890',
    notes: 'Main collection account.',
    status: 'active',
    createdAt: '2024-01-10',
  },
  {
    id: 'ba2',
    bankName: 'Zenith Bank',
    accountName: 'EMPIRE GLOBAL LTD - HIRE PURCHASE',
    accountNumber: '1012345678',
    notes: 'Use transaction reference as narration.',
    status: 'active',
    createdAt: '2025-03-02',
  },
]

export const initialAccountAssignments = {
  default: 'ba1',
  'hire-purchase': 'ba2',
}

export const FACILITIES = [{ value: 'default', label: 'Default (all other facilities)' }, ...productTypes]

export function facilityLabel(value) {
  return FACILITIES.find((f) => f.value === value)?.label || value
}

// The active account customers should pay into for a product type, or null if none is set up
export function resolveBankAccount(accounts, assignments, productType) {
  const active = (id) => accounts.find((a) => a.id === id && a.status === 'active')
  return active(assignments[productType]) || active(assignments.default) || accounts.find((a) => a.status === 'active') || null
}
