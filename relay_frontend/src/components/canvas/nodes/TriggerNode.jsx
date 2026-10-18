import { Handle, Position } from '@xyflow/react'
import { Inbox, ChevronRight } from 'lucide-react'

export default function TriggerNode({ data, selected }) {
  return (
    <div className={`group relative w-[280px] rounded-2xl transition-all duration-200 ${
      selected 
        ? 'ring-2 ring-[#4318FF] shadow-lg' 
        : 'hover:border-gray-400 shadow-md'
    } bg-white border border-[#D1D1D1]`}>
      
      {/* Top Bar with Step Numbering */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#FBFBFB] rounded-t-2xl border-b border-[#E6E6E6]">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-indigo-50 text-[#4318FF] text-[11px] font-bold border border-indigo-200">
            1
          </span>
          <span className="text-[11px] font-bold text-[#1E1B18] uppercase tracking-wider">
            Trigger Event
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </div>
      </div>

      {/* Node Body */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4318FF] shrink-0 shadow-xs">
            <Inbox className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-[#1E1B18] truncate">
              {data.label || 'New Customer Ticket'}
            </h4>
            <p className="text-xs text-[#6F6D6B] mt-0.5 line-clamp-1">
              {data.description || 'Triggers on incoming inquiry'}
            </p>
          </div>
        </div>

        {/* Payload preview chip */}
        <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#6F6D6B]">
          <span className="font-mono text-gray-500">payload: raw_text</span>
          <span className="text-[#4318FF] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
            Config <ChevronRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[#4318FF] !border-4 !border-white !w-3.5 !h-3.5 hover:!scale-125 transition-transform shadow-xs"
      />
    </div>
  )
}
