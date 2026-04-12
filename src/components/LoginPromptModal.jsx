import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useClerk } from '@clerk/clerk-react'
import { Lock, Star, Upload, Download, X, ArrowRight, CheckCircle2 } from 'lucide-react'

const REASONS = {
  favorite: {
    icon: Star,
    title: 'Guardá tus favoritos',
    subtitle: 'Iniciá sesión para marcar archivos y acceder a ellos rápidamente desde cualquier dispositivo.',
  },
  upload: {
    icon: Upload,
    title: 'Subí tus apuntes',
    subtitle: 'Iniciá sesión para contribuir con material a la comunidad estudiantil de la UDA.',
  },
  download: {
    icon: Download,
    title: 'Descargá varios archivos',
    subtitle: 'Iniciá sesión para seleccionar y descargar múltiples archivos a la vez.',
  },
}

const BENEFITS = [
  'Guardá apuntes como favoritos',
  'Subí archivos a la plataforma',
  'Descargá múltiples archivos',
  'Historial y acceso rápido',
]

export default function LoginPromptModal({ open, onClose, reason = 'favorite' }) {
  const { openSignIn } = useClerk()
  const { icon: Icon, title, subtitle } = REASONS[reason] ?? REASONS.favorite

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleLogin = () => {
    onClose()
    openSignIn()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ background: 'rgba(2, 11, 24, 0.75)', backdropFilter: 'blur(6px)' }}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-2xl border overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #061525 0%, #030d1a 100%)',
                borderColor: 'rgba(38,119,141,0.3)',
                boxShadow: '0 0 60px rgba(38,119,141,0.12), 0 24px 48px rgba(0,0,0,0.5)',
              }}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors z-10"
                style={{ color: 'rgba(252,251,247,0.35)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(252,251,247,0.8)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(252,251,247,0.35)'}
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>

              {/* Top gradient accent */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(38,119,141,0.6), transparent)' }}
              />

              <div className="p-8">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    {/* Glow */}
                    <div
                      className="absolute inset-0 rounded-2xl blur-xl"
                      style={{ background: 'rgba(38,119,141,0.3)' }}
                    />
                    <div
                      className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(38,119,141,0.15)', border: '1px solid rgba(38,119,141,0.35)' }}
                    >
                      <Lock className="w-6 h-6 absolute opacity-30" style={{ color: '#4DADC4' }} strokeWidth={2} />
                      <Icon className="w-7 h-7 relative z-10" style={{ color: '#4DADC4' }} strokeWidth={1.75} />
                    </div>
                  </div>
                </div>

                {/* Text */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-black text-white mb-2">{title}</h2>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(252,251,247,0.5)' }}>
                    {subtitle}
                  </p>
                </div>

                {/* Benefits */}
                <div
                  className="rounded-xl p-4 mb-6 space-y-2"
                  style={{ background: 'rgba(38,119,141,0.06)', border: '1px solid rgba(38,119,141,0.12)' }}
                >
                  {BENEFITS.map((b) => (
                    <div key={b} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#4DADC4' }} strokeWidth={2} />
                      <span className="text-sm" style={{ color: 'rgba(252,251,247,0.65)' }}>{b}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #26778D 0%, #1d6a80 100%)',
                    boxShadow: '0 0 20px rgba(38,119,141,0.4), 0 8px 20px rgba(0,0,0,0.3)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 28px rgba(38,119,141,0.6), 0 12px 24px rgba(0,0,0,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(38,119,141,0.4), 0 8px 20px rgba(0,0,0,0.3)'}
                >
                  {/* Shine sweep */}
                  <motion.span
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)' }}
                    animate={{ x: ['-120%', '220%'] }}
                    transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                  />
                  <span className="relative z-10">Ingresar con mi cuenta</span>
                  <ArrowRight className="w-4 h-4 relative z-10" strokeWidth={2.5} />
                </button>

                <button
                  onClick={onClose}
                  className="w-full mt-3 py-2 text-sm transition-colors rounded-lg"
                  style={{ color: 'rgba(252,251,247,0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(252,251,247,0.55)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(252,251,247,0.3)'}
                >
                  Ahora no
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
