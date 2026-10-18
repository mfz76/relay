import React from 'react'
import { Search } from 'lucide-react'

export function SearchInput({ value, onChange, placeholder = 'Search queries...' }) {
  return (
    <div className="relative w-full md:w-80">
      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="relay-input w-full pl-10 pr-4"
      />
    </div>
  )
}
