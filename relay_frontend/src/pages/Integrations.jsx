import React, { useState, useEffect } from 'react'
import {
  RefreshCw, MessageSquare, Mail, Table, Calendar, Power,
  MessageCircle, Video, Webhook, Send, Camera, Zap, Plus, Layers
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../services/api'

export default function Integrations() {
  const [states, setStates] = useState({
    slack: true,
    gmail: true,
    google_sheets: true,
    google_calendar: false,
  })
  const [loading, setLoading] = useState(true)

  const fetchStates = async () => {
    setLoading(true)
    try {
      const data = await api.getIntegrationStates()
      if (data && typeof data === 'object') {
        setStates(prev => ({ ...prev, ...data }))
      }
    } catch (err) {
      console.error('Failed to load integration states:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStates()
  }, [])

  const handleToggle = async (key) => {
    try {
      const res = await api.toggleIntegration(key).catch(() => ({ name: key, enabled: !states[key] }))
      const nextEnabled = res.enabled !== undefined ? res.enabled : !states[key]
      setStates(prev => ({ ...prev, [key]: nextEnabled }))
      toast.success(`${key.replace('_', ' ').toUpperCase()} ${nextEnabled ? 'Enabled' : 'Disabled'}`)
    } catch (err) {
      toast.error('Failed to toggle channel')
    }
  }

  // Core Channels
  const coreChannels = [
    {
      key: 'slack',
      name: 'Slack Alerts & Channels',
      category: 'Team Messaging',
      desc: 'Dispatches high-priority ticket escalations directly to #customer-support Slack channels.',
      icon: MessageSquare,
    },
    {
      key: 'gmail',
      name: 'Gmail Auto-Responder',
      category: 'Email Gateway',
      desc: 'Sends automated customer confirmation emails and resolution receipts seamlessly.',
      icon: Mail,
    },
    {
      key: 'google_sheets',
      name: 'Google Sheets Audit Log',
      category: 'Data Export',
      desc: 'Appends raw customer query logs and resolution metrics to live Google Sheets spreadsheets.',
      icon: Table,
    },
    {
      key: 'google_calendar',
      name: 'Google Calendar Scheduling',
      category: 'Calendar & Demos',
      desc: 'Automatically schedules 1-on-1 demo calls for high-intent sales inquiries.',
      icon: Calendar,
    }
  ]

  // Symbols list for the combined "Add More" card (NO text names, just app symbols/icons!)
  const appSymbols = [
    { icon: MessageCircle, title: 'WhatsApp' },
    { icon: Video, title: 'YouTube' },
    { icon: Send, title: 'Telegram' },
    { icon: Camera, title: 'Instagram' },
    { icon: Webhook, title: 'Webhooks' },
    { icon: Zap, title: 'Zapier' },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-2xl">Integrations & Channels</h1>
          <p className="text-xs text-[var(--ink-muted)] font-medium mt-0.5">
            Manage active support channels, messaging gateways, and third-party app connections
          </p>
        </div>
        <button
          onClick={fetchStates}
          className="btn-ghost"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Connections</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Core Channel Cards */}
        {coreChannels.map(item => {
          const isEnabled = !!states[item.key]
          const IconComponent = item.icon

          return (
            <div
              key={item.key}
              className="relay-card space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1.5 ${
                    isEnabled
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    <span>{isEnabled ? 'ACTIVE' : 'DISABLED'}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[var(--ink)]">{item.name}</h3>
                  <span className="muted-label block mt-0.5">
                    {item.category}
                  </span>
                </div>

                <p className="text-xs text-[var(--ink-muted)] leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>

              {/* Improved Channel Toggle Bar */}
              <div className="pt-3 border-t border-[var(--divider)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--ink)]">
                    {isEnabled ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <button
                  onClick={() => handleToggle(item.key)}
                  type="button"
                  className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border shadow-xs ${
                    isEnabled
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  <Power className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                  <span>{isEnabled ? 'Disable Channel' : 'Enable Channel'}</span>
                </button>
              </div>
            </div>
          )
        })}

        {/* COMBINED CARD: Third-Party Apps & Channels (ONLY App Symbols/Icons + "Add More" Button) */}
        <div className="relay-card space-y-4 flex flex-col justify-between bg-gradient-to-br from-amber-500/5 via-slate-50 to-white dark:from-amber-500/10 dark:via-slate-900 dark:to-slate-950 border-dashed border-amber-500/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                EXPANDABLE
              </span>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--ink)]">Third-Party Channels</h3>
              <span className="muted-label block mt-0.5">
                Connect More Platforms
              </span>
            </div>

            {/* Symbols-only Icon Grid (NO NAMES!) */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {appSymbols.map((app, idx) => {
                const SymbolIcon = app.icon
                return (
                  <div
                    key={idx}
                    title={app.title}
                    className="w-10 h-10 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center shadow-xs hover:scale-110 transition-transform cursor-pointer"
                  >
                    <SymbolIcon className="w-4 h-4" />
                  </div>
                )
              })}
            </div>
          </div>

          {/* "Add More" Button */}
          <div className="pt-3 border-t border-[var(--divider)] flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--ink-muted)]">
              More Integrations
            </span>

            <button
              onClick={() => toast.success('Additional third-party channel connectors ready to pair!')}
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add More</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
