import { useRef, useState } from 'react'
import { UploadCloud, FileText, Image as ImageIcon, X } from 'lucide-react'

export default function FileUpload({ file, onFileSelect, onRemove, accept = 'image/*,.pdf', hint }) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleFile = (selected) => {
    if (!selected) return
    onFileSelect(selected)
    if (selected.type?.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selected))
    } else {
      setPreviewUrl(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const dropped = e.dataTransfer.files?.[0]
    handleFile(dropped)
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    if (inputRef.current) inputRef.current.value = ''
    onRemove?.()
  }

  if (file) {
    const isImage = file.type?.startsWith('image/')
    return (
      <div className="rounded-2xl border border-navy-200 bg-white p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-navy-50 flex items-center justify-center overflow-hidden shrink-0">
          {isImage && previewUrl ? (
            <img src={previewUrl} alt="Receipt preview" className="w-full h-full object-cover" />
          ) : (
            <FileText className="text-navy-400" size={22} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy-800 truncate">{file.name}</p>
          <p className="text-xs text-navy-400">{(file.size / 1024).toFixed(0)} KB</p>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="p-2 rounded-lg text-navy-400 hover:text-red-500 hover:bg-red-50 shrink-0"
          aria-label="Remove file"
        >
          <X size={18} />
        </button>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={`rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
        dragActive ? 'border-emerald-400 bg-emerald-50/50' : 'border-navy-200 bg-navy-50/40 hover:border-navy-300'
      }`}
      onClick={() => inputRef.current?.click()}
    >
      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
        <UploadCloud size={22} />
      </div>
      <p className="text-sm font-semibold text-navy-800">Drag & drop your receipt here</p>
      <p className="text-xs text-navy-400 mt-1">{hint || 'JPG, PNG or PDF, up to 5MB'}</p>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          inputRef.current?.click()
        }}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100"
      >
        <ImageIcon size={16} /> Browse Files
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
