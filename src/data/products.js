// The product catalogue itself lives on the backend (GET /api/products/); these are the
// fixed option lists the UI uses.

export const productTypes = [
  { value: 'savings', label: 'Savings' },
  { value: 'investment', label: 'Investment' },
  { value: 'thrift', label: 'Thrift' },
  { value: 'loan', label: 'Loan' },
  { value: 'hire-purchase', label: 'Hire Purchase' },
]

// Hire-purchase is limited to these item categories (electronics, and tricycles / bikes only)
export const HIRE_PURCHASE_CATEGORIES = [
  { value: 'Phones & gadgets', label: 'Phones & gadgets', group: 'Electronics' },
  { value: 'Laptops & computers', label: 'Laptops & computers', group: 'Electronics' },
  { value: 'Home appliances', label: 'Home appliances', group: 'Electronics' },
  { value: 'Other electronics', label: 'Other electronics', group: 'Electronics' },
  { value: 'Tricycle', label: 'Tricycle (Keke)', group: 'Vehicles' },
  { value: 'Bike', label: 'Bike (Okada / motorcycle)', group: 'Vehicles' },
]
