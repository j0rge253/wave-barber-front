import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import TimeSlotPicker from './TimeSlotPicker'

export default function NewAppointmentModal({ onClose, onCreated }) {
  const [form, setForm]       = useState({ clientId: '', barberId: '', serviceId: '', data: '', horario: '' })
  const [options, setOptions] = useState({ clients: [], barbers: [], services: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/clients').catch(() => ({ data: [] })),
      api.get('/barbers').catch(() => ({ data: [] })),
      api.get('/services').catch(() => ({ data: [] })),
    ]).then(([c, b, s]) => setOptions({ clients: c.data, barbers: b.data, services: s.data }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.horario) { toast.error('Selecione um horário disponível.'); return }
    setLoading(true)
    try {
      await api.post('/appointments', form)
      toast.success('Agendamento criado!')
      onCreated?.()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.erro || err.response?.data?.message || 'Erro ao criar agendamento.'
      if (err.response?.data?.erro === 'Horário indisponível') {
        toast.error('Esse horário acabou de ser reservado, escolha outro.')
        setForm(f => ({ ...f, horario: '' }))
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const fieldCls = 'w-full bg-white/5 border border-[var(--teal)]/25 rounded-xl px-4 py-3 text-[var(--white-s)] focus:outline-none focus:border-[var(--teal-l)] transition-all duration-200'

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#0f2a35] border border-[var(--teal)]/20 rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-title text-[var(--white-s)] font-bold text-lg tracking-wide">Novo Agendamento</h3>
          <button onClick={onClose}
            className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/8 transition-all duration-200">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Cliente */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs font-medium uppercase tracking-wider">Cliente</label>
            <select required value={form.clientId} onChange={set('clientId')} className={fieldCls}>
              <option value="" className="bg-[#0f2a35]">Selecione o cliente</option>
              {options.clients.map(c => <option key={c.id} value={c.id} className="bg-[#0f2a35]">{c.name}</option>)}
            </select>
          </div>

          {/* Barbeiro */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs font-medium uppercase tracking-wider">Barbeiro</label>
            <select required value={form.barberId} onChange={set('barberId')} className={fieldCls}>
              <option value="" className="bg-[#0f2a35]">Selecione o barbeiro</option>
              {options.barbers.map(b => <option key={b.id} value={b.id} className="bg-[#0f2a35]">{b.name}</option>)}
            </select>
          </div>

          {/* Serviço */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs font-medium uppercase tracking-wider">Serviço</label>
            <select required value={form.serviceId} onChange={set('serviceId')} className={fieldCls}>
              <option value="" className="bg-[#0f2a35]">Selecione o serviço</option>
              {options.services.map(s => <option key={s.id} value={s.id} className="bg-[#0f2a35]">{s.name}</option>)}
            </select>
          </div>

          {/* Data */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs font-medium uppercase tracking-wider">Data</label>
            <input type="date" required value={form.data} onChange={set('data')} className={fieldCls}
              min={new Date().toISOString().split('T')[0]} />
          </div>

          {/* Horários */}
          <TimeSlotPicker
            date={form.data}
            barberId={form.barberId}
            value={form.horario}
            onChange={(h) => setForm(f => ({ ...f, horario: h }))}
            variant="admin"
          />

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl bg-[var(--sunset)] hover:bg-[var(--sunset-l)] disabled:opacity-50 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[var(--sunset)]/30 text-sm">
              {loading ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
