import { useRef, useState } from 'react'
import { UploadCloud, CheckCircle2, FileText, X, User, Phone, MapPin, Hash } from 'lucide-react'
import Input from '../ui/Input'
import Select from '../ui/Select'

// Which extra details each product type collects before final submission
export const NEEDS_APPLICATION = ['loan', 'hire-purchase']
export const NEEDS_NEXT_OF_KIN = ['savings', 'investment']

export const REQUIRED_DOCUMENTS = [
  { key: 'passport', label: 'Passport photograph' },
  { key: 'proofOfAddress', label: 'Proof of address', hint: 'Utility bill, LAWMA bill, etc.' },
  { key: 'proofOfId', label: 'Proof of ID', hint: 'NIN slip, driver’s licence, international passport or voter’s card' },
  { key: 'applicationForm', label: 'Completed application form', hint: 'Signed form from our office' },
]

export const RELATIONSHIP_OPTIONS = ['Spouse', 'Parent', 'Sibling', 'Child', 'Relative', 'Friend', 'Colleague', 'Employer', 'Other'].map((r) => ({ value: r, label: r }))

export const ID_TYPE_OPTIONS = ['NIN', 'Driver’s Licence', 'International Passport', 'Voter’s Card'].map((t) => ({ value: t, label: t }))

export const EMPTY_GUARANTOR = { fullName: '', phone: '', address: '', relationship: '', idType: '', idNumber: '', idDocument: null }
export const EMPTY_NEXT_OF_KIN = { fullName: '', phone: '', relationship: '', address: '' }

const filled = (v) => typeof v === 'string' && v.trim().length > 0

// Standard documents plus any the product asks for (e.g. proof of income for a salary advance)
export function requiredDocumentsFor(product) {
  return [...REQUIRED_DOCUMENTS, ...(product?.requiredDocuments || [])]
}

export function documentsComplete(documents, product) {
  return requiredDocumentsFor(product).every((d) => documents[d.key])
}

export function itemErrors(item) {
  const errs = {}
  if (!item.category) errs.category = 'Choose the type of item.'
  if (!filled(item.description)) errs.description = 'Describe the item you want, e.g. brand and model.'
  return errs
}

export function guarantorErrors(g) {
  const errs = {}
  if (!filled(g.fullName)) errs.fullName = 'Full name is required.'
  if (!filled(g.phone)) errs.phone = 'Phone number is required.'
  if (!filled(g.address)) errs.address = 'Address is required.'
  if (!g.relationship) errs.relationship = 'Relationship is required.'
  if (!g.idType) errs.idType = 'ID type is required.'
  if (!filled(g.idNumber)) errs.idNumber = 'ID number is required.'
  if (!g.idDocument) errs.idDocument = 'Upload a copy of the guarantor’s ID.'
  return errs
}

export function nextOfKinErrors(n) {
  const errs = {}
  if (!filled(n?.fullName)) errs.fullName = 'Full name is required.'
  if (!filled(n?.phone)) errs.phone = 'Phone number is required.'
  if (!n?.relationship) errs.relationship = 'Relationship is required.'
  if (!filled(n?.address)) errs.address = 'Address is required.'
  return errs
}

// The File itself is kept so it can be uploaded with the application; the rest is for display
const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024
const toDocument = (file) => file && { fileName: file.name, size: file.size, uploadedAt: new Date().toISOString(), file }

