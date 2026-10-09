import { useState } from 'react'
import { FileText, ExternalLink, ImageOff } from 'lucide-react'
import { formatDate } from '../utils/formatDate'

const isImage = (name = '') => /\.(jpe?g|png|webp)$/i.test(name)

// The uploaded payment slip. Files are served by the API only to the customer who
// uploaded them and to admins, so the session cookie is what grants access.
export default function ReceiptPreview({ receipt }) {
  const [broken, setBroken] = useState(false)

  if (!receipt) {
    return (
      <div className="rounded-xl border border-dashed border-navy-200 p-4 text-sm text-navy-400 flex items-center gap-3">
        <FileText size={18} /> No receipt uploaded yet
      </div>
    )
  }

  const showImage = receipt.url && isImage(receipt.fileName) && !broken

  return (
    <div className="rounded-xl border border-navy-100 bg-navy-50/50 overflow-hidden">
      {showImage && (
        <a href={receipt.url} target="_blank" rel="noopener noreferrer" className="block bg-white border-b border-navy-100">
          <img
            src={receipt.url}
            alt={`Payment receipt ${receipt.fileName}`}
            className="w-full max-h-80 object-contain"
            onError={() => setBroken(true)}
          />
        </a>
      )}
      <div className="p-4 flex items-center gap-3">
        <span className="w-11 h-11 rounded-lg bg-white border border-navy-100 flex items-center justify-center shrink-0">
          {broken ? <ImageOff size={20} className="text-navy-400" /> : <FileText size={20} className="text-navy-400" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-navy-800 truncate">{receipt.fileName}</p>
          <p className="text-xs text-navy-400">
            {receipt.uploadedAt && `Uploaded ${formatDate(receipt.uploadedAt, { withTime: true })}`}
            {!receipt.url && ' · File not available'}
          </p>
        </div>
        {receipt.url && (
          <a
            href={receipt.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 shrink-0"
          >
            Open <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  )
}
