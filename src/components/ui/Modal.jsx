import { useEffect } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  '2xl': 'max-w-3xl',
}

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${SIZES[size]} bg-white rounded-t-2xl sm:rounded-2xl shadow-xl animate-modal-in max-h-[90vh] flex flex-col`}
      >
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-navy-100">
            <div>
              {title && <h3 className="text-lg font-bold text-navy-900">{title}</h3>}
              {subtitle && <p className="text-sm text-navy-400 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-navy-50 shrink-0"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-navy-100 flex items-center justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
