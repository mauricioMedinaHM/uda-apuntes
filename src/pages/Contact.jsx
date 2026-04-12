import React, { useState, useRef } from 'react'
import { motion, useInView } from 'motion/react'
import {
  EnvelopeIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'

// ─── animation helpers ────────────────────────────────────────────────────────
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

// ─── instagram icon ────────────────────────────────────────────────────────────
const InstagramIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

// ─── contact info item ─────────────────────────────────────────────────────────
const ContactItem = ({ icon: Icon, title, children, delay }) => (
  <FadeIn delay={delay} className="flex items-start gap-4">
    <div
      className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
      style={{ background: 'rgba(38,119,141,0.15)', border: '1px solid rgba(38,119,141,0.3)' }}
    >
      <Icon className="w-5 h-5" style={{ color: '#4DADC4' }} />
    </div>
    <div>
      <h3 className="font-semibold mb-0.5" style={{ color: '#FCFBF7' }}>{title}</h3>
      <div style={{ color: 'rgba(252,251,247,0.55)', fontSize: '0.875rem' }}>{children}</div>
    </div>
  </FadeIn>
)

// ─── main component ────────────────────────────────────────────────────────────
const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    const mailtoLink = `mailto:apuntesUDA@gmail.com?subject=Contacto desde la web - ${formData.name}&body=Nombre: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0A%0D%0AMensaje:%0D%0A${formData.message}`
    window.location.href = mailtoLink
  }

  return (
    <div className="min-h-screen" style={{ background: '#060F14' }}>

      {/* ── decorative orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(38,119,141,0.4) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(38,119,141,0.3) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 max-w-5xl">

        {/* ── header ── */}
        <FadeIn className="text-center mb-16">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: '#4DADC4' }}
          >
            Comunidad
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold mb-5 leading-tight"
            style={{ color: '#FCFBF7' }}
          >
            Contáctanos
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(252,251,247,0.55)' }}>
            ¿Tienes preguntas, sugerencias o quieres contribuir? ¡Nos encantaría escucharte!
          </p>
        </FadeIn>

        {/* ── two-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* ── left: contact info ── */}
          <FadeIn delay={0.1}>
            <div
              className="rounded-2xl p-8 h-full flex flex-col gap-8"
              style={{ background: '#0F2A34', border: '1px solid rgba(38,119,141,0.25)' }}
            >
              <div>
                <h2 className="text-xl font-bold mb-6" style={{ color: '#FCFBF7' }}>
                  Información de Contacto
                </h2>
                <div className="space-y-6">
                  <ContactItem icon={EnvelopeIcon} title="Email" delay={0.15}>
                    apuntesUDA@gmail.com
                  </ContactItem>

                  <ContactItem icon={ChatBubbleLeftRightIcon} title="Propósito" delay={0.2}>
                    Mejorar la experiencia de estudio universitario
                  </ContactItem>

                  <ContactItem icon={HeartIcon} title="Contribuciones" delay={0.25}>
                    Apuntes, mejoras y sugerencias bienvenidas
                  </ContactItem>

                  <ContactItem icon={InstagramIcon} title="Instagram" delay={0.3}>
                    <a
                      href="https://www.instagram.com/apuntesuda/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:underline"
                      style={{ color: '#4DADC4' }}
                    >
                      @apuntesuda
                    </a>
                  </ContactItem>
                </div>
              </div>

              {/* how to help box */}
              <FadeIn delay={0.35}>
                <div
                  className="rounded-xl p-5"
                  style={{ background: 'rgba(38,119,141,0.08)', border: '1px solid rgba(38,119,141,0.2)' }}
                >
                  <h3 className="font-semibold mb-3" style={{ color: '#4DADC4' }}>
                    ¿Cómo puedes ayudar?
                  </h3>
                  <ul className="space-y-2 text-sm" style={{ color: 'rgba(252,251,247,0.6)' }}>
                    {[
                      'Compartiendo apuntes de alta calidad',
                      'Reportando errores o enlaces rotos',
                      'Sugiriendo mejoras a la plataforma',
                      'Difundiendo la plataforma entre compañeros',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span style={{ color: '#26778D' }}>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            </div>
          </FadeIn>

          {/* ── right: form ── */}
          <FadeIn delay={0.15}>
            <div
              className="rounded-2xl p-8"
              style={{ background: '#0F2A34', border: '1px solid rgba(38,119,141,0.25)' }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: '#FCFBF7' }}>
                Envíanos un mensaje
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'rgba(252,251,247,0.7)' }}
                  >
                    Nombre completo
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Tu nombre"
                      className="w-full px-4 py-3 pl-10 rounded-xl outline-none transition-all"
                      style={{
                        background: 'rgba(38,119,141,0.08)',
                        border: '1px solid rgba(38,119,141,0.25)',
                        color: '#FCFBF7',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(38,119,141,0.7)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(38,119,141,0.25)'}
                    />
                    <UserIcon className="absolute left-3 top-3.5 h-5 w-5" style={{ color: '#4DADC4' }} />
                  </div>
                </div>

                {/* email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'rgba(252,251,247,0.7)' }}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 pl-10 rounded-xl outline-none transition-all"
                      style={{
                        background: 'rgba(38,119,141,0.08)',
                        border: '1px solid rgba(38,119,141,0.25)',
                        color: '#FCFBF7',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(38,119,141,0.7)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(38,119,141,0.25)'}
                    />
                    <EnvelopeIcon className="absolute left-3 top-3.5 h-5 w-5" style={{ color: '#4DADC4' }} />
                  </div>
                </div>

                {/* message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'rgba(252,251,247,0.7)' }}
                  >
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Cuéntanos cómo podemos ayudarte o cómo quieres contribuir..."
                    className="w-full px-4 py-3 rounded-xl outline-none resize-none transition-all"
                    style={{
                      background: 'rgba(38,119,141,0.08)',
                      border: '1px solid rgba(38,119,141,0.25)',
                      color: '#FCFBF7',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(38,119,141,0.7)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(38,119,141,0.25)'}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #1E6D82 0%, #26778D 60%, #1A5E72 100%)',
                    color: '#FCFBF7',
                    boxShadow: '0 4px 24px rgba(38,119,141,0.3)',
                  }}
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                  Enviar mensaje
                </button>
              </form>

              <p className="mt-5 text-center text-xs" style={{ color: 'rgba(252,251,247,0.35)' }}>
                Al enviar este formulario, se abrirá tu cliente de email por defecto
              </p>
            </div>
          </FadeIn>
        </div>

        {/* ── community banner ── */}
        <FadeIn delay={0.2}>
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: '#0F2A34', border: '1px solid rgba(38,119,141,0.25)' }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(38,119,141,0.15)', border: '1px solid rgba(38,119,141,0.3)' }}
            >
              <HeartIcon className="w-6 h-6" style={{ color: '#4DADC4' }} />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#FCFBF7' }}>
              ¡Gracias por ser parte de la comunidad!
            </h2>
            <p className="max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(252,251,247,0.55)' }}>
              APUNTES UDA es posible gracias a estudiantes como tú que creen en el poder
              de compartir conocimiento. Juntos construimos una mejor experiencia educativa
              para toda la comunidad universitaria.
            </p>
          </div>
        </FadeIn>

      </div>
    </div>
  )
}

export default Contact
