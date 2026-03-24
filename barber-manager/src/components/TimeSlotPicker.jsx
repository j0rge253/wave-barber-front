import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock } from 'lucide-react'
import api from '../api/axios'

/**
 * TimeSlotPicker
 * Props:
 *   date      — string YYYY-MM-DD
 *   barberId  — string | number
 *   value     — horário selecionado ("14:30" | "")
 *   onChange  — (horario: string) => void
 *   variant   — "public" | "admin"  (estilos diferentes)
 */
export default function TimeSlotPicker({ date, barberId, value, onChange, variant = 'public' }) {
  const [slots, setSlots]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)

  useEffect(() => {
    if (!date || !barberId) { setSlots([]); return }
    setLoading(true)
    setError(null)
    onChange('')   // limpa seleção anterior ao trocar data/barbeiro

    api.get('/horarios', { params: { data: date, barbeiro: barberId } })
      .then(res => setSlots(Array.isArray(res.data) ? res.data : []))
      .catch(() => {
        setError('Não foi possível carregar os horários.')
        setSlots([])
      })
      .finally(() => setLoading(false))
  }, [date, barberId])

  const isAdmin = variant === 'admin'

  if (!date || !barberId) return (
    <p className={`text-xs ${isAdmin ? 'text-white/30' : 'text-[var(--sand)]/40'} mt-1`}>
      Selecione barbeiro e data para ver os horários disponíveis.
    </p>
  )

  return (
    <div>
      <label className={`text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 mb-3 ${isAdmin ? 'text-white/50' : 'text-[var(--sand)]/65'}`}>
        <Clock size={10} /> Horário disponível
      </label>

      {loading && (
        <div className="flex gap-2 flex-wrap">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-10 w-16 rounded-xl animate-pulse ${isAdmin ? 'bg-white/8' : 'bg-white/6'}`} />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-red-400/70 text-xs">{error}</p>
      )}

      {!loading && !error && slots.length === 0 && (
        <p className={`text-xs ${isAdmin ? 'text-white/30' : 'text-[var(--sand)]/40'}`}>
          Nenhum horário disponível para esta data.
        </p>
      )}

      {!loading && !error && slots.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap gap-2"
        >
          {slots.map(slot => {
            const selected = value === slot
            return (
              <motion.button
                key={slot}
                type="button"
                onClick={() => onChange(slot)}
                whileTap={{ scale: 0.93 }}
                className={`
                  px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200
                  ${selected
                    ? isAdmin
                      ? 'bg-[var(--teal)] border-[var(--teal-l)] text-white shadow-lg shadow-[var(--teal)]/30'
                      : 'bg-[var(--sunset)] border-[var(--sunset-l)] text-white shadow-lg shadow-[var(--sunset)]/35'
                    : isAdmin
                      ? 'bg-white/5 border-white/12 text-white/70 hover:bg-[var(--teal)]/15 hover:border-[var(--teal-l)]/50 hover:text-white'
                      : 'bg-white/5 border-[var(--teal)]/25 text-[var(--sand)] hover:bg-[var(--teal)]/15 hover:border-[var(--teal-l)]/50 hover:text-white'
                  }
                `}
              >
                {slot}
              </motion.button>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
