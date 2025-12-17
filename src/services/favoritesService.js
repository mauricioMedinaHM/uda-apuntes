import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Favorites Service
 * Manages user's favorited files with backend persistence
 */

/**
 * Get all favorites for the current user
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Array>} Array of favorited files
 */
export const getFavorites = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/api/favorites`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data.favorites || [];
    } catch (error) {
        console.error('Error fetching favorites:', error);
        throw error;
    }
};

/**
 * Add a file to favorites
 * @param {Object} file - File object to add
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} Added favorite
 */
export const addFavorite = async (file, token) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/favorites`,
            {
                fileId: file.id || file.path,
                fileName: file.name,
                fileUrl: file.url,
                fileSize: file.size,
                mimeType: file.mimeType
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.favorite;
    } catch (error) {
        if (error.response?.status === 409) {
            console.log('File already in favorites');
            return null;
        }
        console.error('Error adding favorite:', error);
        throw error;
    }
};

/**
 * Remove a file from favorites
 * @param {string} fileId - ID of the file to remove
 * @param {string} token - Clerk authentication token
 * @returns {Promise<boolean>} Success status
 */
export const removeFavorite = async (fileId, token) => {
    try {
        await axios.delete(`${API_URL}/api/favorites/${fileId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return true;
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
    }
};

/**
 * Check if a file is in favorites
 * @param {string} fileId - ID of the file to check
 * @param {Array} favorites - Array of favorited files
 * @returns {boolean} True if file is favorited
 */
export const isFavorite = (fileId, favorites) => {
    return favorites.some(fav => fav.file_id === fileId);
};

/**
 * Toggle favorite status of a file
 * @param {Object} file - File object
 * @param {Array} favorites - Current favorites array
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} Result with action and favorite
 */
export const toggleFavorite = async (file, favorites, token) => {
    const fileId = file.id || file.path;
    const isCurrentlyFavorited = isFavorite(fileId, favorites);

    if (isCurrentlyFavorited) {
        await removeFavorite(fileId, token);
        return { action: 'removed', fileId };
    } else {
        const favorite = await addFavorite(file, token);
        return { action: 'added', favorite };
    }
};

/**
 * Download all favorites as a ZIP file
 * @param {string} token - Clerk authentication token
 * @returns {Promise<void>}
 */
export const downloadFavoritesAsZip = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/api/favorites/download-zip`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            responseType: 'blob'
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `favoritos-${Date.now()}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading ZIP:', error);
        throw error;
    }
};
