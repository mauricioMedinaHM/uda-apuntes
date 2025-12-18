import { useState, useEffect } from 'react';
import { listPublicFiles, searchPublicFiles, getPublicFileUrl, isFolder, getFolderFileCount } from '../services/publicDrive';
import { FolderIcon, DocumentIcon, ArrowTopRightOnSquareIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

const PublicDriveExplorer = ({ rootFolderId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolder, setCurrentFolder] = useState(rootFolderId);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [folderFileCounts, setFolderFileCounts] = useState({});

  useEffect(() => {
    loadFiles();
  }, [currentFolder]);

  const loadFiles = async () => {
    if (!currentFolder) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fileList = await listPublicFiles(currentFolder);
      setFiles(fileList);
      
      const folders = fileList.filter(file => isFolder(file));
      const counts = {};
      
      await Promise.all(
        folders.map(async (folder) => {
          try {
            const count = await getFolderFileCount(folder.id);
            counts[folder.id] = count;
          } catch (error) {
            console.error(`Error getting count for folder ${folder.name}:`, error);
            counts[folder.id] = 0;
          }
        })
      );
      
      setFolderFileCounts(counts);
    } catch (error) {
      console.error('Error loading files:', error);
      setError(`Error cargando archivos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadFiles();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchPublicFiles(currentFolder, searchTerm);
      setFiles(results);
    } catch (error) {
      console.error('Error searching files:', error);
      setError(`Error en la búsqueda: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
    setSearchTerm('');
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setCurrentFolder(rootFolderId);
      setBreadcrumbs([]);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    }
    setSearchTerm('');
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

  const handleFileClick = (file) => {
    if (isFolder(file)) {
      handleFolderClick(file);
    } else {
      // Open file in new tab
      window.open(getPublicFileUrl(file.id), '_blank');
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">

        {/* Search Bar and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2 flex-1">
            <input
              type="text"
              placeholder="Buscar archivos y carpetas..."
              value={searchTerm}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Buscar
            </button>
            {searchTerm && (
              <button
                onClick={() => {setSearchTerm(''); loadFiles();}}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
          
          {/* View Toggle */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-white dark:bg-gray-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              title="Vista en cuadrícula"
            >
              <Squares2X2Icon className="w-4 h-4 mr-2" />
              Cuadrícula
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              title="Vista en lista"
            >
              <ListBulletIcon className="w-4 h-4 mr-2" />
              Lista
            </button>
          </div>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 mb-6 text-sm overflow-x-auto scrollbar-hide">
            <button
              onClick={() => handleBreadcrumbClick(-1)}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium whitespace-nowrap flex-shrink-0"
            >
              📚 Inicio
            </button>
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.id} className="flex items-center gap-2 flex-shrink-0">
                <span className="text-gray-400">›</span>
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className="text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                >
                  {crumb.name}
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={loadFiles}
              className="mt-2 text-red-600 dark:text-red-400 hover:underline text-sm"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando archivos...</span>
          </div>
        )}

        {/* Files Display */}
        {!loading && !error && (
          <>
            {files.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No se encontraron archivos</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Esta carpeta está vacía'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {isFolder(file) ? (
                        <div className="flex-shrink-0">
                          <FolderIcon className="w-8 h-8 text-blue-500" />
                        </div>
                      ) : (
                        <div className="flex-shrink-0">
                          <DocumentIcon className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                      
                      {!isFolder(file) && (
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {file.name}
                    </h3>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      {isFolder(file) && folderFileCounts[file.id] !== undefined && (
                        <div className="text-blue-600 dark:text-blue-400 font-medium">
                          {folderFileCounts[file.id]} archivos
                        </div>
                      )}
                      {file.size && <div>{formatFileSize(file.size)}</div>}
                      {file.modifiedTime && <div>{formatDate(file.modifiedTime)}</div>}
                      <div className="text-blue-600 dark:text-blue-400 font-medium">
                        {isFolder(file) ? 'Abrir carpeta' : 'Ver archivo'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer group flex items-center gap-4"
                  >
                    <div className="flex-shrink-0">
                      {isFolder(file) ? (
                        <FolderIcon className="w-6 h-6 text-blue-500" />
                      ) : (
                        <DocumentIcon className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {file.name}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {isFolder(file) && folderFileCounts[file.id] !== undefined && (
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {folderFileCounts[file.id]} archivos
                          </span>
                        )}
                        {file.size && <span>{formatFileSize(file.size)}</span>}
                        {file.modifiedTime && <span>{formatDate(file.modifiedTime)}</span>}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {isFolder(file) ? 'Abrir carpeta' : 'Ver archivo'}
                      </span>
                      {!isFolder(file) && (
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicDriveExplorer;