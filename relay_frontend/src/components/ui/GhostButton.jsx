import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export function GhostButton({ to, onClick, children, icon: Icon = ChevronRight }) {
  const content = (
    <>
      <span>{children}</span>
      {Icon && <Icon className="w-3.5 h-3.5" />}
    </>
  )

  if (to) {
    return (
      <Link to={to} className="btn-ghost">
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className="btn-ghost">
      {content}
    </button>
  )
}
