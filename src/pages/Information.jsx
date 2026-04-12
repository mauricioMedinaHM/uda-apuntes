import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'motion/react'
import {
  GraduationCap,
  Users,
  BookOpen,
  CloudDownload,
  Search,
  Smartphone,
  FolderOpen,
  CalendarDays,
  Download,
  ArrowRight,
  Target,
  Sparkles,
} from 'lucide-react'

// Logo teal: #26778D  |  Dark bg: #081920  |  Cream: #FCFBF7

const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632 5.905-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const GithubIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
)

const FadeIn = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-48px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.52, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const SectionHeading = ({ eyebrow, title, sub }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-48px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="text-center mb-12"
    >
      <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#4DADC4' }}>
        {eyebrow}
      </span>
      <h2 className="text-3xl md:text-4xl font-black text-white mb-4">{title}</h2>
      {sub && <p className="max-w-xl mx-auto text-base m-0" style={{ color: 'rgba(252,251,247,0.5)' }}>{sub}</p>}
    </motion.div>
  )
}

const creators = [
  {
    name: 'Mauricio Medina',
    role: 'Desarrollador Full Stack',
    avatar: 'https://github.com/mauricioMedinaHM.png',
    github: 'https://github.com/mauricioMedinaHM',
    x: 'https://x.com/mauricioMedinaHM',
    githubHandle: 'mauricioMedinaHM',
  },
  {
    name: 'Joaquin Cortez',
    role: 'Desarrollador Full Stack',
    avatar: 'https://github.com/JoaquinCortezHub.png',
    github: 'https://github.com/JoaquinCortezHub',
    x: 'https://x.com/JoaquinCortezHub',
    githubHandle: 'JoaquinCortezHub',
  },
]

const CreatorCard = ({ creator, delay }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-5 p-8 rounded-2xl border"
      style={{ background: '#0F2A34', borderColor: 'rgba(38,119,141,0.25)' }}
    >
      <div className="relative">
        <img
          src={creator.avatar}
          alt={creator.name}
          className="w-28 h-28 rounded-full object-cover border-2"
          style={{ borderColor: 'rgba(38,119,141,0.5)', boxShadow: '0 0 24px rgba(38,119,141,0.25)' }}
        />
        <div
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2"
          style={{ background: '#26778D', borderColor: '#0F2A34' }}
        >
          <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2} />
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-1">{creator.name}</h3>
        <p className="text-sm font-medium m-0" style={{ color: '#4DADC4' }}>{creator.role}</p>
      </div>

      <div className="flex items-center gap-3">
        <a
          href={creator.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:text-white"
          style={{ color: 'rgba(252,251,247,0.6)', border: '1px solid rgba(38,119,141,0.25)', background: '#081920' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(38,119,141,0.6)'; e.currentTarget.style.background = '#0F2A34' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(38,119,141,0.25)'; e.currentTarget.style.background = '#081920' }}
        >
          <GithubIcon className="w-4 h-4" />
          {creator.githubHandle}
        </a>
        <a
          href={creator.x}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:text-white"
          style={{ color: 'rgba(252,251,247,0.5)', border: '1px solid rgba(38,119,141,0.25)', background: '#081920' }}
          title="Perfil en X"
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(38,119,141,0.6)'; e.currentTarget.style.background = '#0F2A34' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(38,119,141,0.25)'; e.currentTarget.style.background = '#081920' }}
        >
          <XIcon className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  )
}

const features = [
  { Icon: GraduationCap, title: 'Organización Académica', description: 'Apuntes organizados por carrera, año y materia para facilitar tu estudio de forma estructurada.' },
  { Icon: Users, title: 'Por y para Estudiantes', description: 'Plataforma creada por estudiantes universitarios para ayudar a otros estudiantes de la UDA.' },
  { Icon: BookOpen, title: 'Contenido Actualizado', description: 'Material de estudio constantemente actualizado con las últimas versiones y revisiones.' },
  { Icon: CloudDownload, title: 'Descarga Gratuita', description: 'Todos los apuntes están disponibles para descarga gratuita, sin límites ni suscripciones.' },
  { Icon: Search, title: 'Búsqueda Avanzada', description: 'Encuentra rápidamente el contenido que necesitás con nuestro sistema de búsqueda inteligente.' },
  { Icon: Smartphone, title: 'Responsive Design', description: 'Accedé desde cualquier dispositivo: móvil, tablet o computadora, siempre con la mejor experiencia.' },
]

const FeatureCard = ({ Icon, title, description, delay }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4 p-6 rounded-2xl border transition-all duration-300 group"
      style={{ background: '#0F2A34', borderColor: 'rgba(38,119,141,0.25)' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(38,119,141,0.6)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(38,119,141,0.25)'}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(38,119,141,0.15)', border: '1px solid rgba(38,119,141,0.3)' }}
      >
        <Icon className="w-5 h-5" style={{ color: '#4DADC4' }} strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed m-0" style={{ color: 'rgba(252,251,247,0.5)' }}>{description}</p>
    </motion.div>
  )
}

const steps = [
  { Icon: FolderOpen, number: '01', title: 'Seleccioná tu carrera', desc: 'Elegí tu programa académico desde la página principal de archivos.' },
  { Icon: CalendarDays, number: '02', title: 'Escogé el año', desc: 'Navegá por los años académicos disponibles para tu carrera.' },
  { Icon: Download, number: '03', title: 'Accedé a los apuntes', desc: 'Descargá el material de la materia que necesités, gratis y al instante.' },
]

