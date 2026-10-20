import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useDataStore } from '../../context/DataStoreContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'

// Record that a due interest payment has been transferred to the customer's bank account
export default function RecordInterestModal({ payment, customerName, account, onClose, onRecorded }) {
  const { recordInterestPayment } = useDataStore()
  const { showToast } = useToast()
  const [reference, setReference] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (payment) setReference('')
  }, [payment])

  const submit = async () => {
    setBusy(true)
    const result = await recordInterestPayment(payment.id, reference.trim())
    setBusy(false)
    if (!result.success) {
      showToast(result.error, 'error')
      return
    }
    showToast('Interest payment recorded. The customer has been notified.', 'success')
    onClose()
    onRecorded?.()
  }

  return (
    <Modal
      open={!!payment}
      onClose={onClose}
      title="Record Interest Payment"
      subtitle={payment && `Only after ${formatCurrency(payment.amount)} has been sent to ${customerName}: ${account?.bankName} ${account?.accountNumber} (${account?.accountName}).`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="accent" loading={busy} disabled={!reference.trim()} onClick={submit}>Confirm</Button>
        </>
      }
    >
      <Input
        label="Transfer Reference"
        placeholder="e.g. FT2610120045"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        required
      />
    </Modal>
  )
}
