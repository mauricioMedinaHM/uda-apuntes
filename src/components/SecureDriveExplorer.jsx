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
import { ArrowTopRightOnSquareIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import FileIcon from './FileIcon';
import { SkeletonGrid } from './SkeletonLoader';

const SecureDriveExplorer = ({ rootFolderId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolder, setCurrentFolder] = useState(rootFolderId || '');
  const [breadcrumbs, setBreadcrumbs] = useState([]);
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
                  onClick={() => { setSearchTerm(''); loadFiles(); }}
                  className="flex-1 sm:flex-none px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* File count display */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {files.length > 0 && `${files.length} elemento${files.length !== 1 ? 's' : ''}`}
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

        {/* Files Display - Two Panel Layout */}
        {!loading && (
          <div className="animate-fade-in">
            {files.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-6">
                  <div className="inline-flex p-6 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
                    <span className="text-6xl">📂</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No se encontraron elementos</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Esta carpeta está vacía'}
                  </p>
                </div>
              </div>
            ) : (
              // Two-panel layout: Folders on left, Files on right
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Panel: Folders */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📁 Carpetas</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {files.filter(f => isFolder(f)).length}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {files.filter(f => isFolder(f)).length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400 dark:text-gray-500 text-sm">No hay carpetas</p>
                      </div>
                    ) : (
                      files.filter(f => isFolder(f)).map((folder, index) => (
                        <div
                          key={folder.id}
                          onClick={() => handleFolderClick(folder)}
                          className="group bg-white dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 animate-fade-in"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                              <FileIcon
                                mimeType={folder.mimeType}
                                fileName={folder.name}
                                isFolder={true}
                                size="w-6 h-6"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                {folder.name}
                              </h4>
                              {folderFileCounts[folder.id] !== undefined && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {folderFileCounts[folder.id]} archivos
                                </p>
                              )}
                            </div>

                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                <span className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">›</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Panel: Files */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📄 Archivos</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {files.filter(f => !isFolder(f)).length}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {files.filter(f => !isFolder(f)).length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400 dark:text-gray-500 text-sm">No hay archivos</p>
                      </div>
                    ) : (
                      files.filter(f => !isFolder(f)).map((file, index) => (
                        <div
                          key={file.id}
                          onClick={() => handleFileClick(file)}
                          className="group bg-white dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 animate-fade-in"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                              <FileIcon
                                mimeType={file.mimeType}
                                fileName={file.name}
                                isFolder={false}
                                size="w-6 h-6"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 text-sm leading-tight">
                                {file.name}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {file.size && (
                                  <span>{formatFileSize(file.size)}</span>
                                )}
                                {file.modifiedTime && (
                                  <span>{formatDate(file.modifiedTime)}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecureDriveExplorer;