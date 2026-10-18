import React from 'react'

export function Avatar({ name = 'Customer', size = 32 }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'C'

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '999px',
        backgroundColor: '#0F1115',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 600,
        flexShrink: 0
      }}
    >
      {initials}
    </div>
  )
}
