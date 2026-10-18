import { Handle, Position } from '@xyflow/react'
import { Mail, MessageSquare, Table, Calendar, CheckCircle2, ChevronRight } from 'lucide-react'

const APPS = {
  gmail: {
    title: 'Gmail',
    action: 'Send High-Priority Email',
    icon: Mail,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 border-rose-200',
    badge: 'Email Alert',
  },
  slack: {
    title: 'Slack',
    action: 'Post Incident Alert',
    icon: MessageSquare,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-200',
    badge: 'Channel Message',
  },
  google_sheets: {
    title: 'Google Sheets',
    action: 'Insert Inquiry Row',
    icon: Table,
    iconColor: 'text-emerald-700',
    iconBg: 'bg-emerald-50 border-emerald-200',
    badge: 'Spreadsheet Log',
  },
  google_calendar: {
    title: 'Google Calendar',
    action: 'Schedule Urgent Review',
    icon: Calendar,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 border-blue-200',
    badge: 'Create Event',
  },
}

export default function ActionNode({ data, selected }) {
  const integration = data.integration || 'slack'
  const app = APPS[integration] || APPS.slack
  const Icon = app.icon

  return (
    <div className={`group relative w-[280px] rounded-2xl transition-all duration-200 ${
      selected 
        ? 'ring-2 ring-emerald-500 shadow-lg' 
        : 'hover:border-gray-400 shadow-md'
    } bg-white border border-[#D1D1D1]`}>
      
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-emerald-500 !border-4 !border-white !w-3.5 !h-3.5 hover:!scale-125 transition-transform shadow-xs"
      />

      {/* Top Bar with Step Numbering */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#FBFBFB] rounded-t-2xl border-b border-[#E6E6E6]">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
            4
          </span>
          <span className="text-[11px] font-bold text-[#1E1B18] uppercase tracking-wider">
            {app.title} Action
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
          {app.badge}
        </div>
      </div>

      {/* Node Body */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${app.iconBg} border flex items-center justify-center shrink-0 shadow-xs`}>
            <Icon className={`w-5 h-5 ${app.iconColor}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-[#1E1B18] truncate">
              {data.label || app.action}
            </h4>
            <p className="text-xs text-[#6F6D6B] mt-0.5 truncate">
              {data.config?.channel || data.config?.to || data.config?.spreadsheet || 'Configured via Relay'}
            </p>
          </div>
        </div>

        {/* Live Params Preview */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ready to execute
          </span>
          <span className="text-[#4318FF] font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
            Edit <ChevronRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-emerald-500 !border-4 !border-white !w-3.5 !h-3.5 hover:!scale-125 transition-transform shadow-xs"
      />
    </div>
  )
}
