import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { productTypes, HIRE_PURCHASE_CATEGORIES } from '../../data/products'

const EMPTY_FORM = {
  name: '',
  category: '',
  type: 'savings',
  description: '',
  minAmount: '',
  maxAmount: '',
  duration: '',
  frequency: '',
  termOptions: '',
  expectedReturn: '',
  benefits: '',
  clauses: '',
  requirements: '',
  itemCategories: [],
  status: 'active',
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
]

// Lists are edited as one item per line
const toLines = (list) => (list || []).join('\n')
const fromLines = (text) => text.split('\n').map((l) => l.trim()).filter(Boolean)

function TextArea({ label, value, onChange, error, hint, rows = 3 }) {
  return (
    <div className="sm:col-span-2 flex flex-col gap-1.5">
      <label className="text-sm font-medium text-navy-700">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500"
      />
      {hint && !error && <span className="text-xs text-navy-400">{hint}</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

export default function ProductFormModal({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? {
              ...EMPTY_FORM,
              ...initialData,
              expectedReturn: initialData.expectedReturn || '',
              termOptions: (initialData.termOptions || []).join(', '),
              benefits: toLines(initialData.benefits),
              clauses: toLines(initialData.clauses),
              requirements: toLines(initialData.requirements),
              itemCategories: initialData.itemCategories || [],
            }
          : EMPTY_FORM
      )
      setErrors({})
    }
  }, [open, initialData])

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const isHirePurchase = form.type === 'hire-purchase'

  const toggleItemCategory = (value) =>
    setForm((f) => ({
      ...f,
      itemCategories: f.itemCategories.includes(value) ? f.itemCategories.filter((c) => c !== value) : [...f.itemCategories, value],
    }))

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Product name is required.'
    if (!form.description.trim()) errs.description = 'Description is required.'
    if (!form.minAmount) errs.minAmount = 'Minimum amount is required.'
    if (!form.maxAmount) errs.maxAmount = 'Maximum amount is required.'
    if (Number(form.maxAmount) <= Number(form.minAmount)) errs.maxAmount = 'Maximum must be greater than minimum.'
    if (!form.frequency.trim()) errs.frequency = 'Payment frequency is required.'
    if (form.termOptions.trim() && !/^\s*\d+(\s*,\s*\d+)*\s*$/.test(form.termOptions)) {
      errs.termOptions = 'Enter whole numbers of months separated by commas, e.g. 6, 12, 24.'
    }
    if (isHirePurchase && form.itemCategories.length === 0) errs.itemCategories = 'Choose at least one eligible item category.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const benefits = fromLines(form.benefits)
    setSaving(true)
    const result = await onSave({
      ...form,
      category: form.category.trim() || productTypes.find((t) => t.value === form.type)?.label,
      minAmount: Number(form.minAmount),
      maxAmount: Number(form.maxAmount),
      expectedReturn: form.expectedReturn.trim() || null,
      // Blank means open-ended: the plan has no expiry date
      termOptions: form.termOptions.trim()
        ? [...new Set(form.termOptions.split(',').map((m) => Number(m.trim())).filter((m) => m > 0))].sort((a, b) => a - b)
        : null,
      benefits: benefits.length ? benefits : ['Transparent tracking'],
      clauses: fromLines(form.clauses),
      requirements: fromLines(form.requirements),
      itemCategories: isHirePurchase ? form.itemCategories : [],
    })
    setSaving(false)
    // The server checks limits and lists too; show anything it rejects on the form
    if (result && !result.success) setErrors(result.fieldErrors || {})
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Product' : 'Add Product'}
      subtitle="This product will be visible to customers immediately once saved."
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>{initialData ? 'Save Changes' : 'Add Product'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Product Name" value={form.name} onChange={update('name')} error={errors.name} containerClassName="sm:col-span-2" />
        <Select label="Product Type" value={form.type} onChange={update('type')} options={productTypes} />
        <Input label="Category" placeholder="e.g. Periodic Investment" value={form.category} onChange={update('category')} hint="Shown above the product name." />
        <Select label="Status" value={form.status} onChange={update('status')} options={STATUS_OPTIONS} />
        <Input label="Expected Return" placeholder="e.g. 18% interest (leave blank if none)" value={form.expectedReturn} onChange={update('expectedReturn')} />
        <TextArea label="Description" value={form.description} onChange={update('description')} error={errors.description} />
        <Input label="Minimum Amount (₦)" type="number" value={form.minAmount} onChange={update('minAmount')} error={errors.minAmount} />
        <Input label="Maximum Amount (₦)" type="number" value={form.maxAmount} onChange={update('maxAmount')} error={errors.maxAmount} />
        <Input label="Duration (shown to customers)" placeholder="e.g. Minimum 6 months" value={form.duration} onChange={update('duration')} />
        <Input
          label="Plan Lengths (months)"
          placeholder="e.g. 6, 9, 12"
          value={form.termOptions}
          onChange={update('termOptions')}
          error={errors.termOptions}
          hint="Used to calculate each plan's end date. Leave blank for no expiry."
        />
        <Input label="Payment Frequency" placeholder="e.g. Daily or Weekly" value={form.frequency} onChange={update('frequency')} error={errors.frequency} hint="Separate options with commas or “or”." />

        {isHirePurchase && (
          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-navy-700 mb-1.5">Eligible Items</p>
            <p className="text-xs text-navy-400 mb-2">Hire-purchase is limited to electronics, and tricycles and bikes.</p>
            <div className="flex flex-wrap gap-2">
              {HIRE_PURCHASE_CATEGORIES.map((c) => {
                const on = form.itemCategories.includes(c.value)
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => toggleItemCategory(c.value)}
                    className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition-colors ${on ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-navy-200 text-navy-600 hover:bg-navy-50'}`}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>
            {errors.itemCategories && <p className="text-xs text-red-500 mt-1.5">{errors.itemCategories}</p>}
          </div>
        )}

        <TextArea label="Benefits" value={form.benefits} onChange={update('benefits')} hint="One benefit per line." rows={4} />
        <TextArea label="Terms & Clauses" value={form.clauses} onChange={update('clauses')} hint="One clause per line. Customers must accept these before submitting." rows={4} />
        {form.type === 'loan' && (
          <TextArea label="Requirements" value={form.requirements} onChange={update('requirements')} hint="One requirement per line." rows={3} />
        )}
      </form>
    </Modal>
  )
}
