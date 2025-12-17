import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { SearchProvider } from './context/SearchContext'
import { DarkModeProvider } from './contexts/DarkModeContext'
import Header from './components/Header'
import Footer from './components/Footer'
import LoadingSpinner from './components/LoadingSpinner'

const Home = lazy(() => import('./pages/Home'))
const Archivos = lazy(() => import('./pages/Archivos'))
const Ranking = lazy(() => import('./pages/Ranking'))
const GenerateRanking = lazy(() => import('./pages/GenerateRanking'))
const ProgramView = lazy(() => import('./pages/ProgramView'))
const SubjectView = lazy(() => import('./pages/SubjectView'))
const Information = lazy(() => import('./pages/Information'))
const Contact = lazy(() => import('./pages/Contact'))
const SearchResults = lazy(() => import('./pages/SearchResults'))

function App() {
  return (
    <DarkModeProvider>
      <SearchProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
            <Header />
            <main className="flex-1">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/archivos" element={<Archivos />} />
                  <Route path="/ranking" element={<Ranking />} />
                  <Route path="/generate-ranking" element={<GenerateRanking />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/program/:programId" element={<ProgramView />} />
                  <Route path="/program/:programId/year/:yearId" element={<SubjectView />} />
                  <Route path="/information" element={<Information />} />
                  <Route path="/contact" element={<Contact />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </Router>
      </SearchProvider>
    </DarkModeProvider>
  )
}

export default App
