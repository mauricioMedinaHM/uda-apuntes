import React, { useState } from 'react'
import { generateRankingFromDrive } from '../services/generateRanking'

const GenerateRanking = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      console.log('Iniciando generación de ranking desde Google Drive...')
      const rankingData = await generateRankingFromDrive()
      
      // Crear el JSON formateado
      const jsonString = JSON.stringify(rankingData, null, 2)
      
      setResult({
        data: rankingData,
        json: jsonString
      })
      
      console.log('✅ Ranking generado exitosamente')
      
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadJson = () => {
    if (result) {
      const blob = new Blob([result.json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'ranking-data.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.json)
      alert('JSON copiado al portapapeles')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Generar Ranking desde Google Drive
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Analiza las carpetas reales y genera el JSON correcto
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-3 px-6 rounded-lg text-white font-medium ${
              isGenerating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#26778D] hover:bg-[#1A5E72]'
            }`}
          >
            {isGenerating ? 'Analizando Google Drive...' : 'Generar Ranking Real'}
          </button>
        </div>

        {isGenerating && (
          <div className="bg-[#0F2A34] dark:bg-[#0F2A34] rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#26778D]"></div>
              <span className="text-[#4DADC4] dark:text-[#4DADC4]">
                Analizando carpetas de carreras... Esto puede tomar varios minutos.
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
            <div className="text-red-800 dark:text-red-200">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-green-800 dark:text-green-200">
                <strong>✅ Ranking generado exitosamente</strong>
                <br />
                Total de carreras: {result.data.totalCareers}
                <br />
                Top 10 carreras encontradas
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Ranking Generado
                </h2>
                <div className="space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Copiar JSON
                  </button>
                  <button
                    onClick={downloadJson}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Descargar JSON
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Top 10 Carreras:
                </h3>
                <div className="space-y-2">
                  {result.data.topCareers.map((career) => (
                    <div key={career.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <span className="text-sm">
                        {career.rank}. {career.icon} {career.name}
                      </span>
                      <span className="text-sm font-medium">
                        {career.totalFiles} archivos | {career.totalScore} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <details className="mt-6">
                <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white">
                  Ver JSON completo
                </summary>
                <pre className="mt-4 bg-gray-100 dark:bg-gray-900 p-4 rounded text-xs overflow-auto max-h-96">
                  {result.json}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GenerateRanking