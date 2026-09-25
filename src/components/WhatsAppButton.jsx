import { useState } from 'react'
import { X } from 'lucide-react'

// Placeholder number — replace with the real Empire Global WhatsApp business line.
const WHATSAPP_NUMBER = '2347000000000'
const DEFAULT_MESSAGE = "Hi Empire Global, I'd like to know more about your financial products."

export default function WhatsAppButton() {
  const [dismissedHint, setDismissedHint] = useState(false)

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
      {!dismissedHint && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-navy-800 text-xs font-semibold pl-3.5 pr-2 py-2 rounded-full shadow-soft border border-navy-100 animate-fade-in">
          Chat with us on WhatsApp
          <button
            onClick={() => setDismissedHint(true)}
            className="text-navy-300 hover:text-navy-600 p-0.5"
            aria-label="Dismiss"
            background-color="blue"
          >
            <X size={13} />
          </button>
        </div>
      )}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Empire Global on WhatsApp"
        className="relative w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform animate-pulse-ring"
      >
        <svg viewBox="0 0 32 32" className="w-7 h-7" fill="currentColor">
          <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.324.652 4.494 1.78 6.34L3 29l7.86-2.75A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.75a9.7 9.7 0 0 1-4.945-1.352l-.354-.21-4.664 1.632 1.556-4.542-.23-.365A9.69 9.69 0 0 1 6.25 15c0-5.383 4.378-9.75 9.754-9.75 5.375 0 9.746 4.367 9.746 9.75s-4.371 9.75-9.746 9.75Zm5.34-7.297c-.293-.147-1.734-.855-2.003-.953-.269-.098-.464-.147-.66.147-.196.293-.757.953-.928 1.148-.171.196-.342.22-.635.073-.293-.147-1.238-.456-2.358-1.454-.872-.778-1.461-1.738-1.632-2.031-.171-.293-.018-.452.129-.598.132-.132.293-.342.44-.513.147-.171.196-.293.293-.489.098-.196.049-.367-.024-.513-.073-.147-.66-1.59-.905-2.178-.238-.572-.48-.494-.66-.503l-.562-.01c-.196 0-.513.073-.782.367-.269.293-1.026 1.002-1.026 2.444s1.05 2.835 1.196 3.031c.147.196 2.066 3.156 5.008 4.427.7.302 1.246.483 1.672.618.702.223 1.34.191 1.845.116.563-.084 1.734-.709 1.978-1.393.244-.684.244-1.27.171-1.393-.073-.122-.269-.196-.562-.343Z" />
        </svg>
      </a>
    </div>
  )
}
