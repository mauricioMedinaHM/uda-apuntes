import { useState, useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import {
  listCloudflareFiles,
  searchCloudflareFiles,
  getCloudflareFileUrl,
  isFolder,
  formatFileSize,
  formatDate,
  getFolderFileCountRecursive
} from '../services/cloudflareDrive';
import { uploadFileToFolder, deleteFile } from '../services/uploadService';
import { toggleFavorite, isFavorite } from '../services/favoritesService';
import FileIcon from './FileIcon';
import {
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  StarIcon,
  ArrowTopRightOnSquareIcon,
  CloudArrowUpIcon,
  XMarkIcon
}
  from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { SkeletonGrid } from './SkeletonLoader';

const SecureDriveExplorer = ({ rootFolderId = '', favorites = [], onFavoritesChange, onPreview }) => {
  const { getToken, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState(rootFolderId);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [folderFileCounts, setFolderFileCounts] = useState({});
  const [folderSubfolderCounts, setFolderSubfolderCounts] = useState({});

  // Upload state
  const [dragOverFolder, setDragOverFolder] = useState(null);
  const [dragOverFilesArea, setDragOverFilesArea] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ show: false, fileName: '', progress: 0 });

  // File ownership state
  const [fileOwners, setFileOwners] = useState({});

  // Ref for folders section to scroll to
  const foldersStartRef = useRef(null);

  const truncateName = (name, maxLength = 12) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };
  // Load files when folder changes
  useEffect(() => {
    loadFiles();
  }, [currentFolderId]);

  // Auto-scroll to folders section when folder changes (mobile UX improvement)
  useEffect(() => {
    // Small delay to ensure DOM is ready and ref is attached
    const scrollTimeout = setTimeout(() => {
      if (breadcrumbs.length > 0 && foldersStartRef.current) {
        // Scroll to the folders section header
        const yOffset = -80; // Offset to account for sticky header
        const element = foldersStartRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        // If no breadcrumbs (at root), scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, [currentFolderId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listCloudflareFiles(currentFolderId);

      // Normalizar los datos del endpoint al formato esperado por el componente
      const normalizedFiles = data.map(file => ({
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

      // DISABLED: Folder counting was causing rate limit errors (429 Too Many Requests)
      // If needed in the future, implement with caching or lazy loading
      /*
      // Get RECURSIVE file and subfolder counts for folders
      const folders = normalizedFiles.filter(file => isFolder(file));
      const fileCounts = {};
      const subfolderCounts = {};

      await Promise.all(
        folders.map(async (folder) => {
          try {
            // Get DIRECT contents of this folder for subfolder count
            const folderContents = await listCloudflareFiles(folder.path || folder.id);
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
      */
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
      const results = await searchCloudflareFiles(currentFolderId, searchTerm);
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
    setCurrentFolderId(folderPath);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name, path: folderPath }]);
    setSearchTerm('');
  };

  const handleGoBack = () => {
    if (breadcrumbs.length === 0) return; // Already at root, can't go back

    if (breadcrumbs.length === 1) {
      // Si solo hay 1 breadcrumb, volver al rootFolderId (nivel mínimo)
      // Esto evita llegar a una carpeta raíz vacía
      setCurrentFolderId(rootFolderId);
      setBreadcrumbs([]);
    } else {
      // Go back to previous folder
      const newBreadcrumbs = breadcrumbs.slice(0, -1);
      const previousFolder = newBreadcrumbs[newBreadcrumbs.length - 1];
      setBreadcrumbs(newBreadcrumbs);
      setCurrentFolderId(previousFolder.path || previousFolder.id);
    }
    setSearchTerm('');
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      // Volver al nivel mínimo (rootFolderId), NO a la raíz vacía
      setCurrentFolderId(rootFolderId);
      setBreadcrumbs([]);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      const lastCrumb = newBreadcrumbs[newBreadcrumbs.length - 1];
      setCurrentFolderId(lastCrumb.path || lastCrumb.id);
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

  // Drag & Drop Handlers
  const handleDragEnter = (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSignedIn) {
      setDragOverFolder(folderId);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverFolder === folderId) {
      setDragOverFolder(null);
    }
  };

  const handleDrop = async (e, folder) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);

    if (!isSignedIn) {
      alert('Debes iniciar sesión para subir archivos');
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const folderPath = folder.path || folder.id;

    for (const file of files) {
      try {
        setUploading(true);
        setUploadProgress({ show: true, fileName: file.name, progress: 0 });

        const token = await getToken();
        await uploadFileToFolder(file, folderPath, token);

        setUploadProgress({ show: true, fileName: file.name, progress: 100 });

        // Wait a moment to show success
        setTimeout(() => {
          setUploadProgress({ show: false, fileName: '', progress: 0 });
          setUploading(false);
          // Reload files if we're in this folder
          if (currentFolderId === folderPath || currentFolderId === folder.id) {
            loadFiles();
          }
        }, 1000);

      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Error al subir ${file.name}: ${error.message}`);
        setUploading(false);
        setUploadProgress({ show: false, fileName: '', progress: 0 });
      }
    }
  };

  // Upload to current folder (files area)
  const handleFilesAreaDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFilesArea(false);

    if (!isSignedIn) {
      alert('Debes iniciar sesión para subir archivos');
      return;
    }

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    for (const file of droppedFiles) {
      try {
        setUploading(true);
        setUploadProgress({ show: true, fileName: file.name, progress: 0 });

        const token = await getToken();
        await uploadFileToFolder(file, currentFolderId, token);

        setUploadProgress({ show: true, fileName: file.name, progress: 100 });

        // Wait a moment to show success
        setTimeout(() => {
          setUploadProgress({ show: false, fileName: '', progress: 0 });
          setUploading(false);
          loadFiles();
        }, 1000);

      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Error al subir ${file.name}: ${error.message}`);
        setUploading(false);
        setUploadProgress({ show: false, fileName: '', progress: 0 });
      }
    }
  };

  // Delete file (owner only)
  const handleDeleteFile = async (file) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${file.name}"?`)) {
      return;
    }

    try {
      const token = await getToken();
      const fileKey = file.path || file.id;
      await deleteFile(fileKey, token);

      // Reload files
      loadFiles();
      alert('Archivo eliminado correctamente');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert(`Error al eliminar el archivo: ${error.message}`);
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
      {/* Sticky Navigation Bar (Mobile) - Search Bar and Breadcrumbs */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 pb-4 mb-2 shadow-sm dark:shadow-gray-800/50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
        {/* Search Bar - Hidden on mobile, visible on tablet+ */}
        <div className="hidden md:flex flex-col gap-4 pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar archivos y carpetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              Buscar
            </button>
          </div>
        </div>

        {/* Breadcrumbs - Hidden on mobile, visible on tablet+ */}
        {breadcrumbs.length > 0 && (
          <div className="hidden md:flex flex-wrap items-center gap-2 text-sm mt-4">
            <button
              onClick={() => handleBreadcrumbClick(-1)}
              className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-blue-600 dark:text-blue-400 font-medium"
            >
              Inicio
            </button>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-600 dark:text-gray-300"
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Current Location Card with Back Button - Compact on mobile */}
        {breadcrumbs.length > 0 && (
          <div
            className="flex items-center gap-2 md:gap-3 p-2 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg md:rounded-xl border border-blue-200 dark:border-blue-800 mt-2 md:mt-4"
          >
            <button
              onClick={handleGoBack}
              className="p-1.5 md:p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors group flex-shrink-0"
              title="Volver"
            >
              <ArrowLeftIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
            </button>
            <div className="flex items-center justify-center gap-1.5 md:gap-2 flex-1 min-w-0">
              <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex-shrink-0">
                <div className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400">📁</div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-semibold text-blue-900 dark:text-blue-100 truncate text-center">
                  {breadcrumbs[breadcrumbs.length - 1].name}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress Indicator */}
      {uploadProgress.show && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            {uploadProgress.progress === 100 ? (
              <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">✓</span>
              </div>
            ) : (
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                <CloudArrowUpIcon className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {uploadProgress.progress === 100 ? '✅ Archivo subido!' : 'Subiendo archivo...'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">{uploadProgress.fileName}</p>
            </div>
          </div>
        </div>
      )
      }

      {/* Error State */}
      {
        error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          </div>
        )
      }


      {/* Loading State - Minimalist */}
      {
        loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cargando archivos...</p>
          </div>
        )
      }

      {/* Content */}
      {
        !loading && !error && (
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              if (isSignedIn) setDragOverFilesArea(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => {
              e.preventDefault();
              if (e.currentTarget === e.target) setDragOverFilesArea(false);
            }}
            onDrop={handleFilesAreaDrop}
            className={`relative ${dragOverFilesArea ? 'ring-2 ring-blue-500 ring-inset rounded-lg' : ''}`}
          >
            {dragOverFilesArea && (
              <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-500 rounded-lg z-10 flex items-center justify-center">
                <div className="text-center">
                  <CloudArrowUpIcon className="w-16 h-16 mx-auto mb-2 text-blue-600" />
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    Suelta para subir archivos aquí
                  </p>
                </div>
              </div>
            )}
            {/* Empty State */}
            {files.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 text-gray-300 dark:text-gray-600">
                  📂
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No se encontraron elementos
                </h3>
                <p className="text-gray-500 dark:text-gray-400">Esta carpeta está vacía</p>
              </div>
            ) : (
              // Responsive grid layout - All folders visible
              <div className="space-y-8">
                {/* Folders Section */}
                {files.filter(f => isFolder(f)).length > 0 && (
                  <div>
                    <div
                      ref={foldersStartRef}
                      className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200 dark:border-gray-700"
                    >
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
                          onDragEnter={(e) => handleDragEnter(e, folder.id)}
                          onDragOver={handleDragOver}
                          onDragLeave={(e) => handleDragLeave(e, folder.id)}
                          onDrop={(e) => handleDrop(e, folder)}
                          className={`group bg-white dark:bg-gray-800 rounded-xl p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border-2 hover:shadow-lg animate-fade-in ${dragOverFolder === folder.id && isSignedIn
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                            }`}
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
                              {dragOverFolder === folder.id && isSignedIn ? (
                                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-500 text-white">
                                  <CloudArrowUpIcon className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                  <span className="text-sm text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">›</span>
                                </div>
                              )}
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

                            {/* Delete Button (owner or admin) */}
                            {isSignedIn && (file.id && file.id.includes(userId) || isAdmin) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFile(file);
                                }}
                                className={`flex-shrink-0 p-2 rounded-lg transition-colors ${isAdmin && (!file.id || !file.id.includes(userId))
                                    ? 'hover:bg-orange-100 dark:hover:bg-orange-900/30'
                                    : 'hover:bg-red-100 dark:hover:bg-red-900/30'
                                  }`}
                                title={
                                  isAdmin && (!file.id || !file.id.includes(userId))
                                    ? '🔑 Eliminar archivo (Admin)'
                                    : 'Eliminar archivo'
                                }
                              >
                                <XMarkIcon
                                  className={`w-5 h-5 ${isAdmin && (!file.id || !file.id.includes(userId))
                                      ? 'text-orange-600 dark:text-orange-400'
                                      : 'text-red-600 dark:text-red-400'
                                    }`}
                                />
                              </button>
                            )}

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
        )
      }
    </div >
  );
};

export default SecureDriveExplorer;
