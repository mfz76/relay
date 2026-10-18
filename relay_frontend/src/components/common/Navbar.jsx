import { Link, useLocation } from 'react-router-dom'
import { Zap, LayoutDashboard, Eye, Headphones, Briefcase, Activity, Play } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  const isCustomerPortal = location.pathname.startsWith('/customer')
  const isEditor = location.pathname.startsWith('/workflow')

  return (
    <nav className="border-b border-[#263353] bg-[#141B2D] sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-[#4318FF] flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-slate-100">RELAY</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#4318FF]/15 text-[#4318FF] border border-[#4318FF]/30">
                  AI Automations
                </span>
              </div>
            </Link>

            {/* Mode Switcher Pill */}
            <div className="flex items-center bg-[#090D16] p-1 rounded-xl border border-[#263353]">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isCustomerPortal
                    ? 'bg-[#1E2942] text-slate-100 shadow-md border border-[#2A3756]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-[#4318FF]" />
                Business Engine
              </Link>
              <Link
                to="/customer"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isCustomerPortal
                    ? 'bg-[#1E2942] text-slate-100 shadow-md border border-[#2A3756]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Headphones className="w-3.5 h-3.5 text-blue-400" />
                Customer Portal
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          {!isCustomerPortal ? (
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                  location.pathname === '/'
                    ? 'bg-[#1A233A] text-slate-200 border border-[#263353]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A233A]'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Live Inquiries Feed
              </Link>

              <Link
                to="/workflow/1"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer ${
                  isEditor
                    ? 'bg-[#4318FF] text-white shadow-indigo-500/25'
                    : 'bg-[#1A233A] hover:bg-[#25345B] text-slate-200 border border-[#2A3756]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                View Workflow
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Relay Automation Listener Active
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
