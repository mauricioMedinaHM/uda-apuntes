import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { SearchProvider } from './context/SearchContext'
import { DarkModeProvider } from './contexts/DarkModeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'

const Home = lazy(() => import('./pages/Home'))
const Ranking = lazy(() => import('./pages/Ranking'))
const GenerateRanking = lazy(() => import('./pages/GenerateRanking'))
const ProgramView = lazy(() => import('./pages/ProgramView'))
const SubjectView = lazy(() => import('./pages/SubjectView'))
const Information = lazy(() => import('./pages/Information'))
const Contact = lazy(() => import('./pages/Contact'))
const SearchResults = lazy(() => import('./pages/SearchResults'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

// Componente para rutas públicas que redirige si ya está autenticado
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Layout para rutas públicas con Header y Footer
const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas con Header y Footer */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <Home />
            </Suspense>
          </PublicLayout>
        }
      />
      <Route
        path="/ranking"
        element={
          <PublicLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <Ranking />
            </Suspense>
          </PublicLayout>
        }
      />
      <Route
        path="/generate-ranking"
        element={
          <PublicLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <GenerateRanking />
            </Suspense>
          </PublicLayout>
        }
      />
      <Route
        path="/search"
        element={
          <PublicLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <SearchResults />
            </Suspense>
          </PublicLayout>
        }
      />
      <Route
        path="/program/:programId"
        element={
          <PublicLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <ProgramView />
            </Suspense>
          </PublicLayout>
        }
      />
      <Route
        path="/program/:programId/year/:yearId"
        element={
          <PublicLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <SubjectView />
            </Suspense>
          </PublicLayout>
        }
      />
      <Route
        path="/information"
        element={
          <PublicLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <Information />
            </Suspense>
          </PublicLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <Contact />
            </Suspense>
          </PublicLayout>
        }
      />
      {/* Ruta de Login sin Header/Footer */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Login />
            </Suspense>
          </PublicRoute>
        }
      />
      {/* Ruta de Dashboard protegida sin Header/Footer */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <SearchProvider>
          <Router>
            <AppRoutes />
          </Router>
        </SearchProvider>
      </AuthProvider>
    </DarkModeProvider>
  )
}

export default App
