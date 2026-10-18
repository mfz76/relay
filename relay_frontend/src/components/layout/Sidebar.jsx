import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, MessageSquareText, Zap, Plug, Radio,
  Moon, Sun, ChevronLeft, ChevronRight, Headphones
} from 'lucide-react'
import { ThemeContext, SidebarContext } from '../../App'

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/queries', label: 'Queries', icon: MessageSquareText },
  { path: '/automations', label: 'Rules', icon: Zap },
  { path: '/integrations', label: 'Channels', icon: Plug },
  { path: '/live', label: 'Live Stream', icon: Radio },
]

export default function Sidebar() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  const { collapsed, toggleSidebar } = useContext(SidebarContext)

  return (
    <aside
      className="sidebar-container select-none"
      style={{ width: collapsed ? '64px' : '240px' }}
    >
      
      {/* Top Section */}
      <div className="space-y-6">
        {/* Brand Header + Collapse Button */}
        <div className={`flex items-center ${collapsed ? 'justify-center flex-col space-y-3' : 'justify-between'} px-1 py-1`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              ⚡
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-base font-semibold text-[var(--ink)] tracking-tight leading-tight">
                  Relay
                </h1>
                <span className="text-[11px] font-medium text-[var(--ink-muted)] block">
                  Support Automation
                </span>
              </div>
            )}
          </div>

          {/* Toggle Expand / Minimize Button */}
          <button
            onClick={toggleSidebar}
            type="button"
            className="w-7 h-7 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Minimize sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {!collapsed && (
            <span className="muted-label px-3 mb-2 block">
              Navigation
            </span>
          )}
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} h-10 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-slate-950 dark:bg-slate-800 dark:text-white shadow-sm'
                      : 'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="pt-4 border-t border-[var(--divider)] space-y-4">
        {/* Dark/Light Switch */}
        {collapsed ? (
          <button
            onClick={toggleTheme}
            type="button"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-600" />}
          </button>
        ) : (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--ink-muted)]">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-600" />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <button
              onClick={toggleTheme}
              type="button"
              className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors ${
                theme === 'dark' ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        )}

        {/* Profile Card */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-2'} py-1`}>
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center text-xs font-semibold shrink-0" title="Automation Admin">
            AA
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-[var(--ink)] block truncate leading-tight">
                Automation Admin
              </span>
              <span className="text-[11px] font-medium text-[var(--ink-muted)] block truncate">
                Online
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
