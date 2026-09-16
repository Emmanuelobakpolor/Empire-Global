import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { productTypes } from '../../data/products'

const EMPTY_FORM = {
  name: '',
  type: 'savings',
  description: '',
  minAmount: '',
  maxAmount: '',
  duration: '',
  frequency: '',
  status: 'active',
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
]

export default function ProductFormModal({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? { ...EMPTY_FORM, ...initialData }
          : EMPTY_FORM
      )
      setErrors({})
    }
  }, [open, initialData])

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Product name is required.'
    if (!form.description.trim()) errs.description = 'Description is required.'
    if (!form.minAmount) errs.minAmount = 'Minimum amount is required.'
    if (!form.maxAmount) errs.maxAmount = 'Maximum amount is required.'
    if (Number(form.maxAmount) <= Number(form.minAmount)) errs.maxAmount = 'Maximum must be greater than minimum.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSave({
      ...form,
      minAmount: Number(form.minAmount),
      maxAmount: Number(form.maxAmount),
      benefits: initialData?.benefits || ['Flexible terms', 'Transparent tracking'],
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Product' : 'Add Product'}
      subtitle="This product will be visible to customers immediately once saved."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{initialData ? 'Save Changes' : 'Add Product'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Product Name" value={form.name} onChange={update('name')} error={errors.name} containerClassName="sm:col-span-2" />
        <Select label="Product Type" value={form.type} onChange={update('type')} options={productTypes} />
        <Select label="Status" value={form.status} onChange={update('status')} options={STATUS_OPTIONS} />
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="text-sm font-medium text-navy-700">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={update('description')}
            className="w-full rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500"
          />
          {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
        </div>
        <Input label="Minimum Amount (₦)" type="number" value={form.minAmount} onChange={update('minAmount')} error={errors.minAmount} />
        <Input label="Maximum Amount (₦)" type="number" value={form.maxAmount} onChange={update('maxAmount')} error={errors.maxAmount} />
        <Input label="Duration" placeholder="e.g. 6 months" value={form.duration} onChange={update('duration')} />
        <Input label="Payment Frequency" placeholder="e.g. Monthly" value={form.frequency} onChange={update('frequency')} />
      </form>
    </Modal>
  )
}
