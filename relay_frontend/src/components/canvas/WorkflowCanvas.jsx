import { useRef } from 'react'
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { nodeTypes } from './nodes'

const DEFAULT_NODES = [
  {
    id: 'trigger-1',
    type: 'trigger',
    position: { x: 340, y: 30 },
    data: { label: 'New Customer Ticket', description: 'Triggers on incoming customer inquiry' },
  },
  {
    id: 'analyze-1',
    type: 'analyze',
    position: { x: 340, y: 190 },
    data: { label: 'AI Triage & Categorizer' },
  },
  {
    id: 'condition-1',
    type: 'condition',
    position: { x: 330, y: 360 },
    data: {
      label: 'Urgency Filter',
      config: { field: 'priority', operator: 'equals', value: 'high' },
    },
  },
  {
    id: 'action-slack',
    type: 'action',
    position: { x: 120, y: 550 },
    data: {
      integration: 'slack',
      label: 'Post #urgent-incidents',
      config: { 
        channel: '#customer-support-urgent', 
        message: '🚨 CRITICAL ESCALATION\nTicket: {{ticket_id}}\nCategory: {{category}}\nSentiment: {{sentiment}}\nMessage: {{message}}' 
      },
    },
  },
  {
    id: 'action-sheets',
    type: 'action',
    position: { x: 550, y: 550 },
    data: {
      integration: 'google_sheets',
      label: 'Log Standard Queue',
      config: { 
        spreadsheet: 'Support Inquiries 2026', 
        row_data: '{{ticket_id}}, {{priority}}, {{category}}, {{sentiment}}, {{message}}' 
      },
    },
  },
  {
    id: 'action-gmail',
    type: 'action',
    position: { x: 120, y: 720 },
    data: {
      integration: 'gmail',
      label: 'Email Support Lead',
      config: { 
        to: 'lead-responder@enterprise.com', 
        subject: '🚨 SLA Alert: Urgent Inquiry {{ticket_id}}', 
        body: 'Customer message requires immediate triage:\n\n{{message}}\n\nPriority: {{priority}}' 
      },
    },
  },
  {
    id: 'action-calendar',
    type: 'action',
    position: { x: 120, y: 890 },
    data: {
      integration: 'google_calendar',
      label: 'Hold 15-min War Room',
      config: { event_title: 'Emergency Customer Triage: {{ticket_id}}', duration: 15 },
    },
  },
]

const DEFAULT_EDGES = [
  {
    id: 'e-trigger-analyze',
    source: 'trigger-1',
    target: 'analyze-1',
    animated: true,
    style: { stroke: '#4318FF', strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#4318FF' },
  },
  {
    id: 'e-analyze-condition',
    source: 'analyze-1',
    target: 'condition-1',
    animated: true,
    style: { stroke: '#7C3AED', strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#7C3AED' },
  },
  {
    id: 'e-condition-slack',
    source: 'condition-1',
    sourceHandle: 'match',
    target: 'action-slack',
    label: '⚡ IF HIGH URGENCY',
    labelStyle: { fill: '#0A8754', fontWeight: 700, fontSize: 10, letterSpacing: '0.05em' },
    labelBgStyle: { fill: '#FFFFFF', fillOpacity: 0.95, stroke: '#10B981', strokeWidth: 1.5, rx: 6, ry: 6 },
    labelBgPadding: [8, 4],
    style: { stroke: '#10B981', strokeWidth: 2.5 },
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10B981' },
  },
  {
    id: 'e-condition-sheets',
    source: 'condition-1',
    sourceHandle: 'no-match',
    target: 'action-sheets',
    label: '📋 OTHER (MED / LOW)',
    labelStyle: { fill: '#E11D48', fontWeight: 700, fontSize: 10, letterSpacing: '0.05em' },
    labelBgStyle: { fill: '#FFFFFF', fillOpacity: 0.95, stroke: '#F43F5E', strokeWidth: 1.5, rx: 6, ry: 6 },
    labelBgPadding: [8, 4],
    style: { stroke: '#F43F5E', strokeWidth: 2.5 },
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#F43F5E' },
  },
  {
    id: 'e-slack-gmail',
    source: 'action-slack',
    target: 'action-gmail',
    style: { stroke: '#10B981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10B981' },
  },
  {
    id: 'e-gmail-calendar',
    source: 'action-gmail',
    target: 'action-calendar',
    style: { stroke: '#10B981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10B981' },
  },
]

export default function WorkflowCanvas({ onNodeClick, initialNodes, initialEdges }) {
  const reactFlowWrapper = useRef(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes || DEFAULT_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges || DEFAULT_EDGES)

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full relative bg-[#F7F9FC]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          color="#CBD5E1" 
          gap={24} 
          size={1.5} 
          variant="dots" 
        />
        <Controls position="bottom-left" showInteractive={false} />
        <MiniMap
          position="bottom-right"
          nodeColor={(node) => {
            const colors = {
              trigger: '#4318FF',
              analyze: '#7C3AED',
              condition: '#F59E0B',
              action: '#10B981',
            }
            return colors[node.type] || '#64748B'
          }}
          maskColor="rgba(240, 244, 248, 0.75)"
        />
      </ReactFlow>

      {/* Read-Only Pill */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#E6E6E6] shadow-sm text-xs text-[#1E1B18] font-semibold">
        <span className="w-2 h-2 rounded-full bg-indigo-500" />
        <span>Pre-Built Workflow (Read-Only)</span>
      </div>
    </div>
  )
}

