import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  FolderOpen,
  Trophy,
  Network,
  Info,
  Phone,
  BookOpen,
  Coffee,
  LogIn,
} from 'lucide-react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { useSearch } from '../context/SearchContext'
import { useDarkMode } from '../contexts/DarkModeContext'

// Logo teal: #26778D  |  Dark bg: #081920  |  Cream: #FCFBF7

const NAV_LINKS = [
  { to: '/', label: 'Inicio', Icon: Home },
  { to: '/archivos', label: 'Archivos', Icon: FolderOpen },
  { to: '/ranking', label: 'Ranking', Icon: Trophy },
  { to: '/graph', label: 'Grafo', Icon: Network },
  { to: '/information', label: 'Información', Icon: Info },
  { to: '/contact', label: 'Contacto', Icon: Phone },
]

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { performSearch } = useSearch()
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      performSearch(searchQuery)
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setIsMenuOpen(false)
    }
  }

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'rgba(8, 25, 32, 0.93)',
        backdropFilter: 'blur(16px)',
        borderColor: 'rgba(38, 119, 141, 0.3)',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <img
              src="/Logo.png"
              alt="APUNTES UDA"
              className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-105"
              style={{ filter: 'drop-shadow(0 0 8px rgba(38,119,141,0.5))' }}
            />
            <div className="hidden sm:block">
              <span className="text-lg font-black text-white tracking-tight leading-none">
                APUNTES UDA
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'text-white'
                    : 'hover:text-white hover:bg-white/5'
                }`}
                style={
                  isActive(to)
                    ? { color: '#4DADC4', background: 'rgba(38,119,141,0.12)' }
                    : { color: 'rgba(252,251,247,0.5)' }
                }
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">

            {/* Dark mode */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 hover:bg-white/5"
              style={{ color: 'rgba(252,251,247,0.5)' }}
              title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" strokeWidth={1.75} /> : <Moon className="w-4 h-4" strokeWidth={1.75} />}
            </button>

            {/* Donate */}
            <a
              href="https://cafecito.app/apuntesuda"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{ color: 'rgba(252,251,247,0.7)', border: '1px solid rgba(252,251,247,0.12)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(252,251,247,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Coffee className="w-3.5 h-3.5" strokeWidth={2} />
              Donar
            </a>

            {/* Add notes */}
            <a
              href="https://drive.google.com/drive/folders/1oOYF9Od5NeSErp7lokq95pQ37voukBvu?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{ color: '#4DADC4', border: '1px solid rgba(38,119,141,0.3)', background: 'rgba(38,119,141,0.08)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(38,119,141,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(38,119,141,0.08)'}
            >
              <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
              Agregar apuntes
            </a>

            {/* Auth */}
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all duration-200"
                  style={{ background: '#26778D' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2E8FA6'}
                  onMouseLeave={e => e.currentTarget.style.background = '#26778D'}
                >
                  <LogIn className="w-3.5 h-3.5" strokeWidth={2} />
                  Ingresar
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                    userButtonTrigger: 'hover:opacity-80 transition-opacity',
                  },
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-all duration-200 hover:bg-white/5"
            style={{ color: 'rgba(252,251,247,0.5)' }}
          >
            {isMenuOpen ? <X className="w-5 h-5" strokeWidth={2} /> : <Menu className="w-5 h-5" strokeWidth={2} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div
            className="md:hidden border-t pb-6"
            style={{ borderColor: 'rgba(38,119,141,0.2)' }}
          >
            {/* Search */}
            <form onSubmit={handleSearch} className="relative mt-4 mb-4">
              <input
                type="text"
                placeholder="Buscar apuntes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-200"
                style={{
                  background: '#0F2A34',
                  border: '1px solid rgba(38,119,141,0.3)',
                }}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(38,119,141,0.6)' }} strokeWidth={1.75} />
            </form>

            {/* Mobile action row */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex-1 justify-center"
                style={{ color: 'rgba(252,251,247,0.6)', border: '1px solid rgba(38,119,141,0.2)', background: '#0F2A34' }}
              >
                {isDarkMode ? <Sun className="w-4 h-4" strokeWidth={1.75} /> : <Moon className="w-4 h-4" strokeWidth={1.75} />}
                {isDarkMode ? 'Modo claro' : 'Modo oscuro'}
              </button>
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-white transition-all flex-1 justify-center"
                    style={{ background: '#26778D' }}
                  >
                    <LogIn className="w-4 h-4" strokeWidth={2} />
                    Ingresar
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center justify-center flex-1">
                  <UserButton />
                </div>
              </SignedIn>
            </div>

            {/* Donate + Add notes */}
            <div className="flex gap-2 mb-4">
              <a
                href="https://cafecito.app/apuntesuda"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-1"
                style={{ color: 'rgba(252,251,247,0.7)', border: '1px solid rgba(252,251,247,0.12)' }}
              >
                <Coffee className="w-4 h-4" strokeWidth={2} />
                Donar
              </a>
              <a
                href="https://drive.google.com/drive/folders/1oOYF9Od5NeSErp7lokq95pQ37voukBvu?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-1"
                style={{ color: '#4DADC4', border: '1px solid rgba(38,119,141,0.3)', background: 'rgba(38,119,141,0.08)' }}
              >
                <BookOpen className="w-4 h-4" strokeWidth={2} />
                Agregar
              </a>
            </div>

            {/* Mobile nav links */}
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(({ to, label, Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200`}
                  style={
                    isActive(to)
                      ? { color: '#4DADC4', background: 'rgba(38,119,141,0.12)', border: '1px solid rgba(38,119,141,0.2)' }
                      : { color: 'rgba(252,251,247,0.5)' }
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
