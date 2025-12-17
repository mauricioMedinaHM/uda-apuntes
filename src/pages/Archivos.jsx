import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import SecureDriveExplorer from '../components/SecureDriveExplorer';
import FavoritesBar from '../components/FavoritesBar';
import FilePreviewModal from '../components/FilePreviewModal';
import { getFavorites } from '../services/favoritesService';

const Archivos = () => {
    const { getToken, isSignedIn } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);

    // Load favorites on mount
    useEffect(() => {
        if (isSignedIn) {
            loadFavorites();
        }
    }, [isSignedIn]);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const favs = await getFavorites(token);
            setFavorites(favs);
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = (file) => {
        setPreviewFile(file);
    };

    const closePreview = () => {
        setPreviewFile(null);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
                        📚 Explorador de Archivos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Navega y busca archivos del bucket de Cloudflare R2
                    </p>
                </div>

                {/* Favorites Bar */}
                {isSignedIn && (
                    <div className="mb-8">
                        <FavoritesBar
                            favorites={favorites}
                            onFavoritesChange={loadFavorites}
                            onPreview={handlePreview}
                        />
                    </div>
                )}

                {/* File Explorer */}
                <SecureDriveExplorer
                    rootFolderId=""
                    favorites={favorites}
                    onFavoritesChange={loadFavorites}
                    onPreview={handlePreview}
                />

                {/* Preview Modal */}
                {previewFile && (
                    <FilePreviewModal
                        file={previewFile}
                        onClose={closePreview}
                        favorites={favorites}
                        onFavoritesChange={loadFavorites}
                    />
                )}
            </div>
        </div>
    );
};

export default Archivos;
