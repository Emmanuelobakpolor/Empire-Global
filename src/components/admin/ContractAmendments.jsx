import { useState } from 'react'
import { PenLine } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import { useDataStore } from '../../context/DataStoreContext'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

const today = () => new Date().toISOString().slice(0, 10)

function Row({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-navy-100 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-navy-400">{label}</p>
        <p className="text-sm font-bold text-navy-900 mt-0.5">{value}</p>
      </div>
      <Button size="sm" variant="outline" onClick={onChange} className="shrink-0">Change</Button>
    </div>
  )
}

// A Super Admin's corrections to a contract already on the books: the day it really started (often
// before it was entered here) and, for savings and investments, the amount that was actually paid.
// The server moves the schedule, balance and interest to match.
export default function ContractAmendments({ transaction }) {
  const { changeContractDate, changePaymentAmount } = useDataStore()
  const { isSuperAdmin } = useAdminAuth()
  const { showToast } = useToast()
  // 'date' | 'amount' while its dialog is open
  const [editing, setEditing] = useState(null)
  const [value, setValue] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const { facility, ajo, investment } = transaction
  // Loans and hire-purchase start when disbursed; everything else when its payment is approved
  const started = facility ? ['active', 'completed'].includes(facility.status) : transaction.status === 'approved'
  const canChangeAmount = !facility && !ajo && transaction.status !== 'rejected'
  if (!isSuperAdmin || (!started && !canChangeAmount)) return null

  const open = (what) => {
    if (what === 'amount' && ajo) {
      showToast('An Ajo plan is paid in by contributions, recorded one at a time.', 'error')
      return
    }
    setValue(what === 'date' ? transaction.startDate : String(transaction.amount))
    setNote('')
    setError('')
    setEditing(what)
  }

  const submit = async () => {
    if (editing === 'amount' && !(Number(value) > 0)) {
      setError('Enter the amount that was paid.')
      return
    }
    setBusy(true)
    const result = editing === 'date'
      ? await changeContractDate(transaction.id, value, note.trim())
      : await changePaymentAmount(transaction.id, value, note.trim())
    setBusy(false)
    if (!result.success) {
      const fieldError = result.fieldErrors?.[editing === 'date' ? 'startDate' : 'amount']
      setError(fieldError || '')
      if (!fieldError) showToast(result.error, 'error')
      return
    }
    setEditing(null)
    showToast(editing === 'date' ? 'Contract date updated. The customer has been notified.' : 'Amount updated. The customer has been notified.', 'success')
  }

  const dateHint = ajo ? 'Ajo cycles run on calendar months, so the cycle moves to the 1st of the month you pick. Contributions already recorded keep their place.'
    : facility ? 'Every instalment’s due date moves with it.'
      : investment ? 'The end date and the interest payment dates move with it.'
        : 'The end date moves with it.'
  const amountHint = transaction.status === 'approved'
    ? `The customer’s balance${investment ? ' and the interest still to pay follow' : ' follows'} the new amount.`
    : 'This is what the customer is credited when the payment is approved.'

  return (
    <>
      <Card className="mb-6">
        <h3 className="text-sm font-bold text-navy-800 mb-1 flex items-center gap-2">
          <PenLine size={16} className="text-navy-400" /> Contract Corrections
        </h3>
        <p className="text-xs text-navy-400 mb-4">Super Admins only. Every change is written to the audit log and the customer is told.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {started && <Row label={ajo ? 'Cycle Start Date' : 'Contract Start Date'} value={formatDate(transaction.startDate)} onChange={() => open('date')} />}
          {canChangeAmount && <Row label="Amount Paid" value={formatCurrency(transaction.amount)} onChange={() => open('amount')} />}
        </div>
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'date' ? 'Change Contract Date' : 'Change Amount Paid'}
        subtitle={`${transaction.customerName} · ${transaction.productName} · ${transaction.reference}`}
        footer={(
          <>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={busy}>Cancel</Button>
            <Button variant="accent" onClick={submit} loading={busy} disabled={!value}>Save</Button>
          </>
        )}
      >
        <div className="flex flex-col gap-4">
          {editing === 'date' ? (
            <Input label="Start Date" type="date" max={today()} value={value} onChange={(e) => setValue(e.target.value)} error={error} hint={dateHint} required />
          ) : (
            <Input label="Amount Paid (₦)" type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} error={error} hint={amountHint} required />
          )}
          <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Contract signed and paid in cash on this date" />
        </div>
      </Modal>
    </>
  )
}
