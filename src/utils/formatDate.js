export function formatDate(dateInput, { withTime = false } = {}) {
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return '—'
  const dateOpts = { day: '2-digit', month: 'short', year: 'numeric' }
  const datePart = date.toLocaleDateString('en-NG', dateOpts)
  if (!withTime) return datePart
  const timePart = date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
  return `${datePart}, ${timePart}`
}

export function timeAgo(dateInput) {
  const date = new Date(dateInput)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(dateInput)
}
