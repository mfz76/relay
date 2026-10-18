import { useState } from 'react'
import { Search, Mail, MessageSquare, Table, Calendar, GripVertical, Sparkles, Boxes, Info } from 'lucide-react'

const INTEGRATIONS = [
  { 
    type: 'gmail', 
    name: 'Gmail', 
    category: 'Communication',
    icon: Mail, 
    description: 'Send alerts or automated emails', 
    color: 'text-rose-600', 
    bg: 'bg-rose-50', 
    border: 'border-rose-200',
    badge: 'Email Action'
  },
  { 
    type: 'slack', 
    name: 'Slack', 
    category: 'Communication',
    icon: MessageSquare, 
    description: 'Post to #urgent channel or direct message', 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200',
    badge: 'Chat Alert'
  },
  { 
    type: 'google_sheets', 
    name: 'Google Sheets', 
    category: 'Data & Storage',
    icon: Table, 
    description: 'Append ticket details to spreadsheet', 
    color: 'text-emerald-700', 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200',
    badge: 'Insert Row'
  },
  { 
    type: 'google_calendar', 
    name: 'Google Calendar', 
    category: 'Scheduling',
    icon: Calendar, 
    description: 'Create urgent support triage meeting', 
    color: 'text-blue-600', 
    bg: 'bg-blue-50', 
    border: 'border-blue-200',
    badge: 'Book Event'
  },
]

export default function IntegrationPanel() {
  const [search, setSearch] = useState('')

  const filtered = INTEGRATIONS.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.description.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  )

  function onDragStart(event, integration) {
    event.dataTransfer.setData('application/reactflow-integration', integration.type)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="w-80 border-l border-[#E6E6E6] bg-white flex flex-col h-full z-20 shadow-xs">
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#E6E6E6] bg-[#FBFBFB]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4318FF]">
              <Boxes className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-[#1E1B18]">Integrations</h3>
          </div>
          <span className="text-[10px] font-bold text-[#4318FF] px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200">
            {INTEGRATIONS.length} Available
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F6D6B]" />
          <input
            type="text"
            placeholder="Search apps..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-[#D1D1D1] text-xs text-[#1E1B18] placeholder-[#9C9A98] focus:outline-none focus:border-[#4318FF] transition-colors"
          />
        </div>
      </div>

      {/* Integration Apps List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        <div className="text-[11px] font-bold text-[#6F6D6B] uppercase tracking-wider px-1">
          Support Connectors
        </div>

        {filtered.map(integration => (
          <div
            key={integration.type}
            draggable
            onDragStart={e => onDragStart(e, integration)}
            className={`group flex items-center gap-3 p-3 rounded-xl border ${integration.border} ${integration.bg} cursor-grab active:cursor-grabbing hover:border-[#4318FF] hover:shadow-xs transition-all duration-150`}
          >
            <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 border ${integration.border} shadow-xs`}>
              <integration.icon className={`w-4 h-4 ${integration.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#1E1B18]">{integration.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white text-[#6F6D6B] font-semibold border border-[#E6E6E6]">
                  {integration.badge}
                </span>
              </div>
              <div className="text-[11px] text-[#6F6D6B] mt-0.5 truncate">{integration.description}</div>
            </div>
            <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-[#1E1B18] transition-colors" />
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-xs text-[#6F6D6B]">
            No connectors match "{search}"
          </div>
        )}
      </div>

      {/* Drag Tip Footer */}
      <div className="p-3.5 border-t border-[#E6E6E6] bg-[#FBFBFB]">
        <div className="flex items-center gap-2 text-xs text-[#6F6D6B]">
          <Info className="w-4 h-4 text-[#4318FF] shrink-0" />
          <span>Drag connector onto canvas to add step</span>
        </div>
      </div>
    </div>
  )
}
