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
  interestRate: '',
  interestRates: { upfront: '', monthly: '', maturity: '', partial: '' },
  status: 'active',
}

// Yearly interest rates by product type; a blank one uses the default shown
const PARTIAL_RATE_FIELD = { key: 'partial', label: 'After Partial Withdrawal (% a year)', hint: 'On the capital left, when withdrawn from before maturity. Default 12%.' }
const RATE_FIELDS = {
  investment: [
    { key: 'upfront', label: 'Upfront Rate (%)', hint: 'Paid at the start. Default 30%.' },
    { key: 'monthly', label: 'Monthly Rate (% a year)', hint: 'Paid in 12 monthly parts. Default 36% (3% a month).' },
    { key: 'maturity', label: 'At Maturity Rate (%)', hint: 'Paid at the end of the year. Default 42%.' },
    PARTIAL_RATE_FIELD,
  ],
  savings: [
    { key: 'maturity', label: 'Interest Rate (% a year)', hint: 'Pro-rata over the plan, paid at maturity. Default 15%.' },
    PARTIAL_RATE_FIELD,
  ],
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
              interestRate: initialData.interestRate ?? '',
              interestRates: {
                upfront: initialData.interestRates?.upfront ?? '',
                monthly: initialData.interestRates?.monthly ?? '',
                maturity: initialData.interestRates?.maturity ?? '',
                partial: initialData.interestRates?.partial ?? '',
              },
            }
          : EMPTY_FORM
      )
      setErrors({})
    }
  }, [open, initialData])

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const isHirePurchase = form.type === 'hire-purchase'
  const isFacility = isHirePurchase || form.type === 'loan'
  const isInvestment = form.type === 'investment'
  const rateFields = RATE_FIELDS[form.type]
  const updateRate = (key) => (e) => setForm((f) => ({ ...f, interestRates: { ...f.interestRates, [key]: e.target.value } }))

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
      // Blank means open-ended: the plan has no expiry date. Investments are always 12 months.
      termOptions: isInvestment ? [12] : form.termOptions.trim()
        ? [...new Set(form.termOptions.split(',').map((m) => Number(m.trim())).filter((m) => m > 0))].sort((a, b) => a - b)
        : null,
      benefits: benefits.length ? benefits : ['Transparent tracking'],
      clauses: fromLines(form.clauses),
      requirements: fromLines(form.requirements),
      itemCategories: isHirePurchase ? form.itemCategories : [],
      // Blank: a Super Admin sets the rate when approving each application
      interestRate: isFacility && form.interestRate !== '' ? Number(form.interestRate) : null,
      // Investments and savings: a blank rate uses the default
      ...(rateFields && {
        interestRates: Object.fromEntries(
          rateFields.filter((f) => form.interestRates[f.key] !== '').map((f) => [f.key, Number(form.interestRates[f.key])])
        ),
      }),
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
        <Input label="Expected Return" placeholder="e.g. 30% upfront (leave blank if none)" value={form.expectedReturn} onChange={update('expectedReturn')} />
        <TextArea label="Description" value={form.description} onChange={update('description')} error={errors.description} />
        <Input label="Minimum Amount (₦)" type="number" value={form.minAmount} onChange={update('minAmount')} error={errors.minAmount} />
        <Input label="Maximum Amount (₦)" type="number" value={form.maxAmount} onChange={update('maxAmount')} error={errors.maxAmount} />
        <Input label="Duration (shown to customers)" placeholder="e.g. Minimum 6 months" value={form.duration} onChange={update('duration')} />
        {isInvestment ? (
          <Input label="Plan Length (months)" value="12" disabled hint="Every investment is a 12-month contract." />
        ) : (
          <Input
            label="Plan Lengths (months)"
            placeholder="e.g. 6, 9, 12"
            value={form.termOptions}
            onChange={update('termOptions')}
            error={errors.termOptions}
            hint="Used to calculate each plan's end date. Leave blank for no expiry."
          />
        )}
        <Input label="Payment Frequency" placeholder="e.g. Daily or Weekly" value={form.frequency} onChange={update('frequency')} error={errors.frequency} hint="Separate options with commas or “or”." />

        {isFacility && (
          <Input
            label="Interest Rate (% of the amount, flat)"
            type="number"
            min="0"
            step="0.01"
            value={form.interestRate}
            onChange={update('interestRate')}
            error={errors.interestRate}
            hint="Charged once on the amount, whatever the term. Leave blank for the default of 13%. A Super Admin can still change it on each application."
          />
        )}
        {rateFields && (
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rateFields.map((f) => (
              <Input
                key={f.key}
                label={f.label}
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.interestRates[f.key]}
                onChange={updateRate(f.key)}
                hint={f.hint}
              />
            ))}
            {errors.interestRates && <p className="sm:col-span-2 text-xs text-red-500">{errors.interestRates}</p>}
          </div>
        )}
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
