import { useEffect, useState, useCallback } from 'react'
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Scissors, User, Pencil, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import NewAppointmentModal from '../components/NewAppointmentModal'
import EditAppointmentModal from '../components/EditAppointmentModal'
import api from '../api/axios'

function formatDate(date) {
  return date.toISOString().split('T')[0]
}
function displayDate(date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

const STATUS_BADGE  = {
  confirmed: 'badge-confirmed',
  pending:   'badge-pending',
  cancelled: 'badge-cancelled',
}
const STATUS_LABEL  = { confirmed: 'Confirmado', pending: 'Pendente', cancelled: 'Cancelado' }

// Monta grade de horários mesclando slots livres + agendamentos
function buildScheduleGrid(slots, appointments) {
  const apptMap = {}
  appointments.forEach(a => { apptMap[a.time] = a })

  // Garante que todos os agendamentos apareçam mesmo se não estiverem nos slots
  const allTimes = [...new Set([...slots, ...appointments.map(a => a.time)])].sort()

  return allTimes.map(time => ({
    time,
    appointment: apptMap[time] || null,
  }))
}

export default function Agenda() {
  const [selectedDate, setSelectedDate]   = useState(new Date())
  const [appointments, setAppointments]   = useState([])
  const [slots, setSlots]                 = useState([])
  const [selectedBarber, setSelectedBarber] = useState('')
  const [barbers, setBarbers]             = useState([])
  const [loading, setLoading]             = useState(false)
  const [showModal, setShowModal]         = useState(false)
  const [editTarget, setEditTarget]       = useState(null)   // appointment sendo editado
  const [deletingId, setDeletingId]       = useState(null)   // id sendo deletado

  // Carrega lista de barbeiros uma vez
  useEffect(() => {
    api.get('/barbers').catch(() => ({ data: [] })).then(r => {
      const list = Array.isArray(r.data) ? r.data : []
      setBarbers(list)
      if (list.length > 0) setSelectedBarber(String(list[0].id))
    })
  }, [])

  const fetchData = useCallback(() => {
    setLoading(true)
    const date = formatDate(selectedDate)
    Promise.all([
      api.get(`/appointments?date=${date}${selectedBarber ? `&barbeiro=${selectedBarber}` : ''}`).catch(() => ({ data: [] })),
      selectedBarber
        ? api.get('/horarios', { params: { data: date, barbeiro: selectedBarber } }).catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] }),
    ]).then(([apptRes, slotsRes]) => {
      setAppointments(Array.isArray(apptRes.data) ? apptRes.data : [])
      setSlots(Array.isArray(slotsRes.data) ? slotsRes.data : [])
    }).finally(() => setLoading(false))
  }, [selectedDate, selectedBarber])

  useEffect(() => { fetchData() }, [selectedDate, selectedBarber])

  const changeDay = (delta) => {
    setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() + delta); return n })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este agendamento?')) return
    setDeletingId(id)
    try {
      await api.delete(`/appointments/${id}`)
      toast.success('Agendamento excluído.')
      fetchData()
    } catch {
      toast.error('Erro ao excluir agendamento.')
    } finally {
      setDeletingId(null)
    }
  }

  const isToday = formatDate(selectedDate) === formatDate(new Date())
  const grid    = buildScheduleGrid(slots, appointments)

  return (
    <div className="min-h-screen admin-bg">
      <Navbar />
      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-title text-3xl text-[var(--white-s)] tracking-wide flex items-center gap-2">
              <CalendarDays className="text-[var(--teal-l)]" size={26} />
              Agenda
            </h2>
            <p className="text-white/40 text-sm mt-1">Gerencie os agendamentos</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[var(--sunset)] hover:bg-[var(--sunset-l)] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:shadow-lg hover:shadow-[var(--sunset)]/30 hover:-translate-y-0.5">
            <Plus size={16} /> Novo
          </button>
        </div>

        {/* Filtro de data */}
        <div className="bg-[#1a3a4a]/55 border border-[var(--teal)]/20 rounded-2xl p-4 flex items-center justify-between mb-4">
          <button onClick={() => changeDay(-1)}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition-all duration-200">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center min-w-0 px-2">
            <p className="text-[var(--white-s)] font-semibold capitalize text-xs sm:text-sm leading-snug">{displayDate(selectedDate)}</p>
            {!isToday
              ? <button onClick={() => setSelectedDate(new Date())} className="text-[var(--teal-l)] hover:text-[var(--teal)] text-xs mt-1 transition-colors">Ir para hoje</button>
              : <p className="text-green-400 text-xs mt-1">Hoje</p>
            }
          </div>
          <button onClick={() => changeDay(1)}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition-all duration-200">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Filtro de barbeiro */}
        {barbers.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {barbers.map(b => (
              <button key={b.id} onClick={() => setSelectedBarber(String(b.id))}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                  selectedBarber === String(b.id)
                    ? 'bg-[var(--teal)] border-[var(--teal-l)] text-white'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-[var(--teal)]/40'
                }`}>
                {b.name}
              </button>
            ))}
          </div>
        )}

        {/* Grade de horários */}
        {loading ? (
          <div className="flex flex-col gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : grid.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-white/20">
            <Scissors size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Nenhum horário para este dia.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.ul key={formatDate(selectedDate) + selectedBarber}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="flex flex-col gap-2">
              {grid.map(({ time, appointment }) => (
                <li key={`${time}-${appointment?.id ?? 'free'}`}
                  className={`flex items-center gap-2 sm:gap-4 rounded-2xl px-3 sm:px-5 py-3 border transition-all duration-200 ${
                    appointment
                      ? 'bg-[#1a3a4a]/70 border-[var(--teal)]/25 hover:border-[var(--teal)]/45'
                      : 'bg-white/3 border-white/6 opacity-60'
                  }`}>

                  {/* Horário */}
                  <div className="min-w-[52px] text-center">
                    <span className={`font-bold text-base ${appointment ? 'text-[var(--sunset-l)]' : 'text-white/30'}`}>
                      {time}
                    </span>
                  </div>

                  <div className="w-px h-8 bg-white/8 flex-shrink-0" />

                  {/* Conteúdo */}
                  {appointment ? (
                    <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-[var(--white-s)] font-semibold text-sm truncate flex items-center gap-1.5">
                          <User size={13} className="text-[var(--teal-l)] flex-shrink-0" />
                          {appointment.clientName}
                        </p>
                        <p className="text-white/40 text-xs mt-0.5">{appointment.service} · {appointment.barber}</p>
                      </div>
                      <span className={`flex-shrink-0 ${STATUS_BADGE[appointment.status] || STATUS_BADGE.pending}`}>
                        {STATUS_LABEL[appointment.status] || 'Pendente'}
                      </span>
                      {/* Ações */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setEditTarget({ ...appointment, date: formatDate(selectedDate) })}
                          className="p-2 rounded-lg text-white/30 hover:text-[var(--teal-l)] hover:bg-[var(--teal)]/10 transition-all duration-200"
                          aria-label={`Editar agendamento de ${appointment.clientName}`}>
                          <Pencil size={14} aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDelete(appointment.id)}
                          disabled={deletingId === appointment.id}
                          className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-40"
                          aria-label={`Excluir agendamento de ${appointment.clientName}`}>
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-white/25 text-sm font-light">Disponível</span>
                      <button
                        onClick={() => setShowModal(true)}
                        className="text-xs text-[var(--teal-l)]/60 hover:text-[var(--teal-l)] border border-[var(--teal)]/20 hover:border-[var(--teal)]/50 px-3 py-1 rounded-lg transition-all duration-200">
                        + Agendar
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        )}
      </main>

      {showModal && (
        <NewAppointmentModal onClose={() => setShowModal(false)} onCreated={fetchData} />
      )}

      <AnimatePresence>
        {editTarget && (
          <EditAppointmentModal
            appointment={editTarget}
            onClose={() => setEditTarget(null)}
            onUpdated={() => { fetchData(); setEditTarget(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
