import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CalendarDays, LogOut, LayoutDashboard, Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import WaveLogo from './WaveLogo'

export default function Navbar() {
  const { logout } = useAuth()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path) => pathname === path

  const linkCls = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-[var(--teal)]/20 text-[var(--teal-l)] border border-[var(--teal)]/40'
        : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
    }`

  const navLinks = [
    { to: '/admin',        label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/admin/agenda', label: 'Agenda',    Icon: CalendarDays    },
  ]

  return (
    <nav className="bg-[#0d1f1f]/85 backdrop-blur-lg border-b border-[var(--teal)]/15 relative z-40">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <WaveLogo size={32} />
          <div className="leading-none">
            <span className="font-title text-[var(--white-s)] font-bold text-sm block tracking-wider">WAVE</span>
            <span className="text-[var(--teal-l)] text-[9px] font-semibold tracking-[0.3em] uppercase">Admin</span>
          </div>
        </div>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, Icon }) => (
            <Link key={to} to={to} className={linkCls(to)}>
              <Icon size={15} aria-hidden="true" /> {label}
            </Link>
          ))}
        </div>

        {/* Logout desktop + hamburger mobile */}
        <div className="flex items-center gap-2">
          <button
            onClick={logout}
            aria-label="Sair"
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
          >
            <LogOut size={15} aria-hidden="true" /> Sair
          </button>

          <button
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
            className="md:hidden p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/8 transition-all duration-200"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-[var(--teal)]/10 overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ to, label, Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(to)
                      ? 'bg-[var(--teal)]/20 text-[var(--teal-l)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} aria-hidden="true" /> {label}
                </Link>
              ))}
              <button
                onClick={() => { logout(); setMobileOpen(false) }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 mt-1"
              >
                <LogOut size={16} aria-hidden="true" /> Sair
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
