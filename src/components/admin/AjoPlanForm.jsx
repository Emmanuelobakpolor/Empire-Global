import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { useDataStore } from '../../context/DataStoreContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatTerm } from '../../utils/planPeriod'
import { CONTRIBUTION_FREQUENCY, contributionLabel, estimateAjo } from '../../utils/ajo'

export const EMPTY_AJO_PLAN = { productId: '', amount: '', contributionFrequency: '', termMonths: '', termsAccepted: false }

// The plan as the API takes it
export const ajoPlanBody = (plan) => ({ ...plan, amount: Number(plan.amount), termMonths: Number(plan.termMonths) })

// Choosing an Ajo plan for a customer: product, contribution, how often and the cycle, with what it comes to
export function AjoPlanFields({ value, onChange, errors = {} }) {
  const { products } = useDataStore()
  const ajoProducts = products.filter((p) => p.type === 'ajo' && p.status === 'active')
  const product = ajoProducts.find((p) => p.id === value.productId)
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  // One product, one frequency or one cycle length: choose it for staff
  useEffect(() => {
    const next = { ...value }
    if (!next.productId && ajoProducts.length === 1) next.productId = ajoProducts[0].id
    const chosen = ajoProducts.find((p) => p.id === next.productId)
    if (chosen && !next.contributionFrequency && chosen.contributionFrequencies?.length === 1) next.contributionFrequency = chosen.contributionFrequencies[0]
    if (chosen && !next.termMonths && chosen.termOptions?.length === 1) next.termMonths = String(chosen.termOptions[0])
    if (JSON.stringify(next) !== JSON.stringify(value)) onChange(next)
  }, [value, ajoProducts.length])

  if (!ajoProducts.length) return <p className="text-sm text-amber-700">No Ajo product is available. Add or enable one under Products.</p>

  const estimate = estimateAjo(Number(value.amount), value.contributionFrequency, Number(value.termMonths))
  return (
    <div className="flex flex-col gap-4">
      {ajoProducts.length > 1 && (
        <Select
          label="Ajo Product"
          value={value.productId}
          onChange={(e) => onChange({ ...EMPTY_AJO_PLAN, productId: e.target.value })}
          options={ajoProducts.map((p) => ({ value: p.id, label: p.name }))}
          placeholder="Choose a product"
          error={errors.productId}
        />
      )}
      {product && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Each Contribution (₦)"
              type="number"
              min="0"
              value={value.amount}
              onChange={set('amount')}
              hint={`${formatCurrency(product.minAmount)} – ${formatCurrency(product.maxAmount)}`}
              error={errors.amount}
            />
            <Select
              label="How Often"
              value={value.contributionFrequency}
              onChange={set('contributionFrequency')}
              options={(product.contributionFrequencies || []).map((f) => ({ value: f, label: contributionLabel(f) }))}
              placeholder="Choose"
              error={errors.contributionFrequency}
            />
            <Select
              label="Cycle Length"
              value={String(value.termMonths)}
              onChange={set('termMonths')}
              options={(product.termOptions || []).map((m) => ({ value: String(m), label: formatTerm(m) }))}
              placeholder="Choose"
              error={errors.termMonths}
            />
          </div>
          {estimate && (
            <p className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-navy-700">
              {estimate.count} contributions of {formatCurrency(Number(value.amount))} {CONTRIBUTION_FREQUENCY[value.contributionFrequency]?.per}:{' '}
              <strong>{formatCurrency(estimate.total)}</strong> if all are paid, so <strong>{formatCurrency(estimate.payout)}</strong> at the end after the{' '}
              {formatCurrency(estimate.charge)} service charge. The cycle starts today.
            </p>
          )}
          {product.clauses?.length > 0 && (
            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
              <ul className="list-disc pl-5 space-y-1 text-xs text-navy-600 max-h-32 overflow-y-auto">
                {product.clauses.map((c) => <li key={c}>{c}</li>)}
              </ul>
              <label className="flex items-start gap-2 mt-3 text-sm text-navy-800 cursor-pointer">
                <input type="checkbox" checked={value.termsAccepted} onChange={set('termsAccepted')} className="w-4 h-4 mt-0.5 rounded accent-emerald-500" />
                The customer has been told these terms and agrees to them.
              </label>
              {errors.termsAccepted && <p className="text-xs text-red-500 mt-1">{errors.termsAccepted}</p>}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Start an Ajo plan for a customer who's already registered
export function StartAjoModal({ customer, open, onClose }) {
  const { startAjoPlan } = useDataStore()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(EMPTY_AJO_PLAN)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setPlan(EMPTY_AJO_PLAN)
      setErrors({})
    }
  }, [open])

  const submit = async () => {
    setSaving(true)
    const result = await startAjoPlan(customer.id, ajoPlanBody(plan))
    setSaving(false)
    if (!result.success) {
      setErrors(result.fieldErrors || {})
      showToast(result.error, 'error')
      return
    }
    showToast(`Ajo plan started for ${customer.fullName}.`, 'success')
    onClose()
    navigate(`/admin/ajo/${result.transaction.id}`)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Start Ajo Plan"
      subtitle={customer?.fullName}
      size="lg"
      footer={(
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="accent" onClick={submit} loading={saving}>Start Plan</Button>
        </>
      )}
    >
      <AjoPlanFields value={plan} onChange={setPlan} errors={errors} />
    </Modal>
  )
}
