import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { XMarkIcon, ArrowDownTrayIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { toggleFavorite, isFavorite } from '../services/favoritesService';
import { getPreviewType, canPreview } from '../services/filePreviewService';
import FileIcon from './FileIcon';

const FilePreviewModal = ({ file, onClose, favorites = [], onFavoritesChange }) => {
    const { getToken, isSignedIn } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isFav, setIsFav] = useState(false);

    useEffect(() => {
        const fileId = file.id || file.path;
        setIsFav(isFavorite(fileId, favorites));
    }, [file, favorites]);

    const previewType = getPreviewType(file.mimeType);
    const canShowPreview = canPreview(file.mimeType);

    const handleToggleFavorite = async () => {
        if (!isSignedIn) {
            alert('Debes iniciar sesión para guardar favoritos');
            return;
        }

        try {
            setIsLoading(true);
            const token = await getToken();
            await toggleFavorite(file, favorites, token);
            setIsFav(!isFav);
            if (onFavoritesChange) {
                onFavoritesChange();
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('Error al actualizar favoritos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (file.url) {
            window.open(file.url, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileIcon
                            mimeType={file.mimeType}
                            fileName={file.name}
                            isFolder={false}
                            size="w-8 h-8"
                        />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {file.name}
                            </h3>
                            {file.size && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatFileSize(file.size)}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isSignedIn && (
                            <button
                                onClick={handleToggleFavorite}
                                disabled={isLoading}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                            >
                                {isFav ? (
                                    <StarIconSolid className="w-6 h-6 text-yellow-500" />
                                ) : (
                                    <StarIcon className="w-6 h-6 text-gray-400" />
                                )}
                            </button>
                        )}

                        <button
                            onClick={handleDownload}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Descargar archivo"
                        >
                            <ArrowDownTrayIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </button>
                    </div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 overflow-auto p-4">
                    {canShowPreview ? (
                        <div className="h-full">
                            {previewType === 'pdf' && (
                                <iframe
                                    src={file.url}
                                    className="w-full h-full min-h-[500px] rounded-lg"
                                    title={file.name}
                                />
                            )}

                            {previewType === 'image' && (
                                <div className="flex items-center justify-center">
                                    <img
                                        src={file.url}
                                        alt={file.name}
                                        className="max-w-full max-h-[600px] rounded-lg"
                                    />
                                </div>
                            )}

                            {previewType === 'text' && (
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <iframe
                                        src={file.url}
                                        className="w-full h-full min-h-[500px] bg-white dark:bg-gray-800 rounded"
                                        title={file.name}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <FileIcon
                                mimeType={file.mimeType}
                                fileName={file.name}
                                isFolder={false}
                                size="w-20 h-20"
                            />
                            <p className="mt-4 text-gray-600 dark:text-gray-400">
                                Vista previa no disponible para este tipo de archivo
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                {file.mimeType}
                            </p>
                            <button
                                onClick={handleDownload}
                                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Abrir archivo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper function
const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default FilePreviewModal;
