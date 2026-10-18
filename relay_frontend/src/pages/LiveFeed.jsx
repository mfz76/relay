import React, { useState, useEffect } from 'react'
import { Radio, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react'
import { api } from '../services/api'
import { Pill } from '../components/ui/Pill'
import { timeAgo } from '../utils/badges'

export default function LiveFeed() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLiveLogs = async () => {
    setLoading(true)
    try {
      const data = await api.getExecutions()
      if (data?.executions && Array.isArray(data.executions)) {
        setLogs(data.executions)
      }
    } catch (err) {
      console.error('Failed to fetch live feed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveLogs()
    const timer = setInterval(fetchLiveLogs, 5000)
    return () => clearInterval(timer)
  }, [])

  const defaultStream = logs.length > 0 ? logs : [
    { id: 1, ticket_id: 'INQ-9804', customer_name: 'Devon Lane', message: 'Billing discrepancy on invoice #1042', priority: 'high', category: 'billing', action: 'Dispatched Urgent Slack Alert to #finance', created_at: new Date().toISOString() },
    { id: 2, ticket_id: 'INQ-9803', customer_name: 'Eleanor Pena', message: 'How do I add team members?', priority: 'low', category: 'general', action: 'Auto-Replied Email Sent', created_at: new Date(Date.now() - 300000).toISOString() },
    { id: 3, ticket_id: 'INQ-9802', customer_name: 'Robert Fox', message: 'Webhook endpoints throwing 500 error', priority: 'high', category: 'technical', action: 'Escalated to On-Call Roster', created_at: new Date(Date.now() - 600000).toISOString() },
    { id: 4, ticket_id: 'INQ-9801', customer_name: 'Cody Fisher', message: 'Looking for annual enterprise pricing', priority: 'medium', category: 'sales', action: 'CRM Lead Created', created_at: new Date(Date.now() - 900000).toISOString() },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
            <h1 className="section-title text-2xl">Live Activity Stream</h1>
          </div>
          <p className="text-xs text-[var(--ink-muted)] font-medium mt-0.5">
            Real-time event stream of incoming customer queries, Gemini AI classifications, and relay actions
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Auto-polling active (5s)</span>
        </div>
      </div>

      {/* Terminal View */}
      <div className="relay-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--ink-muted)]">
            <Terminal className="w-4 h-4 text-amber-500" />
            <span>relay-engine --stream --format=json</span>
          </div>
          <button
            onClick={fetchLiveLogs}
            className="btn-ghost"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-3 font-normal text-xs">
          {defaultStream.map((item, idx) => {
            const tid = item.ticket_id || (typeof item.id === 'string' && item.id.startsWith('INQ') ? item.id : `INQ-${String(item.id).padStart(4, '0')}`)
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--divider)] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-ticket font-semibold text-amber-600 dark:text-amber-400">{tid}</span>
                    <span className="text-[var(--ink-muted)]">•</span>
                    <span className="text-[var(--ink)] font-semibold">{item.customer_name || 'Customer'}</span>
                  </div>
                  <span className="text-[var(--ink-muted)] text-xs font-medium">
                    {timeAgo(item.created_at)}
                  </span>
                </div>

                <p className="text-[var(--ink)] text-xs font-normal">
                  "{item.message}"
                </p>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Pill type="category" value={item.category} />
                    <Pill type="priority" value={item.priority} />
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.action || item.status || 'Processed'}</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
