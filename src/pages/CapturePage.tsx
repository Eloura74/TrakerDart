/**
 * Page de capture d'une volée de 3 lancers
 * Gère l'enregistrement séquentiel et l'analyse
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { ArrowLeft, RotateCcw, CheckCircle2, Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CameraCapture } from '@/components/camera/CameraCapture'
import { useAppStore } from '@/store/useAppStore'
import { analyzethrow } from '@/lib/biomechanics/analyzer'
import { compareThrows } from '@/lib/biomechanics/comparison'
import { createMotionDetector, type MotionState } from '@/lib/biomechanics/motionDetector'
import { generateId } from '@/lib/utils'
import type { Pose, Throw, Volley } from '@/types'

type RecordingState = 'idle' | 'ready' | 'detecting' | 'analyzing' | 'completed'

export function CapturePage() {
  const { calibration, currentSession, addVolleyToSession, setAnalyzing } = useAppStore()
  
  // État de la capture
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [currentThrowIndex, setCurrentThrowIndex] = useState(0)
  const [countdown, setCountdown] = useState(3)
  
  // Stockage des poses pendant l'enregistrement
  const posesBufferRef = useRef<Pose[]>([])
  const throwsRef = useRef<Throw[]>([])
  
  // Chronomètre
  const [elapsedTime, setElapsedTime] = useState(0)
  const timerRef = useRef<number>()
  
  /**
   * Démarre le compte à rebours avant l'enregistrement
   */
  const startCountdown = useCallback(() => {
    setRecordingState('countdown')
    setCountdown(3)
    
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          // Démarrer l'enregistrement après le compte à rebours
          setRecordingState('recording')
          setElapsedTime(0)
          posesBufferRef.current = []
          
          // Démarrer le chronomètre
          timerRef.current = setInterval(() => {
            setElapsedTime((t) => t + 100)
          }, 100)
          
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])
  
  /**
   * Arrête l'enregistrement du lancer actuel
   */
  const stopRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    setRecordingState('idle')
    
    // Vérifier qu'on a bien des poses
    if (posesBufferRef.current.length < 10) {
      alert('Enregistrement trop court. Recommencez.')
      return
    }
    
    // Analyser le lancer
    setAnalyzing(true)
    
    try {
      const dominantHand = calibration?.dominantHand || 'right'
      const analysis = analyzethrow(posesBufferRef.current, dominantHand)
      
      // Créer l'objet Throw
      const throwData: Throw = {
        id: generateId(),
        poses: posesBufferRef.current,
        analysis,
        recordedAt: Date.now(),
        duration: elapsedTime
      }
      
      throwsRef.current.push(throwData)
      
      // Si c'est le 3ème lancer, créer la volée
      if (currentThrowIndex === 2) {
        await completeVolley()
      } else {
        // Passer au lancer suivant
        setCurrentThrowIndex((prev) => prev + 1)
      }
    } catch (error) {
      console.error('Erreur analyse:', error)
      alert('Erreur lors de l\'analyse. Recommencez.')
    } finally {
      setAnalyzing(false)
    }
  }, [currentThrowIndex, elapsedTime, calibration, setAnalyzing])
  
  /**
   * Complète la volée et génère la comparaison
   */
  const completeVolley = useCallback(async () => {
    if (throwsRef.current.length !== 3) return
    
    setAnalyzing(true)
    
    try {
      // Comparer les 3 lancers
      const comparison = compareThrows(throwsRef.current as [Throw, Throw, Throw])
      
      // Créer la volée
      const volley: Volley = {
        id: generateId(),
        throws: throwsRef.current as [Throw, Throw, Throw],
        comparison,
        createdAt: Date.now()
      }
      
      // Ajouter à la session
      if (currentSession) {
        addVolleyToSession(volley)
      }
      
      // Passer à l'état terminé
      setRecordingState('completed')
      
      // Rediriger vers l'analyse après 2 secondes
      setTimeout(() => {
        window.location.hash = `#/analysis/${volley.id}`
      }, 2000)
    } catch (error) {
      console.error('Erreur création volée:', error)
      alert('Erreur lors de la création de la volée.')
    } finally {
      setAnalyzing(false)
    }
  }, [currentSession, addVolleyToSession, setAnalyzing])
  
  /**
   * Recommence la volée
   */
  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    setRecordingState('idle')
    setCurrentThrowIndex(0)
    setElapsedTime(0)
    posesBufferRef.current = []
    throwsRef.current = []
  }, [])
  
  /**
   * Callback de détection de pose
   */
  const handlePoseDetected = useCallback((pose: Pose) => {
    if (recordingState === 'recording') {
      posesBufferRef.current.push(pose)
    }
  }, [recordingState])
  
  /**
   * Retour à l'accueil
   */
  const goBack = () => {
    window.location.hash = '#/'
  }
  
  // Calcul du pourcentage de progression
  const progress = ((currentThrowIndex + (recordingState === 'completed' ? 1 : 0)) / 3) * 100
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            
            <div className="text-center">
              <h1 className="text-xl font-bold">Enregistrement</h1>
              <p className="text-sm text-muted-foreground">
                Lancer {currentThrowIndex + 1}/3
              </p>
            </div>
            
            <div className="w-20" /> {/* Spacer pour centrage */}
          </div>
          
          {/* Barre de progression */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>
      
      {/* Zone de capture */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Caméra */}
          <CameraCapture
            onPoseDetected={handlePoseDetected}
            showSkeleton={true}
            isRecording={recordingState === 'recording'}
          />
          
          {/* Compte à rebours */}
          {recordingState === 'countdown' && (
            <Card className="bg-primary/10 border-primary">
              <CardContent className="p-8 text-center">
                <div className="text-6xl font-bold text-primary mb-2">
                  {countdown}
                </div>
                <p className="text-muted-foreground">
                  Préparez-vous...
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* État d'enregistrement */}
          {recordingState === 'recording' && (
            <Card className="bg-red-500/10 border-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                    <div>
                      <p className="font-medium">Enregistrement en cours</p>
                      <p className="text-sm text-muted-foreground">
                        {(elapsedTime / 1000).toFixed(1)}s
                      </p>
                    </div>
                  </div>
                  
                  <Button onClick={stopRecording} variant="destructive">
                    <Square className="mr-2 h-4 w-4" />
                    Arrêter
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Volée terminée */}
          {recordingState === 'completed' && (
            <Card className="bg-success/10 border-success">
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Volée terminée !</h2>
                <p className="text-muted-foreground mb-4">
                  Analyse en cours...
                </p>
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-success" />
              </CardContent>
            </Card>
          )}
          
          {/* Lancers complétés */}
          {throwsRef.current.length > 0 && recordingState !== 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle>Lancers enregistrés</CardTitle>
                <CardDescription>
                  {throwsRef.current.length}/3 lancers complétés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {throwsRef.current.map((throwData, index) => (
                    <div
                      key={throwData.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="success">Lancer {index + 1}</Badge>
                        <div className="text-sm">
                          <p className="font-medium">
                            {(throwData.duration / 1000).toFixed(1)}s
                          </p>
                          <p className="text-muted-foreground">
                            Score: {throwData.analysis.technicalScore}/100
                          </p>
                        </div>
                      </div>
                      
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Instructions */}
          {recordingState === 'idle' && (
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>1. Assurez-vous d'être bien visible dans le cadre</p>
                <p>2. Cliquez sur "Démarrer" quand vous êtes prêt</p>
                <p>3. Effectuez votre lancer après le compte à rebours</p>
                <p>4. Cliquez sur "Arrêter" après le lancer</p>
                <p>5. Répétez pour les 3 lancers</p>
                
                <div className="pt-4 mt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => { window.location.hash = '#/calibration' }}
                  >
                    📍 Aide au positionnement
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Contrôles */}
          <div className="flex gap-3 justify-center">
            {recordingState === 'idle' && (
              <>
                <Button
                  onClick={startCountdown}
                  size="lg"
                  className="min-w-[200px]"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Démarrer le lancer
                </Button>
                
                {throwsRef.current.length > 0 && (
                  <Button onClick={reset} variant="outline" size="lg">
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Recommencer
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
