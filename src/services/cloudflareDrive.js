// Cloudflare R2 API service - Usa el endpoint /api/apuntes
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * List files/folders from Cloudflare R2 via /api/apuntes endpoint
 */
export const listCloudflareFiles = async (folderPath = '') => {
  try {
    // Construir el prefix: si está vacío, mostrar carpetas en la raíz del bucket
    // Si tiene valor, usar ese path directamente
    const prefix = folderPath || '';

    // Asegurar que termine con '/' si es una carpeta, pero NO agregar '/' si está vacío
    const normalizedPrefix = prefix && !prefix.endsWith('/') ? `${prefix}/` : prefix;

    const url = `${API_BASE_URL || ''}/api/apuntes?prefix=${encodeURIComponent(normalizedPrefix)}`;

    const response = await fetch(url, {
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

    // La respuesta ya viene en el formato correcto desde el endpoint
    return data.archivos || [];
  } catch (error) {
    console.error('Error fetching Cloudflare files:', error);
    // En caso de error, retornar array vacío o datos de ejemplo
    return [];
  }
};

/**
 * Search files in Cloudflare
 */
export const searchCloudflareFiles = async (folderPath, searchTerm) => {
  try {
    const files = await listCloudflareFiles(folderPath);

    // Filtrar por término de búsqueda (usar nombre o nombre según el formato)
    const searchLower = searchTerm.toLowerCase();
    return files.filter(file => {
      const fileName = file.nombre || file.name || '';
      return fileName.toLowerCase().includes(searchLower);
    });
  } catch (error) {
    console.error('Error searching Cloudflare files:', error);
    return [];
  }
};

/**
 * Get file URL from Cloudflare
 */
export const getCloudflareFileUrl = (file) => {
  // Si el archivo tiene una propiedad 'url', usarla directamente
  if (file.url) {
    return file.url;
  }

  // Si tiene path, construir URL (fallback)
  if (file.path) {
    // Esta URL debería venir del endpoint, pero por si acaso:
    return `#`;
  }

  return '#';
};


/**
 * Mock data for development (cuando no hay configuración de Cloudflare)
 */
const getMockFiles = (folderPath) => {
  // Datos de ejemplo para desarrollo
  const mockFolders = [
    {
      id: `${folderPath}/Ingenieria`,
      name: 'Ingeniería',
      mimeType: 'application/vnd.cloudflare.folder',
      modifiedTime: new Date().toISOString(),
      size: '0',
      isFolder: true,
      path: `${folderPath}/Ingenieria`
    },
    {
      id: `${folderPath}/Medicina`,
      name: 'Medicina',
      mimeType: 'application/vnd.cloudflare.folder',
      modifiedTime: new Date().toISOString(),
      size: '0',
      isFolder: true,
      path: `${folderPath}/Medicina`
    },
    {
      id: `${folderPath}/Derecho`,
      name: 'Derecho',
      mimeType: 'application/vnd.cloudflare.folder',
      modifiedTime: new Date().toISOString(),
      size: '0',
      isFolder: true,
      path: `${folderPath}/Derecho`
    }
  ];

  const mockFiles = [
    {
      id: `${folderPath}/apuntes-ejemplo.pdf`,
      name: 'Apuntes de Ejemplo.pdf',
      mimeType: 'application/pdf',
      modifiedTime: new Date(Date.now() - 86400000).toISOString(),
      size: '2048576',
      isFolder: false,
      path: `${folderPath}/apuntes-ejemplo.pdf`
    }
  ];

  return [...mockFolders, ...mockFiles];
};

/**
 * Check if file is a folder
 */
export const isFolder = (file) => {
  return file.isFolder === true || file.mimeType === 'application/vnd.cloudflare.folder';
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === '0' || bytes === 0) return '-';

  const numBytes = parseInt(bytes);
  if (isNaN(numBytes)) return '-';

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(numBytes) / Math.log(1024));

  if (i === 0) return `${numBytes} ${sizes[i]}`;
  return `${(numBytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Obtener el número de archivos en una carpeta (sin recursión, solo directos)
 * @param {string} folderId - ID o path de la carpeta
 * @returns {Promise<number>} - Número de archivos
 */
export const getFolderFileCount = async (folderId) => {
  try {
    // Reemplazado axios por fetch para consistencia con el resto del archivo
    const url = `${API_BASE_URL || ''}/api/apuntes?prefix=${encodeURIComponent(folderId)}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Contar solo archivos, no carpetas
    const files = data.archivos || [];
    return files.filter(item => !item.isFolder).length;
  } catch (error) {
    console.error('Error getting folder file count:', error);
    return 0;
  }
};

/**
 * Obtener el número TOTAL de archivos en una carpeta de forma RECURSIVA (incluyendo subcarpetas)
 * @param {string} folderId - ID o path de la carpeta
 * @returns {Promise<number>} - Número total de archivos en la carpeta y todas sus subcarpetas
 */
export const getFolderFileCountRecursive = async (folderId) => {
  try {
    // Reemplazado axios por fetch para consistencia con el resto del archivo
    const url = `${API_BASE_URL || ''}/api/apuntes/count-files?prefix=${encodeURIComponent(folderId)}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.totalFiles || 0;
  } catch (error) {
    console.error('Error getting recursive folder file count:', error);
    return 0;
  }
};
