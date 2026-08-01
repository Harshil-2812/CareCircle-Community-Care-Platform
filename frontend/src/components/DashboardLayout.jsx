import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Heart, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function DashboardLayout({ title, navItems, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const roleColors = {
    Admin: 'from-primary-500 to-blue-600',
    Family: 'from-rose-500 to-pink-600',
    Volunteer: 'from-emerald-500 to-teal-600',
  }
  const myRole = user?.roles?.[0] || 'User'

  return (
    <div className="min-h-screen flex" style={{background:'linear-gradient(135deg,#0a0f1e 0%,#0d1225 100%)'}}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 glass border-r border-white/5 flex flex-col transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[myRole]} flex items-center justify-center shadow-lg`}>
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">CareCircle</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{myRole} Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <button key={item.path} id={`nav-${item.label.toLowerCase().replace(/\s+/g,'-')}`}
                onClick={() => { navigate(item.path); setMobileOpen(false) }}
                className={`sidebar-link w-full ${active ? 'active' : ''}`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColors[myRole]} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.full_name}</div>
              <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
          <button id="logout-btn" onClick={handleLogout}
            className="sidebar-link w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="glass border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${myRole === 'Admin' ? 'badge-blue' : myRole === 'Family' ? 'badge-red' : 'badge-green'}`}>
              {myRole}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 animate-fadein">
          {children}
        </main>
      </div>
    </div>
  )
}
