import { useState } from 'react'
import { Copy, CheckCircle2, Landmark, ClipboardList } from 'lucide-react'
import Card from '../ui/Card'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { copyText } from '../../utils/clipboard'
import { productTypes } from '../../data/products'

// Where to pay for a transaction: the collection account for its facility, recorded by the
// server when the transaction was created. Every value can be copied into a banking app.
export default function PaymentAccountCard({ transaction, className = 'mb-6' }) {
  const { showToast } = useToast()
  const [copied, setCopied] = useState('')
  const account = transaction.paymentAccount

  if (!account) {
    return (
      <Card className={`${className} !bg-amber-50 !border-amber-100`}>
        <p className="text-sm text-amber-800">
          No bank account is set up for this facility yet. Please contact support before making a payment.
        </p>
      </Card>
    )
  }

  const facility = productTypes.find((t) => t.value === transaction.productType)?.label || transaction.productType
  // Banking apps want plain digits, not "₦25,000.00"
  const plainAmount = String(Number(transaction.amount))

  const rows = [
    { key: 'accountNumber', label: 'Account Number', value: account.accountNumber, copyValue: account.accountNumber, big: true },
    { key: 'bank', label: 'Bank', value: account.bankName, copyValue: account.bankName },
    { key: 'accountName', label: 'Account Name', value: account.accountName, copyValue: account.accountName },
    { key: 'amount', label: 'Amount', value: formatCurrency(transaction.amount), copyValue: plainAmount },
    { key: 'reference', label: 'Narration / Reference', value: transaction.reference, copyValue: transaction.reference, mono: true },
  ]

  const copy = async (key, value, label) => {
    const ok = await copyText(value)
    if (!ok) {
      showToast(`Couldn't copy automatically. Please copy the ${label.toLowerCase()} manually.`, 'error')
      return
    }
    setCopied(key)
    showToast(`${label} copied.`, 'success')
    setTimeout(() => setCopied((current) => (current === key ? '' : current)), 1800)
  }

  const allDetails = [
    `Bank: ${account.bankName}`,
    `Account Number: ${account.accountNumber}`,
    `Account Name: ${account.accountName}`,
    `Amount: ${plainAmount}`,
    `Narration: ${transaction.reference}`,
  ].join('\n')

  return (
    <Card className={className}>
      <div className="flex items-start gap-3 mb-5">
        <span className="w-11 h-11 rounded-xl bg-navy-900 text-emerald-400 flex items-center justify-center shrink-0">
          <Landmark size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-navy-900">Pay into this {facility} account</p>
          <p className="text-xs text-navy-400 mt-0.5">
            For <strong className="text-navy-600">{transaction.productName}</strong>. Use the reference below as your transfer narration.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-navy-100 divide-y divide-navy-50">
        {rows.map((row) => (
          <div key={row.key} className={`flex items-center justify-between gap-3 px-4 ${row.big ? 'py-4 bg-emerald-50/40' : 'py-3.5'}`}>
            <div className="min-w-0">
              <p className="text-xs text-navy-400">{row.label}</p>
              <p
                className={`font-bold text-navy-900 mt-0.5 break-all select-all ${row.big ? 'text-2xl font-mono tracking-wider' : 'text-sm'} ${row.mono ? 'font-mono tracking-wide' : ''}`}
              >
                {row.value}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copy(row.key, row.copyValue, row.label)}
              className={`inline-flex items-center gap-1.5 rounded-lg shrink-0 text-xs font-semibold transition-colors ${
                row.big ? 'px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700' : 'p-2 text-navy-400 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
              aria-label={`Copy ${row.label.toLowerCase()}`}
              title={`Copy ${row.label.toLowerCase()}`}
            >
              {copied === row.key ? <CheckCircle2 size={16} className={row.big ? '' : 'text-emerald-500'} /> : <Copy size={16} />}
              {row.big && (copied === row.key ? 'Copied' : 'Copy')}
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
        {account.notes ? <p className="text-xs text-navy-500"><strong>Note:</strong> {account.notes}</p> : <span />}
        <button
          type="button"
          onClick={() => copy('all', allDetails, 'Payment details')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          {copied === 'all' ? <CheckCircle2 size={14} /> : <ClipboardList size={14} />} Copy all details
        </button>
      </div>
    </Card>
  )
}
