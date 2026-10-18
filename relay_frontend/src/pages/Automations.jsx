import React, { useState, useEffect } from 'react'
import { Zap, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { Pill } from '../components/ui/Pill'

export default function Automations() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchWorkflows = async () => {
    setLoading(true)
    try {
      const data = await api.getWorkflows()
      if (Array.isArray(data)) setWorkflows(data)
    } catch (err) {
      console.error('Failed to fetch workflows:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const handleToggle = async (wf) => {
    try {
      await api.toggleWorkflow(wf.id)
      toast.success(`Rule ${wf.is_active ? 'paused' : 'activated'}!`)
      fetchWorkflows()
    } catch (err) {
      toast.error('Failed to update workflow state')
    }
  }

  const defaultRules = [
    {
      id: 1,
      name: 'High Urgency & Billing Escalation',
      description: 'Triggered when sentiment is frustrated or priority is high. Dispatches Slack alert to #finance and creates priority ticket.',
      is_active: true,
      category: 'billing',
      trigger: 'Gemini AI Classifier',
      executions: '1,420 runs'
    },
    {
      id: 2,
      name: 'Technical Bug Auto-Triage',
      description: 'Classifies technical inquiries, routes to developer on-call roster, and replies with standard diagnostic steps.',
      is_active: true,
      category: 'technical',
      trigger: 'Customer Desk Inquiry',
      executions: '890 runs'
    },
    {
      id: 3,
      name: 'Sales Inquiry Lead Routing',
      description: 'Detects enterprise plan interest, tags lead in CRM, and schedules automatic demo call invite link.',
      is_active: true,
      category: 'sales',
      trigger: 'Email Gateway',
      executions: '612 runs'
    },
    {
      id: 4,
      name: 'General FAQ Instant Auto-Responder',
      description: 'Answers common questions (hours, pricing, docs) instantly with Gemini AI without requiring agent intervention.',
      is_active: true,
      category: 'general',
      trigger: 'Inquiry Event',
      executions: '3,840 runs'
    }
  ]

  const displayList = workflows.length > 0 ? workflows : defaultRules

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="section-title text-2xl">Automation Rules</h1>
        <p className="text-xs text-[var(--ink-muted)] font-medium mt-0.5">
          Active rules that categorize, route, and resolve customer queries automatically
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayList.map(rule => (
          <div
            key={rule.id}
            className="relay-card space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--ink)]">{rule.name}</h3>
                    <Pill type="category" value={rule.category || 'general'} />
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(rule)}
                  className="text-[var(--ink-muted)] hover:text-amber-500 transition-colors cursor-pointer"
                >
                  {rule.is_active ? (
                    <ToggleRight className="w-8 h-8 text-amber-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              <p className="text-xs text-[var(--ink-muted)] leading-relaxed font-normal">
                {rule.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--divider)] flex items-center justify-between text-xs text-[var(--ink-muted)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Trigger: <strong className="text-[var(--ink)] font-semibold">{rule.trigger || 'Gemini AI'}</strong></span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {rule.executions || 'Active'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
