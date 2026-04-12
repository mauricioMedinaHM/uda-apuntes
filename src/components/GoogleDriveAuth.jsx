import { useState, useEffect } from 'react';
import { getAuthUrl, getAccessToken, isAuthenticated, logout } from '../services/googleDrive';

const GoogleDriveAuth = ({ onAuthChange }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authenticated = isAuthenticated();
    setIsAuth(authenticated);
    if (onAuthChange) {
      onAuthChange(authenticated);
    }
  }, [onAuthChange]);

  useEffect(() => {
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !isAuth) {
      handleAuthCallback(code);
    }
  }, [isAuth]);

  const handleAuthCallback = async (code) => {
    setLoading(true);
    try {
      await getAccessToken(code);
      setIsAuth(true);
      if (onAuthChange) {
        onAuthChange(true);
      }
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Authentication failed:', error);
      alert('Error de autenticación. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    const authUrl = getAuthUrl();
    window.location.href = authUrl;
  };

  const handleLogout = () => {
    logout();
    setIsAuth(false);
    if (onAuthChange) {
      onAuthChange(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#26778D]"></div>
        <span className="ml-2">Autenticando...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Conectar con Google Drive</h3>
      
      {isAuth ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-green-700 font-medium">Conectado a Google Drive</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Desconectar
          </button>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">
            Conecta tu cuenta de Google Drive para acceder a tus archivos y carpetas.
          </p>
          <button
            onClick={handleLogin}
            className="px-6 py-3 text-white rounded-md transition-colors flex items-center" style={{ background: '#26778D' }} onMouseEnter={e => e.currentTarget.style.background='#1A5E72'} onMouseLeave={e => e.currentTarget.style.background='#26778D'}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Conectar con Google
          </button>
        </div>
      )}
    </div>
  );
};

export default GoogleDriveAuth;