// Percentage change between this calendar month and last, from real records.
// Returns undefined when last month had nothing to compare against, so no trend is shown.
export function monthOverMonth(items, getDate, getValue = () => 1) {
  const now = new Date()
  const thisKey = monthKey(now)
  const lastKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1))
  let current = 0
  let previous = 0
  items.forEach((item) => {
    const key = (getDate(item) || '').slice(0, 7)
    if (key === thisKey) current += getValue(item)
    else if (key === lastKey) previous += getValue(item)
  })
  if (!previous) return undefined
  return Math.round(((current - previous) / previous) * 1000) / 10
}

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
