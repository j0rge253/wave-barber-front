import { useEffect, useState } from 'react'
import { DollarSign, Scissors, User, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const STATUS_BADGE = {
  confirmed: 'bg-green-500/15 text-green-400 border border-green-500/25',
  pending: 'bg-[#c1692a]/15 text-[#e07a35] border border-[#c1692a]/25',
  cancelled: 'bg-red-500/15 text-red-400 border border-red-500/25',
}
const STATUS_LABEL = { confirmed: 'Confirmado', pending: 'Pendente', cancelled: 'Cancelado' }

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className={`bg-[#163030] border rounded-2xl p-5 flex items-center gap-4 hover:bg-[#1a3838] transition-all duration-200 ${accent}`}>
      <div className="bg-[#c1692a]/15 border border-[#c1692a]/25 p-3 rounded-xl">
        <Icon size={20} className="text-[#e07a35]" />
      </div>
      <div>
        <p className="text-white/50 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-white text-xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ revenue: 'R$ 0,00', scheduled: 0, nextClient: '—' })
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    Promise.all([
      api.get('/dashboard/stats').catch(() => ({ data: {} })),
      api.get(`/appointments?date=${today}`).catch(() => ({ data: [] })),
    ]).then(([statsRes, apptRes]) => {
      const s = statsRes.data
      setStats({
        revenue: s.revenue ? `R$ ${Number(s.revenue).toFixed(2).replace('.', ',')}` : 'R$ 0,00',
        scheduled: s.scheduled ?? 0,
        nextClient: s.nextClient ?? '—',
      })
      setAppointments(Array.isArray(apptRes.data) ? apptRes.data : [])
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen admin-bg">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="font-title text-2xl sm:text-3xl text-[var(--white-s)] font-bold tracking-wide">Dashboard</h2>
          <p className="text-white/40 text-sm mt-1">Visão geral do dia de hoje</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={DollarSign} label="Faturamento Hoje" value={stats.revenue} accent="border-[#2d7d7d]/25" />
          <StatCard icon={Scissors} label="Cortes Agendados" value={stats.scheduled} accent="border-[#2d7d7d]/25" />
          <StatCard icon={User} label="Próximo Cliente" value={stats.nextClient} accent="border-[#2d7d7d]/25" />
        </div>

        {/* Tabela de agendamentos */}
        <div className="bg-[#163030] border border-[#2d7d7d]/25 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d7d7d]/15">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <TrendingUp size={16} className="text-[#4aa8a8]" />
              Agendamentos de Hoje
            </h3>
            <Link to="/admin/agenda" className="text-[#4aa8a8] hover:text-[#2d7d7d] text-sm font-medium transition-colors">
              Ver agenda →
            </Link>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-white/30 text-sm">Carregando...</div>
          ) : appointments.length === 0 ? (
            <div className="px-6 py-12 text-center text-white/30 text-sm">
              Nenhum agendamento para hoje.
            </div>
          ) : (
            <div className="table-scroll">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3 text-white/30 text-xs font-medium uppercase tracking-wide">Horário</th>
                  <th className="text-left px-6 py-3 text-white/30 text-xs font-medium uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-6 py-3 text-white/30 text-xs font-medium uppercase tracking-wide hidden md:table-cell">Serviço</th>
                  <th className="text-left px-6 py-3 text-white/30 text-xs font-medium uppercase tracking-wide hidden md:table-cell">Barbeiro</th>
                  <th className="text-left px-6 py-3 text-white/30 text-xs font-medium uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a, i) => (
                  <tr
                    key={a.id}
                    className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i === appointments.length - 1 ? 'border-0' : ''}`}
                  >
                    <td className="px-6 py-4 text-[#e07a35] font-bold text-sm">{a.time}</td>
                    <td className="px-6 py-4 text-white font-medium text-sm">{a.clientName}</td>
                    <td className="px-6 py-4 text-white/50 text-sm hidden md:table-cell">{a.service}</td>
                    <td className="px-6 py-4 text-white/50 text-sm hidden md:table-cell">{a.barber}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[a.status] || STATUS_BADGE.pending}`}>
                        {STATUS_LABEL[a.status] || 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </main>
    </div>
  )
}
