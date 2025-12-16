import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { useSearch } from '../context/SearchContext'
import { useDarkMode } from '../contexts/DarkModeContext'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-white dark:bg-gray-800 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="w-14 h-14 flex items-center justify-center group-hover:scale-105 transition-all duration-300">
              <img 
                src="/Logo.png" 
                alt="APUNTES UDA" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-0 pb-0 pt-2">APUNTES UDA</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Por y para los estudiantes</p>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            <div className="hidden md:flex items-center gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all duration-200 hover:-translate-y-0.5">
                    Ingresar
                  </span>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
            <a
              href="https://cafecito.app/apuntesuda" 
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5"
            >
              ☕ Donar
            </a>
            <a
              href="https://drive.google.com/drive/folders/1oOYF9Od5NeSErp7lokq95pQ37voukBvu?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5"
            >
              📚 Agrega tus apuntes
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-1">
              <Link 
                to="/" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Inicio
              </Link>
              <Link 
                to="/ranking" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Ranking
              </Link>
              <Link 
                to="/information" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Información
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Contacto
              </Link>
            </nav>
          </div>

          <button
            onClick={toggleMenu}
            className="md:hidden p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-6 border-t border-gray-200 dark:border-gray-700 animate-slide-in">
            <div className="pt-6">
              <form onSubmit={handleSearch} className="relative mb-6">
                <input
                  type="text"
                  placeholder="Buscar apuntes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              </form>

              {/* Mobile Dark Mode Toggle */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  {isDarkMode ? (
                    <>
                      <SunIcon className="w-5 h-5" />
                      Modo claro
                    </>
                  ) : (
                    <>
                      <MoonIcon className="w-5 h-5" />
                      Modo oscuro
                    </>
                  )}
                </button>
              </div>

              {/* Mobile Action Buttons */}
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <span className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200">
                        Ingresar
                      </span>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <div className="flex-1 flex items-center justify-center">
                      <UserButton />
                    </div>
                  </SignedIn>
                </div>
                <a
                  href="https://cafecito.app/apuntesuda" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  ☕ Donar
                </a>
                <a
                  href="https://drive.google.com/drive/folders/1oOYF9Od5NeSErp7lokq95pQ37voukBvu?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  📚 Agrega apuntes
                </a>
              </div>

              <nav className="flex flex-col space-y-2">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium"
                >
                  🏠 Inicio
                </Link>
                <Link
                  to="/ranking"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium"
                >
                  🏆 Ranking
                </Link>
                <Link
                  to="/information"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium"
                >
                  ℹ️ Información
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium"
                >
                  📞 Contacto
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header