/**
 * Point d'entrée principal de l'application React
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Vérifications de compatibilité
const checkBrowserCompatibility = () => {
  const features = {
    mediaDevices: 'mediaDevices' in navigator,
    webgl: (() => {
      try {
        const canvas = document.createElement('canvas')
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      } catch {
        return false
      }
    })(),
    indexedDB: 'indexedDB' in window
  }
  
  const missing = Object.entries(features)
    .filter(([_, supported]) => !supported)
    .map(([feature]) => feature)
  
  if (missing.length > 0) {
    console.warn('⚠️ Fonctionnalités manquantes:', missing)
  } else {
    console.log('✅ Toutes les fonctionnalités requises sont disponibles')
  }
  
  return missing.length === 0
}

// Vérifier la compatibilité avant de monter l'app
const isCompatible = checkBrowserCompatibility()

if (!isCompatible) {
  document.body.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      padding: 2rem;
      text-align: center;
      background: #0f172a;
      color: #f1f5f9;
    ">
      <h1 style="font-size: 2rem; margin-bottom: 1rem;">
        Navigateur non compatible
      </h1>
      <p style="color: #94a3b8; max-width: 500px;">
        Votre navigateur ne supporte pas toutes les fonctionnalités requises.
        Veuillez utiliser un navigateur moderne (Chrome, Firefox, Safari, Edge).
      </p>
    </div>
  `
} else {
  // Monter l'application React
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
