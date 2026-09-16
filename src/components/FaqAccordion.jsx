import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx
        return (
          <div
            key={item.question}
            className={`rounded-2xl border transition-colors ${isOpen ? 'border-emerald-200 bg-emerald-50/40' : 'border-navy-100 bg-white'}`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? -1 : idx)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-sm sm:text-base font-semibold text-navy-900">{item.question}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-navy-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`}
              />
            </button>
            <div
              className="grid transition-all duration-300 ease-in-out"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm text-navy-500 leading-relaxed">{item.answer}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
