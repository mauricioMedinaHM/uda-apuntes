import React, { useState, useEffect } from 'react'
import { TrophyIcon, DocumentIcon, PhotoIcon, PresentationChartBarIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import RankingJsonService from '../services/rankingJsonService'

// Componente de ranking minimalista con vista expandible
// Carga datos desde JSON estático - Sin análisis en tiempo real

const Ranking = () => {
  const [rankingData, setRankingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedCards, setExpandedCards] = useState(new Set())
  const [updateStatus, setUpdateStatus] = useState(null)

  // Función para expandir/colapsar tarjetas
  const toggleCard = (careerId) => {
    const newExpandedCards = new Set(expandedCards)
    if (newExpandedCards.has(careerId)) {
      newExpandedCards.delete(careerId)
    } else {
      newExpandedCards.add(careerId)
    }
    setExpandedCards(newExpandedCards)
  }

  useEffect(() => {
    console.log('🏆 Ranking component mounted - Cargando JSON estático')

    const loadRankingData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Solo cargar el JSON estático, sin análisis
        console.log('📊 Cargando datos desde JSON estático...')
        const data = await RankingJsonService.getRankingData()
        setRankingData(data)
        console.log('✅ Datos cargados exitosamente')
      } catch (err) {
        console.error('❌ Error cargando ranking:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadRankingData()

    // Verificar estado de actualización
    checkUpdateStatus()
  }, [])

  // Verificar si hay actualización pendiente
  const checkUpdateStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ranking-update/status`)
      if (response.ok) {
        const status = await response.json()
        setUpdateStatus(status)
      }
    } catch (error) {
      console.error('Error checking update status:', error)
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <TrophyIcon className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Error al Cargar Ranking
            </h1>
            <p className="text-red-600 dark:text-red-400 mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <TrophyIcon className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Ranking de Carreras
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Cargando ranking desde JSON...
            </p>
          </div>

          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Usar datos del JSON
  const careerData = rankingData?.topCareers || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header minimalista */}
        <div className="text-center mb-8">
          <TrophyIcon className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Ranking de Carreras
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Top 5 carreras con mayor material académico
          </p>

          {/* Status actualización */}
          {rankingData && (
            <div className="mt-4 inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-400">
              <ClockIcon className="w-3 h-3" />
              Actualizado: {new Date(rankingData.lastUpdate).toLocaleDateString('es-ES')}
            </div>
          )}

          {/* Indicador de actualización pendiente */}
          {updateStatus?.needsUpdate && (
            <div className="mt-4 bg-orange-100 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 px-4 py-3 rounded-lg animate-fade-in">
              <div className="flex items-center gap-2 text-sm">
                <ArrowPathIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <div className="flex-1">
                  <p className="font-semibold text-orange-800 dark:text-orange-200">
                    ⚠️ Actualización disponible
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    Se detectaron cambios significativos en los archivos
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista minimalista de carreras */}
        <div className="space-y-3">
          {careerData.map((career) => (
            <div key={career.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">

              {/* Vista colapsada - minimalista */}
              <div
                className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => toggleCard(career.id)}
              >
                <div className="flex items-center space-x-4">
                  {/* Posición y emoji */}
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-400 dark:text-gray-500 w-6">
                      {getRankIcon(career.rank)}
                    </span>
                    <span className="text-2xl">{career.icon}</span>
                  </div>

                  {/* Nombre de carrera */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {career.name}
                    </h3>
                  </div>
                </div>

                {/* Stats básicos */}
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Archivos</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {career.totalFiles.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Puntos</div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {career.totalScore.toLocaleString()}
                    </div>
                  </div>

                  {/* Icono expandir/colapsar */}
                  <div className="text-gray-400 dark:text-gray-500">
                    {expandedCards.has(career.id) ? (
                      <ChevronUpIcon className="w-4 h-4" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Vista expandida - detalles completos */}
              {expandedCards.has(career.id) && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="pt-4 space-y-4">

                    {/* Facultad */}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      🏛️ {career.facultyName}
                    </div>

                    {/* Desglose de tipos de archivos */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                        <DocumentIcon className="w-5 h-5 text-red-500 mx-auto mb-1" />
                        <div className="text-sm font-medium text-red-600 dark:text-red-400">
                          {career.fileTypes.pdf.toLocaleString()}
                        </div>
                        <div className="text-xs text-red-700 dark:text-red-300">PDFs</div>
                      </div>

                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <DocumentIcon className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {career.fileTypes.word.toLocaleString()}
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-300">Word</div>
                      </div>

                      <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                        <PresentationChartBarIcon className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                        <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                          {career.fileTypes.presentations.toLocaleString()}
                        </div>
                        <div className="text-xs text-orange-700 dark:text-orange-300">PPT</div>
                      </div>

                      <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                        <PhotoIcon className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                        <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          {career.fileTypes.images.toLocaleString()}
                        </div>
                        <div className="text-xs text-purple-700 dark:text-purple-300">Imágenes</div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>📁 {career.foldersProcessed} carpetas procesadas</span>
                      <span>Posición #{career.rank} en el ranking</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer simple */}
        <div className="mt-8 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Sistema de puntuación: PDF (3pts) • Word/PPT (2pts) • Imagen (1pt)
            <br />
            Se actualiza automáticamente cada lunes a las 8:00 AM
          </div>
        </div>

      </div>
    </div>
  )
}

export default Ranking