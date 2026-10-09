import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check, ShieldCheck, Users } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Stepper from '../../components/ui/Stepper'
import { PRODUCT_ICONS, PRODUCT_COLORS } from '../../components/customer/ProductCard'
import {
  NEEDS_APPLICATION, NEEDS_NEXT_OF_KIN, EMPTY_GUARANTOR, EMPTY_NEXT_OF_KIN,
  DocumentsForm, GuarantorForm, NextOfKinForm, ItemForm, DetailList, itemErrors, itemRows,
  documentsComplete, guarantorErrors, nextOfKinErrors, guarantorRows, nextOfKinRows, documentRows,
} from '../../components/customer/ApplicationForms'
import { useDataStore } from '../../context/DataStoreContext'
import GeneratingTransaction, { GENERATING_MS } from '../../components/customer/GeneratingTransaction'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { productTypes } from '../../data/products'
import { formatDate } from '../../utils/formatDate'
import { addMonths, formatTerm } from '../../utils/planPeriod'

const STEP_LABELS = {
  product: 'Product',
  amount: 'Amount',
  plan: 'Plan',
  item: 'Item',
  documents: 'Documents',
  guarantor: 'Guarantor',
  nextOfKin: 'Next of Kin',
  review: 'Review',
  done: 'Generated',
}

