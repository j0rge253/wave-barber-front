import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, Phone, Clock, Users, Star, Quote,
  Anchor, Wind, MapPin, MessageCircle, ChevronLeft, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import WaveLogo from '../components/WaveLogo'
import TimeSlotPicker from '../components/TimeSlotPicker'

/* ── ANIMATION HELPERS ───────────────────────────────────── */
const fadeUp   = { hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0 } }
const fadeLeft = { hidden: { opacity: 0, x: -36 }, show: { opacity: 1, x: 0 } }
const fadeRight= { hidden: { opacity: 0, x:  36 }, show: { opacity: 1, x: 0 } }
const stagger  = { show: { transition: { staggerChildren: 0.13 } } }
const ease     = [0.22, 1, 0.36, 1]

function Reveal({ children, delay = 0, className = '', dir = 'up' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const variant = dir === 'left' ? fadeLeft : dir === 'right' ? fadeRight : fadeUp
  return (
    <motion.div ref={ref} variants={variant} initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      transition={{ duration: 0.65, ease, delay }}
      className={className}>
      {children}
    </motion.div>
  )
}

/* ── SVG ICONS ───────────────────────────────────────────── */
const IcoHair = () => (
  <svg viewBox="0 0 64 64" fill="currentColor" className="w-16 h-16">
    <path d="M32 5C23 5 16 12 16 21c0 5.5 2.8 10.4 7 13.4L21 42h22l-2-7.6C45.2 31.4 48 26.5 48 21 48 12 41 5 32 5z"/>
    <path d="M25 42l-2 9h18l-2-9H25z" opacity=".7"/>
    <ellipse cx="32" cy="53" rx="11" ry="4" opacity=".4"/>
  </svg>
)
const IcoBeard = () => (
  <svg viewBox="0 0 64 64" fill="currentColor" className="w-16 h-16">
    <circle cx="32" cy="20" r="13"/>
    <circle cx="24" cy="19" r="5" fill="none" stroke="currentColor" strokeWidth="2.5"/>
    <circle cx="40" cy="19" r="5" fill="none" stroke="currentColor" strokeWidth="2.5"/>
    <line x1="29" y1="19" x2="35" y2="19" stroke="currentColor" strokeWidth="2"/>
    <path d="M13 35c0 0 3 20 19 20s19-20 19-20c-5 5-11 7-19 7s-14-2-19-7z"/>
    <path d="M19 40 Q32 52 45 40 Q38 47 32 47 Q26 47 19 40z" opacity=".55"/>
  </svg>
)
const IcoFade = () => (
  <svg viewBox="0 0 64 64" fill="currentColor" className="w-16 h-16">
    <path d="M32 6C21 6 13 14 13 25c0 7 3.5 13 9 16.5L20 48h24l-2-6.5C47.5 38 51 32 51 25 51 14 43 6 32 6z"/>
    <rect x="20" y="48" width="24" height="4" rx="2" opacity=".6"/>
    <rect x="22" y="54" width="20" height="3" rx="1.5" opacity=".35"/>
    <line x1="13" y1="32" x2="51" y2="32" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
    <line x1="15" y1="38" x2="49" y2="38" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"/>
  </svg>
)
const IcoCombo = () => (
  <svg viewBox="0 0 64 64" fill="currentColor" className="w-16 h-16">
    <circle cx="19" cy="45" r="6"/>
    <circle cx="33" cy="45" r="6"/>
    <line x1="19" y1="39" x2="40" y2="18" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
    <line x1="33" y1="39" x2="12" y2="18" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
    <rect x="40" y="8" width="15" height="4" rx="2"/>
    <rect x="41" y="12" width="2.5" height="9" rx="1.2"/>
    <rect x="46" y="12" width="2.5" height="9" rx="1.2"/>
    <rect x="51" y="12" width="2.5" height="9" rx="1.2"/>
  </svg>
)

const WPP_NUMBER = '5585996776432'
const WPP_MSG   = encodeURIComponent('Olá! Vim pelo site e quero agendar um horário na Wave Barbearia.')
const WPP_LINK  = `https://wa.me/${WPP_NUMBER}?text=${WPP_MSG}`
const MAPS_LINK = 'https://maps.google.com/?q=Av.+Padre+José+Holanda+do+Vale,+1500-A,+Piratininga,+Maracanaú-CE'
const HERO_IMG  = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&q=80&auto=format&fit=crop'

const services = [
  { Icon: IcoHair,  name: 'Corte',        desc: 'Nossa equipe fará do seu corte uma experiência única. Prontos para qualquer desafio.', price: 'R$ 45', featured: false },
  { Icon: IcoBeard, name: 'Barba',         desc: 'Queremos fazer parte da sua rotina. Nossos barbeiros fazem milagres com navalha.', price: 'R$ 40', featured: false },
  { Icon: IcoFade,  name: 'Degradê',       desc: 'Fade perfeito com acabamento fino. Técnica exclusiva para um visual moderno.', price: 'R$ 55', featured: false },
  { Icon: IcoCombo, name: 'Corte + Barba', desc: 'Combo completo com toalha quente e hidratação. A experiência Wave em um só atendimento.', price: 'R$ 75', featured: true },
]

const reviews = [
  { name: 'Lucas M.',  stars: 5, text: 'Melhor corte da região, sem comparação. Ambiente incrível, parece que você tá na praia.' },
  { name: 'Rafael S.', stars: 5, text: 'Profissionais de verdade. Fui uma vez e nunca mais fui em outro lugar. Recomendo demais!' },
  { name: 'Thiago P.', stars: 5, text: 'A vibe da Wave é única. Corte impecável e ainda sai com a mente leve. Lugar pra toda família.' },
  { name: 'Diego A.',  stars: 5, text: 'Atendimento top, ambiente aconchegante. Meu filho adora ir lá. Equipe muito atenciosa.' },
  { name: 'Carlos R.', stars: 5, text: 'Fui indicado por um amigo e não me arrependo. Corte preciso, preço justo e ótima conversa.' },
]

const SCHEDULE = [
  { day: 'Seg – Sex', hours: '09:00 – 20:00' },
  { day: 'Sábado',    hours: '09:00 – 18:00' },
  { day: 'Domingo',   hours: 'Fechado' },
]

/* ── CAROUSEL ────────────────────────────────────────────── */
function ReviewCarousel() {
  const [idx, setIdx] = useState(0)
  const total = reviews.length

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % total), 4000)
    return () => clearInterval(t)
  }, [])

  const prev = () => setIdx(i => (i - 1 + total) % total)
  const next = () => setIdx(i => (i + 1) % total)

  return (
    <div className="relative max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div key={idx}
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4, ease }}
          className="review-card p-8 text-center">
          <Quote size={28} className="mx-auto mb-5 opacity-50" style={{ color: 'var(--sunset)' }} />
          <p className="text-[var(--sand)] text-base leading-relaxed mb-6 font-light italic">
            "{reviews[idx].text}"
          </p>
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(reviews[idx].stars)].map((_, i) => (
              <Star key={i} size={14} style={{ color: 'var(--sunset-l)', fill: 'var(--sunset-l)' }} />
            ))}
          </div>
          <p className="text-[var(--white-s)] font-semibold">{reviews[idx].name}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-center gap-4 mt-6">
        <button onClick={prev} className="p-2 rounded-full border border-[var(--teal)]/30 text-[var(--teal-l)] hover:bg-[var(--teal)]/15 transition-all">
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-2">
          {reviews.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-2 bg-[var(--sunset)]' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`} />
          ))}
        </div>
        <button onClick={next} className="p-2 rounded-full border border-[var(--teal)]/30 text-[var(--teal-l)] hover:bg-[var(--teal)]/15 transition-all">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

