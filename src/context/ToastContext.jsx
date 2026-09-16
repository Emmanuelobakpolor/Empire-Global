import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const STYLES = {
  success: 'bg-white border-emerald-200 text-navy-900 [&_svg]:text-emerald-500',
  error: 'bg-white border-red-200 text-navy-900 [&_svg]:text-red-500',
  info: 'bg-white border-navy-200 text-navy-900 [&_svg]:text-navy-500',
  warning: 'bg-white border-amber-200 text-navy-900 [&_svg]:text-amber-500',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'success', opts = {}) => {
    const id = ++idRef.current
    const toast = { id, message, type, title: opts.title }
    setToasts((prev) => [...prev, toast])
    const duration = opts.duration ?? 4000
    setTimeout(() => removeToast(id), duration)
    return id
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info
          return (
            <div
              key={t.id}
              className={`animate-toast-in flex items-start gap-3 rounded-xl border shadow-soft px-4 py-3 ${STYLES[t.type] || STYLES.info}`}
              role="status"
            >
              <Icon size={20} className="mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                {t.title && <p className="text-sm font-semibold">{t.title}</p>}
                <p className="text-sm text-navy-600">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-navy-300 hover:text-navy-500 shrink-0"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
