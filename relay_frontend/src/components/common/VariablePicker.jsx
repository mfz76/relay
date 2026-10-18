import { useState, useRef, useEffect } from 'react'
import { Braces, Sparkles, ChevronDown } from 'lucide-react'

const VARIABLES = [
  { key: 'ticket_id', label: 'Ticket ID', preview: 'INQ-1045', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { key: 'message', label: 'Customer Message', preview: 'My payment failed...', color: 'text-amber-800 bg-amber-50 border-amber-200' },
  { key: 'priority', label: 'Priority Urgency', preview: 'high | medium | low', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  { key: 'category', label: 'Inquiry Category', preview: 'payment | account | ...', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { key: 'sentiment', label: 'Customer Sentiment', preview: 'frustrated | neutral', color: 'text-blue-700 bg-blue-50 border-blue-200' },
]

export default function VariablePicker({ onInsert }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block mt-1.5" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 border border-gray-300 text-[#1E1B18] transition-all cursor-pointer"
      >
        <Braces className="w-3.5 h-3.5 text-[#4318FF]" />
        <span>Insert Dynamic Tag</span>
        <ChevronDown className={`w-3 h-3 text-[#6F6D6B] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 bottom-full mb-2 w-72 rounded-xl border border-gray-300 bg-white shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#1E1B18] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#4318FF]" />
              Data from Previous Steps
            </span>
          </div>

          <div className="p-1.5 space-y-1 max-h-56 overflow-y-auto">
            {VARIABLES.map(v => (
              <button
                key={v.key}
                type="button"
                onClick={() => {
                  onInsert(`{{${v.key}}}`)
                  setOpen(false)
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100 text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-semibold text-[#1E1B18] group-hover:text-[#4318FF] transition-colors">
                    {v.label}
                  </div>
                  <div className="text-[10px] font-mono text-[#6F6D6B]">
                    {`{{${v.key}}}`}
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${v.color}`}>
                  {v.preview}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
