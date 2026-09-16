// Payments queue mirrors pending/processing transactions awaiting admin verification.
// Derived helper is provided by DataStoreContext; this file just seeds extra metadata.
export const paymentMeta = {
  t1: { bankUsed: 'Empire Global Bank', paymentDate: '2026-08-18' },
  t4: { bankUsed: 'Empire Global Bank', paymentDate: '2026-08-05' },
  t6: { bankUsed: 'Empire Global Bank', paymentDate: '2026-07-22' },
}
