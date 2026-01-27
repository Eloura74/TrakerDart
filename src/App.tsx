/**
 * Composant principal de l'application
 * Gère le routing et la structure globale
 */

import { useState, useEffect } from 'react'
import { HomePage } from './pages/HomePage'
import { CapturePageAuto } from './pages/CapturePageAuto'
import { AnalysisPage } from './pages/AnalysisPage'
import { HistoryPage } from './pages/HistoryPage'
import { CalibrationPage } from './pages/CalibrationPage'
import './index.css'

/**
 * Router basique avec hash routing
 * Format des routes:
 * - #/ ou #/home → HomePage
 * - #/capture → CapturePage
 * - #/calibration → CalibrationPage
 * - #/analysis/:id → AnalysisPage
 * - #/history → HistoryPage
 */
function App() {
  const [currentRoute, setCurrentRoute] = useState(
    window.location.hash.slice(1) || '/'
  )
  
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash.slice(1) || '/')
    }
    
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])
  
  // Parser la route pour extraire les paramètres
  const parseRoute = (route: string) => {
    const parts = route.split('/')
    return {
      path: parts[1] || '',
      param: parts[2] || undefined
    }
  }
  
  // Router basique
  const renderPage = () => {
    const { path, param } = parseRoute(currentRoute)
    
    switch (path) {
      case '':
      case 'home':
        return <HomePage />
      
      case 'capture':
        return <CapturePageAuto />
      
      case 'calibration':
        return <CalibrationPage />
      
      case 'analysis':
        return <AnalysisPage volleyId={param} />
      
      case 'history':
        return <HistoryPage />
      
      default:
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-muted-foreground mb-4">Page non trouvée</p>
              <button
                onClick={() => { window.location.hash = '#/' }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        )
    }
  }
  
  return (
    <div className="app">
      {renderPage()}
    </div>
  )
}

export default App
