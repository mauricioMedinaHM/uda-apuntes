// Ranking Auto-Update API Routes
// Endpoints for checking ranking status and triggering updates

import express from 'express';
import { requireAuth, clerkClient } from '@clerk/express';
import { getSnapshot, syncWithRanking, needsUpdate } from '../services/rankingSnapshot.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * GET /api/ranking-update/status
 * Check if ranking needs update
 */
router.get('/status', async (req, res) => {
    try {
        const snapshot = await getSnapshot();
        const updateNeeded = await needsUpdate();

        res.json({
            needsUpdate: updateNeeded,
            lastSnapshot: snapshot.lastUpdate,
            totalFiles: snapshot.totalFiles,
            careerCount: Object.keys(snapshot.careers).length
        });
    } catch (error) {
        console.error('Error checking ranking status:', error);
        res.status(500).json({ error: 'Error checking status' });
    }
});

/**
 * POST /api/ranking-update/sync-snapshot
 * Sync snapshot with current ranking data (admin only)
 */
router.post('/sync-snapshot', requireAuth(), async (req, res) => {
    try {
        const userId = req.auth.userId;

        // Check if user is admin  
        const user = await clerkClient.users.getUser(userId);
        const isAdmin = user.publicMetadata?.role === 'admin';

        if (!isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const snapshot = await syncWithRanking();

        res.json({
            message: 'Snapshot synced successfully',
            snapshot
        });
    } catch (error) {
        console.error('Error syncing snapshot:', error);
        res.status(500).json({ error: 'Error syncing snapshot' });
    }
});

/**
 * GET /api/ranking-update/last-update
 * Get last update timestamp from ranking data
 */
router.get('/last-update', async (req, res) => {
    try {
        const rankingPath = path.join(__dirname, '../../public/ranking-data.json');
        const rankingData = JSON.parse(await fs.readFile(rankingPath, 'utf-8'));

        res.json({
            lastUpdate: rankingData.lastUpdate,
            totalCareers: rankingData.totalCareers,
            version: rankingData.metadata?.version
        });
    } catch (error) {
        console.error('Error getting last update:', error);
        res.status(500).json({ error: 'Error getting update info' });
    }
});

export default router;
