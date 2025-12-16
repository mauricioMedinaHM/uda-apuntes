import { useState, useEffect } from 'react';
import { 
  listCloudflareFiles as listFiles, 
  searchCloudflareFiles as searchFiles, 
  getCloudflareFileUrl, 
  isFolder,
  formatFileSize,
  formatDate,
  getFolderFileCount
} from '../services/cloudflareDrive';
import { ArrowTopRightOnSquareIcon, MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import FileIcon from './FileIcon';
import { SkeletonGrid } from './SkeletonLoader';

const SecureDriveExplorer = ({ rootFolderId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolder, setCurrentFolder] = useState(rootFolderId || '');
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [folderFileCounts, setFolderFileCounts] = useState({});

  const truncateName = (name, maxLength = 12) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };
  useEffect(() => {
    loadFiles();
  }, [currentFolder]);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fileList = await listFiles(currentFolder);
      
      // Normalizar los datos del endpoint al formato esperado por el componente
      const normalizedFiles = fileList.map(file => ({
        id: file.id,
        name: file.nombre || file.name,
        mimeType: file.mimeType,
        modifiedTime: file.ultimaModificacion || file.modifiedTime,
        size: file.tamaño || file.size,
        path: file.path || file.id,
        url: file.url,
        isFolder: file.isFolder || file.tipo === 'carpeta'
      }));
      
      setFiles(normalizedFiles);
      
      // Get file counts for folders
      const folders = normalizedFiles.filter(file => isFolder(file));
      const counts = {};
      
      await Promise.all(
        folders.map(async (folder) => {
          try {
            const count = await getFolderFileCount(folder.path || folder.id);
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
      // No mostrar error, solo loguear
      setError(null);
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
      const results = await searchFiles(currentFolder, searchTerm);
      setFiles(results);
    } catch (error) {
      console.error('Error searching files:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder) => {
    if (!isFolder(folder)) return;
    
    const folderPath = folder.path || folder.id;
    setCurrentFolder(folderPath);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name, path: folderPath }]);
    setSearchTerm('');
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      // Volver a la raíz (apuntes/)
      setCurrentFolder('');
      setBreadcrumbs([]);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      const lastCrumb = newBreadcrumbs[newBreadcrumbs.length - 1];
      setCurrentFolder(lastCrumb.path || lastCrumb.id);
    }
    setSearchTerm('');
  };

  const handleFileClick = (file) => {
    if (isFolder(file)) {
      handleFolderClick(file);
    } else {
      // Open file in new tab usando la URL del archivo
      const fileUrl = file.url || getCloudflareFileUrl(file);
      if (fileUrl && fileUrl !== '#') {
        window.open(fileUrl, '_blank');
      }
    }
  };



  return (
    <div className="w-full animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div className="w-8 h-8 text-blue-600">📚</div>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Apuntes Universitarios</h2>
              <p className="text-gray-600 dark:text-gray-300">Explora y descarga los apuntes organizados por carrera</p>
            </div>
          </div>
          
        </div>

        {/* Search Bar and View Toggle */}
        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar archivos y carpetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 md:px-5 py-3 md:py-4 pl-10 md:pl-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all duration-300 text-base md:text-lg mobile-search bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <MagnifyingGlassIcon className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSearch}
                className="flex-1 sm:flex-none px-4 md:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Buscar</span>
              </button>
              {searchTerm && (
                <button
                  onClick={() => {setSearchTerm(''); loadFiles();}}
                  className="flex-1 sm:flex-none px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {files.length > 0 && `${files.length} elemento${files.length !== 1 ? 's' : ''}`}
            </div>
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-white dark:bg-gray-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                title="Vista en cuadrícula"
              >
                <Squares2X2Icon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Cuadrícula</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                title="Vista horizontal"
              >
                <ListBulletIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Lista</span>
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-blue-100 dark:border-blue-800 animate-slide-in">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleBreadcrumbClick(-1)}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-sm flex-shrink-0"
                title="Volver al inicio"
              >
                <span className="text-lg">🏠</span>
                <span className="hidden sm:inline">Inicio</span>
              </button>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.id} className="flex items-center gap-2">
                  <span className="text-gray-400 text-lg flex-shrink-0">›</span>
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className="px-3 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-sm flex-shrink-0"
                    title={crumb.name}
                  >
                    <span className="block max-w-[80px] sm:max-w-[120px] md:max-w-[150px] truncate">
                      {truncateName(crumb.name)}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Loading State */}
        {loading && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-center py-12 mb-8">
              <div className="relative">
                <div className="animate-spin-slow rounded-full h-16 w-16 border-4 border-blue-100"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Cargando archivos...</h3>
                <p className="text-gray-500 dark:text-gray-400">Esto puede tomar unos segundos</p>
              </div>
            </div>
            <SkeletonGrid count={8} />
          </div>
        )}

        {/* Files Display */}
        {!loading && (
          <div className="animate-fade-in">
            {files.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-6">
                  <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mb-4">
                    <span className="text-6xl">📂</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No se encontraron archivos</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Esta carpeta está vacía'}
                  </p>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                {files.map((file, index) => (
                  <div
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className="group bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md animate-fade-in min-h-[160px] sm:min-h-[180px] flex flex-col justify-between"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <div className="flex-shrink-0 p-2 md:p-3 bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 rounded-lg transition-all duration-200">
                        <FileIcon 
                          mimeType={file.mimeType} 
                          fileName={file.name} 
                          isFolder={isFolder(file)} 
                          size="w-6 h-6 md:w-8 md:h-8" 
                        />
                      </div>
                      {!isFolder(file) && (
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 group-hover:text-blue-500 transition-all duration-300" />
                      )}
                    </div>
                    
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 md:mb-3 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-300 text-sm md:text-base leading-tight" 
                        title={file.name}
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        }}>
                      {file.name}
                    </h3>
                    
                    <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                      {isFolder(file) && folderFileCounts[file.id] !== undefined && (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-400 rounded-full"></span>
                          <span className="font-medium text-xs sm:text-sm">{folderFileCounts[file.id]} archivos</span>
                        </div>
                      )}
                      {file.size && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-400 rounded-full"></span>
                          <span className="text-xs sm:text-sm">{formatFileSize(file.size)}</span>
                        </div>
                      )}
                      {file.modifiedTime && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full"></span>
                          <span className="text-xs sm:text-sm">{formatDate(file.modifiedTime)}</span>
                        </div>
                      )}
                      <div className="mt-3 md:mt-4 pt-2 md:pt-3 border-t border-gray-200 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-600">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 group-hover:bg-blue-700 text-white rounded-lg text-xs md:text-sm font-medium transition-all duration-200">
                          {isFolder(file) ? (
                            <>
                              <span>📁</span>
                              <span className="hidden sm:inline">Abrir carpeta</span>
                              <span className="sm:hidden">Abrir</span>
                            </>
                          ) : (
                            <>
                              <span>📄</span>
                              <span className="hidden sm:inline">Ver archivo</span>
                              <span className="sm:hidden">Ver</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className="group bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md animate-fade-in flex items-center gap-3 sm:gap-4"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {/* File Icon */}
                    <div className="flex-shrink-0 p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 rounded-lg transition-all duration-200">
                      <FileIcon 
                        mimeType={file.mimeType} 
                        fileName={file.name} 
                        isFolder={isFolder(file)} 
                        size="w-5 h-5 sm:w-6 sm:h-6" 
                      />
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-300 text-base md:text-lg mb-1 leading-tight" 
                          title={file.name}
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                          }}>
                        {file.name}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {isFolder(file) && folderFileCounts[file.id] !== undefined && (
                          <span className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                            {folderFileCounts[file.id]} archivos
                          </span>
                        )}
                        {file.size && (
                          <span className="inline-flex items-center gap-2">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full flex-shrink-0"></span>
                            {formatFileSize(file.size)}
                          </span>
                        )}
                        {file.modifiedTime && (
                          <span className="inline-flex items-center gap-2">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full flex-shrink-0"></span>
                            {formatDate(file.modifiedTime)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
                      <span className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 group-hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-200">
                        {isFolder(file) ? (
                          <>
                            <span>📁</span>
                            <span className="hidden sm:inline">Abrir carpeta</span>
                            <span className="sm:hidden">Abrir</span>
                          </>
                        ) : (
                          <>
                            <span>📄</span>
                            <span className="hidden sm:inline">Ver archivo</span>
                            <span className="sm:hidden">Ver</span>
                          </>
                        )}
                      </span>
                      {!isFolder(file) && (
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 group-hover:text-blue-500 transition-all duration-300" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecureDriveExplorer;