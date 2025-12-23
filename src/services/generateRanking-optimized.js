// Helper function to process careers in parallel batches
const processCareersInParallel = async (allCareerFolders, batchSize = 5) => {
    const careerAnalysis = []

    for (let i = 0; i < allCareerFolders.length; i += batchSize) {
        const batch = allCareerFolders.slice(i, i + batchSize)
        const progress = Math.round((i / allCareerFolders.length) * 100)

        console.log(`\n📊 Progreso: ${progress}% (${i + batch.length}/${allCareerFolders.length})`)

        const results = await Promise.allSettled(
            batch.map(async (careerFolder) => {
                try {
                    const stats = await analyzeCareerFolder(careerFolder.id, careerFolder.name)

                    return {
                        id: careerFolder.id,
                        name: careerFolder.name,
                        facultyName: careerFolder.facultyName,
                        icon: getCareerIcon(careerFolder.name),
                        ...stats
                    }
                } catch (error) {
                    return {
                        id: careerFolder.id,
                        name: careerFolder.name,
                        facultyName: careerFolder.facultyName,
                        icon: getCareerIcon(careerFolder.name),
                        totalFiles: 0,
                        totalScore: 0,
                        fileTypes: { pdf: 0, word: 0, images: 0, presentations: 0 },
                        foldersProcessed: 0
                    }
                }
            })
        )

        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
                careerAnalysis.push(result.value)
            }
        })
    }

    return careerAnalysis
}

export { processCareersInParallel, isCareerFolder, getCareerIcon }
