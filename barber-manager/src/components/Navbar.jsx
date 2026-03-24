import { Link, useLocation } from 'react-router-dom'
import { CalendarDays, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import WaveLogo from './WaveLogo'

export default function Navbar() {
  const { logout } = useAuth()
  const { pathname } = useLocation()

  const linkClass = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      pathname === path
        ? 'bg-[#2d7d7d]/20 text-[#4aa8a8] border border-[#2d7d7d]/40'
        : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
    }`

  return (
    <nav className="bg-[#0d1f1f]/80 backdrop-blur-lg border-b border-[#2d7d7d]/20 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <WaveLogo size={34} />
        <div>
          <span className="font-title text-[var(--white-s)] font-bold text-sm leading-none block tracking-wider">WAVE</span>
          <span className="text-[var(--teal-l)] text-[9px] font-semibold tracking-[0.3em] uppercase">Admin</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Link to="/admin" className={linkClass('/admin')}>
          <LayoutDashboard size={15} />
          Dashboard
        </Link>
        <Link to="/admin/agenda" className={linkClass('/admin/agenda')}>
          <CalendarDays size={15} />
          Agenda
        </Link>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
      >
        <LogOut size={15} />
        Sair
      </button>
    </nav>
  )
}
