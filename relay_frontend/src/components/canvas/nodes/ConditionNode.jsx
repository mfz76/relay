import { Handle, Position } from '@xyflow/react'
import { GitFork, SlidersHorizontal } from 'lucide-react'

export default function ConditionNode({ data, selected }) {
  const config = data.config || {}

  return (
    <div className={`group relative w-[300px] rounded-2xl transition-all duration-200 ${
      selected 
        ? 'ring-2 ring-amber-500 shadow-lg' 
        : 'hover:border-gray-400 shadow-md'
    } bg-white border border-[#D1D1D1]`}>
      
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-amber-500 !border-4 !border-white !w-3.5 !h-3.5 hover:!scale-125 transition-transform shadow-xs"
      />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#FBFBFB] rounded-t-2xl border-b border-[#E6E6E6]">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
            3
          </span>
          <span className="text-[11px] font-bold text-[#1E1B18] uppercase tracking-wider">
            Filter / Path Router
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
          <GitFork className="w-3 h-3" />
          Branch Logic
        </div>
      </div>

      {/* Node Body */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-[#1E1B18] truncate">
              {data.label || 'Urgency Filter'}
            </h4>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs bg-gray-50 p-2 rounded-lg border border-gray-200 font-mono">
              <span className="text-amber-800 font-bold">{config.field || 'priority'}</span>
              <span className="text-gray-500 font-sans">{config.operator || 'equals'}</span>
              <span className="text-emerald-700 font-bold uppercase">"{config.value || 'high'}"</span>
            </div>
          </div>
        </div>

        {/* Branch Out Labels */}
        <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 font-bold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Path A (HIGH)
          </span>
          <span className="flex items-center gap-1 font-bold text-rose-700">
            Path B (OTHER) <span className="w-2 h-2 rounded-full bg-rose-500" />
          </span>
        </div>
      </div>

      {/* Two Source Handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="match"
        className="!bg-emerald-500 !border-4 !border-white !w-3.5 !h-3.5 hover:!scale-125 transition-transform shadow-xs"
        style={{ left: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no-match"
        className="!bg-rose-500 !border-4 !border-white !w-3.5 !h-3.5 hover:!scale-125 transition-transform shadow-xs"
        style={{ left: '75%' }}
      />
    </div>
  )
}
