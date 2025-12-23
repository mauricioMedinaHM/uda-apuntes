// Script para generar ranking desde Google Drive real
// Este script analiza las carpetas reales y genera un JSON único

import { listPublicFiles as listFiles } from './publicDrive'

const MAIN_FOLDER_ID = '1oOYF9Od5NeSErp7lokq95pQ37voukBvu'

// Filtrar carpetas que comienzan con prefijos específicos de carreras
const isCareerFolder = (folderName) => {
  const name = folderName.trim()

  const careerPrefixes = [
    'Lic.',
    'Prof',
    'Tecnicatura',
    'Tec',
    'Medicina',
    'Maestría',
    'Escribania',
    'Contador',
    'Abogacía',
    'Traductor',
    'Sommelier'
  ]

  return careerPrefixes.some(prefix => name.startsWith(prefix))
}

// Obtener icono según el tipo de carrera
const getCareerIcon = (folderName) => {
  const name = folderName.toLowerCase()

  if (name.startsWith('medicina')) return '⚕️'
  if (name.startsWith('contador')) return '🧮'
  if (name.startsWith('abogacía')) return '⚖️'
  if (name.startsWith('traductor')) return '🗣️'
  if (name.startsWith('sommelier')) return '🍷'
  if (name.startsWith('escribania')) return '📜'
  if (name.startsWith('maestría')) return '🎓'
  if (name.startsWith('prof')) return '👩‍🏫'
  if (name.startsWith('tecnicatura') || name.startsWith('tec')) return '🔧'

  if (name.startsWith('lic.')) {
    if (name.includes('informática') || name.includes('informatica') || name.includes('software') || name.includes('sistemas')) return '💻'
    if (name.includes('psicología') || name.includes('psicologia')) return '🧠'
    if (name.includes('diseño') || name.includes('diseno') || name.includes('gráfico') || name.includes('grafico')) return '🎨'
    if (name.includes('marketing') || name.includes('mercadeo')) return '📈'
    if (name.includes('turismo') || name.includes('hotelería') || name.includes('hoteleria')) return '✈️'
    if (name.includes('administración') || name.includes('administracion') || name.includes('empresas')) return '💼'
    if (name.includes('comunicación') || name.includes('comunicacion') || name.includes('periodismo')) return '📺'
    if (name.includes('enfermería') || name.includes('enfermeria')) return '👩‍⚕️'
    if (name.includes('educación') || name.includes('educacion')) return '📚'
    return '🎓'
  }

  return '🎓'
}

// Calcular puntuación de archivo según tipo
const calculateFileScore = (file) => {
  const mimeType = file.mimeType
  const name = file.name.toLowerCase()

  // PDF = 3 puntos
  if (mimeType === 'application/pdf' || name.endsWith('.pdf')) {
    return 3
  }

  // Word = 2 puntos
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    name.endsWith('.docx') || name.endsWith('.doc')) {
    return 2
  }

  // PowerPoint = 2 puntos
  if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    mimeType === 'application/vnd.ms-powerpoint' ||
    name.endsWith('.pptx') || name.endsWith('.ppt')) {
    return 2
  }

  // Imágenes = 1 punto
  if (mimeType?.startsWith('image/') ||
    name.endsWith('.jpg') || name.endsWith('.jpeg') ||
    name.endsWith('.png') || name.endsWith('.gif') ||
    name.endsWith('.webp')) {
    return 1
  }

  return 0
}

// Análisis recursivo completo de una carpeta con límite de profundidad
const analyzeCareerFolder = async (folderId, careerName, depth = 0, maxDepth = 5) => {
  let totalFiles = 0
  let totalScore = 0
  let fileTypes = { pdf: 0, word: 0, images: 0, presentations: 0 }
  let foldersProcessed = 0

  const processFolder = async (currentFolderId, currentPath = '', currentDepth = 0) => {
    try {
      // Stop if max depth reached
      if (currentDepth >= maxDepth) {
        return
      }

      const items = await listFiles(currentFolderId)

      const files = items.filter(item => item.mimeType !== 'application/vnd.google-apps.folder')
      const folders = items.filter(item => item.mimeType === 'application/vnd.google-apps.folder')

      // Analizar archivos
      files.forEach(file => {
        totalFiles++
        const score = calculateFileScore(file)
        totalScore += score

        const mimeType = file.mimeType
        const name = file.name.toLowerCase()

        if (mimeType === 'application/pdf' || name.endsWith('.pdf')) {
          fileTypes.pdf++
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          mimeType === 'application/msword' ||
          name.endsWith('.docx') || name.endsWith('.doc')) {
          fileTypes.word++
        } else if (mimeType?.startsWith('image/') ||
          name.endsWith('.jpg') || name.endsWith('.jpeg') ||
          name.endsWith('.png') || name.endsWith('.gif') ||
          name.endsWith('.webp')) {
          fileTypes.images++
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
          mimeType === 'application/vnd.ms-powerpoint' ||
          name.endsWith('.pptx') || name.endsWith('.ppt')) {
          fileTypes.presentations++
        }
      })

      // Procesar subcarpetas en lotes paralelos de 5
      const BATCH_SIZE = 5
      for (let i = 0; i < folders.length; i += BATCH_SIZE) {
        const batch = folders.slice(i, i + BATCH_SIZE)
        await Promise.allSettled(
          batch.map(folder => {
            const newPath = currentPath ? `${currentPath}/${folder.name}` : folder.name
            return processFolder(folder.id, newPath, currentDepth + 1)
              .then(() => { foldersProcessed++ })
          })
        )
      }

    } catch (error) {
      // Silent error handling - no logging for performance
    }
  }

  await processFolder(folderId, careerName, depth)

  return {
    totalFiles,
    totalScore,
    fileTypes,
    foldersProcessed
  }
}