function UploadRow({ label, hint, value, onChange, error }) {
  const inputRef = useRef(null)
  const [tooBig, setTooBig] = useState(false)
  const pick = (file) => {
    if (file && file.size > MAX_DOCUMENT_BYTES) {
      setTooBig(true)
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    setTooBig(false)
    onChange(toDocument(file))
  }
  error = error || (tooBig && 'Files must be 5 MB or smaller.')
  return (
    <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${error ? 'border-red-300' : value ? 'border-emerald-200 bg-emerald-50/40' : 'border-navy-100'}`}>
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${value ? 'bg-emerald-100 text-emerald-600' : 'bg-navy-50 text-navy-400'}`}>
        {value ? <CheckCircle2 size={17} /> : <FileText size={17} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-navy-800">{label}<span className="text-red-500 ml-0.5">*</span></p>
        <p className="text-xs text-navy-400 truncate">{value ? value.fileName : hint || 'JPG, PNG, WebP or PDF, up to 5 MB'}</p>
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>
      {value ? (
        <button
          type="button"
          onClick={() => {
            if (inputRef.current) inputRef.current.value = ''
            onChange(null)
          }}
          className="p-2 rounded-lg text-navy-400 hover:text-red-500 hover:bg-red-50 shrink-0"
          aria-label={`Remove ${label}`}
        >
          <X size={16} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg hover:bg-emerald-100 shrink-0"
        >
          <UploadCloud size={14} /> Upload
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  )
}

export function DocumentsForm({ documents, onChange, product }) {
  return (
    <div className="flex flex-col gap-3">
      {requiredDocumentsFor(product).map((d) => (
        <UploadRow
          key={d.key}
          label={d.label}
          hint={d.hint}
          value={documents[d.key]}
          // The label is stored with the file so admins see what each upload is
          onChange={(doc) => onChange({ ...documents, [d.key]: doc && { ...doc, label: d.label } })}
        />
      ))}
    </div>
  )
}

export function ItemForm({ value, onChange, categories, errors = {} }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value })
  return (
    <div className="flex flex-col gap-4">
      <Select
        label="Item Type"
        placeholder="Choose the type of item"
        value={value.category}
        onChange={set('category')}
        options={categories.map((c) => ({ value: c, label: c }))}
        error={errors.category}
        required
      />
      <Input
        label="Item Description"
        placeholder="e.g. Samsung Galaxy A15, 128GB"
        value={value.description}
        onChange={set('description')}
        error={errors.description}
        hint="Brand, model and any other details that help us source the item."
        required
      />
    </div>
  )
}

export function GuarantorForm({ value, onChange, errors = {} }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value })
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input label="Full Name" icon={User} value={value.fullName} onChange={set('fullName')} error={errors.fullName} required />
      <Input label="Phone Number" icon={Phone} placeholder="+234 800 000 0000" value={value.phone} onChange={set('phone')} error={errors.phone} required />
      <Input label="Home Address" icon={MapPin} value={value.address} onChange={set('address')} error={errors.address} containerClassName="sm:col-span-2" required />
      <Select label="Relationship to You" placeholder="Choose relationship" value={value.relationship} onChange={set('relationship')} options={RELATIONSHIP_OPTIONS} error={errors.relationship} required />
      <Select label="ID Type" placeholder="Choose ID type" value={value.idType} onChange={set('idType')} options={ID_TYPE_OPTIONS} error={errors.idType} required />
      <Input label="ID Number" icon={Hash} value={value.idNumber} onChange={set('idNumber')} error={errors.idNumber} containerClassName="sm:col-span-2" required />
      <div className="sm:col-span-2">
        <UploadRow
          label="Guarantor’s ID document"
          hint="A clear copy of the ID above"
          value={value.idDocument}
          onChange={(doc) => onChange({ ...value, idDocument: doc })}
          error={errors.idDocument}
        />
      </div>
    </div>
  )
}

export function NextOfKinForm({ value, onChange, errors = {} }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value })
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input label="Full Name" icon={User} value={value.fullName} onChange={set('fullName')} error={errors.fullName} required />
      <Input label="Phone Number" icon={Phone} placeholder="+234 800 000 0000" value={value.phone} onChange={set('phone')} error={errors.phone} required />
      <Select label="Relationship" placeholder="Choose relationship" value={value.relationship} onChange={set('relationship')} options={RELATIONSHIP_OPTIONS} error={errors.relationship} required />
      <Input label="Address" icon={MapPin} value={value.address} onChange={set('address')} error={errors.address} required />
    </div>
  )
}

// Read-only key/value list for showing these details back (review step, admin pages)
export function DetailList({ rows }) {
  return (
    <div className="rounded-xl border border-navy-100 divide-y divide-navy-50">
      {rows.map((row) => (
        <div key={row.label} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
          <span className="text-navy-400 shrink-0">{row.label}</span>
          <span className="font-semibold text-navy-900 text-right break-words min-w-0">{row.value || '—'}</span>
        </div>
      ))}
    </div>
  )
}

// A stored document opens from the API (only for its owner and admins); before upload it's just a name
const fileValue = (doc) =>
  doc && (doc.url ? (
    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 hover:underline">
      {doc.fileName}
    </a>
  ) : doc.fileName)

export const guarantorRows = (g) => [
  { label: 'Full Name', value: g.fullName },
  { label: 'Phone', value: g.phone },
  { label: 'Address', value: g.address },
  { label: 'Relationship', value: g.relationship },
  { label: 'ID', value: g.idType && `${g.idType} · ${g.idNumber}` },
  { label: 'ID Document', value: fileValue(g.idDocument) },
]

export const nextOfKinRows = (n) => [
  { label: 'Full Name', value: n.fullName },
  { label: 'Phone', value: n.phone },
  { label: 'Relationship', value: n.relationship },
  { label: 'Address', value: n.address },
]

export const documentRows = (docs) =>
  Object.entries(docs || {})
    .filter(([, d]) => d)
    .map(([key, d]) => ({ label: d.label || REQUIRED_DOCUMENTS.find((r) => r.key === key)?.label || key, value: fileValue(d) }))

export const itemRows = (item) => [
  { label: 'Item Type', value: item.category },
  { label: 'Description', value: item.description },
]
