import { useState } from 'react'
import { Landmark, Pencil } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useDataStore } from '../../context/DataStoreContext'
import { useToast } from '../../context/ToastContext'

export default function BankDetailsPage() {
  const { bankDetails, updateBankDetails } = useDataStore()
  const { showToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(bankDetails)
  const [saving, setSaving] = useState(false)

  const handleEdit = () => {
    setForm(bankDetails)
    setEditing(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    updateBankDetails(form)
    setSaving(false)
    setEditing(false)
    showToast('Bank details updated successfully.', 'success')
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Bank Details Management" subtitle="Manage the payment information displayed to customers." />

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-11 h-11 rounded-xl bg-navy-900 text-emerald-400 flex items-center justify-center">
            <Landmark size={20} />
          </span>
          <div>
            <p className="text-sm font-bold text-navy-900">Default Settlement Account</p>
            <p className="text-xs text-navy-400">Shown to customers on the Payment Instructions screen.</p>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input label="Bank Name" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
            <Input label="Account Name" value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} />
            <Input label="Account Number" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
            <div className="flex items-center gap-3 mt-2">
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>Save Changes</Button>
            </div>
          </form>
        ) : (
          <div>
            <div className="rounded-xl border border-navy-100 divide-y divide-navy-50">
              {[
                { label: 'Bank Name', value: bankDetails.bankName },
                { label: 'Account Name', value: bankDetails.accountName },
                { label: 'Account Number', value: bankDetails.accountNumber },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-4 py-3.5">
                  <span className="text-sm text-navy-400">{row.label}</span>
                  <span className="text-sm font-bold text-navy-900">{row.value}</span>
                </div>
              ))}
            </div>
            <Button className="mt-5" icon={Pencil} onClick={handleEdit}>Edit</Button>
          </div>
        )}
      </Card>
    </div>
  )
}
