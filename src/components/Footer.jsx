import React from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  Home,
  Info,
  Phone,
  Mail,
  Instagram,
  Coffee,
  ArrowUpRight,
} from 'lucide-react'

const FOOTER_LINKS = [
  { to: '/', label: 'Inicio', Icon: Home },
  { to: '/information', label: 'Información', Icon: Info },
  { to: '/contact', label: 'Contacto', Icon: Phone },
]

const Footer = () => {
  return (
    <footer
      className="border-t"
      style={{ background: '#060F14', borderColor: 'rgba(38,119,141,0.2)' }}
    >
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/Logo.png"
                alt="APUNTES UDA"
                className="w-10 h-10 object-contain"
                style={{ filter: 'drop-shadow(0 0 8px rgba(38,119,141,0.5))' }}
              />
              <div>
                <span className="text-lg font-black text-white tracking-tight block leading-none">
                  APUNTES UDA
                </span>
                <span className="text-xs text-slate-500 font-medium">Por y para los estudiantes</span>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
              Plataforma colaborativa de apuntes universitarios diseñada para mejorar la experiencia
              de estudio y facilitar el acceso a material académico de calidad, de forma completamente gratuita.
            </p>

            <div
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border text-sm text-slate-300"
              style={{ background: '#0F2A34', borderColor: 'rgba(38,119,141,0.25)' }}
            >
              <Heart className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" strokeWidth={0} />
              <span>Hecho con amor para la comunidad estudiantil</span>
            </div>
          </div>

          {/* Nav column */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">
              Navegación
            </h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.map(({ to, label, Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-[#4DADC4] transition-all duration-200 group"
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0 group-hover:text-[#4DADC4] transition-colors" strokeWidth={1.75} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="border-t mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderColor: 'rgba(38,119,141,0.15)' }}
        >
          <p className="text-slate-500 text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} APUNTES UDA. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="mailto:apuntesUDA@gmail.com"
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-colors duration-200"
            >
              <Mail className="w-3.5 h-3.5" strokeWidth={1.75} />
              apuntesUDA@gmail.com
            </a>

            <a
              href="https://www.instagram.com/apuntesuda/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-colors duration-200"
            >
              <Instagram className="w-3.5 h-3.5" strokeWidth={1.75} />
              @apuntesuda
            </a>

            <a
              href="https://cafecito.app/apuntesuda"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 border border-amber-600/25 hover:bg-amber-600/10 transition-all duration-200"
            >
              <Coffee className="w-3 h-3" strokeWidth={2} />
              Apoyar
              <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
            </a>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Proyecto educativo sin fines de lucro. El contenido es proporcionado por la comunidad estudiantil.
        </p>
      </div>
    </footer>
  )
}

export default Footer
