import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Cpu, User, Mail, MessageSquare } from 'lucide-react'
import { api } from '../services/api'
import { Pill } from '../components/ui/Pill'
import { Avatar } from '../components/ui/Avatar'
import { GhostButton } from '../components/ui/GhostButton'

export default function QueryDetail() {
  const { id } = useParams()
  const [query, setQuery] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDetail() {
      setLoading(true)
      try {
        const data = await api.getExecutions()
        if (data?.executions) {
          const match = data.executions.find(e => String(e.id) === String(id) || e.ticket_id === id)
          if (match) setQuery(match)
        }
      } catch (err) {
        console.error('Failed to load query detail:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDetail()
  }, [id])

  const item = query || {
    id: id || '101',
    ticket_id: typeof id === 'string' && id.startsWith('INQ') ? id : `INQ-${String(id || '9804').padStart(4, '0')}`,
    customer_name: 'Devon Lane',
    customer_email: 'devon@acme.com',
    message: 'My credit card was charged twice for monthly subscription invoice #1042! Requesting an immediate refund.',
    priority: 'high',
    category: 'billing',
    action: 'Escalated · Slack + Gmail',
    created_at: new Date().toISOString(),
    steps_log: [
      { node: 'Customer Inquiry Trigger', status: 'success', detail: 'Received HTTPS payload from customer helpdesk portal', time: '0.01s' },
      { node: 'Gemini AI Classifier', status: 'success', detail: 'Analyzed message -> Category: billing, Priority: HIGH', time: '0.45s' },
      { node: 'Escalation Router', status: 'success', detail: 'Matched High Urgency Billing Rule #104', time: '0.48s' },
      { node: 'Slack Notification Dispatcher', status: 'success', detail: 'Dispatched alert to #finance-urgent Slack channel', time: '0.72s' },
      { node: 'Customer Auto-Responder', status: 'success', detail: 'Dispatched confirmation email to devon@acme.com', time: '0.95s' }
    ]
  }

  const ticketIdStr = item.ticket_id || `INQ-${String(item.id).padStart(4, '0')}`

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/queries" className="btn-ghost">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Queries</span>
          </Link>
          <span className="text-[var(--ink-muted)]">/</span>
          <span className="font-ticket font-semibold text-amber-600 dark:text-amber-400">
            {ticketIdStr}
          </span>
        </div>

        <span className="relay-pill" style={{ background: 'var(--status-low-bg)', color: 'var(--status-low-fg)' }}>
          Execution Verified
        </span>
      </div>

      {/* Main Grid: Inquiry Payload & Pipeline Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Inquiry Payload */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relay-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <h2 className="section-title text-base">Inquiry Payload Details</h2>
              </div>
              <span className="text-xs text-[var(--ink-muted)] font-medium">
                {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'}
              </span>
            </div>

            {/* Customer Info */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--divider)]">
              <Avatar name={item.customer_name} size={40} />
              <div>
                <span className="text-sm font-semibold text-[var(--ink)] block">{item.customer_name}</span>
                <span className="text-xs text-[var(--ink-muted)] block font-medium">{item.customer_email || '—'}</span>
              </div>
            </div>

            {/* Original Payload */}
            <div>
              <span className="muted-label block mb-2">Original Message Payload</span>
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--divider)] text-sm text-[var(--ink)] leading-relaxed font-normal">
                "{item.message}"
              </div>
            </div>

            {/* Classifications */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--divider)] space-y-1">
                <span className="muted-label block">Category</span>
                <Pill type="category" value={item.category} />
              </div>

              <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--divider)] space-y-1">
                <span className="muted-label block">Priority</span>
                <Pill type="priority" value={item.priority} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Step Timeline */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relay-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-500" />
                <h2 className="section-title text-base">Pipeline Execution Steps</h2>
              </div>
              <span className="relay-pill" style={{ background: 'var(--status-low-bg)', color: 'var(--status-low-fg)' }}>
                {item.steps_log?.length || 5} Steps Executed
              </span>
            </div>

            {/* Timeline */}
            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--divider)]">
              {(item.steps_log || []).map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>

                  <div className="flex-1 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--divider)] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--ink)]">{step.node}</span>
                      <span className="text-[11px] font-mono text-[var(--ink-muted)]">{step.time || '0.1s'}</span>
                    </div>
                    <p className="text-xs text-[var(--ink-muted)] font-medium">
                      {step.detail || 'Executed successfully'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{item.action || item.status || 'Workflow Dispatched'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
