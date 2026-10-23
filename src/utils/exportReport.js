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

// An Ajo plan's statement: every contribution, the service charge and the payout, with the running
// balance. Opens printable; the browser's print dialog can save it as a PDF.
export function printStatement({ transaction, formatAmount, formatDate }) {
  const win = window.open('', '_blank')
  if (!win) return false
  const ajo = transaction.ajo
  const credits = ajo.statement.reduce((sum, r) => sum + r.credit, 0)
  const rows = ajo.statement
    .map((r) => `<tr><td>${escapeHtml(formatDate(r.date))}</td><td>${escapeHtml(r.description)}</td>`
      + `<td class="ref">${escapeHtml(r.reference)}</td><td class="num">${r.credit ? escapeHtml(formatAmount(r.credit)) : '—'}</td>`
      + `<td class="num">${r.debit ? escapeHtml(formatAmount(r.debit)) : '—'}</td><td class="num">${escapeHtml(formatAmount(r.balance))}</td></tr>`)
    .join('')
  const details = [
    ['Customer', transaction.customerName],
    ['Plan', `${transaction.productName} (${transaction.reference})`],
    ['Contribution', `${formatAmount(ajo.contribution)} ${ajo.frequency}`],
    ['Cycle', ajo.cycleEnds ? `${formatDate(transaction.startDate)} to ${formatDate(ajo.cycleEnds)}` : 'Not started'],
  ]
  const summary = [
    ['Total contributed', formatAmount(credits)],
    ['Service charge', formatAmount(ajo.payout?.serviceCharge ?? ajo.serviceCharge)],
    [ajo.payout ? 'Net payout' : 'Payout due at the end', formatAmount(ajo.payout?.payoutAmount ?? ajo.netPayout)],
  ]
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Statement ${escapeHtml(transaction.reference)}</title>
<style>
  body { font-family: system-ui, sans-serif; color: #0b1b33; margin: 32px; }
  h1 { font-size: 20px; margin: 0 0 2px; } h2 { font-size: 14px; color: #475569; margin: 0 0 16px; font-weight: 600; }
  p.meta { color: #64748b; font-size: 12px; margin: 0 0 20px; }
  dl { display: grid; grid-template-columns: max-content 1fr; gap: 4px 16px; font-size: 12px; margin: 0 0 20px; }
  dt { color: #64748b; } dd { margin: 0; font-weight: 600; }
  .summary { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
  .summary div { border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; font-size: 12px; }
  .summary strong { display: block; font-size: 15px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border-bottom: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; }
  th { background: #f1f5f9; } .num { text-align: right; white-space: nowrap; } .ref { font-family: monospace; }
</style></head><body>
<h1>Empire Global</h1>
<h2>Ajo Account Statement</h2>
<p class="meta">Generated ${escapeHtml(new Date().toLocaleString())}</p>
<dl>${details.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join('')}</dl>
<div class="summary">${summary.map(([k, v]) => `<div>${escapeHtml(k)}<strong>${escapeHtml(v)}</strong></div>`).join('')}</div>
<table><thead><tr><th>Date</th><th>Description</th><th>Reference</th><th class="num">Credit</th><th class="num">Debit</th><th class="num">Balance</th></tr></thead>
<tbody>${rows || '<tr><td colspan="6">No confirmed contributions yet.</td></tr>'}</tbody></table>
</body></html>`)
  win.document.close()
  win.focus()
  win.print()
  return true
}

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
