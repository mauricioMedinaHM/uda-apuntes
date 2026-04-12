import { useState, useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import {
  listCloudflareFiles,
  listCloudflareFilesWithCounts,
  searchCloudflareFiles,
  getCloudflareFileUrl,
  isFolder,
  formatFileSize,
  formatDate,
} from '../services/cloudflareDrive';
import { uploadFileToFolder, deleteFile } from '../services/uploadService';
import { toggleFavorite, isFavorite } from '../services/favoritesService';
import FileIcon from './FileIcon';
import LoginPromptModal from './LoginPromptModal';
import {
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  StarIcon,
  ArrowTopRightOnSquareIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  HomeIcon,
}
  from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { SkeletonGrid } from './SkeletonLoader';
import { Download, CheckSquare, Square, X as LucideX } from 'lucide-react';

const SecureDriveExplorer = ({ rootFolderId = '', favorites = [], onFavoritesChange, onPreview }) => {
  const { getToken, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
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

  // Login prompt modal
  const [loginPrompt, setLoginPrompt] = useState({ open: false, reason: 'favorite' });
  const showLogin = (reason) => setLoginPrompt({ open: true, reason });
  const closeLogin = () => setLoginPrompt({ open: false, reason: loginPrompt.reason });

  // Multi-select for download
  const [selectMode, setSelectMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(new Set());

  const toggleSelectMode = () => {
    if (!isSignedIn) { showLogin('download'); return; }
    setSelectMode(v => !v);
    setSelectedFiles(new Set());
  };

  const toggleFileSelect = (fileId, e) => {
    e.stopPropagation();
    setSelectedFiles(prev => {
      const next = new Set(prev);
      next.has(fileId) ? next.delete(fileId) : next.add(fileId);
      return next;
    });
  };

  const downloadSelected = () => {
    const toDownload = files.filter(f => !isFolder(f) && selectedFiles.has(f.id || f.path));
    toDownload.forEach((file, i) => {
      const url = file.url || getCloudflareFileUrl(file);
      if (!url || url === '#') return;
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.click();
      }, i * 300); // small delay between tabs
    });
    setSelectMode(false);
    setSelectedFiles(new Set());
  };

  // Refs
  const foldersStartRef = useRef(null);
  const searchInputRef = useRef(null);
  const breadcrumbScrollRef = useRef(null);

  // Load files when folder changes
  useEffect(() => {
    loadFiles();
  }, [currentFolderId]);

  // Scroll breadcrumbs to end when new crumb added
  useEffect(() => {
    if (breadcrumbScrollRef.current) {
      breadcrumbScrollRef.current.scrollLeft = breadcrumbScrollRef.current.scrollWidth;
    }
  }, [breadcrumbs]);

  // Auto-scroll to folders section when folder changes
  useEffect(() => {
    const scrollTimeout = setTimeout(() => {
      if (breadcrumbs.length > 0 && foldersStartRef.current) {
        const yOffset = -100;
        const element = foldersStartRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(scrollTimeout);
  }, [currentFolderId]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listCloudflareFilesWithCounts(currentFolderId);

      const normalizedFiles = data.map(file => ({
        id: file.id,
        name: file.nombre || file.name,
        mimeType: file.mimeType,
        modifiedTime: file.ultimaModificacion || file.modifiedTime,
        size: file.tamaño || file.size,
        path: file.path || file.id,
        url: file.url,
        isFolder: file.isFolder || file.tipo === 'carpeta',
        totalArchivos: file.totalArchivos,
        totalCarpetas: file.totalCarpetas,
      }));

      setFiles(normalizedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
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
    setSearchOpen(false);
  };

  const handleGoBack = () => {
    if (breadcrumbs.length === 0) return;
    if (breadcrumbs.length === 1) {
      setCurrentFolderId(rootFolderId);
      setBreadcrumbs([]);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, -1);
      const previousFolder = newBreadcrumbs[newBreadcrumbs.length - 1];
      setBreadcrumbs(newBreadcrumbs);
      setCurrentFolderId(previousFolder.path || previousFolder.id);
    }
    setSearchTerm('');
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
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
    if (!isSignedIn) { showLogin('favorite'); return; }
    try {
      const token = await getToken();
      await toggleFavorite(file, favorites, token);
      if (onFavoritesChange) onFavoritesChange();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Drag & Drop Handlers
  const handleDragEnter = (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSignedIn) setDragOverFolder(folderId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverFolder === folderId) setDragOverFolder(null);
  };

  const handleDrop = async (e, folder) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);

    if (!isSignedIn) { showLogin('upload'); return; }

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
        setTimeout(() => {
          setUploadProgress({ show: false, fileName: '', progress: 0 });
          setUploading(false);
          if (currentFolderId === folderPath || currentFolderId === folder.id) loadFiles();
        }, 1000);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Error al subir ${file.name}: ${error.message}`);
        setUploading(false);
        setUploadProgress({ show: false, fileName: '', progress: 0 });
      }
    }
  };

  const handleFilesAreaDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFilesArea(false);

    if (!isSignedIn) { showLogin('upload'); return; }

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    for (const file of droppedFiles) {
      try {
        setUploading(true);
        setUploadProgress({ show: true, fileName: file.name, progress: 0 });
        const token = await getToken();
        await uploadFileToFolder(file, currentFolderId, token);
        setUploadProgress({ show: true, fileName: file.name, progress: 100 });
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

  const handleDeleteFile = async (file) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${file.name}"?`)) return;
    try {
      const token = await getToken();
      const fileKey = file.path || file.id;
      await deleteFile(fileKey, token);
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
      if (onPreview) {
        onPreview(file);
      } else {
        const fileUrl = file.url || getCloudflareFileUrl(file);
        if (fileUrl && fileUrl !== '#') window.open(fileUrl, '_blank');
      }
    }
  };

  const isAtRoot = breadcrumbs.length === 0;
  const currentFolderName = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : null;

  return (
    <div className="w-full animate-fade-in">

      {/* ── Sticky Navigation Bar ── */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800/50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">

        {/* Top row: Back button + Breadcrumb path + Search toggle */}
        <div className="flex items-center gap-2 px-1 py-2 border-b border-gray-100 dark:border-gray-800">

          {/* Back button — only when inside a folder */}
          {!isAtRoot && (
            <button
              onClick={handleGoBack}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#0F2A34] hover:bg-[#122F3B] text-[#4DADC4] rounded-lg transition-colors font-medium text-sm"
              aria-label="Volver"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Volver</span>
            </button>
          )}

          {/* Horizontal scrollable breadcrumb path */}
          <div
            ref={breadcrumbScrollRef}
            className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Home */}
            <button
              onClick={() => handleBreadcrumbClick(-1)}
              className={`flex-shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors text-sm font-medium ${
                isAtRoot
                  ? 'text-[#4DADC4] bg-[#0F2A34]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <HomeIcon className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Inicio</span>
            </button>

            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-1 flex-shrink-0">
                <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`px-2 py-1.5 rounded-md transition-colors text-sm whitespace-nowrap ${
                    index === breadcrumbs.length - 1
                      ? 'text-gray-900 dark:text-white font-semibold bg-gray-100 dark:bg-gray-800'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>

          {/* Search toggle button */}
          <button
            onClick={() => setSearchOpen(v => !v)}
            className="flex-shrink-0 p-2 rounded-lg transition-colors text-white"
            style={searchOpen || searchTerm
              ? { background: '#26778D' }
              : { background: 'rgba(38,119,141,0.1)', color: 'rgba(38,119,141,0.8)' }
            }
            aria-label="Buscar"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search row — collapsible */}
        <div className={`overflow-hidden transition-all duration-200 ${searchOpen ? 'max-h-20 py-2' : 'max-h-0'}`}>
          <div className="flex gap-2 px-1">
            <div className="flex-1 relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar archivos y carpetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                  if (e.key === 'Escape') { setSearchOpen(false); setSearchTerm(''); loadFiles(); }
                }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26778D] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2.5 text-white font-medium rounded-lg transition-colors text-sm" style={{ background: '#26778D' }} onMouseEnter={e=>e.currentTarget.style.background='#1A5E72'} onMouseLeave={e=>e.currentTarget.style.background='#26778D'}
            >
              Buscar
            </button>
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); loadFiles(); }}
                className="px-3 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors text-sm"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upload Progress Indicator */}
      {uploadProgress.show && (
        <div className="mt-4 border rounded-lg p-4 animate-fade-in" style={{ background: 'rgba(38,119,141,0.1)', borderColor: 'rgba(38,119,141,0.3)' }}>
          <div className="flex items-center gap-3">
            {uploadProgress.progress === 100 ? (
              <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">✓</span>
              </div>
            ) : (
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center animate-pulse" style={{ background: '#26778D' }}>
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
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex gap-2 mb-4">
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#26778D', animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#26778D', animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#26778D', animationDelay: '300ms' }}></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentFolderName ? `Cargando ${currentFolderName}...` : 'Cargando...'}
          </p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragOverFilesArea(true); }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => { e.preventDefault(); if (e.currentTarget === e.target) setDragOverFilesArea(false); }}
          onDrop={handleFilesAreaDrop}
          className={`relative mt-4 ${dragOverFilesArea ? 'ring-2 ring-[#26778D] ring-inset rounded-lg' : ''}`}
        >
          {dragOverFilesArea && (
            <div className="absolute inset-0 border-2 border-dashed border-[#26778D] rounded-lg z-10 flex items-center justify-center" style={{ background: 'rgba(38,119,141,0.08)' }}>
              <div className="text-center">
                <CloudArrowUpIcon className="w-16 h-16 mx-auto mb-2 text-[#26778D]" />
                {isSignedIn ? (
                  <p className="text-lg font-semibold text-[#4DADC4]">Suelta para subir archivos aquí</p>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-[#4DADC4] mb-1">Iniciá sesión para subir archivos</p>
                    <p className="text-sm" style={{ color: 'rgba(77,173,196,0.7)' }}>Contribuí con tus apuntes a la comunidad</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {files.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">📂</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No se encontraron elementos
              </h3>
              <p className="text-gray-500 dark:text-gray-400">Esta carpeta está vacía</p>
            </div>
          ) : (
            <div className="space-y-8">

              {/* ── Folders Section ── */}
              {files.filter(f => isFolder(f)).length > 0 && (
                <div>
                  <div
                    ref={foldersStartRef}
                    className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200 dark:border-gray-700"
                  >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">📁 Carpetas</h3>
                    <span className="text-sm font-medium px-2.5 py-0.5 text-[#4DADC4] rounded-full" style={{ background: 'rgba(38,119,141,0.12)' }}>
                      {files.filter(f => isFolder(f)).length}
                    </span>
                  </div>

                  {/* Folder grid — 2 cols on mobile, 3 on tablet, 4 on desktop */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {files.filter(f => isFolder(f)).map((folder, index) => (
                      <button
                        key={folder.id}
                        onClick={() => handleFolderClick(folder)}
                        onDragEnter={(e) => handleDragEnter(e, folder.id)}
                        onDragOver={handleDragOver}
                        onDragLeave={(e) => handleDragLeave(e, folder.id)}
                        onDrop={(e) => handleDrop(e, folder)}
                        className={`group relative text-left bg-white dark:bg-gray-800 rounded-xl p-4 hover:bg-[#0F2A34] dark:hover:bg-[#0F2A34] active:scale-95 transition-all duration-150 cursor-pointer border-2 hover:shadow-md animate-fade-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26778D] ${
                          dragOverFolder === folder.id && isSignedIn
                            ? 'border-[#26778D] bg-[#0F2A34]'
                            : 'border-gray-200 dark:border-gray-700 hover:border-[#26778D]'
                        }`}
                        style={{ animationDelay: `${index * 15}ms` }}
                      >
                        {/* Folder icon */}
                        <div className="mb-3 flex items-center justify-between">
                          <div className="p-2 bg-[rgba(38,119,141,0.08)] dark:bg-[rgba(38,119,141,0.1)] rounded-lg group-hover:bg-[#122F3B] transition-colors">
                            <FileIcon
                              mimeType={folder.mimeType}
                              fileName={folder.name}
                              isFolder={true}
                              size="w-6 h-6"
                            />
                          </div>
                          {dragOverFolder === folder.id && isSignedIn ? (
                            <CloudArrowUpIcon className="w-5 h-5 text-[#26778D]" />
                          ) : (
                            <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-[#26778D] dark:group-hover:text-[#4DADC4] transition-colors" />
                          )}
                        </div>

                        {/* Folder name */}
                        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#4DADC4] transition-colors leading-tight line-clamp-2 mb-2">
                          {folder.name}
                        </p>

                        {/* Counts */}
                        {(folder.totalArchivos > 0 || folder.totalCarpetas > 0) && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {folder.totalCarpetas > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md px-1.5 py-0.5">
                                <span>📁</span>
                                <span>{folder.totalCarpetas}</span>
                              </span>
                            )}
                            {folder.totalArchivos > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md px-1.5 py-0.5">
                                <span>📄</span>
                                <span>{folder.totalArchivos}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Files Section ── */}
              {files.filter(f => !isFolder(f)).length > 0 && (
                <div>
                  {/* Section header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Archivos</h3>
                      <span className="text-sm font-medium px-2.5 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                        {files.filter(f => !isFolder(f)).length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Download selected bar */}
                      {selectMode && selectedFiles.size > 0 && (
                        <button
                          onClick={downloadSelected}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                          style={{ background: 'linear-gradient(135deg, #26778D, #1d6a80)', boxShadow: '0 0 14px rgba(38,119,141,0.35)' }}
                        >
                          <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
                          Descargar ({selectedFiles.size})
                        </button>
                      )}

                      {/* Toggle select mode */}
                      <button
                        onClick={toggleSelectMode}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                        style={selectMode
                          ? { color: '#4DADC4', background: 'rgba(38,119,141,0.12)', border: '1px solid rgba(38,119,141,0.3)' }
                          : { color: 'rgba(107,114,128,1)', background: 'transparent', border: '1px solid rgba(107,114,128,0.3)' }
                        }
                        title={isSignedIn ? (selectMode ? 'Cancelar selección' : 'Seleccionar para descargar') : 'Iniciá sesión para descargar múltiples archivos'}
                      >
                        {selectMode
                          ? <LucideX className="w-3.5 h-3.5" strokeWidth={2.5} />
                          : <Download className="w-3.5 h-3.5" strokeWidth={2} />
                        }
                        {selectMode ? 'Cancelar' : 'Seleccionar'}
                        {!isSignedIn && <span className="text-xs ml-0.5">🔒</span>}
                      </button>
                    </div>
                  </div>

                  {/* File grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {files.filter(f => !isFolder(f)).map((file, index) => {
                      const fileKey = file.id || file.path;
                      const isSelected = selectedFiles.has(fileKey);
                      const favored = isFavorite(fileKey, favorites);

                      return (
                        <div
                          key={file.id}
                          onClick={() => selectMode ? toggleFileSelect(fileKey, { stopPropagation: () => {} }) : handleFileClick(file)}
                          className="group bg-white dark:bg-gray-800 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 cursor-pointer border hover:shadow-md animate-fade-in active:scale-95"
                          style={{
                            animationDelay: `${index * 15}ms`,
                            borderColor: isSelected ? '#26778D' : undefined,
                            background: isSelected ? 'rgba(38,119,141,0.06)' : undefined,
                          }}
                        >
                          <div className="flex items-center gap-3">

                            {/* Checkbox (select mode) */}
                            {selectMode && (
                              <button
                                onClick={(e) => toggleFileSelect(fileKey, e)}
                                className="flex-shrink-0 transition-colors"
                                style={{ color: isSelected ? '#26778D' : 'rgba(107,114,128,0.5)' }}
                              >
                                {isSelected
                                  ? <CheckSquare className="w-5 h-5" strokeWidth={2} />
                                  : <Square className="w-5 h-5" strokeWidth={1.5} />
                                }
                              </button>
                            )}

                            <div className="flex-shrink-0 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:bg-[rgba(38,119,141,0.08)] transition-colors">
                              <FileIcon mimeType={file.mimeType} fileName={file.name} isFolder={false} size="w-6 h-6" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#26778D] dark:group-hover:text-[#4DADC4] transition-colors line-clamp-2 text-sm leading-tight">
                                {file.name}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {file.size && <span>{formatFileSize(file.size)}</span>}
                                {file.modifiedTime && <span>{formatDate(file.modifiedTime)}</span>}
                              </div>
                            </div>

                            {/* Delete (owner or admin) */}
                            {isSignedIn && (file.id && file.id.includes(userId) || isAdmin) && !selectMode && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteFile(file); }}
                                className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                                  isAdmin && (!file.id || !file.id.includes(userId))
                                    ? 'hover:bg-orange-100 dark:hover:bg-orange-900/30'
                                    : 'hover:bg-red-100 dark:hover:bg-red-900/30'
                                }`}
                                title={isAdmin && (!file.id || !file.id.includes(userId)) ? 'Eliminar (Admin)' : 'Eliminar archivo'}
                              >
                                <XMarkIcon className={`w-4 h-4 ${
                                  isAdmin && (!file.id || !file.id.includes(userId))
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`} />
                              </button>
                            )}

                            {/* Favorite star — visible to EVERYONE, prompts login if not signed in */}
                            {!selectMode && (
                              <button
                                onClick={(e) => handleToggleFavorite(file, e)}
                                className="flex-shrink-0 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                title={!isSignedIn ? 'Iniciá sesión para guardar favoritos' : favored ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                              >
                                {favored ? (
                                  <StarIconSolid className="w-4 h-4 text-yellow-500" />
                                ) : (
                                  <StarIcon className={`w-4 h-4 transition-colors ${
                                    isSignedIn
                                      ? 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`} />
                                )}
                              </button>
                            )}

                            {!selectMode && (
                              <ArrowTopRightOnSquareIcon className="flex-shrink-0 w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-[#26778D] dark:group-hover:text-[#4DADC4] transition-colors" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <LoginPromptModal
        open={loginPrompt.open}
        onClose={closeLogin}
        reason={loginPrompt.reason}
      />
    </div>
  );
};

export default SecureDriveExplorer;
