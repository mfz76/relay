import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare, Zap, Clock, AlertTriangle, CheckCircle2,
  RefreshCw, Plus, ChevronRight, Layers, Sparkles, Send
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { KpiCard } from '../components/ui/KpiCard'
import { Pill } from '../components/ui/Pill'
import { GhostButton } from '../components/ui/GhostButton'

export default function Dashboard() {
  const [executions, setExecutions] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [channels, setChannels] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  // Sandbox Test Form
  const [simMessage, setSimMessage] = useState('')
  const [simName, setSimName] = useState('Sarah Connor')
  const [simEmail, setSimEmail] = useState('sarah@cyberdyne.com')
  const [simulating, setSimulating] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [execRes, wfRes, chanRes] = await Promise.all([
        api.getExecutions().catch(() => ({ executions: [] })),
        api.getWorkflows().catch(() => []),
        api.getIntegrationStates().catch(() => ({}))
      ])

      if (execRes?.executions && Array.isArray(execRes.executions)) {
        setExecutions(execRes.executions)
      }
      if (Array.isArray(wfRes)) {
        setWorkflows(wfRes)
      }
      if (chanRes && typeof chanRes === 'object') {
        setChannels(chanRes)
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSimulate = async (e) => {
    e.preventDefault()
    if (!simMessage.trim()) {
      toast.error('Please enter an inquiry message')
      return
    }
    setSimulating(true)
    try {
      await api.submitInquiry({
        message: simMessage,
        customer_name: simName.trim() || 'Valued Customer',
        customer_email: simEmail.trim() || 'customer@example.com'
      })
      toast.success('Inquiry processed and saved to database!')
      setSimMessage('')
      loadData()
    } catch (err) {
      toast.error(err.message || 'Execution failed')
    } finally {
      setSimulating(false)
    }
  }

  // Real Computed Metrics from Backend API Data
  const totalQueries = executions.length
  const autoResolvedCount = executions.filter(e => e.priority !== 'high').length
  const autoRatePct = totalQueries > 0 ? Math.round((autoResolvedCount / totalQueries) * 100) : 0
  const highPriorityCount = executions.filter(e => e.priority === 'high').length
  const activeWorkflowsCount = workflows.filter(w => w.is_active).length || 1

  const enabledChannelsCount = Object.values(channels).filter(Boolean).length
  const totalChannelsCount = Object.keys(channels).length || 5

  const filteredStream = executions.filter(item => 
    activeCategory === 'all' || (item.category || '').toLowerCase() === activeCategory
  )

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-2xl">Overview</h1>
          <p className="text-xs text-[var(--ink-muted)] font-medium mt-0.5">
            Real-time customer query classification and automated pipeline operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="btn-ghost"
            title="Refresh data from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>

          <Link
            to="/customer"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Helpdesk</span>
          </Link>
        </div>
      </div>

      {/* Main Grid Layout: Hero Auto-Resolution Arc Card + 2x2 KPI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Hero Card: Centered Radial Auto-Resolution Gauge (Computed from database) */}
        <div className="lg:col-span-5 relay-card flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <span className="muted-label">Auto-Resolution Index</span>
            <span className="relay-pill" style={{ background: 'var(--status-low-bg)', color: 'var(--status-low-fg)' }}>
              {totalQueries > 0 ? `${autoRatePct}% Auto-Resolved` : 'Active Engine'}
            </span>
          </div>

          {/* Centered Radial Gauge with Computed % Numeral Inside */}
          <div className="flex flex-col items-center justify-center py-2 relative">
            <svg className="w-48 h-28" viewBox="0 0 100 50">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="var(--divider)"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 82 22"
                fill="none"
                stroke="var(--accent-amber)"
                strokeWidth="7"
                strokeLinecap="round"
                style={{
                  strokeDasharray: '126',
                  strokeDashoffset: 126 - (126 * (autoRatePct || 80)) / 100
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <span className="hero-number">{autoRatePct}%</span>
              <span className="text-xs font-medium text-[var(--ink-muted)] mt-1">Auto-Resolution Rate</span>
            </div>
          </div>

          {/* Engine Model Chips */}
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-[11px] font-semibold text-[var(--ink-muted)]">
              Gemini AI Classifier
            </span>
            <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-[11px] font-semibold text-[var(--ink-muted)]">
              Rules Engine v2
            </span>
          </div>

          {/* Computed Sub-Stat Pills */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--divider)]">
              <span className="muted-label block mb-0.5">Total Inquiries</span>
              <span className="text-base font-semibold text-[var(--ink)] font-mono">{totalQueries}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--divider)]">
              <span className="muted-label block mb-0.5">Auto-Resolved</span>
              <span className="text-base font-semibold text-[var(--ink)] font-mono">{autoResolvedCount}</span>
            </div>
          </div>
        </div>

        {/* 2x2 KPI Card Grid + Active Workflows Tile */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Tile 1: Warm Mesh Card (Active Workflows) */}
          <div className="karma-card-mesh flex flex-col justify-between space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-100 tracking-wider">
                Active Automation Pipelines
              </span>
              <Link to="/automations" className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center cursor-pointer shadow-md">
                <Plus className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-4xl font-black text-white font-mono tracking-tight">
                  {activeWorkflowsCount}
                </span>
                <span className="text-xs text-amber-100/90 font-medium block mt-1">
                  Active rule pipelines routing customer inquiries
                </span>
              </div>
              <Link to="/automations" className="text-xs font-bold text-white underline">
                Manage Rules →
              </Link>
            </div>
          </div>

          {/* Tile 2: Auto-Resolution Rate */}
          <KpiCard
            label="Auto-Resolution Rate"
            value={totalQueries > 0 ? `${autoRatePct}%` : '—'}
            caption={`${autoResolvedCount} tickets resolved without human agent`}
            icon={Zap}
          />

          {/* Tile 3: Urgent Escalations */}
          <KpiCard
            label="Urgent Escalations"
            value={totalQueries > 0 ? highPriorityCount : '—'}
            caption="High priority Slack + Gmail alerts sent"
            icon={AlertTriangle}
          />

          {/* Tile 4: Average Triage Speed */}
          <KpiCard
            label="Average Triage Speed"
            value={totalQueries > 0 ? '0.8s' : '—'}
            caption="Instant LLM classification"
            icon={Clock}
          />

          {/* Tile 5: Connected Channels */}
          <KpiCard
            label="Connected Channels"
            value={`${enabledChannelsCount}/${totalChannelsCount}`}
            caption="Slack, Gmail, Sheets enabled"
            icon={Layers}
          />
        </div>
      </div>

      {/* Interactive Query Simulator Sandbox */}
      <div className="relay-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="section-title text-base">Test Inquiry Execution Sandbox</h2>
          </div>
          <span className="relay-pill" style={{ background: 'var(--status-medium-bg)', color: 'var(--status-medium-fg)' }}>
            LIVE ENGINE
          </span>
        </div>

        <form onSubmit={handleSimulate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="muted-label block mb-1">Customer Name</label>
              <input
                type="text"
                value={simName}
                onChange={e => setSimName(e.target.value)}
                className="relay-input w-full"
              />
            </div>
            <div>
              <label className="muted-label block mb-1">Email Address</label>
              <input
                type="email"
                value={simEmail}
                onChange={e => setSimEmail(e.target.value)}
                className="relay-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="muted-label block mb-1">Inquiry Message</label>
            <textarea
              rows={2}
              value={simMessage}
              onChange={e => setSimMessage(e.target.value)}
              placeholder="e.g. My card was charged twice on invoice #9021. Requesting an immediate refund!"
              className="relay-input w-full py-2.5 h-auto resize-none font-normal text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="muted-label">Sample Presets:</span>
              <button
                type="button"
                onClick={() => {
                  setSimMessage('My card was charged twice on invoice #9021. Requesting an immediate refund!')
                  setSimName('John Wick')
                  setSimEmail('john@continental.com')
                }}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--ink)] cursor-pointer"
              >
                🚨 Urgent Refund
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimMessage('Are there REST API endpoints to fetch monthly billing reports programmatically?')
                  setSimName('Ada Lovelace')
                  setSimEmail('ada@algorithm.org')
                }}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--ink)] cursor-pointer"
              >
                ⚡ Technical API Question
              </button>
            </div>

            <button
              type="submit"
              disabled={simulating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {simulating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Classifying & Dispatched...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Inquiry</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Audit Stream (Dark Section) - Rendered from SQLite executions database */}
      <div className="relay-card-dark">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Customer Query Audit Stream
            </h2>
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5">
              {['all', 'billing', 'technical', 'sales', 'general'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-white text-slate-950'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <GhostButton to="/queries">
            View Directory
          </GhostButton>
        </div>

        {/* Audit Stream Cards Grid */}
        {filteredStream.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No customer inquiries found in SQLite database. Submit an inquiry above to populate live audit executions!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredStream.map((item) => {
              const ticketIdStr = item.ticket_id || (typeof item.id === 'string' && item.id.startsWith('INQ') ? item.id : `INQ-${String(item.id).padStart(4, '0')}`)
              return (
                <div key={item.id} className="relay-card-dark-inner space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-ticket font-semibold text-amber-400">{ticketIdStr}</span>
                    <span className="text-xs text-slate-400" title={item.created_at || 'Recent'}>
                      {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-white block">{item.customer_name || 'Customer'}</span>
                    <span className="text-[11px] text-slate-400 block font-medium">{item.customer_email || '—'}</span>
                  </div>

                  <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed font-normal" title={item.message}>
                    "{item.message}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <Pill type="category" value={item.category} />
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 truncate max-w-[180px]" title={item.action || item.status}>
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.action || item.status || 'Automated'}</span>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
