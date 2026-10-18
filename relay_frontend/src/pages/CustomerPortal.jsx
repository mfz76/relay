import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Send, CheckCircle2, Sparkles, MessageSquare, ShieldCheck, HelpCircle, Activity, ArrowLeft, Zap, Clock, ExternalLink, Headphones } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import ThreeParticleBackground from '../components/three/ThreeParticleBackground'

export default function CustomerPortal() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [recentTickets, setRecentTickets] = useState([])
  const [activeTicket, setActiveTicket] = useState(null)

  // Fetch past live executions on mount
  useEffect(() => {
    async function loadPastTickets() {
      try {
        const data = await api.getExecutions()
        if (data?.executions && Array.isArray(data.executions)) {
          const formatted = data.executions.slice(0, 5).map(e => ({
            id: e.ticket_id || `INQ-${e.id}`,
            name: e.customer_name || 'Customer',
            email: e.customer_email || 'customer@example.com',
            message: e.message,
            priority: e.priority || 'low',
            category: e.category || 'general',
            sentiment: e.sentiment || 'neutral',
            status: e.action || e.status || 'Processed by Relay',
            steps: e.steps_log || [],
            createdAt: e.created_at ? new Date(e.created_at).toLocaleTimeString() : 'Recent'
          }))
          setRecentTickets(formatted)
          if (formatted.length > 0) {
            setActiveTicket(formatted[0])
          }
        }
      } catch (err) {
        console.error('Error fetching past tickets:', err)
      }
    }
    loadPastTickets()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) {
      toast.error('Please describe your issue')
      return
    }

    setSubmitting(true)

    try {
      const res = await api.submitInquiry({
        message,
        customer_name: name.trim() || 'Valued Customer',
        customer_email: email.trim() || 'customer@example.com'
      })

      const newTicket = {
        id: res.ticket_id,
        name: res.customer_name,
        email: res.customer_email,
        message: res.message,
        priority: res.priority,
        category: res.category,
        sentiment: res.sentiment,
        status: res.status,
        steps: res.steps || [],
        createdAt: 'Just now'
      }

      setRecentTickets(prev => [newTicket, ...prev])
      setActiveTicket(newTicket)
      setMessage('')
      toast.success('Inquiry submitted! Automation relay triggered.')
    } catch (err) {
      console.error('Submission failed:', err)
      toast.error(err.message || 'Failed to submit inquiry')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 font-sans antialiased flex flex-col relative overflow-hidden">
      {/* 3D Three.js Particle Mesh Wave Background */}
      <ThreeParticleBackground />

      {/* Top Header */}
      <header className="h-16 px-8 bg-slate-900/70 backdrop-blur-md border-b border-slate-800 flex items-center justify-between shrink-0 relative z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Relay Workspace</span>
          </Link>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/25">
              ⚡
            </div>
            <span className="text-sm font-bold text-white">Relay Helpdesk</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-800/60 backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          AI Automation Listener Active
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full space-y-8 relative z-10">
        
        {/* Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Headphones className="w-3.5 h-3.5" />
            Customer Support Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
            How can our support team help you?
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Submit your issue or question. Our automated workflow engine classifies urgency with Gemini AI and triggers real-time alerts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Submission Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/75 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-800 mb-5">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">Describe your problem</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Connor"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="sarah@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Your Message / Inquiry *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. My payment failed and my account is locked. Need immediate help!"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none font-mono"
                  />
                </div>

                {/* Quick Examples */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-semibold">Quick test examples:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMessage('My card was charged twice and I am furious! Please refund me immediately.')
                        setName('John Doe')
                        setEmail('john@example.com')
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
                    >
                      🚨 Urgent Double Charge
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMessage('What are your regular business operating hours on weekends?')
                        setName('Alice Smith')
                        setEmail('alice@example.com')
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
                    >
                      💡 General Hours Query
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Classifying with Gemini AI & Running Relay...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Status Card */}
          <div className="lg:col-span-5 space-y-6">
            {activeTicket ? (
              <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-xs text-white uppercase tracking-wider">Live AI Triage & Response</span>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    {activeTicket.id}
                  </span>
                </div>

                <div className="py-4 space-y-4">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Inquiry Payload</span>
                    <p className="text-xs font-medium text-slate-200 font-mono">
                      "{activeTicket.message}"
                    </p>
                  </div>

                  {/* AI Matrix */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Priority</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTicket.priority === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {activeTicket.priority.toUpperCase()}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Category</span>
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {activeTicket.category.toUpperCase()}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Sentiment</span>
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        {activeTicket.sentiment}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-emerald-300 block">Workflow Triggered Successfully</span>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        {activeTicket.status}
                      </p>
                    </div>
                  </div>

                  {/* Step audit preview */}
                  {activeTicket.steps && activeTicket.steps.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Actions Taken:</span>
                      {activeTicket.steps.map((st, i) => (
                        <div key={i} className="text-[11px] text-slate-300 flex items-center justify-between">
                          <span className="truncate pr-2">• {st.node}</span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold shrink-0">{st.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/60 p-8 text-center">
                <ShieldCheck className="w-10 h-10 mx-auto text-slate-500 mb-2" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Ready for submission</h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Submit an inquiry on the left to see real-time categorization and live workflow triggers.
                </p>
              </div>
            )}

            {/* Recent Inquiries */}
            {recentTickets.length > 0 && (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/75 backdrop-blur-xl p-5 shadow-xl">
                <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Recent Live Executions
                </h3>
                <div className="space-y-2">
                  {recentTickets.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setActiveTicket(t)}
                      className="p-3 rounded-xl bg-slate-950/60 hover:bg-indigo-950/40 border border-slate-800/80 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-400">{t.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          t.priority === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-1 font-medium font-mono">"{t.message}"</p>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                        <span className="font-mono font-semibold">{t.category}</span>
                        <span>{t.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
