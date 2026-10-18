export const priorityMap = {
  high:   { label: 'High',   cls: 'bg-red-500/15 text-red-400 border border-red-500/30',     dot: 'bg-red-500' },
  medium: { label: 'Medium', cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/30', dot: 'bg-amber-500' },
  low:    { label: 'Low',    cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30', dot: 'bg-emerald-500' },
}

export const categoryMap = {
  billing:   { label: 'Billing',   cls: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',   icon: '💳' },
  account:   { label: 'Account',   cls: 'bg-purple-500/15 text-purple-400 border border-purple-500/30', icon: '👤' },
  technical: { label: 'Technical', cls: 'bg-orange-500/15 text-orange-400 border border-orange-500/30', icon: '🔧' },
  sales:     { label: 'Sales',     cls: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',   icon: '📈' },
  general:   { label: 'General',   cls: 'bg-slate-500/15 text-slate-300 border border-slate-500/30',   icon: '💬' },
}

export const sentimentMap = {
  negative:   { label: 'Negative', cls: 'bg-red-500/15 text-red-400 border border-red-500/30',     emoji: '😠' },
  frustrated: { label: 'Frustrated', cls: 'bg-red-500/15 text-red-400 border border-red-500/30',     emoji: '😠' },
  neutral:    { label: 'Neutral',    cls: 'bg-slate-500/15 text-slate-300 border border-slate-500/30',   emoji: '😐' },
  positive:   { label: 'Positive',   cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30', emoji: '😊' },
  satisfied:  { label: 'Satisfied',  cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30', emoji: '😊' },
}

export function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
