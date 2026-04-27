import { useState } from 'react'
import { X, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../api/axios'
import TimeSlotPicker from './TimeSlotPicker'

/**
 * EditAppointmentModal
 * Props:
 *   appointment — objeto { id, clientName, barber, barberId, service, time, status, date }
 *   onClose     — () => void
 *   onUpdated   — () => void
 */
export default function EditAppointmentModal({ appointment, onClose, onUpdated }) {
  const [data, setData]       = useState(appointment.date || '')
  const [horario, setHorario] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!horario) { toast.error('Selecione um horário disponível.'); return }
    setLoading(true)
    try {
      await api.patch(`/appointments/${appointment.id}`, { data, horario })
      toast.success('Agendamento atualizado!')
      onUpdated?.()
      onClose()
    } catch (err) {
      if (err.response?.data?.erro === 'Horário indisponível') {
        toast.error('Esse horário acabou de ser reservado, escolha outro.')
        setHorario('')
      } else {
        toast.error(err.response?.data?.message || 'Erro ao atualizar agendamento.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fieldCls = 'w-full bg-white/5 border border-[var(--teal)]/25 rounded-xl px-4 py-3 text-[var(--white-s)] focus:outline-none focus:border-[var(--teal-l)] transition-all duration-200'

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#0f2a35] border border-[var(--teal)]/20 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl modal-scroll"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-title text-[var(--white-s)] font-bold text-lg tracking-wide">Editar Agendamento</h3>
            <p className="text-white/40 text-xs mt-0.5">{appointment.clientName} · {appointment.service}</p>
          </div>
          <button onClick={onClose}
            className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/8 transition-all duration-200">
            <X size={18} />
          </button>
        </div>

        {/* Info atual */}
        <div className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
          <Clock size={14} className="text-[var(--teal-l)] flex-shrink-0" />
          <div>
            <p className="text-white/40 text-xs">Horário atual</p>
            <p className="text-[var(--sunset-l)] font-bold">{appointment.time} · {appointment.date}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nova data */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs font-medium uppercase tracking-wider">Nova data</label>
            <input
              type="date"
              required
              value={data}
              onChange={(e) => { setData(e.target.value); setHorario('') }}
              className={fieldCls}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Horários disponíveis */}
          <TimeSlotPicker
            date={data}
            barberId={appointment.barberId}
            value={horario}
            onChange={setHorario}
            variant="admin"
          />

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={loading || !horario}
              className="flex-1 py-3 rounded-xl bg-[var(--teal)] hover:bg-[var(--teal-l)] disabled:opacity-40 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[var(--teal)]/30 text-sm">
              {loading ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
