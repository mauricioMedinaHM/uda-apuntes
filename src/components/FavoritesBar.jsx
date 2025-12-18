import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { StarIcon, ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { removeFavorite, downloadFavoritesAsZip } from '../services/favoritesService';
import FileIcon from './FileIcon';

const FavoritesBar = ({ favorites, onFavoritesChange, onPreview }) => {
    const { getToken } = useAuth();
    const [downloading, setDownloading] = useState(false);

    const handleRemoveFavorite = async (fileId) => {
        try {
            const token = await getToken();
            await removeFavorite(fileId, token);
            onFavoritesChange();
        } catch (error) {
            console.error('Error removing favorite:', error);
            alert('Error al quitar de favoritos');
        }
    };

    const handleDownloadAll = async () => {
        try {
            setDownloading(true);
            const token = await getToken();
            await downloadFavoritesAsZip(token);
        } catch (error) {
            console.error('Error downloading ZIP:', error);
            alert('Error al descargar favoritos');
        } finally {
            setDownloading(false);
        }
    };

    if (!favorites || favorites.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                    <StarIcon className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Favoritos</h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No tienes archivos favoritos. Marca archivos con la estrella para acceso rápido.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <StarIcon className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Favoritos ({favorites.length})
                    </h2>
                </div>
                <button
                    onClick={handleDownloadAll}
                    disabled={downloading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors text-sm"
                >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    {downloading ? 'Descargando...' : 'Descargar Todo (ZIP)'}
                </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
                {favorites.map((favorite) => (
                    <div
                        key={favorite.id}
                        className="group relative flex-shrink-0 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer min-w-[180px]"
                        onClick={() => onPreview && onPreview({
                            id: favorite.file_id,
                            name: favorite.file_name,
                            url: favorite.file_url,
                            mimeType: favorite.mime_type,
                            size: favorite.file_size
                        })}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFavorite(favorite.file_id);
                            }}
                            className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Quitar de favoritos"
                        >
                            <XMarkIcon className="w-4 h-4 text-red-500" />
                        </button>

                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-white dark:bg-gray-800 rounded">
                                <FileIcon
                                    mimeType={favorite.mime_type}
                                    fileName={favorite.file_name}
                                    isFolder={false}
                                    size="w-5 h-5"
                                />
                            </div>
                            <StarIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        </div>

                        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                            {favorite.file_name}
                        </h4>

                        {favorite.file_size && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatFileSize(favorite.file_size)}
                            </p>
                        )}
                    </div>
                ))}
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

export default FavoritesBar;
