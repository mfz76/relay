import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, CheckCircle2, Eye, Sparkles, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import WorkflowCanvas from '../components/canvas/WorkflowCanvas'
import { api } from '../services/api'

export default function WorkflowEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [workflowName, setWorkflowName] = useState('Critical Incident Auto-Responder')
  const [isPublished, setIsPublished] = useState(true)
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting] = useState(false)

  // Load workflow from backend
  useEffect(() => {
    async function loadWorkflow() {
      if (id) {
        try {
          const data = await api.getWorkflow(id)
          if (data) {
            setWorkflowName(data.name || 'Untitled Automation')
            setIsPublished(Boolean(data.is_active))
          }
        } catch (err) {
          console.error('Failed to load workflow:', err)
        }
      }
    }
    loadWorkflow()
  }, [id])

  const handleTest = async () => {
    if (!testMessage.trim()) {
      toast.error('Please enter a test inquiry message')
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      const res = await api.testRun({
        message: testMessage,
        workflow_id: id ? parseInt(id) : undefined
      })

      const formatted = {
        ticket_id: res.ticket_id,
        priority: res.priority,
        category: res.category,
        sentiment: res.sentiment,
        execution: res.steps || []
      }

      setTestResult(formatted)
      toast.success('Test run executed via live backend!')
    } catch (err) {
      console.error('Test run failed:', err)
      toast.error(err.message || 'Test run failed')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#F7F7F7] text-[#1E1B18] font-sans antialiased">
      {/* Read-Only Workspace Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#E6E6E6] bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-gray-100 text-[#6F6D6B] hover:text-black transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-500" />
              <span className="text-base font-bold text-[#1E1B18]">
                {workflowName}
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                isPublished
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-slate-600 bg-slate-100 border-slate-200'
              }`}>
                {isPublished ? 'Live Active' : 'Draft'}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded border text-indigo-600 bg-indigo-50 border-indigo-200">
                Read-Only View
              </span>
            </div>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTestModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4318FF] hover:bg-[#3311CC] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Test Flow
          </button>
        </div>
      </div>

      {/* Main Canvas Area — Full width, read-only (no side panels) */}
      <div className="flex-1 flex overflow-hidden">
        <WorkflowCanvas onNodeClick={() => {}} />
      </div>

      {/* Test Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl border border-gray-300 bg-white shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-[#FBFBFB]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4318FF]">
                  <Play className="w-4 h-4 fill-[#4318FF]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#1E1B18]">Test Relay Automation</h2>
                  <p className="text-[11px] text-[#6F6D6B]">Executes live via Gemini AI & Backend Pipeline</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setTestModalOpen(false)
                  setTestResult(null)
                  setTestMessage('')
                }}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-[#6F6D6B] hover:text-black transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider mb-2">
                  Sample Customer Message
                </label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={e => setTestMessage(e.target.value)}
                  placeholder="e.g. My payment failed urgently and account is locked! Please fix ASAP."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-xs text-[#1E1B18] placeholder-[#9C9A98] focus:outline-none focus:border-[#4318FF] resize-none font-mono"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTestMessage('My payment failed and I need help urgently before my account is locked!')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#1E1B18] border border-gray-200 cursor-pointer"
                >
                  ⚡ High Priority Payment
                </button>
                <button
                  type="button"
                  onClick={() => setTestMessage('How do I update my email address on my account?')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#1E1B18] border border-gray-200 cursor-pointer"
                >
                  📋 General Question
                </button>
              </div>

              {!testResult && (
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4318FF] hover:bg-[#3311CC] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {testing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Classifying with Gemini & Executing Steps...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Run Test Pipeline</span>
                    </>
                  )}
                </button>
              )}

              {testResult && (
                <div className="space-y-4">
                  {/* Analysis Summary */}
                  <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6F6D6B] block">Ticket ID</span>
                      <span className="font-mono text-xs font-bold text-indigo-600">{testResult.ticket_id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6F6D6B] block">Priority</span>
                      <span className={`text-xs font-bold ${testResult.priority === 'high' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {testResult.priority.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6F6D6B] block">Category</span>
                      <span className="text-xs font-bold text-purple-600">{testResult.category.toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6F6D6B] block">Sentiment</span>
                      <span className="text-xs font-bold text-blue-600">{testResult.sentiment}</span>
                    </div>
                  </div>

                  {/* Step-by-step Trace */}
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {testResult.execution.map((step, i) => (
                      <div key={i} className="flex items-start justify-between p-2.5 rounded-xl bg-white border border-gray-200">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold text-[#1E1B18] block">{step.node}</span>
                            <span className="text-[11px] text-[#6F6D6B]">{step.detail}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-[#6F6D6B] shrink-0">{step.time}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setTestResult(null)
                      setTestMessage('')
                    }}
                    className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1E1B18] text-xs font-bold transition-all cursor-pointer"
                  >
                    Test Another Scenario
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