const Information = () => {
  return (
    <div className="min-h-screen" style={{ background: '#081920' }}>

      {/* ── Page header ── */}
      <section
        className="py-20 border-b"
        style={{ background: 'linear-gradient(160deg, #060F14 0%, #0B2028 60%, #060F14 100%)', borderColor: 'rgba(38,119,141,0.2)' }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#4DADC4' }}>
              Información
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Sobre{' '}
              <span style={{
                background: 'linear-gradient(135deg, #4DADC4 0%, #26778D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Apuntes UDA
              </span>
            </h1>
            <p className="text-lg max-w-xl mx-auto m-0" style={{ color: 'rgba(252,251,247,0.5)' }}>
              Herramienta diseñada para mejorar tu organización a la hora de estudiar.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Creators ── */}
      <section className="py-20" style={{ background: '#081920' }}>
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="El equipo"
            title="Quiénes lo construimos"
            sub="Dos estudiantes de la UDA que decidieron construir la herramienta que siempre quisieron tener."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {creators.map((c, i) => <CreatorCard key={c.name} creator={c} delay={i * 0.1} />)}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 border-y" style={{ background: '#060F14', borderColor: 'rgba(38,119,141,0.2)' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <div className="text-center mb-4">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#4DADC4' }}>
                  Nuestra misión
                </span>
              </div>
              <div className="rounded-2xl border p-10" style={{ background: '#0F2A34', borderColor: 'rgba(38,119,141,0.25)' }}>
                <div className="flex justify-center mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(38,119,141,0.15)', border: '1px solid rgba(38,119,141,0.3)' }}
                  >
                    <Target className="w-6 h-6" style={{ color: '#4DADC4' }} strokeWidth={1.5} />
                  </div>
                </div>
                <p className="text-lg leading-relaxed text-center mb-4 m-0" style={{ color: 'rgba(252,251,247,0.85)' }}>
                  Apuntes UDA nace de la necesidad de tener un espacio centralizado donde los
                  estudiantes puedan acceder fácilmente a apuntes, resúmenes y material de estudio
                  de alta calidad, organizados de manera intuitiva y accesible desde cualquier dispositivo.
                </p>
                <p className="text-center m-0" style={{ color: 'rgba(252,251,247,0.5)' }}>
                  Creemos en la educación colaborativa y en el poder de compartir conocimiento para
                  mejorar el rendimiento académico de toda la comunidad estudiantil de la UDA.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20" style={{ background: '#081920' }}>
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Funcionalidades"
            title="Todo lo que ofrecemos"
            sub="Una plataforma completa pensada para que estudiar sea más fácil y eficiente."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {features.map((f, i) => <FeatureCard key={f.title} {...f} delay={i * 0.07} />)}
          </div>
        </div>
      </section>

      {/* ── How to use ── */}
      <section className="py-20 border-y" style={{ background: '#060F14', borderColor: 'rgba(38,119,141,0.2)' }}>
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Guía rápida"
            title="Cómo usar la plataforma"
            sub="En tres pasos simples tenés acceso a todos los apuntes que necesitás."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <FadeIn key={step.number} delay={i * 0.1}>
                <div
                  className="relative flex flex-col items-center text-center p-8 rounded-2xl border"
                  style={{ background: '#0F2A34', borderColor: 'rgba(38,119,141,0.25)' }}
                >
                  <span className="absolute top-5 right-5 text-xs font-bold font-mono" style={{ color: 'rgba(38,119,141,0.4)' }}>
                    {step.number}
                  </span>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: 'rgba(38,119,141,0.15)', border: '1px solid rgba(38,119,141,0.3)' }}
                  >
                    <step.Icon className="w-6 h-6" style={{ color: '#4DADC4' }} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm leading-relaxed m-0" style={{ color: 'rgba(252,251,247,0.5)' }}>{step.desc}</p>

                  {i < steps.length - 1 && (
                    <div
                      className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full items-center justify-center"
                      style={{ background: '#060F14', border: '1px solid rgba(38,119,141,0.3)' }}
                    >
                      <ArrowRight className="w-3 h-3" style={{ color: '#26778D' }} strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contribute CTA ── */}
      <section className="py-20" style={{ background: '#081920' }}>
        <div className="container mx-auto px-4">
          <FadeIn>
            <div
              className="max-w-2xl mx-auto text-center rounded-2xl border p-12"
              style={{ background: '#0F2A34', borderColor: 'rgba(38,119,141,0.25)' }}
            >
              <div className="flex justify-center mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(38,119,141,0.15)', border: '1px solid rgba(38,119,141,0.3)' }}
                >
                  <Users className="w-6 h-6" style={{ color: '#4DADC4' }} strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-4">¿Querés contribuir?</h2>
              <p className="mb-8 leading-relaxed m-0" style={{ color: 'rgba(252,251,247,0.5)' }}>
                Si tenés apuntes de calidad que querés compartir con otros estudiantes, o ideas
                para mejorar la plataforma, nos encantaría escucharte.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #1E6D82 0%, #26778D 100%)',
                  boxShadow: '0 0 24px rgba(38,119,141,0.35)',
                }}
              >
                Contactanos
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}

export default Information
