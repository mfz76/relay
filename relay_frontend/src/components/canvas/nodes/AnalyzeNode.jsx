import { Handle, Position } from '@xyflow/react'
import { Sparkles, Brain } from 'lucide-react'

export default function AnalyzeNode({ data, selected }) {
  return (
    <div className={`group relative w-[280px] rounded-2xl transition-all duration-200 ${
      selected 
        ? 'ring-2 ring-purple-600 shadow-lg' 
        : 'hover:border-gray-400 shadow-md'
    } bg-white border border-[#D1D1D1]`}>
      
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-600 !border-4 !border-white !w-3.5 !h-3.5 hover:!scale-125 transition-transform shadow-xs"
      />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#FBFBFB] rounded-t-2xl border-b border-[#E6E6E6]">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200">
            2
          </span>
          <span className="text-[11px] font-bold text-[#1E1B18] uppercase tracking-wider">
            AI Logic Step
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
          <Sparkles className="w-3 h-3" />
          NLP Model
        </div>
      </div>

      {/* Node Body */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0 shadow-xs">
            <Brain className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-[#1E1B18] truncate">
              {data.label || 'Triage & Categorize'}
            </h4>
            <p className="text-xs text-[#6F6D6B] mt-0.5 line-clamp-1">
              Extracts Priority, Category & Sentiment
            </p>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            ⚡ Urgency
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
            💳 Topic
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            😠 Sentiment
          </span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-600 !border-4 !border-white !w-3.5 !h-3.5 hover:!scale-125 transition-transform shadow-xs"
      />
    </div>
  )
}
