import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Stepper from '../../components/ui/Stepper'
import { PRODUCT_ICONS, PRODUCT_COLORS } from '../../components/customer/ProductCard'
import { useDataStore } from '../../context/DataStoreContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { generateReference } from '../../utils/generateReference'
import { productTypes } from '../../data/products'

const STEPS = ['Select Product', 'Enter Amount', 'Select Plan', 'Review', 'Generated']

export default function CreateTransaction() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { products, createTransaction } = useDataStore()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [step, setStep] = useState(0)
  const [productId, setProductId] = useState(searchParams.get('productId') || '')
  const [amount, setAmount] = useState('')
  const [planFrequency, setPlanFrequency] = useState('')
  const [reference, setReference] = useState('')

  const product = useMemo(() => products.find((p) => p.id === productId), [products, productId])

  useEffect(() => {
    if (productId && !product) setProductId('')
  }, [productId, product])

  const canGoNext = () => {
    if (step === 0) return !!productId
    if (step === 1) {
      const num = Number(amount)
      return num > 0 && (!product || (num >= product.minAmount && num <= product.maxAmount))
    }
    if (step === 2) return !!planFrequency
    return true
  }

  const handleNext = () => {
    if (step === 3) {
      // Generate transaction
      const ref = generateReference(product.type)
      const txn = {
        id: `t${Date.now()}`,
        reference: ref,
        customerId: user?.id,
        customerName: user?.fullName,
        productId: product.id,
        productName: product.name,
        productType: product.type,
        amount: Number(amount),
        date: new Date().toISOString().slice(0, 10),
        status: 'draft',
        receipt: null,
        timeline: [
          { label: 'Transaction Created', done: true, date: new Date().toISOString() },
          { label: 'Payment Instructions Generated', done: true, date: new Date().toISOString() },
          { label: 'Receipt Uploaded', done: false },
          { label: 'Awaiting Verification', done: false },
          { label: 'Payment Approved', done: false },
        ],
      }
      createTransaction(txn)
      setReference(ref)
      showToast('Transaction reference generated successfully.', 'success')
      setStep(4)
      return
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const handleBack = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div className="max-w-3xl">
      <PageHeader title="Create Transaction" subtitle="Set up a new savings, investment, loan or hire-purchase transaction." />

      <Stepper steps={STEPS} currentStep={step} />

      <Card>
        {step === 0 && (
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

        {step === 1 && product && (
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

        {step === 2 && product && (
          <div>
            <h3 className="text-base font-bold text-navy-900 mb-1">Select Plan</h3>
            <p className="text-sm text-navy-400 mb-5">Choose your preferred payment frequency for this plan.</p>
            <Select
              label="Payment Frequency"
              value={planFrequency}
              onChange={(e) => setPlanFrequency(e.target.value)}
              options={product.frequency.split(/,| or /).filter(Boolean).map((f) => ({ value: f.trim(), label: f.trim() }))}
              placeholder="Choose a frequency"
            />
          </div>
        )}

        {step === 3 && product && (
          <div>
            <h3 className="text-base font-bold text-navy-900 mb-1">Review Transaction</h3>
            <p className="text-sm text-navy-400 mb-5">Please confirm the details below before generating your transaction reference.</p>
            <div className="rounded-xl border border-navy-100 divide-y divide-navy-50">
              {[
                { label: 'Product', value: product.name },
                { label: 'Type', value: productTypes.find((t) => t.value === product.type)?.label },
                { label: 'Amount', value: formatCurrency(Number(amount)) },
                { label: 'Payment Frequency', value: planFrequency },
                { label: 'Customer', value: user?.fullName },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-navy-400">{row.label}</span>
                  <span className="font-semibold text-navy-900">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <Check size={30} />
            </div>
            <h3 className="text-lg font-bold text-navy-900">Transaction Reference Generated</h3>
            <p className="text-sm text-navy-400 mt-1">Your transaction has been created successfully.</p>
            <div className="bg-navy-900 rounded-xl px-6 py-4 mt-5 w-full">
              <p className="text-xs text-navy-300">Transaction Reference</p>
              <p className="text-lg font-mono font-bold text-emerald-400 mt-1 tracking-wide">{reference}</p>
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

      {step < 4 && (
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" icon={ChevronLeft} onClick={handleBack} disabled={step === 0}>
            Back
          </Button>
          <Button icon={ChevronRight} iconPosition="right" onClick={handleNext} disabled={!canGoNext()}>
            {step === 3 ? 'Generate Transaction' : 'Continue'}
          </Button>
        </div>
      )}
    </div>
  )
}
