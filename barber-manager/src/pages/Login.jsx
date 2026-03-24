import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import WaveLogo from '../components/WaveLogo'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Bem-vindo de volta!')
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciais inválidas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen admin-bg flex items-center justify-center px-4">
      {/* Decoração */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#2d7d7d]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#c1692a]/6 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <Link to="/" className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-8 transition-colors w-fit">
          <ArrowLeft size={14} />
          Voltar ao site
        </Link>

        <div className="flex flex-col items-center mb-8">
          <WaveLogo size={72} className="mb-4" />
          <h1 className="font-title text-2xl font-bold text-[var(--white-s)] tracking-widest">ÁREA DO BARBEIRO</h1>
          <p className="text-[var(--sand)]/40 text-sm mt-1">Acesso restrito à equipe</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#163030] border border-[#2d7d7d]/25 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs font-medium uppercase tracking-wider">E-mail</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@wavebarbearia.com"
              className="bg-white/5 border border-[#2d7d7d]/30 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#4aa8a8] transition-all duration-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs font-medium uppercase tracking-wider">Senha</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="bg-white/5 border border-[#2d7d7d]/30 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#4aa8a8] transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#c1692a] hover:bg-[#e07a35] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-[#c1692a]/30 hover:-translate-y-0.5"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
