import { useState, useEffect } from 'react'
import { X, Save, CheckCircle2, Sliders, Braces, Sparkles } from 'lucide-react'
import VariablePicker from '../common/VariablePicker'

export default function ConfigPanel({ node, onClose, onSave }) {
  const [config, setConfig] = useState({})
  const [activeTab, setActiveTab] = useState('fields') // 'fields' | 'test'

  useEffect(() => {
    if (node) {
      setConfig(node.data?.config || {})
    }
  }, [node])

  if (!node) return null

  function handleSave() {
    onSave(node.id, config)
    onClose()
  }

  function updateField(field, value) {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  function insertVariable(field, variable) {
    setConfig(prev => ({
      ...prev,
      [field]: (prev[field] || '') + variable,
    }))
  }

  const nodeType = node.type
  const integration = node.data?.integration

  return (
    <div className="w-96 border-l border-[#E6E6E6] bg-white flex flex-col h-full z-30 shadow-lg">
      
      {/* Drawer Header */}
      <div className="p-4 border-b border-[#E6E6E6] bg-[#FBFBFB] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4318FF]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6F6D6B] block tracking-wider">Step Settings</span>
            <h3 className="text-sm font-bold text-[#1E1B18]">{node.data?.label || 'Configure Step'}</h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-[#6F6D6B] hover:text-black transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E6E6E6] bg-[#FBFBFB]">
        <button
          onClick={() => setActiveTab('fields')}
          className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'fields'
              ? 'border-[#4318FF] text-[#4318FF] bg-white'
              : 'border-transparent text-[#6F6D6B] hover:text-[#1E1B18]'
          }`}
        >
          Setup Parameters
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'test'
              ? 'border-[#4318FF] text-[#4318FF] bg-white'
              : 'border-transparent text-[#6F6D6B] hover:text-[#1E1B18]'
          }`}
        >
          Step Output Data
        </button>
      </div>

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {activeTab === 'fields' ? (
          <>
            {nodeType === 'trigger' && (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  Trigger is Listening
                </div>
                <p className="text-xs text-[#6F6D6B] leading-relaxed">
                  Whenever a customer creates a support ticket via the Customer Helpdesk, this workflow fires automatically.
                </p>
                <div className="pt-2 border-t border-gray-200 font-mono text-[11px] text-[#6F6D6B]">
                  Event: <span className="text-[#1E1B18] font-bold">inquiry.created</span>
                </div>
              </div>
            )}

            {nodeType === 'analyze' && (
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-800">
                  <Sparkles className="w-4 h-4" />
                  AI Triage & Categorizer
                </div>
                <p className="text-xs text-purple-900 leading-relaxed">
                  Processes the customer text to determine Priority level (`HIGH`/`MED`/`LOW`), Category topic, and Sentiment.
                </p>
              </div>
            )}

            {nodeType === 'condition' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider mb-1.5">
                    Field to Evaluate
                  </label>
                  <select
                    value={config.field || 'priority'}
                    onChange={e => updateField('field', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-xs text-[#1E1B18] focus:outline-none focus:border-[#4318FF]"
                  >
                    <option value="priority">Priority Urgency</option>
                    <option value="category">Inquiry Topic Category</option>
                    <option value="sentiment">Customer Sentiment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider mb-1.5">
                    Operator
                  </label>
                  <select
                    value={config.operator || 'equals'}
                    onChange={e => updateField('operator', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-xs text-[#1E1B18] focus:outline-none focus:border-[#4318FF]"
                  >
                    <option value="equals">(Exact Match) equals</option>
                    <option value="not_equals">does not equal</option>
                    <option value="contains">text contains</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider mb-1.5">
                    Target Value
                  </label>
                  <input
                    type="text"
                    value={config.value || 'high'}
                    onChange={e => updateField('value', e.target.value)}
                    placeholder="e.g. high"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-xs text-[#1E1B18] focus:outline-none focus:border-[#4318FF]"
                  />
                </div>
              </div>
            )}

            {integration === 'slack' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider mb-1.5">
                    Slack Channel
                  </label>
                  <input
                    type="text"
                    value={config.channel || '#customer-support-urgent'}
                    onChange={e => updateField('channel', e.target.value)}
                    placeholder="#customer-support"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-xs text-[#1E1B18] focus:outline-none focus:border-[#4318FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider mb-1.5">
                    Message Template
                  </label>
                  <textarea
                    rows={4}
                    value={config.message || '🚨 HIGH PRIORITY ALERT\nTicket: {{ticket_id}}\nCategory: {{category}}\nMessage: {{message}}'}
                    onChange={e => updateField('message', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-xs text-[#1E1B18] focus:outline-none focus:border-[#4318FF] resize-none font-mono"
                  />
                  <VariablePicker onInsert={v => insertVariable('message', v)} />
                </div>
              </div>
            )}

            {integration === 'gmail' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider mb-1.5">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={config.to || 'support-escalations@enterprise.com'}
                    onChange={e => updateField('to', e.target.value)}
                    placeholder="lead@company.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-xs text-[#1E1B18] focus:outline-none focus:border-[#4318FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider mb-1.5">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={config.subject || '🚨 High Priority Inquiry {{ticket_id}}'}
                    onChange={e => updateField('subject', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-xs text-[#1E1B18] focus:outline-none focus:border-[#4318FF]"
                  />
                  <VariablePicker onInsert={v => insertVariable('subject', v)} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider mb-1.5">
                    Email Body
                  </label>
                  <textarea
                    rows={4}
                    value={config.body || 'Customer problem details:\n\n{{message}}\n\nUrgency: {{priority}}\nCategory: {{category}}'}
                    onChange={e => updateField('body', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-xs text-[#1E1B18] focus:outline-none focus:border-[#4318FF] resize-none font-mono"
                  />
                  <VariablePicker onInsert={v => insertVariable('body', v)} />
                </div>
              </div>
            )}

            {integration === 'google_sheets' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider mb-1.5">
                    Spreadsheet Name
                  </label>
                  <input
                    type="text"
                    value={config.spreadsheet || 'Support Inquiries 2026'}
                    onChange={e => updateField('spreadsheet', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-xs text-[#1E1B18] focus:outline-none focus:border-[#4318FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider mb-1.5">
                    Row Values (CSV format)
                  </label>
                  <textarea
                    rows={3}
                    value={config.row_data || '{{ticket_id}}, {{priority}}, {{category}}, {{message}}'}
                    onChange={e => updateField('row_data', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-xs text-[#1E1B18] focus:outline-none focus:border-[#4318FF] resize-none font-mono"
                  />
                  <VariablePicker onInsert={v => insertVariable('row_data', v)} />
                </div>
              </div>
            )}

            {integration === 'google_calendar' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider mb-1.5">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    value={config.event_title || 'Urgent Triage Call: {{ticket_id}}'}
                    onChange={e => updateField('event_title', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-xs text-[#1E1B18] focus:outline-none focus:border-[#4318FF]"
                  />
                  <VariablePicker onInsert={v => insertVariable('event_title', v)} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={config.duration || 15}
                    onChange={e => updateField('duration', parseInt(e.target.value) || 15)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-xs text-[#1E1B18] focus:outline-none focus:border-[#4318FF]"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          /* Output Test Tab */
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] font-bold text-[#6F6D6B] block mb-2 uppercase tracking-wider">
                Step Schema Output
              </span>
              <pre className="text-[11px] font-mono text-[#1E1B18] overflow-x-auto p-2 rounded-lg bg-white border border-gray-200">
                {JSON.stringify(
                  {
                    step_id: node.id,
                    status: 'verified',
                    type: integration || nodeType,
                    config: config,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-[#E6E6E6] bg-[#FBFBFB]">
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4318FF] hover:bg-[#3311CC] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Apply Parameters
        </button>
      </div>
    </div>
  )
}