// Función principal para generar ranking desde Drive real - OPTIMIZADO
export const generateRankingFromDrive = async () => {
  console.log('🚀 Iniciando análisis optimizado del Google Drive...')
  const startTime = Date.now()

  try {
    // Obtener carpetas de facultades
    const mainFolderFiles = await listFiles(MAIN_FOLDER_ID)
    const facultyFolders = mainFolderFiles.filter(file =>
      file.mimeType === 'application/vnd.google-apps.folder'
    )

    console.log(`🏛️ ${facultyFolders.length} facultades encontradas`)

    // Buscar carreras dentro de cada facultad
    const allCareerFolders = []

    for (const facultyFolder of facultyFolders) {
      try {
        console.log(`🔍 Buscando en facultad: ${facultyFolder.name}`)
        const facultyContents = await listFiles(facultyFolder.id)

        const careerFoldersInFaculty = facultyContents.filter(file =>
          file.mimeType === 'application/vnd.google-apps.folder' &&
          isCareerFolder(file.name)
        )

        if (careerFoldersInFaculty.length > 0) {
          console.log(`✅ ${careerFoldersInFaculty.length} carreras encontradas en ${facultyFolder.name}`)
          careerFoldersInFaculty.forEach(career => {
            career.facultyName = facultyFolder.name
          })
          allCareerFolders.push(...careerFoldersInFaculty)
        }
      } catch (error) {
        console.error(`Error en facultad ${facultyFolder.name}:`, error)
      }
    }

    console.log(`🎓 Total de carreras a analizar: ${allCareerFolders.length}`)

    if (allCareerFolders.length === 0) {
      throw new Error('No se encontraron carpetas de carreras')
    }

    // Analizar cada carrera
    const careerAnalysis = []

    for (const [index, careerFolder] of allCareerFolders.entries()) {
      try {
        console.log(`\n📊 Analizando carrera ${index + 1}/${allCareerFolders.length}: ${careerFolder.name}`)

        const stats = await analyzeCareerFolder(careerFolder.id, careerFolder.name)

        careerAnalysis.push({
          id: careerFolder.id,
          name: careerFolder.name,
          facultyName: careerFolder.facultyName,
          icon: getCareerIcon(careerFolder.name),
          ...stats
        })

        console.log(`✅ ${careerFolder.name} completada: ${stats.totalFiles} archivos, ${stats.totalScore} puntos`)

      } catch (error) {
        console.error(`❌ Error analizando ${careerFolder.name}:`, error)
        careerAnalysis.push({
          id: careerFolder.id,
          name: careerFolder.name,
          facultyName: careerFolder.facultyName,
          icon: getCareerIcon(careerFolder.name),
          totalFiles: 0,
          totalScore: 0,
          fileTypes: { pdf: 0, word: 0, images: 0, presentations: 0 },
          foldersProcessed: 0
        })
      }
    }

    // Ordenar por puntuación y crear ranking final
    const ranking = careerAnalysis
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((career, index) => ({
        ...career,
        rank: index + 1
      }))

    // Crear objeto final con metadatos
    const rankingData = {
      lastUpdate: new Date().toISOString(),
      totalCareers: ranking.length,
      topCareers: ranking.slice(0, 10),
      allCareers: ranking,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '2.0',
        description: 'Ranking de carreras basado en análisis real de Google Drive',
        scoringSystem: {
          pdf: 3,
          word: 2,
          powerpoint: 2,
          images: 1
        }
      }
    }

    console.log('\n🏆 RANKING GENERADO:')
    console.log('Top 10 carreras:')
    ranking.slice(0, 10).forEach((career, index) => {
      console.log(`${index + 1}. ${career.name} - ${career.totalScore} puntos (${career.totalFiles} archivos)`)
    })

    return rankingData

  } catch (error) {
    console.error('❌ Error generando ranking:', error)
    throw error
  }
}

export default { generateRankingFromDrive }