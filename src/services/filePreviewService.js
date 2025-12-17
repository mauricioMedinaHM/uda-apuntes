/**
 * File Preview Service
 * Handles file preview generation for different file types
 */

/**
 * Check if a file type can be previewed
 * @param {string} mimeType - MIME type of the file
 * @returns {boolean} True if file can be previewed
 */
export const canPreview = (mimeType) => {
    if (!mimeType) return false;

    const previewableTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'text/plain',
        'text/html',
        'text/css',
        'text/javascript',
        'application/json'
    ];

    return previewableTypes.includes(mimeType.toLowerCase());
};

/**
 * Get preview type for a file
 * @param {string} mimeType - MIME type of the file
 * @returns {string} Preview type: 'pdf', 'image', 'text', or 'none'
 */
export const getPreviewType = (mimeType) => {
    if (!mimeType) return 'none';

    const type = mimeType.toLowerCase();

    if (type === 'application/pdf') return 'pdf';
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('text/') || type === 'application/json') return 'text';

    return 'none';
};

/**
 * Get file info for hover preview
 * @param {Object} file - File object
 * @returns {Object} File information for tooltip
 */
export const getFileInfo = (file) => {
    return {
        name: file.name,
        size: file.size,
        type: file.mimeType,
        modified: file.modifiedTime
    };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
    if (!bytes) return 'Tamaño desconocido';

    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};
