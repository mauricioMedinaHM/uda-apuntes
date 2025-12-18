// Upload service for file upload functionality
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Upload a file to a specific folder
 */
export const uploadFileToFolder = async (file, folderPath, token, onProgress) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folderPath);

        const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al subir el archivo');
        }

        const data = await response.json();
        return data.file;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

/**
 * Delete a file (only if user is owner)
 */
export const deleteFile = async (fileKey, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/upload/${encodeURIComponent(fileKey)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al eliminar el archivo');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

/**
 * Check if current user owns a file
 */
export const checkFileOwnership = async (fileKey, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/upload/check-owner/${encodeURIComponent(fileKey)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return { isOwner: false };
        }

        return await response.json();
    } catch (error) {
        console.error('Error checking file ownership:', error);
        return { isOwner: false };
    }
};
