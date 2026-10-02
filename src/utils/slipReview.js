export const TRAIL_LABELS = {
  viewed: 'Viewed slip',
  recommended_approval: 'Recommended approval',
  recommended_rejection: 'Recommended rejection',
  approved: 'Final approval',
  rejected: 'Final rejection',
}

export function latestRecommendation(txn) {
  return [...(txn.slipTrail || [])].reverse().find((s) => s.action.startsWith('recommended_')) || null
}

// Where a payment slip sits in the Admin → Super Admin review chain.
// `status` is a Badge status key, so the colour matches the rest of the UI.
export function slipStage(txn) {
  if (txn.status === 'approved') return { label: 'Final approved', status: 'approved' }
  if (txn.status === 'rejected') return { label: 'Final rejected', status: 'rejected' }
  const rec = latestRecommendation(txn)
  if (rec) {
    return rec.action === 'recommended_approval'
      ? { label: 'Recommended · awaiting Super Admin', status: 'processing' }
      : { label: 'Flagged for rejection · awaiting Super Admin', status: 'warning' }
  }
  if ((txn.slipTrail || []).some((s) => s.action === 'viewed')) return { label: 'Viewed', status: 'default' }
  return { label: 'Not reviewed', status: 'pending' }
}
