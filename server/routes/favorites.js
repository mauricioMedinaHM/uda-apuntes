import express from 'express';
import { clerkMiddleware, getAuth, clerkClient } from '@clerk/express';
import archiver from 'archiver';
import axios from 'axios';

const router = express.Router();

// Apply Clerk middleware to all routes
router.use(clerkMiddleware());

/**
 * GET /api/favorites
 * Get all favorites for the authenticated user from Clerk metadata
 */
router.get('/', async (req, res) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get user from Clerk
        const user = await clerkClient.users.getUser(userId);
        const favorites = user.publicMetadata?.favorites || [];

        return res.json({ favorites });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

/**
 * POST /api/favorites
 * Add a file to favorites in Clerk metadata
 */
router.post('/', async (req, res) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { fileId, fileName, fileUrl, fileSize, mimeType } = req.body;

        if (!fileId || !fileName || !fileUrl) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get current favorites from Clerk metadata
        const user = await clerkClient.users.getUser(userId);
        const favorites = user.publicMetadata?.favorites || [];

        // Check if already favorited
        const existing = favorites.find(fav => fav.file_id === fileId);
        if (existing) {
            return res.status(409).json({ error: 'File already in favorites' });
        }

        // Create new favorite object
        const newFavorite = {
            id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            file_id: fileId,
            file_name: fileName,
            file_url: fileUrl,
            file_size: fileSize,
            mime_type: mimeType,
            created_at: new Date().toISOString()
        };

        // Add to favorites array
        const updatedFavorites = [...favorites, newFavorite];

        // Update user metadata
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                ...user.publicMetadata,
                favorites: updatedFavorites
            }
        });

        return res.status(201).json({ favorite: newFavorite });
    } catch (error) {
        console.error('Error adding favorite:', error);
        return res.status(500).json({ error: 'Failed to add favorite' });
    }
});

/**
 * DELETE /api/favorites/:fileId
 * Remove a file from favorites in Clerk metadata
 */
router.delete('/:fileId', async (req, res) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { fileId } = req.params;

        // Get current favorites from Clerk metadata
        const user = await clerkClient.users.getUser(userId);
        const favorites = user.publicMetadata?.favorites || [];

        // Remove the favorite
        const updatedFavorites = favorites.filter(fav => fav.file_id !== fileId);

        // Update user metadata
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                ...user.publicMetadata,
                favorites: updatedFavorites
            }
        });

        return res.json({ success: true });
    } catch (error) {
        console.error('Error removing favorite:', error);
        return res.status(500).json({ error: 'Failed to remove favorite' });
    }
});

/**
 * GET /api/favorites/download-zip
 * Download all favorites as a ZIP file
 */
router.get('/download-zip', async (req, res) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get favorites from Clerk metadata
        const user = await clerkClient.users.getUser(userId);
        const favorites = user.publicMetadata?.favorites || [];

        if (!favorites || favorites.length === 0) {
            return res.status(404).json({ error: 'No favorites to download' });
        }

        // Set response headers for ZIP download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="favoritos-${Date.now()}.zip"`);

        // Create ZIP archive
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        // Pipe archive to response
        archive.pipe(res);

        // Add each favorite file to the archive
        for (const favorite of favorites) {
            try {
                // Fetch file from URL
                const response = await axios({
                    method: 'get',
                    url: favorite.file_url,
                    responseType: 'stream',
                    timeout: 30000 // 30 second timeout per file
                });

                // Add file to archive
                archive.append(response.data, { name: favorite.file_name });
            } catch (fileError) {
                console.error(`Error downloading file ${favorite.file_name}:`, fileError);
                // Continue with other files even if one fails
            }
        }

        // Finalize the archive
        await archive.finalize();

    } catch (error) {
        console.error('Error creating ZIP:', error);
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Failed to create ZIP file' });
        }
    }
});

export default router;
