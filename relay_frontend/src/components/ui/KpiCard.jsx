import React from 'react'
import { Plus } from 'lucide-react'

export function KpiCard({ label, value, caption, icon: Icon = Plus, onAction, sparkline }) {
  const displayVal = (value !== undefined && value !== null && value !== '') ? value : '—'

  return (
    <div className="relay-card flex flex-col justify-between space-y-4">
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <span className="muted-label">{label}</span>
        <button type="button" onClick={onAction} className="btn-icon-circle">
          <Icon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Value & Caption/Sparkline Row */}
      <div className="flex items-end justify-between">
        <div>
          <span className="kpi-value">{displayVal}</span>
          {caption && (
            <span className="block text-xs font-medium text-[var(--ink-muted)] mt-1">
              {caption}
            </span>
          )}
        </div>

        {sparkline && (
          <div className="shrink-0">
            {sparkline}
          </div>
        )}
      </div>
    </div>
  )
}
