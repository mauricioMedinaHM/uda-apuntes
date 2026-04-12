/**
 * Service to fetch all file keys from R2 for the Knowledge Graph
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Fetch all file keys from R2 bucket
 * @returns {Promise<Array<{key: string, url: string}>>} Array of file objects
 */
export async function fetchAllFileKeys() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/apuntes/all-keys`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.keys || [];
    } catch (error) {
        console.error('Error fetching all file keys:', error);
        return [];
    }
}
