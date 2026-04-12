import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'motion/react'
import {
  FolderOpen,
  Search,
  Trophy,
  Cloud,
  BadgeCheck,
  Users,
  ArrowRight,
  ChevronDown,
} from 'lucide-react'
import TopCareerWidget from '../components/TopCareerWidget'

// Logo teal: #26778D  |  Dark bg: #081920  |  Cream: #FCFBF7

/* ─── Animated background orb ───────────────────────────────────── */
const Orb = ({ style, dx = 30, dy = 20, duration = 10 }) => (
  <motion.div
    className="absolute rounded-full blur-3xl pointer-events-none"
    style={style}
    animate={{ x: [0, dx, 0], y: [0, dy, 0] }}
    transition={{ duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
  />
)

/* ─── Feature card ───────────────────────────────────────────────── */
const FeatureCard = ({ Icon, title, desc, delay }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4 p-6 rounded-2xl border transition-all duration-300 group"
      style={{ borderColor: 'rgba(38,119,141,0.25)', background: '#0F2A34' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(38,119,141,0.6)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(38,119,141,0.25)'}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
        style={{ background: 'rgba(38,119,141,0.15)', border: '1px solid rgba(38,119,141,0.3)' }}
      >
        <Icon className="w-5 h-5" style={{ color: '#4DADC4' }} strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed m-0" style={{ color: 'rgba(252,251,247,0.5)' }}>{desc}</p>
    </motion.div>
  )
}

/* ─── Section heading ────────────────────────────────────────────── */
const SectionHeading = ({ eyebrow, title, sub }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="text-center mb-12"
    >
      <span
        className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: '#4DADC4' }}
      >
        {eyebrow}
      </span>
      <h2 className="text-3xl md:text-4xl font-black text-white mb-4">{title}</h2>
      <p className="text-base max-w-xl mx-auto m-0" style={{ color: 'rgba(252,251,247,0.5)' }}>{sub}</p>
    </motion.div>
  )
}

const features = [
  {
    Icon: FolderOpen,
    title: 'Archivos por carrera',
    desc: 'Todos los apuntes organizados por carrera. Encontrá lo que necesitás en segundos sin navegar carpetas interminables.',
  },
  {
    Icon: Search,
    title: 'Búsqueda rápida',
    desc: 'Buscá apuntes por materia, tema o palabra clave. Resultados instantáneos desde cualquier dispositivo.',
  },
  {
    Icon: Trophy,
    title: 'Ranking de materias',
    desc: 'Descubrí qué materias tienen más recursos disponibles y reconocé a quienes más contribuyen.',
  },
  {
    Icon: Cloud,
    title: 'Almacenamiento en la nube',
    desc: 'Respaldado por Cloudflare R2 para disponibilidad y velocidad óptimas sin importar dónde estés.',
  },
  {
    Icon: BadgeCheck,
    title: '100% Gratuito',
    desc: 'Sin suscripciones ni costos ocultos. El conocimiento debe ser libre y accesible para toda la comunidad.',
  },
  {
    Icon: Users,
    title: 'Comunidad estudiantil',
    desc: 'Construido por estudiantes para estudiantes. Cualquiera puede subir y compartir sus apuntes.',
  },
]

/* ─── Big primary button ─────────────────────────────────────────── */
const ExploreButton = ({ onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.04, y: -2 }}
    whileTap={{ scale: 0.97 }}
    className="relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black text-lg text-white overflow-hidden"
    style={{
      background: 'linear-gradient(135deg, #1E6D82 0%, #26778D 60%, #1A5E72 100%)',
      boxShadow: '0 0 36px rgba(38,119,141,0.45), 0 16px 32px rgba(0,0,0,0.4)',
    }}
  >
    <motion.span
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.12) 50%, transparent 62%)',
      }}
      animate={{ x: ['-120%', '220%'] }}
      transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 3.5, ease: 'easeInOut' }}
    />
    <FolderOpen className="w-5 h-5 relative z-10" strokeWidth={2} />
    <span className="relative z-10">Explorar Archivos</span>
    <motion.span
      className="relative z-10"
      animate={{ x: [0, 4, 0] }}
      transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
    </motion.span>
  </motion.button>
)