export default function CreateTransaction() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { products, productsLoaded, customers, createTransaction, updateCustomer } = useDataStore()
  const { user, updateProfile } = useAuth()
  const { showToast } = useToast()

  const [step, setStep] = useState(0)
  const [productId, setProductId] = useState(searchParams.get('productId') || '')
  const [amount, setAmount] = useState('')
  const [planFrequency, setPlanFrequency] = useState('')
  const [termMonths, setTermMonths] = useState(null)
  const [reference, setReference] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Loan / hire-purchase application
  const [documents, setDocuments] = useState({})
  const [guarantor, setGuarantor] = useState(EMPTY_GUARANTOR)
  const [item, setItem] = useState({ category: '', description: '' })
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  // Savings / investment next of kin, pre-filled from the customer's profile
  const savedNextOfKin = customers.find((c) => c.id === user?.id)?.nextOfKin || user?.nextOfKin
  const [nextOfKin, setNextOfKin] = useState(savedNextOfKin || EMPTY_NEXT_OF_KIN)
  const [saveNextOfKin, setSaveNextOfKin] = useState(true)
  const [errors, setErrors] = useState({})

  const product = useMemo(() => products.find((p) => p.id === productId), [products, productId])
  const needsApplication = NEEDS_APPLICATION.includes(product?.type)
  const needsNextOfKin = NEEDS_NEXT_OF_KIN.includes(product?.type)
  const isHirePurchase = product?.type === 'hire-purchase'
  const hasClauses = product?.clauses?.length > 0
  const termOptions = product?.termOptions || []
  // Single-option products have a fixed term; null termOptions means open-ended
  const chosenTerm = termOptions.length > 1 ? termMonths : termOptions[0] ?? null
  const today = new Date().toISOString().slice(0, 10)
  const period = product ? { start: today, end: chosenTerm ? addMonths(today, chosenTerm) : null } : null

  const steps = [
    'product',
    'amount',
    'plan',
    ...(isHirePurchase ? ['item'] : []),
    ...(needsApplication ? ['documents', 'guarantor'] : []),
    ...(needsNextOfKin ? ['nextOfKin'] : []),
    'review',
    'done',
  ]
  const current = steps[step]

  // Clear an unknown product (e.g. from an old link) once the catalogue has loaded
  useEffect(() => {
    if (productsLoaded && productId && !product) setProductId('')
  }, [productsLoaded, productId, product])

  // Terms and item choice belong to one product, so start over when it changes
  useEffect(() => {
    setAcceptedTerms(false)
    setItem({ category: '', description: '' })
    setTermMonths(null)
  }, [productId])

  const canGoNext = () => {
    if (current === 'product') return !!productId
    if (current === 'amount') {
      const num = Number(amount)
      return num > 0 && (!product || (num >= product.minAmount && num <= product.maxAmount))
    }
    if (current === 'plan') return !!planFrequency && (termOptions.length <= 1 || !!termMonths)
    if (current === 'documents') return documentsComplete(documents, product)
    if (current === 'review' && hasClauses) return acceptedTerms
    return true
  }

  // The server assigns the reference, plan dates and status
  const generate = async () => {
    // The generating screen stays up for at least GENERATING_MS while the server works
    const startedAt = Date.now()
    setSubmitting(true)
    // Application files are uploaded with the transaction; the server stores and checks them
    const { idDocument, ...guarantorDetails } = guarantor
    const files = needsApplication
      ? { ...Object.fromEntries(Object.entries(documents).map(([key, doc]) => [key, doc?.file])), guarantorId: idDocument?.file }
      : {}
    const result = await createTransaction({
      productId: product.id,
      amount: Number(amount),
      termMonths: chosenTerm,
      termsAccepted: hasClauses ? acceptedTerms : false,
      ...(needsApplication && { application: { guarantor: guarantorDetails, ...(isHirePurchase && { item }) } }),
      ...(needsNextOfKin && { nextOfKin }),
    }, files)
    if (!result.success) {
      // Errors show straight away, without waiting for the animation to finish
      setSubmitting(false)
      // e.g. a document the server couldn't read, or an amount outside the product's limits
      const documentErrors = result.data?.documents
      showToast(Array.isArray(documentErrors) ? documentErrors[0] : result.error, 'error')
      return false
    }
    if (needsNextOfKin && saveNextOfKin) {
      updateCustomer(user.id, { nextOfKin })
      updateProfile({ nextOfKin }).then((saved) => {
        if (!saved.success) showToast(`Next of kin wasn't saved to your profile: ${saved.error}`, 'error')
      })
    }
    const remaining = GENERATING_MS - (Date.now() - startedAt)
    if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining))
    setSubmitting(false)
    setReference(result.transaction.reference)
    showToast(needsApplication ? 'Application submitted successfully.' : 'Transaction reference generated successfully.', 'success')
    return true
  }

  const handleNext = async () => {
    // Forms validate on Continue so the customer sees what's missing
    const stepErrors =
      current === 'item' ? itemErrors(item)
        : current === 'guarantor' ? guarantorErrors(guarantor)
        : current === 'nextOfKin' ? nextOfKinErrors(nextOfKin)
        : {}
    setErrors(stepErrors)
    if (Object.keys(stepErrors).length) return
    if (current === 'review' && !(await generate())) return
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  const handleBack = () => {
    setErrors({})
    setStep((s) => Math.max(s - 1, 0))
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Create Transaction" subtitle="Set up a new savings, investment, loan or hire-purchase transaction." />

      <Stepper steps={steps.map((s) => STEP_LABELS[s])} currentStep={step} />

      <Card>
        {current === 'product' && (
          <div>
            <h3 className="text-base font-bold text-navy-900 mb-1">Select a Product</h3>
            <p className="text-sm text-navy-400 mb-5">Choose the financial product you'd like to transact on.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.filter((p) => p.status === 'active').map((p) => {
                const Icon = PRODUCT_ICONS[p.type]
                const selected = productId === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => setProductId(p.id)}
                    className={`text-left flex items-center gap-3 rounded-xl border-2 p-4 transition-colors ${
                      selected ? 'border-emerald-500 bg-emerald-50/50' : 'border-navy-100 hover:border-navy-200'
                    }`}
                  >
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${PRODUCT_COLORS[p.type]}`}>
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy-900 truncate">{p.name}</p>
                      <p className="text-xs text-navy-400 capitalize">{p.type.replace('-', ' ')}</p>
                    </div>
                    {selected && <Check size={18} className="text-emerald-500 ml-auto shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {current === 'amount' && product && (
          <div>
            <h3 className="text-base font-bold text-navy-900 mb-1">Enter Amount</h3>
            <p className="text-sm text-navy-400 mb-5">
              Amount must be between {formatCurrency(product.minAmount)} and {formatCurrency(product.maxAmount)}.
            </p>
            <Input
              label="Amount (₦)"
              type="number"
              placeholder="e.g. 100000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              hint={`Min ${formatCurrency(product.minAmount)} · Max ${formatCurrency(product.maxAmount)}`}
            />
          </div>
        )}

        {current === 'plan' && product && (
          <div>
            <h3 className="text-base font-bold text-navy-900 mb-1">Select Plan</h3>
            <p className="text-sm text-navy-400 mb-5">Choose your payment frequency and how long the plan should run.</p>
            <div className="flex flex-col gap-4">
              <Select
                label="Payment Frequency"
                value={planFrequency}
                onChange={(e) => setPlanFrequency(e.target.value)}
                options={product.frequency.split(/,| or /).filter(Boolean).map((f) => ({ value: f.trim(), label: f.trim() }))}
                placeholder="Choose a frequency"
              />
              {termOptions.length > 1 ? (
                <Select
                  label="Plan Duration"
                  value={termMonths ? String(termMonths) : ''}
                  onChange={(e) => setTermMonths(Number(e.target.value))}
                  options={termOptions.map((m) => ({ value: String(m), label: formatTerm(m) }))}
                  placeholder="Choose a duration"
                />
              ) : (
                <div className="rounded-xl bg-navy-50/60 px-4 py-3 text-sm text-navy-600">
                  Plan duration: <strong className="text-navy-900">{termOptions.length ? formatTerm(termOptions[0]) : 'Open-ended (no expiry date)'}</strong>
                </div>
              )}
              {period?.end && (
                <p className="text-sm text-navy-500">
                  Runs from <strong className="text-navy-900">{formatDate(period.start)}</strong> to{' '}
                  <strong className="text-navy-900">{formatDate(period.end)}</strong>.
                </p>
              )}
            </div>
          </div>
        )}

        {current === 'item' && product && (
          <div>
            <h3 className="text-base font-bold text-navy-900 mb-1">What Would You Like?</h3>
            <p className="text-sm text-navy-400 mb-5">
              Hire-purchase covers electronics, and tricycles and bikes only. Ownership transfers to you after all instalments are paid.
            </p>
            <ItemForm value={item} onChange={setItem} categories={product.itemCategories || []} errors={errors} />
          </div>
        )}

        {current === 'documents' && (
          <div>
            <h3 className="text-base font-bold text-navy-900 mb-1">Application Documents</h3>
            <p className="text-sm text-navy-400 mb-5">
              Upload the documents required for your {product.type === 'loan' ? 'loan' : 'hire-purchase'} application.
              You'll add your guarantor's details next.
            </p>
            <DocumentsForm documents={documents} onChange={setDocuments} product={product} />
          </div>
        )}

        {current === 'guarantor' && (
          <div>
            <h3 className="text-base font-bold text-navy-900 mb-1 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" /> Guarantor Details
            </h3>
            <p className="text-sm text-navy-400 mb-5">
              Your application can't be submitted until your guarantor's details are complete.
            </p>
            <GuarantorForm value={guarantor} onChange={setGuarantor} errors={errors} />
          </div>
        )}

        {current === 'nextOfKin' && (
          <div>
            <h3 className="text-base font-bold text-navy-900 mb-1 flex items-center gap-2">
              <Users size={18} className="text-emerald-500" /> Next of Kin
            </h3>
            <p className="text-sm text-navy-400 mb-5">
              {savedNextOfKin
                ? 'We’ve filled this in from your profile. Check it’s still correct.'
                : 'Savings and investment plans need a next of kin on record.'}
            </p>
            <NextOfKinForm value={nextOfKin} onChange={setNextOfKin} errors={errors} />
            <label className="flex items-center gap-2 mt-5 text-sm text-navy-600 cursor-pointer">
              <input
                type="checkbox"
                checked={saveNextOfKin}
                onChange={(e) => setSaveNextOfKin(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-500"
              />
              Save to my profile for future plans
            </label>
          </div>
        )}

        {current === 'review' && product && !submitting && (
          <div>
            <h3 className="text-base font-bold text-navy-900 mb-1">Review {needsApplication ? 'Application' : 'Transaction'}</h3>
            <p className="text-sm text-navy-400 mb-5">
              Please confirm the details below before {needsApplication ? 'submitting your application' : 'generating your transaction reference'}.
            </p>
            <DetailList
              rows={[
                { label: 'Product', value: product.name },
                { label: 'Type', value: productTypes.find((t) => t.value === product.type)?.label },
                { label: 'Amount', value: formatCurrency(Number(amount)) },
                { label: 'Payment Frequency', value: planFrequency },
                { label: 'Duration', value: formatTerm(chosenTerm) },
                { label: 'Start Date', value: formatDate(period.start) },
                { label: 'End Date', value: period.end ? formatDate(period.end) : 'No expiry' },
                { label: 'Customer', value: user?.fullName },
              ]}
            />
            {needsApplication && (
              <>
                {isHirePurchase && (
                  <>
                    <p className="text-xs font-bold uppercase tracking-wider text-navy-400 mt-6 mb-2">Item</p>
                    <DetailList rows={itemRows(item)} />
                  </>
                )}
                <p className="text-xs font-bold uppercase tracking-wider text-navy-400 mt-6 mb-2">Documents</p>
                <DetailList rows={documentRows(documents)} />
                <p className="text-xs font-bold uppercase tracking-wider text-navy-400 mt-6 mb-2">Guarantor</p>
                <DetailList rows={guarantorRows(guarantor)} />
              </>
            )}
            {needsNextOfKin && (
              <>
                <p className="text-xs font-bold uppercase tracking-wider text-navy-400 mt-6 mb-2">Next of Kin</p>
                <DetailList rows={nextOfKinRows(nextOfKin)} />
              </>
            )}
            {hasClauses && (
              <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">Terms & Clauses</p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-navy-600 max-h-48 overflow-y-auto">
                  {product.clauses.map((c) => <li key={c}>{c}</li>)}
                </ul>
                <label className="flex items-start gap-2 mt-4 text-sm text-navy-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded accent-emerald-500"
                  />
                  I have read and agree to the terms and clauses of this plan.
                </label>
              </div>
            )}
          </div>
        )}

        {submitting && <GeneratingTransaction isApplication={needsApplication} />}

        {current === 'done' && (
          <div className="flex flex-col items-center text-center py-4 animate-rise-in">
            <div className="relative w-16 h-16 mb-4">
              <span className="absolute inset-0 rounded-full bg-emerald-200 animate-ping opacity-40 [animation-iteration-count:2]" aria-hidden="true" />
              <span className="relative w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center animate-check-pop">
                <Check size={30} />
              </span>
            </div>
            <h3 className="text-lg font-bold text-navy-900">{needsApplication ? 'Application Submitted' : 'Transaction Reference Generated'}</h3>
            <p className="text-sm text-navy-400 mt-1">Your transaction has been created successfully.</p>
            <div className="bg-navy-900 rounded-xl px-6 py-4 mt-5 w-full">
              <p className="text-xs text-navy-300">Transaction Reference</p>
              <p className="text-lg font-mono font-bold text-emerald-400 mt-1 tracking-wide animate-reference-reveal">{reference}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full mt-3 text-left stagger-pop">
              {[
                { label: 'Start Date', value: formatDate(period.start) },
                { label: 'End Date', value: period.end ? formatDate(period.end) : 'No expiry' },
                { label: 'Duration', value: formatTerm(chosenTerm) },
              ].map((row) => (
                <div key={row.label} className="rounded-xl border border-navy-100 px-3 py-2.5">
                  <p className="text-[11px] text-navy-400">{row.label}</p>
                  <p className="text-sm font-bold text-navy-900 mt-0.5">{row.value}</p>
                </div>
              ))}
            </div>
            <Button
              className="mt-6"
              fullWidth
              size="lg"
              onClick={() => navigate(`/customer/payment?ref=${reference}`)}
            >
              Continue to Payment Instructions
            </Button>
          </div>
        )}
      </Card>

      {current !== 'done' && !submitting && (
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" icon={ChevronLeft} onClick={handleBack} disabled={step === 0}>
            Back
          </Button>
          <Button icon={ChevronRight} iconPosition="right" onClick={handleNext} disabled={!canGoNext()} loading={submitting}>
            {current === 'review' ? (needsApplication ? 'Submit Application' : 'Generate Transaction') : 'Continue'}
          </Button>
        </div>
      )}
    </div>
  )
}
