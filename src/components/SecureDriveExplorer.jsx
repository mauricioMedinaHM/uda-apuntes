import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  listCloudflareFiles as listFiles,
  searchCloudflareFiles as searchFiles,
  getCloudflareFileUrl,
  isFolder,
  formatFileSize,
  formatDate,
  getFolderFileCount,
  getFolderFileCountRecursive
} from '../services/cloudflareDrive';
import { ArrowTopRightOnSquareIcon, MagnifyingGlassIcon, ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import FileIcon from './FileIcon';
import { SkeletonGrid } from './SkeletonLoader';
import { toggleFavorite, isFavorite } from '../services/favoritesService';

const SecureDriveExplorer = ({ rootFolderId, favorites = [], onFavoritesChange, onPreview }) => {
  const { getToken, isSignedIn } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolder, setCurrentFolder] = useState(rootFolderId || '');
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [folderFileCounts, setFolderFileCounts] = useState({});
  const [folderSubfolderCounts, setFolderSubfolderCounts] = useState({});

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

      // Get RECURSIVE file and subfolder counts for folders
      const folders = normalizedFiles.filter(file => isFolder(file));
      const fileCounts = {};
      const subfolderCounts = {};

      await Promise.all(
        folders.map(async (folder) => {
          try {
            // Get DIRECT contents of this folder for subfolder count
            const folderContents = await listFiles(folder.path || folder.id);
            const subfolders = folderContents.filter(item => item.isFolder || item.tipo === 'carpeta');

            // Get RECURSIVE file count (all files in this folder and all subfolders)
            const totalFiles = await getFolderFileCountRecursive(folder.path || folder.id);

            fileCounts[folder.id] = totalFiles;
            subfolderCounts[folder.id] = subfolders.length;
          } catch (error) {
            console.error(`Error getting count for folder ${folder.name}:`, error);
            fileCounts[folder.id] = 0;
            subfolderCounts[folder.id] = 0;
          }
        })
      );

      setFolderFileCounts(fileCounts);
      setFolderSubfolderCounts(subfolderCounts);
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

  const handleGoBack = () => {
    if (breadcrumbs.length === 0) return;

    if (breadcrumbs.length === 1) {
      // Si solo hay 1 breadcrumb, volver al rootFolderId (nivel mínimo)
      // Esto evita llegar a una carpeta raíz vacía
      setCurrentFolder(rootFolderId || '');
      setBreadcrumbs([]);
    } else {
      // Go back to previous folder
      const newBreadcrumbs = breadcrumbs.slice(0, -1);
      const previousFolder = newBreadcrumbs[newBreadcrumbs.length - 1];
      setBreadcrumbs(newBreadcrumbs);
      setCurrentFolder(previousFolder.path || previousFolder.id);
    }
    setSearchTerm('');
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      // Volver al nivel mínimo (rootFolderId), NO a la raíz vacía
      setCurrentFolder(rootFolderId || '');
      setBreadcrumbs([]);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      const lastCrumb = newBreadcrumbs[newBreadcrumbs.length - 1];
      setCurrentFolder(lastCrumb.path || lastCrumb.id);
    }
    setSearchTerm('');
  };

  const handleToggleFavorite = async (file, e) => {
    e.stopPropagation();

    if (!isSignedIn) {
      alert('Debes iniciar sesión para guardar favoritos');
      return;
    }

    try {
      const token = await getToken();
      await toggleFavorite(file, favorites, token);
      if (onFavoritesChange) {
        onFavoritesChange();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error al actualizar favoritos');
    }
  };

  const handleFileClick = (file) => {
    if (isFolder(file)) {
      handleFolderClick(file);
    } else {
      // Preview or open file
      if (onPreview) {
        onPreview(file);
      } else {
        // Open file in new tab using the URL from file
        const fileUrl = file.url || getCloudflareFileUrl(file);
        if (fileUrl && fileUrl !== '#') {
          window.open(fileUrl, '_blank');
        }
      }
    }
  };



  return (
    <div className="w-full animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <div className="mb-8">

        </div>

        {/* Search Bar and View Toggle */}
        <div className="flex flex-col gap-4 mb-2 md:mb-1">
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

          {/* File/Folder count display */}
          <div className="flex items-center justify-end mb-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {files.length > 0 && (
                <span>
                  {files.filter(f => isFolder(f)).length > 0 && `${files.filter(f => isFolder(f)).length} carpeta${files.filter(f => isFolder(f)).length !== 1 ? 's' : ''}`}
                  {files.filter(f => isFolder(f)).length > 0 && files.filter(f => !isFolder(f)).length > 0 && ', '}
                  {files.filter(f => !isFolder(f)).length > 0 && `${files.filter(f => !isFolder(f)).length} archivo${files.filter(f => !isFolder(f)).length !== 1 ? 's' : ''}`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Breadcrumbs & Current Location */}
        {breadcrumbs.length > 0 && (
          <div className="mb-8 space-y-3">
            {/* Breadcrumb Navigation */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <button
                onClick={() => handleBreadcrumbClick(-1)}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                title="Volver al inicio"
              >
                🏠 Inicio
              </button>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.id} className="flex items-center gap-2">
                  <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className={`hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors ${index === breadcrumbs.length - 1
                      ? 'text-gray-900 dark:text-white cursor-default'
                      : 'text-gray-600 dark:text-gray-400'
                      }`}
                    title={crumb.name}
                  >
                    <span className="max-w-[120px] md:max-w-[200px] truncate block">
                      {crumb.name}
                    </span>
                  </button>
                </div>
              ))}
            </div>

            {/* Current Location Card */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                {/* Back Button */}
                <button
                  onClick={handleGoBack}
                  className="p-2 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800/60 rounded-lg transition-all duration-200 hover:-translate-x-1"
                  title="Volver atrás"
                >
                  <ArrowLeftIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </button>

                {/* Folder Icon */}
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <span className="text-2xl">📂</span>
                </div>

                {/* Folder Name */}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {breadcrumbs[breadcrumbs.length - 1].name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ubicación actual
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Loading State - Minimalist */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cargando archivos...</p>
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
              // Responsive grid layout - All folders visible
              <div className="space-y-8">
                {/* Folders Section */}
                {files.filter(f => isFolder(f)).length > 0 && (
                  <div>
                    <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">📁 Carpetas</h3>
                      <span className="text-sm font-medium px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        {files.filter(f => isFolder(f)).length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {files.filter(f => isFolder(f)).map((folder, index) => (
                        <div
                          key={folder.id}
                          onClick={() => handleFolderClick(folder)}
                          className="group bg-white dark:bg-gray-800 rounded-xl p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg animate-fade-in"
                          style={{ animationDelay: `${index * 20}ms` }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                              <FileIcon
                                mimeType={folder.mimeType}
                                fileName={folder.name}
                                isFolder={true}
                                size="w-7 h-7"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight mb-2">
                                {folder.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                {folderSubfolderCounts[folder.id] !== undefined && folderSubfolderCounts[folder.id] > 0 && (
                                  <span className="flex items-center gap-1">
                                    <span>📁</span>
                                    <span>{folderSubfolderCounts[folder.id]}</span>
                                  </span>
                                )}
                                {folderFileCounts[folder.id] !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <span>📄</span>
                                    <span>{folderFileCounts[folder.id]}</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                <span className="text-sm text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">›</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Files Section */}
                {files.filter(f => !isFolder(f)).length > 0 && (
                  <div>
                    <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">📄 Archivos</h3>
                      <span className="text-sm font-medium px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                        {files.filter(f => !isFolder(f)).length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {files.filter(f => !isFolder(f)).map((file, index) => (
                        <div
                          key={file.id}
                          onClick={() => handleFileClick(file)}
                          className="group bg-white dark:bg-gray-800 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg animate-fade-in"
                          style={{ animationDelay: `${index * 20}ms` }}
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

                            {/* Favorite Star Button */}
                            {isSignedIn && (
                              <button
                                onClick={(e) => handleToggleFavorite(file, e)}
                                className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                title={isFavorite(file.id || file.path, favorites) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                              >
                                {isFavorite(file.id || file.path, favorites) ? (
                                  <StarIconSolid className="w-5 h-5 text-yellow-500" />
                                ) : (
                                  <StarIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                )}
                              </button>
                            )}

                            <div className="flex-shrink-0">
                              <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecureDriveExplorer;