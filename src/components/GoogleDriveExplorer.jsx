import { useState, useEffect } from 'react';
import { listFiles, searchFiles, downloadFile, getFileMetadata } from '../services/googleDrive';
import { FolderIcon, DocumentIcon, CloudArrowDownIcon } from '@heroicons/react/24/outline';

const GoogleDriveExplorer = ({ isAuthenticated, rootFolderId = null }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolder, setCurrentFolder] = useState(rootFolderId);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFiles();
    }
  }, [isAuthenticated, currentFolder]);

  const loadFiles = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const fileList = await listFiles(currentFolder, 50);
      setFiles(fileList);
    } catch (error) {
      console.error('Error loading files:', error);
      alert('Error cargando archivos. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim() || !isAuthenticated) return;
    
    setLoading(true);
    try {
      const results = await searchFiles(searchTerm);
      setFiles(results);
    } catch (error) {
      console.error('Error searching files:', error);
      alert('Error en la búsqueda. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = async (folder) => {
    setCurrentFolder(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      // Root folder
      setCurrentFolder(rootFolderId);
      setBreadcrumbs([]);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    }
  };

  const handleDownload = async (file) => {
    try {
      setLoading(true);
      const content = await downloadFile(file.id);
      
      // Create download link
      const blob = new Blob([content], { type: file.mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error descargando el archivo. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const isFolder = (file) => {
    return file.mimeType === 'application/vnd.google-apps.folder';
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>Conecta tu cuenta de Google Drive para explorar archivos.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Explorador de Google Drive</h3>
      
      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar archivos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26778D]"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-[#26778D] text-white rounded-md hover:bg-[#1A5E72] transition-colors"
        >
          Buscar
        </button>
        <button
          onClick={loadFiles}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Actualizar
        </button>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className="text-[#26778D] hover:underline"
          >
            Apuntes UDA
          </button>
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.id} className="flex items-center gap-2">
              <span className="text-gray-400">/</span>
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="text-[#26778D] hover:underline"
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#26778D]"></div>
          <span className="ml-2">Cargando...</span>
        </div>
      )}

      {/* Files List */}
      {!loading && (
        <div className="space-y-2">
          {files.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No se encontraron archivos.</p>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {isFolder(file) ? (
                    <FolderIcon className="w-6 h-6 text-[#26778D]" />
                  ) : (
                    <DocumentIcon className="w-6 h-6 text-gray-500" />
                  )}
                  
                  <div className="flex-1">
                    <button
                      onClick={() => isFolder(file) ? handleFolderClick(file) : null}
                      className={`text-left font-medium ${
                        isFolder(file) 
                          ? 'text-[#26778D] hover:underline cursor-pointer'
                          : 'text-gray-900'
                      }`}
                    >
                      {file.name}
                    </button>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • {formatDate(file.modifiedTime)}
                    </div>
                  </div>
                </div>

                {!isFolder(file) && (
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-2 text-gray-500 hover:text-[#26778D] transition-colors"
                    title="Descargar archivo"
                  >
                    <CloudArrowDownIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleDriveExplorer;