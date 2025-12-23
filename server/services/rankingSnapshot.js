// Ranking Snapshot Service
// Tracks file counts per career to detect significant changes

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SNAPSHOT_PATH = path.join(__dirname, '../../public/ranking-snapshot.json');

// Get current snapshot
export const getSnapshot = async () => {
    try {
        const data = await fs.readFile(SNAPSHOT_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty snapshot
        return {
            lastUpdate: new Date().toISOString(),
            totalFiles: 0,
            careers: {}
        };
    }
};

// Save snapshot
export const saveSnapshot = async (snapshot) => {
    try {
        await fs.writeFile(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('Error saving snapshot:', error);
        return false;
    }
};

// Increment file count for a career
export const incrementCareerCount = async (careerId, careerName) => {
    const snapshot = await getSnapshot();

    if (!snapshot.careers[careerId]) {
        snapshot.careers[careerId] = {
            name: careerName,
            fileCount: 0
        };
    }

    snapshot.careers[careerId].fileCount++;
    snapshot.totalFiles++;

    await saveSnapshot(snapshot);
    return snapshot;
};

// Compare with current ranking data to check if update is needed
export const needsUpdate = async (threshold = 0.10) => {
    try {
        const snapshot = await getSnapshot();

        // Load current ranking data
        const rankingPath = path.join(__dirname, '../../public/ranking-data.json');
        const rankingData = JSON.parse(await fs.readFile(rankingPath, 'utf-8'));

        // Calculate total files from ranking
        const rankingTotalFiles = rankingData.allCareers?.reduce((sum, career) => sum + (career.totalFiles || 0), 0) || 0;

        if (rankingTotalFiles === 0) return true; // Need initial ranking

        // Calculate difference
        const difference = snapshot.totalFiles - rankingTotalFiles;
        const percentChange = Math.abs(difference / rankingTotalFiles);

        console.log(`📊 Snapshot: ${snapshot.totalFiles} files, Ranking: ${rankingTotalFiles} files`);
        console.log(`📈 Change: ${(percentChange * 100).toFixed(2)}% (threshold: ${(threshold * 100)}%)`);

        return percentChange >= threshold;
    } catch (error) {
        console.error('Error checking if update needed:', error);
        return false;
    }
};

// Sync snapshot with current ranking data
export const syncWithRanking = async () => {
    try {
        const rankingPath = path.join(__dirname, '../../public/ranking-data.json');
        const rankingData = JSON.parse(await fs.readFile(rankingPath, 'utf-8'));

        const snapshot = {
            lastUpdate: new Date().toISOString(),
            totalFiles: 0,
            careers: {}
        };

        // Build snapshot from ranking data
        rankingData.allCareers?.forEach(career => {
            snapshot.careers[career.id] = {
                name: career.name,
                fileCount: career.totalFiles || 0
            };
            snapshot.totalFiles += career.totalFiles || 0;
        });

        await saveSnapshot(snapshot);
        console.log('✅ Snapshot synced with ranking data');
        return snapshot;
    } catch (error) {
        console.error('Error syncing snapshot:', error);
        throw error;
    }
};

export default {
    getSnapshot,
    saveSnapshot,
    incrementCareerCount,
    needsUpdate,
    syncWithRanking
};
