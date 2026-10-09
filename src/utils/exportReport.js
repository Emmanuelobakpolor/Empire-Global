// Real report exports built from the transactions on screen (after filters).

const COLUMNS = [
  { label: 'Reference', value: (t) => t.reference },
  { label: 'Date', value: (t) => t.date },
  { label: 'Customer ID', value: (t) => t.customerId },
  { label: 'Customer', value: (t) => t.customerName },
  { label: 'Agent', value: (t, agentFor) => agentFor(t.customerId) || '' },
  { label: 'Product', value: (t) => t.productName },
  { label: 'Type', value: (t) => t.productType },
  { label: 'Amount (NGN)', value: (t) => t.amount },
  { label: 'Status', value: (t) => t.status },
]

const stamp = () => new Date().toISOString().slice(0, 10)

function csvCell(value) {
  const text = String(value ?? '')
  // Quote anything with commas, quotes or line breaks; neutralise spreadsheet formulas
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export function downloadCsv(transactions, agentFor) {
  const rows = [COLUMNS.map((c) => c.label), ...transactions.map((t) => COLUMNS.map((c) => c.value(t, agentFor)))]
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
  // BOM so Excel reads the ₦ sign and names correctly
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `empire-global-report-${stamp()}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch])

// Opens a printable report; the browser's print dialog can save it as a PDF
export function printReport({ title, filtersText, summary, transactions, agentFor, formatAmount }) {
  const win = window.open('', '_blank')
  if (!win) return false
  const rows = transactions
    .map((t) => `<tr>${COLUMNS.map((c) => {
      const value = c.label.startsWith('Amount') ? formatAmount(t.amount) : c.value(t, agentFor)
      return `<td>${escapeHtml(value)}</td>`
    }).join('')}</tr>`)
    .join('')
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  body { font-family: system-ui, sans-serif; color: #0b1b33; margin: 32px; }
  h1 { font-size: 20px; margin: 0 0 4px; } p.meta { color: #64748b; font-size: 12px; margin: 0 0 20px; }
  .summary { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
  .summary div { border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; font-size: 12px; }
  .summary strong { display: block; font-size: 15px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border-bottom: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; }
  th { background: #f1f5f9; }
</style></head><body>
<h1>${escapeHtml(title)}</h1>
<p class="meta">Generated ${escapeHtml(new Date().toLocaleString())}${filtersText ? ` · ${escapeHtml(filtersText)}` : ''}</p>
<div class="summary">${summary.map((s) => `<div>${escapeHtml(s.label)}<strong>${escapeHtml(s.value)}</strong></div>`).join('')}</div>
<table><thead><tr>${COLUMNS.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('')}</tr></thead>
<tbody>${rows || `<tr><td colspan="${COLUMNS.length}">No transactions match these filters.</td></tr>`}</tbody></table>
</body></html>`)
  win.document.close()
  win.focus()
  win.print()
  return true
}