const Home = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen" style={{ background: '#081920' }}>

      {/* ═══ HERO ═══════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #060F14 0%, #0B2028 50%, #060F14 100%)' }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(38,119,141,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(38,119,141,.8) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }}
        />

        {/* Teal orbs */}
        <Orb style={{ width: 560, height: 560, background: 'rgba(38,119,141,0.16)', top: '-12%', left: '-10%' }} dx={35} dy={25} duration={11} />
        <Orb style={{ width: 420, height: 420, background: 'rgba(38,119,141,0.11)', bottom: '-8%', right: '-8%' }} dx={-28} dy={-18} duration={13} />
        <Orb style={{ width: 260, height: 260, background: 'rgba(38,119,141,0.09)', top: '35%', right: '8%' }} dx={18} dy={-22} duration={9} />
        <Orb style={{ width: 180, height: 180, background: 'rgba(38,119,141,0.10)', bottom: '22%', left: '12%' }} dx={-14} dy={16} duration={12} />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-24 text-center">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.55 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center mb-8"
          >
            <img
              src="/Logo.png"
              alt="APUNTES UDA"
              className="w-24 h-24 md:w-32 md:h-32 object-contain"
              style={{ filter: 'drop-shadow(0 0 24px rgba(38,119,141,0.6))' }}
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-4 tracking-tight"
          >
            Apuntes{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #4DADC4 0%, #26778D 50%, #1A5E72 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              UDA
            </span>
          </motion.h1>

          {/* Mission statement */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.27, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-0 mt-6"
            style={{ color: 'rgba(252,251,247,0.7)' }}
          >
            La plataforma estudiantil donde podés encontrar, compartir y organizar apuntes
            universitarios de todas las carreras de la UDA, de forma gratuita y colaborativa.
          </motion.p>

          {/* Main CTA */}
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center mt-10 mb-8"
          >
            <ExploreButton onClick={() => navigate('/archivos')} />
          </motion.div>

          {/* Secondary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.68 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <a
              href="https://cafecito.app/apuntesuda"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ color: '#FCFBF7', border: '1px solid rgba(252,251,247,0.15)', background: 'rgba(252,251,247,0.05)' }}
            >
              Apoya el proyecto
            </a>
            <a
              href="https://drive.google.com/drive/folders/1oOYF9Od5NeSErp7lokq95pQ37voukBvu?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ color: 'rgba(252,251,247,0.6)', border: '1px solid rgba(38,119,141,0.25)', background: 'rgba(38,119,141,0.08)' }}
            >
              Contribuye con apuntes
            </a>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            style={{ color: 'rgba(38,119,141,0.5)' }}
          >
            <span className="text-xs font-medium tracking-wide" style={{ color: 'rgba(252,251,247,0.3)' }}>Descubrí más</span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
              <ChevronDown className="w-5 h-5" style={{ color: 'rgba(38,119,141,0.5)' }} strokeWidth={1.5} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ MISSION STRIP ══════════════════════════════════════════ */}
      <MissionStrip />

      {/* ═══ FEATURES ═══════════════════════════════════════════════ */}
      <section className="py-24" style={{ background: '#081920' }}>
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Plataforma"
            title="Todo lo que necesitás para estudiar"
            sub="Una herramienta construida por estudiantes para estudiantes. Sin publicidad, sin costos, sin complicaciones."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.07} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ RANKING WIDGET ═════════════════════════════════════════ */}
      <section className="py-20" style={{ background: '#060F14' }}>
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Ranking"
            title="Las carreras con más apuntes"
            sub="Las materias con mayor cantidad de recursos disponibles según la comunidad."
          />
          <div className="max-w-2xl mx-auto">
            <TopCareerWidget />
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ══════════════════════════════════════════════ */}
      <FinalCTA navigate={navigate} />
    </div>
  )
}

/* ─── Mission strip ──────────────────────────────────────────────── */
const MissionStrip = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <section
      ref={ref}
      className="py-16"
      style={{ background: '#060F14', borderTop: '1px solid rgba(38,119,141,0.2)', borderBottom: '1px solid rgba(38,119,141,0.2)' }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="text-xl md:text-2xl font-medium leading-relaxed m-0" style={{ color: 'rgba(252,251,247,0.8)' }}>
            Nuestra misión es{' '}
            <span className="font-semibold" style={{ color: '#4DADC4' }}>democratizar el acceso al material académico</span>{' '}
            de la Universidad del Aconcagua, facilitando que cada estudiante pueda estudiar mejor y
            contribuir al aprendizaje colectivo.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Final CTA ──────────────────────────────────────────────────── */
const FinalCTA = ({ navigate }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <section
      ref={ref}
      className="relative py-28 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #060F14 0%, #0B2028 50%, #060F14 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(38,119,141,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(38,119,141,.8) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }}
      />
      <Orb style={{ width: 400, height: 400, background: 'rgba(38,119,141,0.13)', top: '-20%', right: '-5%' }} dx={-20} dy={18} duration={10} />
      <Orb style={{ width: 300, height: 300, background: 'rgba(38,119,141,0.10)', bottom: '-15%', left: '5%' }} dx={16} dy={-14} duration={12} />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Empezá a estudiar{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #4DADC4 0%, #26778D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              mejor
            </span>
          </h2>
          <p className="text-lg mb-10 max-w-md mx-auto" style={{ color: 'rgba(252,251,247,0.5)', marginBottom: '2.5rem' }}>
            Miles de apuntes esperan. Accedé ahora, es completamente gratis.
          </p>

          <div className="flex justify-center mb-8">
            <ExploreButton onClick={() => navigate('/archivos')} />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://cafecito.app/apuntesuda"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ color: '#FCFBF7', border: '1px solid rgba(252,251,247,0.15)', background: 'rgba(252,251,247,0.05)' }}
            >
              Apoya el proyecto
            </a>
            <a
              href="https://drive.google.com/drive/folders/1oOYF9Od5NeSErp7lokq95pQ37voukBvu?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ color: 'rgba(252,251,247,0.6)', border: '1px solid rgba(38,119,141,0.25)', background: 'rgba(38,119,141,0.08)' }}
            >
              Contribuye con apuntes
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Home
