import React from 'react'

export function Pill({ type = 'category', value, label }) {
  const valKey = (value || label || '').toLowerCase()

  let styleObj = {
    background: 'var(--status-neutral-bg)',
    color: 'var(--status-neutral-fg)'
  }

  let text = label || value || 'Uncategorized'

  if (type === 'priority' || valKey === 'high' || valKey === 'medium' || valKey === 'low') {
    if (valKey === 'high') {
      styleObj = { background: 'var(--status-high-bg)', color: 'var(--status-high-fg)' }
      text = 'High'
    } else if (valKey === 'medium') {
      styleObj = { background: 'var(--status-medium-bg)', color: 'var(--status-medium-fg)' }
      text = 'Medium'
    } else if (valKey === 'low') {
      styleObj = { background: 'var(--status-low-bg)', color: 'var(--status-low-fg)' }
      text = 'Low'
    }
  } else {
    // Categories
    if (valKey === 'billing') {
      styleObj = { background: 'rgba(59, 130, 246, 0.10)', color: '#2563EB' }
      text = 'Billing'
    } else if (valKey === 'technical') {
      styleObj = { background: 'rgba(239, 68, 68, 0.10)', color: '#DC2626' }
      text = 'Technical'
    } else if (valKey === 'sales') {
      styleObj = { background: 'rgba(16, 185, 129, 0.10)', color: '#059669' }
      text = 'Sales'
    } else if (valKey === 'account' || valKey === 'general') {
      styleObj = { background: 'rgba(107, 111, 118, 0.10)', color: '#4B5563' }
      text = valKey === 'account' ? 'Account' : 'General'
    }
  }

  return (
    <span className="relay-pill" style={styleObj}>
      {text}
    </span>
  )
}
