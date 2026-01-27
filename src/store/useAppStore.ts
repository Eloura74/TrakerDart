/**
 * Store global de l'application avec Zustand
 * Gère l'état de configuration, session, et UI
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppState,
  CameraConfig,
  Calibration,
  UserPreferences,
  TrainingSession,
  Volley
} from '@/types'

/**
 * Actions du store
 */
interface AppActions {
  // Configuration caméra
  setCameraConfig: (config: CameraConfig) => void
  setCalibration: (calibration: Calibration) => void
  
  // Préférences utilisateur
  setPreferences: (preferences: Partial<UserPreferences>) => void
  
  // Session d'entraînement
  startSession: () => void
  endSession: () => void
  addVolleyToSession: (volley: Volley) => void
  
  // Volée en cours
  setCurrentVolley: (volley: Partial<Volley> | null) => void
  
  // États UI
  setRecording: (isRecording: boolean) => void
  setAnalyzing: (isAnalyzing: boolean) => void
  setError: (error: string | null) => void
  
  // Historique
  addSession: (session: TrainingSession) => void
  deleteSession: (sessionId: string) => void
  
  // Reset
  reset: () => void
}

/**
 * État initial
 */
const initialState: AppState = {
  cameraConfig: null,
  calibration: null,
  preferences: {
    language: 'fr',
    units: 'metric',
    analysisDetail: 'intermediate',
    soundEnabled: false,
    vibrationEnabled: true,
    theme: 'dark'
  },
  currentSession: null,
  currentVolley: null,
  sessions: [],
  isRecording: false,
  isAnalyzing: false,
  error: null
}

/**
 * Store principal de l'application
 */
export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Configuration caméra
      setCameraConfig: (config) => set({ cameraConfig: config }),
      
      setCalibration: (calibration) => {
        console.log('✅ Calibration sauvegardée:', calibration)
        set({ calibration })
      },
      
      // Préférences
      setPreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences }
        })),
      
      // Session d'entraînement
      startSession: () => {
        const session: TrainingSession = {
          id: `session-${Date.now()}`,
          volleys: [],
          stats: {
            totalThrows: 0,
            averageConsistency: 0,
            averageTechnicalScore: 0,
            consistencyTrend: 'stable'
          },
          createdAt: Date.now(),
          duration: 0
        }
        set({ currentSession: session })
      },
      
      endSession: () => {
        const { currentSession } = get()
        if (!currentSession) return
        
        // Calculer la durée finale
        const endedSession: TrainingSession = {
          ...currentSession,
          endedAt: Date.now(),
          duration: Date.now() - currentSession.createdAt
        }
        
        // Ajouter à l'historique
        set((state) => ({
          sessions: [...state.sessions, endedSession],
          currentSession: null
        }))
      },
      
      addVolleyToSession: (volley) => {
        set((state) => {
          if (!state.currentSession) return state
          
          const volleys = [...state.currentSession.volleys, volley]
          
          // Recalculer les stats
          const totalThrows = volleys.length * 3
          const consistencies = volleys.map(v => v.comparison.consistencyIndex)
          const averageConsistency =
            consistencies.reduce((sum, c) => sum + c, 0) / consistencies.length
          
          const technicalScores = volleys.flatMap(v =>
            v.throws.map(t => t.analysis.technicalScore)
          )
          const averageTechnicalScore =
            technicalScores.reduce((sum, s) => sum + s, 0) / technicalScores.length
          
          // Détecter la tendance (simple: comparer première et dernière moitié)
          const halfPoint = Math.floor(consistencies.length / 2)
          const firstHalf = consistencies.slice(0, halfPoint)
          const secondHalf = consistencies.slice(halfPoint)
          const firstAvg = firstHalf.reduce((sum, c) => sum + c, 0) / firstHalf.length
          const secondAvg = secondHalf.reduce((sum, c) => sum + c, 0) / secondHalf.length
          
          let consistencyTrend: 'improving' | 'stable' | 'declining' = 'stable'
          if (secondAvg > firstAvg + 5) consistencyTrend = 'improving'
          else if (secondAvg < firstAvg - 5) consistencyTrend = 'declining'
          
          // Meilleure volée
          const bestVolley = volleys.reduce((best, current) =>
            current.comparison.consistencyIndex > best.comparison.consistencyIndex
              ? current
              : best
          , volleys[0])
          
          return {
            currentSession: {
              ...state.currentSession,
              volleys,
              stats: {
                totalThrows,
                averageConsistency,
                averageTechnicalScore,
                consistencyTrend,
                bestVolley: {
                  id: bestVolley.id,
                  consistencyIndex: bestVolley.comparison.consistencyIndex
                }
              }
            }
          }
        })
      },
      
      // Volée en cours
      setCurrentVolley: (volley) => set({ currentVolley: volley }),
      
      // États UI
      setRecording: (isRecording) => set({ isRecording }),
      setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      setError: (error) => set({ error }),
      
      // Historique
      addSession: (session) =>
        set((state) => ({
          sessions: [...state.sessions, session]
        })),
      
      deleteSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.filter(s => s.id !== sessionId)
        })),
      
      // Reset complet
      reset: () => set(initialState)
    }),
    {
      name: 'trakerdart-storage', // Nom dans localStorage
      partialize: (state) => ({
        // Ne persister que certaines parties de l'état
        cameraConfig: state.cameraConfig,
        calibration: state.calibration,
        preferences: state.preferences,
        sessions: state.sessions
        // Ne PAS persister: currentSession, currentVolley, isRecording, isAnalyzing, error
      })
    }
  )
)

/**
 * Sélecteurs pour accès optimisé
 */
export const selectCameraConfig = (state: AppState & AppActions) => state.cameraConfig
export const selectCalibration = (state: AppState & AppActions) => state.calibration
export const selectPreferences = (state: AppState & AppActions) => state.preferences
export const selectCurrentSession = (state: AppState & AppActions) => state.currentSession
export const selectSessions = (state: AppState & AppActions) => state.sessions
export const selectIsRecording = (state: AppState & AppActions) => state.isRecording
export const selectIsAnalyzing = (state: AppState & AppActions) => state.isAnalyzing
