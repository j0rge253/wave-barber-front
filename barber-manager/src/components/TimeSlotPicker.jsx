import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import api from '../api/axios'

export default function TimeSlotPicker({ date, barberId, value, onChange, variant = 'public' }) {
  const [slots, setSlots]     = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // Ref para sempre ter a versão mais recente de onChange
  // sem colocá-la nas deps do useEffect (evita loop infinito)
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange })

  useEffect(() => {
    if (!date || !barberId) {
      setSlots([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    // Limpa seleção anterior sem causar re-render que dispara o effect de novo
    onChangeRef.current('')

    api.get('/horarios', { params: { data: date, barbeiro: barberId } })
      .then(res => {
        if (cancelled) return
        const data = res.data
        // Aceita tanto array de strings ["09:00"] quanto array de objetos [{horario:"09:00"}]
        if (Array.isArray(data)) {
          setSlots(
            typeof data[0] === 'string'
              ? data
              : data.map(d => d.horario ?? d.time ?? d.hora ?? String(d))
          )
        } else {
          setSlots([])
        }
      })
      .catch(err => {
        if (cancelled) return
        console.error('[TimeSlotPicker] erro ao buscar horários:', err)
        setError('Não foi possível carregar os horários.')
        setSlots([])
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [date, barberId]) // onChange intencionalmente fora das deps — usamos ref

  const isAdmin = variant === 'admin'

  if (!date || !barberId) return (
    <p className={`text-xs mt-1 ${isAdmin ? 'text-white/30' : 'text-[var(--sand)]/40'}`}>
      Selecione barbeiro e data para ver os horários disponíveis.
    </p>
  )

  return (
    <div>
      <label className={`text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 mb-3 ${isAdmin ? 'text-white/50' : 'text-[var(--sand)]/65'}`}>
        <Clock size={10} aria-hidden="true" /> Horário disponível
      </label>

      {loading && (
        <div className="flex gap-2 flex-wrap" role="status" aria-label="Carregando horários">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-10 w-16 rounded-xl animate-pulse ${isAdmin ? 'bg-white/8' : 'bg-white/6'}`} />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-red-400/80 text-xs" role="alert">{error}</p>
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
          role="group"
          aria-label="Horários disponíveis"
        >
          {slots.map(slot => {
            const selected = value === slot
            return (
              <motion.button
                key={slot}
                type="button"
                onClick={() => onChangeRef.current(slot)}
                whileTap={{ scale: 0.93 }}
                aria-pressed={selected}
                aria-label={`Horário ${slot}${selected ? ', selecionado' : ''}`}
                className={`
                  px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200
                  ${selected
                    ? isAdmin
                      ? 'bg-[var(--teal)] border-[var(--teal-l)] text-white shadow-lg shadow-[var(--teal)]/30'
                      : 'bg-[var(--sunset)] border-[var(--sunset-l)] text-white shadow-lg shadow-[var(--sunset)]/35'
                    : isAdmin
                      ? 'bg-white/5 border-white/10 text-white/70 hover:bg-[var(--teal)]/15 hover:border-[var(--teal-l)]/50 hover:text-white'
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
