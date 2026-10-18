import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react'
import { api } from '../services/api'
import { SearchInput } from '../components/ui/SearchInput'
import { Select } from '../components/ui/Select'
import { Pill } from '../components/ui/Pill'
import { Avatar } from '../components/ui/Avatar'
import { GhostButton } from '../components/ui/GhostButton'
import { timeAgo } from '../utils/badges'

export default function Queries() {
  const [executions, setExecutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const fetchQueries = async () => {
    setLoading(true)
    try {
      const data = await api.getExecutions()
      if (data?.executions && Array.isArray(data.executions)) {
        setExecutions(data.executions)
      }
    } catch (err) {
      console.error('Failed to fetch queries:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueries()
  }, [])

  // Clean deduplicated dataset
  const seedQueries = [
    { id: 101, ticket_id: 'INQ-9804', customer_name: 'Devon Lane', customer_email: 'devon@acme.com', message: 'Billing discrepancy on invoice #1042 — card charged twice for annual plan.', priority: 'high', category: 'billing', action: 'Escalated · Slack + Gmail', created_at: new Date().toISOString() },
    { id: 102, ticket_id: 'INQ-9803', customer_name: 'Eleanor Pena', customer_email: 'eleanor@design.io', message: 'How do I invite team members to my organization workspace?', priority: 'low', category: 'general', action: 'Auto-Responded · Gemini AI', created_at: new Date(Date.now() - 480000).toISOString() },
    { id: 103, ticket_id: 'INQ-9802', customer_name: 'Robert Fox', customer_email: 'robert@techcorp.com', message: 'Webhook API returning 500 server error intermittently during spike hours.', priority: 'high', category: 'technical', action: 'Escalated · On-Call Roster', created_at: new Date(Date.now() - 900000).toISOString() },
    { id: 104, ticket_id: 'INQ-9801', customer_name: 'Cody Fisher', customer_email: 'cody@enterprise.co', message: 'Looking for annual enterprise pricing discount details for 100 seats.', priority: 'medium', category: 'sales', action: 'Assigned · CRM Lead Created', created_at: new Date(Date.now() - 1500000).toISOString() },
    { id: 105, ticket_id: 'INQ-9800', customer_name: 'Sarah Jenkins', customer_email: 'sarah@jenkins.net', message: 'Can you provide invoice receipts for past subscription cycles?', priority: 'low', category: 'billing', action: 'Logged · Google Sheets Audit', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 106, ticket_id: 'INQ-9799', customer_name: 'Marcus Vance', customer_email: 'marcus@vance.org', message: 'Urgent: Customer login failing across US East region.', priority: 'high', category: 'technical', action: 'Escalated · Slack + Email Alert', created_at: new Date(Date.now() - 7200000).toISOString() },
  ]

  const displayList = executions.length > 0 ? executions : seedQueries

  // Deduplicate and filter list
  const filteredQueries = displayList.filter((item, index, self) => {
    const isFirst = self.findIndex(t => t.id === item.id || (t.ticket_id && t.ticket_id === item.ticket_id)) === index
    if (!isFirst) return false

    const matchesSearch = !search.trim() || 
      (item.message || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.ticket_id || String(item.id)).toLowerCase().includes(search.toLowerCase())
    
    const matchesCat = categoryFilter === 'all' || (item.category || '').toLowerCase() === categoryFilter
    const matchesPri = priorityFilter === 'all' || (item.priority || '').toLowerCase() === priorityFilter

    return matchesSearch && matchesCat && matchesPri
  })

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="section-title text-2xl">Queries</h1>
            <span className="relay-pill" style={{ background: 'var(--status-neutral-bg)', color: 'var(--status-neutral-fg)' }}>
              {filteredQueries.length} Total
            </span>
          </div>
          <p className="text-xs text-[var(--ink-muted)] font-medium mt-0.5">
            Directory table of customer support tickets, AI categories, and routing actions
          </p>
        </div>

        <button
          onClick={fetchQueries}
          className="btn-ghost"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main 28px White Card Container */}
      <div className="relay-card p-0 overflow-hidden">
        {/* Toolbar Row */}
        <div className="p-6 border-b border-[var(--divider)] flex flex-col md:flex-row items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customer, ticket ID, payload..."
          />

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'billing', label: 'Billing' },
                { value: 'technical', label: 'Technical' },
                { value: 'sales', label: 'Sales' },
                { value: 'general', label: 'General' },
              ]}
            />

            <Select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'high', label: 'High Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'low', label: 'Low Priority' },
              ]}
            />
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--divider)] bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
                <th className="py-4 px-6 w-28">Ticket ID</th>
                <th className="py-4 px-6 w-56">Customer</th>
                <th className="py-4 px-6">Message Payload</th>
                <th className="py-4 px-6 w-32">Category</th>
                <th className="py-4 px-6 w-32">Priority</th>
                <th className="py-4 px-6 w-56">Automation Action</th>
                <th className="py-4 px-6 w-32">Time</th>
                <th className="py-4 px-6 w-28 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--divider)] text-xs text-[var(--ink)]">
              {filteredQueries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--ink-muted)] font-medium">
                    No matching customer queries found.
                  </td>
                </tr>
              ) : (
                filteredQueries.map(query => {
                  const tid = query.ticket_id || (typeof query.id === 'string' && query.id.startsWith('INQ') ? query.id : `INQ-${String(query.id).padStart(4, '0')}`)
                  const customerName = query.customer_name || 'Customer'
                  const customerEmail = query.customer_email && query.customer_email !== 'n/a' ? query.customer_email : '—'

                  return (
                    <tr key={query.id || tid} className="hover:bg-slate-500/5 transition-colors h-16">
                      {/* Ticket ID */}
                      <td className="py-4 px-6 font-ticket font-semibold text-amber-600 dark:text-amber-400">
                        {tid}
                      </td>

                      {/* Customer Initials Avatar + Name & Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar name={customerName} size={32} />
                          <div className="min-w-0">
                            <span className="font-semibold text-[var(--ink)] block truncate">{customerName}</span>
                            <span className="text-[11px] text-[var(--ink-muted)] block truncate">{customerEmail}</span>
                          </div>
                        </div>
                      </td>

                      {/* Message Payload Truncated with Tooltip */}
                      <td className="py-4 px-6 max-w-xs truncate font-normal text-xs text-[var(--ink)]" title={query.message}>
                        "{query.message}"
                      </td>

                      {/* Category Pill */}
                      <td className="py-4 px-6">
                        <Pill type="category" value={query.category} />
                      </td>

                      {/* Priority Pill */}
                      <td className="py-4 px-6">
                        <Pill type="priority" value={query.priority} />
                      </td>

                      {/* Automation Action */}
                      <td className="py-4 px-6">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 text-xs truncate max-w-[200px]" title={query.action || query.status}>
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{query.action || query.status || 'Automated'}</span>
                        </span>
                      </td>

                      {/* Relative Time with exact ISO hover */}
                      <td className="py-4 px-6 text-xs text-[var(--ink-muted)] font-medium" title={query.created_at || 'Recent'}>
                        {timeAgo(query.created_at)}
                      </td>

                      {/* Trace Log Ghost Button */}
                      <td className="py-4 px-6 text-right">
                        <GhostButton to={`/queries/${query.id || tid}`}>
                          Trace Log
                        </GhostButton>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