/* ── MAIN COMPONENT ──────────────────────────────────────── */
export default function Landing() {
  const [form, setForm] = useState({ name: '', whatsapp: '', serviceId: '', barberId: '', data: '', horario: '' })
  const [options, setOptions] = useState({ services: [], barbers: [] })
  const [loading, setLoading] = useState(false)
  const [navSolid, setNavSolid] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const onScroll = () => {
      setNavSolid(window.scrollY > 60)
      const sections = ['servicos','sobre','avaliacoes','agendar']
      for (const id of sections.reverse()) {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 120) { setActiveSection(id); break }
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    Promise.all([
      api.get('/services').catch(() => ({ data: [] })),
      api.get('/barbers').catch(() => ({ data: [] })),
    ]).then(([s, b]) => setOptions({ services: s.data, barbers: b.data }))
  }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!form.horario) { toast.error('Selecione um horário disponível.'); setLoading(false); return }
      await api.post('/appointments/public', form)
      toast.success('Agendamento enviado! Entraremos em contato pelo WhatsApp.')
      setForm({ name: '', whatsapp: '', serviceId: '', barberId: '', data: '', horario: '' })
    } catch (err) {
      const msg = err.response?.data?.erro || err.response?.data?.message || 'Erro ao agendar. Tente novamente.'
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

  const navLinks = [
    { href: '#servicos',   label: 'Serviços'    },
    { href: '#sobre',      label: 'Sobre'       },
    { href: '#avaliacoes', label: 'Avaliações'  },
    { href: '#agendar',    label: 'Agendar'     },
  ]

  return (
    <div className="bg-page min-h-screen">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${navSolid ? 'bg-[#081820]/92 backdrop-blur-xl shadow-xl shadow-black/30 border-b border-[var(--teal)]/12' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WaveLogo size={36} />
            <div className="leading-none">
              <span className="font-title text-[var(--white-s)] font-bold text-base block tracking-wider">WAVE</span>
              <span className="text-[var(--teal-l)] text-[9px] font-semibold tracking-[0.3em] uppercase">Barbearia</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navLinks.map(({ href, label }) => {
              const id = href.replace('#','')
              const active = activeSection === id
              return (
                <a key={href} href={href}
                  className={`relative transition-colors duration-200 group ${active ? 'text-[var(--sunset-l)]' : 'text-[var(--sand)]/70 hover:text-[var(--sand)]'}`}>
                  {label}
                  <span className={`absolute -bottom-0.5 left-0 h-px bg-[var(--sunset-l)] transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </a>
              )
            })}
          </div>
          <Link to="/admin/login" className="text-xs text-[var(--sand)]/25 hover:text-[var(--sand)]/55 transition-colors">
            Área do Barbeiro
          </Link>
        </div>
      </motion.nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Wave Barbearia" className="w-full h-full object-cover object-center scale-105" />
          <div className="hero-overlay absolute inset-0" />
        </div>

        {/* Linhas decorativas laterais */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2.5 opacity-25">
          {[28,20,14,10,6,4].map((w,i) => <div key={i} className="h-px bg-[var(--teal-l)]" style={{width:`${w}px`}} />)}
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2.5 opacity-25 items-end">
          {[28,20,14,10,6,4].map((w,i) => <div key={i} className="h-px bg-[var(--sunset)]" style={{width:`${w}px`}} />)}
        </div>

        <div className="relative text-center px-6 max-w-4xl mx-auto pt-24">
          <motion.div initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease }} className="flex justify-center mb-8">
            <WaveLogo size={96} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.55 }}
            className="inline-flex items-center gap-2 border border-[var(--teal)]/45 rounded-full px-5 py-2 text-[var(--teal-l)] text-xs font-semibold tracking-[0.2em] uppercase mb-7 badge-pulse">
            <Anchor size={11} /> Barbearia Premium · Maracanaú – CE
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.7, ease }}
            className="font-title text-5xl md:text-[4.5rem] text-[var(--white-s)] font-black leading-[1.05] mb-5 tracking-wide">
            Corte fino.<br />
            <span style={{ background: 'linear-gradient(90deg,#e07a35,#c1692a)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              Vibe de praia.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.6 }}
            className="text-[var(--sand)] text-lg max-w-md mx-auto mb-10 leading-relaxed font-light">
            Estilo que combina com o seu ritmo. Visual afiado, mente leve.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.66, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#agendar" className="btn-primary">Garantir meu corte</a>
            <a href={WPP_LINK} target="_blank" rel="noreferrer" className="btn-ghost">
              <MessageCircle size={16} /> WhatsApp
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
            className="mt-16 animate-bounce">
            <ChevronDown size={22} className="text-[var(--sand)]/35 mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* ── SERVIÇOS ───────────────────────────────────────── */}
      <section id="servicos" className="bg-ocean-section relative pt-4 pb-28 px-6">
        <div className="wave-divider-dark" />
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-[var(--teal-l)] text-xs font-semibold uppercase tracking-[0.3em] mb-3">O que oferecemos</p>
            <h2 className="font-title text-4xl text-[var(--white-s)] tracking-wide">Nossos Serviços</h2>
            <div className="line-h w-24 mx-auto mt-5" />
          </Reveal>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map(({ Icon, name, desc, price, featured }) => (
              <motion.div key={name} variants={fadeUp}
                className={`service-card p-7 flex flex-col items-center text-center ${featured ? 'service-card-featured lg:scale-105' : ''}`}>
                {featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--sunset)] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                    Mais pedido
                  </div>
                )}
                <div className={`card-icon mb-5 drop-shadow-lg ${featured ? 'text-[var(--sunset-l)]' : 'text-white/90'}`}>
                  <Icon />
                </div>
                <h3 className="font-title text-white text-xl tracking-wide mb-3">{name}</h3>
                <p className={`text-sm leading-relaxed mb-5 font-light ${featured ? 'text-[var(--sand)]' : 'text-white/80'}`}>{desc}</p>
                <div className="mt-auto w-full border-t border-white/15 pt-4">
                  <span className={`font-bold text-lg ${featured ? 'text-[var(--sunset-l)]' : 'text-white'}`}>{price}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SOBRE — assimétrico ─────────────────────────────── */}
      <section id="sobre" className="relative py-28 px-6">
        <div className="wave-divider-ocean" />
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Reveal dir="left">
            <p className="text-[var(--teal-l)] text-xs font-semibold uppercase tracking-[0.3em] mb-4">Nossa história</p>
            <h2 className="font-title text-4xl text-[var(--white-s)] leading-tight tracking-wide mb-6">
              Entre o som do mar<br />e o corte preciso,<br />
              <span style={{ background:'linear-gradient(90deg,#e07a35,#c1692a)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                nasceu a Wave.
              </span>
            </h2>
            <div className="line-sunset w-16 mb-7" />
            <p className="text-[var(--sand)] leading-relaxed mb-5 font-light">
              É o lugar certo pra você que procura um corte executado por profissionais qualificados e gosta daquela proza que é de lei!!
            </p>
            <p className="text-[var(--sand)]/75 leading-relaxed font-light">
              Todos são bem vindos, o ambiente da barbearia é um lugar pra toda a família, onde o respeito e a amizade andam lado a lado!!
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ background:'linear-gradient(180deg,#c1692a,#2d7d7d)' }} />
              <div>
                <p className="text-[var(--white-s)] font-semibold">Wave Barbearia</p>
                <p className="text-[var(--teal-l)] text-sm">Fundada em Outubro de 2025 · Maracanaú – CE</p>
              </div>
            </div>
          </Reveal>

          <Reveal dir="right" delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Clock,  label: 'Sem Espera',   desc: 'Agendamento online em segundos' },
                { icon: Users,  label: 'Família',       desc: 'Ambiente para toda a família' },
                { icon: Phone,  label: '(85) 99677-6432', desc: 'Ligue ou mande mensagem' },
                { icon: Wind,   label: 'Vibe Única',    desc: 'Clima de praia o ano todo' },
              ].map(({ icon: Ic, label, desc }) => (
                <div key={label}
                  className="bg-[#1a3a4a]/55 border border-[var(--teal)]/18 rounded-2xl p-5 hover:border-[var(--sunset)]/40 hover:-translate-y-1 transition-all duration-300">
                  <div className="bg-[var(--teal)]/18 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                    <Ic size={17} className="text-[var(--teal-l)]" />
                  </div>
                  <p className="text-[var(--white-s)] font-semibold text-sm">{label}</p>
                  <p className="text-[var(--sand)]/55 text-xs mt-1 font-light">{desc}</p>
                </div>
              ))}
            </div>

            {/* Horários */}
            <div className="mt-4 bg-[#1a3a4a]/55 border border-[var(--teal)]/18 rounded-2xl p-5">
              <p className="text-[var(--teal-l)] text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock size={12} /> Horários de funcionamento
              </p>
              {SCHEDULE.map(({ day, hours }) => (
                <div key={day} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-[var(--sand)]/70 text-sm font-light">{day}</span>
                  <span className={`text-sm font-medium ${hours === 'Fechado' ? 'text-red-400/70' : 'text-[var(--white-s)]'}`}>{hours}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── AVALIAÇÕES ─────────────────────────────────────── */}
      <section id="avaliacoes" className="bg-ocean-section relative py-28 px-6">
        <div className="wave-divider-dark" />
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="text-[var(--teal-l)] text-xs font-semibold uppercase tracking-[0.3em] mb-3">Quem já passou pela Wave</p>
            <h2 className="font-title text-4xl text-[var(--white-s)] tracking-wide">O que dizem por aí</h2>
            <div className="line-h w-24 mx-auto mt-5" />
          </Reveal>
          <ReviewCarousel />
        </div>
      </section>

      {/* ── AGENDAMENTO ────────────────────────────────────── */}
      <section id="agendar" className="relative py-28 px-6">
        <div className="wave-divider-ocean" />
        <div className="max-w-xl mx-auto">
          <Reveal className="text-center mb-10">
            <p className="text-[var(--teal-l)] text-xs font-semibold uppercase tracking-[0.3em] mb-3">Sem cadastro necessário</p>
            <h2 className="font-title text-4xl text-[var(--white-s)] tracking-wide">Reserve seu horário</h2>
            <div className="line-h w-24 mx-auto mt-5" />
            <p className="text-[var(--sand)]/55 mt-4 text-sm font-light">Preencha abaixo e entraremos em contato pelo WhatsApp.</p>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={handleSubmit}
              className="bg-[#1a3a4a]/55 border border-[var(--teal)]/22 rounded-2xl p-8 flex flex-col gap-5 backdrop-blur-sm"
              style={{ boxShadow: '0 28px 72px rgba(8,24,32,0.55)' }}>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { label: 'Nome', key: 'name', type: 'text', placeholder: 'Seu nome completo', Icon: Users },
                  { label: 'WhatsApp', key: 'whatsapp', type: 'tel', placeholder: '(85) 99999-9999', Icon: Phone },
                ].map(({ label, key, type, placeholder, Icon: Ic }) => (
                  <div key={key} className="flex flex-col gap-2">
                    <label className="text-[var(--sand)]/65 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
                      <Ic size={10} /> {label}
                    </label>
                    <input type={type} required placeholder={placeholder} value={form[key]} onChange={set(key)} className="field" />
                  </div>
                ))}
              </div>

              {/* Serviço */}
              <div className="flex flex-col gap-2">
                <label className="text-[var(--sand)]/65 text-xs font-medium uppercase tracking-wider">Serviço</label>
                <select required value={form.serviceId} onChange={set('serviceId')} className="field">
                  <option value="" className="bg-[#0f2a35]">Selecione o serviço</option>
                  {(options.services.length ? options.services : services.map((s,i)=>({id:i+1,name:s.name}))).map(it => (
                    <option key={it.id} value={it.id} className="bg-[#0f2a35]">{it.name}</option>
                  ))}
                </select>
              </div>

              {/* Barbeiro */}
              <div className="flex flex-col gap-2">
                <label className="text-[var(--sand)]/65 text-xs font-medium uppercase tracking-wider">Barbeiro</label>
                <select required value={form.barberId} onChange={set('barberId')} className="field">
                  <option value="" className="bg-[#0f2a35]">Selecione o barbeiro</option>
                  {(options.barbers.length ? options.barbers : [{id:1,name:'Carlos'},{id:2,name:'Rafael'},{id:3,name:'Diego'}]).map(it => (
                    <option key={it.id} value={it.id} className="bg-[#0f2a35]">{it.name}</option>
                  ))}
                </select>
              </div>

              {/* Data */}
              <div className="flex flex-col gap-2">
                <label className="text-[var(--sand)]/65 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={10} /> Data
                </label>
                <input type="date" required value={form.data} onChange={set('data')} className="field"
                  min={new Date().toISOString().split('T')[0]} />
              </div>

              {/* Horários disponíveis */}
              <TimeSlotPicker
                date={form.data}
                barberId={form.barberId}
                value={form.horario}
                onChange={(h) => setForm(f => ({ ...f, horario: h }))}
                variant="public"
              />

              <button type="submit" disabled={loading} className="btn-primary mt-2 w-full">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enviando...</>
                  : 'Garantir meu corte'}
              </button>

              <a href={WPP_LINK} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-[var(--sand)]/50 hover:text-[#25d366] transition-colors duration-200 mt-1">
                <MessageCircle size={14} /> Ou agende direto pelo WhatsApp
              </a>
            </form>
          </Reveal>
        </div>
      </section>

      {/* ── LOCALIZAÇÃO ────────────────────────────────────── */}
      <section className="bg-ocean-section relative py-20 px-6">
        <div className="wave-divider-dark" />
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-10">
            <p className="text-[var(--teal-l)] text-xs font-semibold uppercase tracking-[0.3em] mb-3">Onde estamos</p>
            <h2 className="font-title text-3xl text-[var(--white-s)] tracking-wide">Nos encontre</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <a href={MAPS_LINK} target="_blank" rel="noreferrer"
              className="flex items-center gap-4 bg-[#1a3a4a]/55 border border-[var(--teal)]/20 rounded-2xl p-6 hover:border-[var(--sunset)]/40 transition-all duration-300 hover:-translate-y-1 group max-w-lg mx-auto">
              <div className="bg-[var(--sunset)]/15 border border-[var(--sunset)]/25 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin size={20} className="text-[var(--sunset-l)]" />
              </div>
              <div>
                <p className="text-[var(--white-s)] font-semibold group-hover:text-[var(--sunset-l)] transition-colors">Av. Padre José Holanda do Vale, 1500-A</p>
                <p className="text-[var(--sand)]/60 text-sm font-light">Piratininga, Maracanaú – CE · 61905-292</p>
              </div>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-[var(--teal)]/12 py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <WaveLogo size={52} />
          <div className="text-center">
            <p className="font-title text-[var(--white-s)] font-bold text-xl tracking-widest">WAVE</p>
            <p className="text-[var(--teal-l)] text-xs tracking-[0.3em] uppercase mt-0.5">Barbearia</p>
          </div>
          <div className="line-h w-32" />
          <p className="text-[var(--sand)]/25 text-xs">© 2026 Wave Barbearia · Fundada em Outubro de 2025 · Maracanaú – CE</p>
        </div>
      </footer>

      {/* ── WHATSAPP FLUTUANTE ──────────────────────────────── */}
      <motion.a href={WPP_LINK} target="_blank" rel="noreferrer"
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
        className="wpp-float" title="Agendar pelo WhatsApp">
        <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </motion.a>
    </div>
  )
}
