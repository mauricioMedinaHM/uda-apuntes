import React from 'react'
import { Link } from 'react-router-dom'
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  BookOpenIcon, 
  CloudArrowDownIcon,
  MagnifyingGlassIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: AcademicCapIcon,
    title: 'Organización Académica',
    description: 'Apuntes organizados por carrera, año y materia para facilitar tu estudio.'
  },
  {
    icon: UserGroupIcon,
    title: 'Por y para Estudiantes',
    description: 'Plataforma creada por estudiantes universitarios para ayudar a otros estudiantes.'
  },
  {
    icon: BookOpenIcon,
    title: 'Contenido Actualizado',
    description: 'Material de estudio constantemente actualizado con las últimas versiones.'
  },
  {
    icon: CloudArrowDownIcon,
    title: 'Descarga Gratuita',
    description: 'Todos los apuntes están disponibles para descarga gratuita.'
  },
  {
    icon: MagnifyingGlassIcon,
    title: 'Búsqueda Avanzada',
    description: 'Encuentra rápidamente el contenido que necesitas con nuestro sistema de búsqueda.'
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Responsive Design',
    description: 'Accede desde cualquier dispositivo: móvil, tablet o computadora.'
  }
]

const Information = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Sobre APUNTES UDA
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Herramienta diseñada para mejorar tu organización a la hora de estudiar
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Nuestra Misión
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center mb-6">
              APUNTES UDA nace de la necesidad de tener un espacio centralizado donde los estudiantes 
              puedan acceder fácilmente a apuntes, resúmenes y material de estudio de alta calidad, 
              organizados de manera intuitiva y accesible desde cualquier dispositivo.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Creemos en la educación colaborativa y en el poder de compartir conocimiento 
              para mejorar el rendimiento académico de toda la comunidad estudiantil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                  <div className="inline-flex p-3 rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              ¿Cómo usar la plataforma?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Selecciona tu carrera</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Elige tu programa académico desde la página principal
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Escoge el año</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Navega por los años académicos disponibles
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Accede a los apuntes</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Descarga el material de la materia que necesites
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Desarrolladores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                  <img 
                    src="https://github.com/mauricioMedinaHM" 
                    alt="Mauricio Medina"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Mauricio Medina
                </h3>
                <a 
                  href="https://github.com/NegroHm" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                  <img 
                    src="https://github.com/JoaquinCortezHub.png" 
                    alt="Joaquin Cortez"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Joaquin Cortez
                </h3>
                <a 
                  href="https://github.com/JoaquinCortezHub" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Quieres contribuir?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Si tienes apuntes de calidad que quieras compartir con otros estudiantes, 
              o ideas para mejorar la plataforma, ¡nos encantaría escucharte!
            </p>
            <Link
              to="/contact"
              className="inline-flex px-8 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Information
