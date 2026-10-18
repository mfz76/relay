import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect, createContext } from 'react'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Queries from './pages/Queries'
import QueryDetail from './pages/QueryDetail'
import Automations from './pages/Automations'
import Integrations from './pages/Integrations'
import LiveFeed from './pages/LiveFeed'
import CustomerPortal from './pages/CustomerPortal'

export const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} })
export const SidebarContext = createContext({ collapsed: false, toggleSidebar: () => {} })

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('relay-sidebar-collapsed') === 'true'
  })

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem('relay-sidebar-collapsed', String(next))
      return next
    })
  }

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar }}>
      <div className="app-layout">
        <Sidebar />
        <main
          className="main-container"
          style={{
            marginLeft: collapsed ? '64px' : '240px',
            width: `calc(100% - ${collapsed ? '64px' : '240px'})`
          }}
        >
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  )
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('relay-theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('relay-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--surface-card)',
              color: 'var(--ink)',
              border: '1px solid var(--divider)',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
            }
          }}
        />
        <Routes>
          {/* Dashboard Layout (With Collapsible Sidebar) */}
          <Route element={<DashboardLayout />}>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/queries"       element={<Queries />} />
            <Route path="/queries/:id"   element={<QueryDetail />} />
            <Route path="/automations"   element={<Automations />} />
            <Route path="/integrations"  element={<Integrations />} />
            <Route path="/live"          element={<LiveFeed />} />
          </Route>

          {/* Standalone Helpdesk (No Sidebar) */}
          <Route path="/customer" element={<CustomerPortal />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  )
}
