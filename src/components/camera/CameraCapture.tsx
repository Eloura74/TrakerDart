/**
 * Composant de capture vidéo avec détection de pose
 * Gère l'accès à la webcam et l'affichage du flux
 */

import { useRef, useEffect, useState } from 'react'
import { Camera, CameraOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'
import { initPoseDetector, detectPosesFromVideo, drawPose } from '@/lib/pose/detector'
import type { Pose } from '@/types'

interface CameraCaptureProps {
  onPoseDetected?: (pose: Pose) => void
  showSkeleton?: boolean
  isRecording?: boolean
}

/**
 * Composant de capture caméra avec overlay de squelette
 */
export function CameraCapture({
  onPoseDetected,
  showSkeleton = true,
  isRecording = false
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detectorReady, setDetectorReady] = useState(false)
  const [fps, setFps] = useState(0)
  
  const { cameraConfig, setCameraConfig } = useAppStore()
  
  /**
   * Initialise le détecteur de pose au montage du composant
   */
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true)
        await initPoseDetector()
        setDetectorReady(true)
      } catch (err) {
        setError('Impossible d\'initialiser la détection de pose')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    init()
  }, [])
  
  /**
   * Démarre le flux caméra
   */
  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Configuration caméra par défaut ou depuis le store
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraConfig?.facingMode || 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false
      }
      
      // Demander l'accès à la caméra
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      // Attacher le flux au élément vidéo
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Attendre que la vidéo soit prête
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              resolve()
            }
          }
        })
        
        await videoRef.current.play()
        
        // Ajuster le canvas à la taille de la vidéo
        if (canvasRef.current && videoRef.current.videoWidth > 0) {
          canvasRef.current.width = videoRef.current.videoWidth
          canvasRef.current.height = videoRef.current.videoHeight
          console.log('✅ Canvas dimensionné:', canvasRef.current.width, 'x', canvasRef.current.height)
        }
      }
      
      // Sauvegarder la config
      const videoTrack = stream.getVideoTracks()[0]
      const settings = videoTrack.getSettings()
      
      setCameraConfig({
        deviceId: settings.deviceId,
        facingMode: cameraConfig?.facingMode || 'user',
        resolution: {
          width: settings.width || 1280,
          height: settings.height || 720
        },
        frameRate: settings.frameRate || 30
      })
      
      setIsActive(true)
    } catch (err) {
      console.error('Erreur accès caméra:', err)
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
    } finally {
      setIsLoading(false)
    }
  }
  
  /**
   * Arrête le flux caméra
   */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsActive(false)
  }
  
  /**
   * Démarre la détection de pose en continu
   */
  useEffect(() => {
    if (!isActive || !detectorReady || !videoRef.current || !canvasRef.current) {
      return
    }
    
    const video = videoRef.current
    const canvas = canvasRef.current
    
    let frameCount = 0
    let lastFpsUpdate = Date.now()
    
    // Callback de détection
    const handlePoseDetected = (pose: Pose) => {
      // Calcul FPS
      frameCount++
      const now = Date.now()
      if (now - lastFpsUpdate >= 1000) {
        setFps(frameCount)
        frameCount = 0
        lastFpsUpdate = now
      }
      
      // Dessiner le squelette sur le canvas
      if (showSkeleton && canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          // Effacer le canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          
          // Dessiner le squelette
          drawPose(canvas, pose, {
            drawKeypoints: true,
            drawSkeleton: true,
            keypointColor: isRecording ? '#ff0000' : '#00ff00',
            skeletonColor: isRecording ? '#ff0000' : '#00ff00',
            lineWidth: 3,
            keypointRadius: 5
          })
        }
      }
      
      // Transmettre la pose au parent
      if (onPoseDetected) {
        onPoseDetected(pose)
      }
    }
    
    // Démarrer la détection continue
    const stopDetection = detectPosesFromVideo(video, handlePoseDetected, 0.3)
    
    // Cleanup
    return () => {
      stopDetection()
    }
  }, [isActive, detectorReady, onPoseDetected, showSkeleton, isRecording])
  
  /**
   * Cleanup au démontage
   */
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* Zone vidéo + canvas overlay */}
      <Card className="relative w-full max-w-4xl aspect-video bg-black overflow-hidden">
        {/* Vidéo (cachée, sert de source) */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />
        
        {/* Canvas pour le squelette */}
        {showSkeleton && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        
        {/* Overlay de statut */}
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
            {error ? (
              <>
                <CameraOff className="w-16 h-16 text-destructive mb-4" />
                <p className="text-destructive text-center px-4">{error}</p>
                <Button
                  onClick={startCamera}
                  className="mt-4"
                  disabled={isLoading}
                >
                  Réessayer
                </Button>
              </>
            ) : (
              <>
                <Camera className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Caméra désactivée
                </p>
                <Button
                  onClick={startCamera}
                  disabled={isLoading || !detectorReady}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Démarrage...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-5 w-5" />
                      Activer la caméra
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}
        
        {/* Indicateur d'enregistrement */}
        {isRecording && isActive && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">REC</span>
          </div>
        )}
        
        {/* Indicateur FPS (debug) */}
        {isActive && fps > 0 && (
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
            <span className="font-mono">{fps} FPS</span>
          </div>
        )}
      </Card>
      
      {/* Contrôles */}
      {isActive && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={stopCamera}
            variant="outline"
          >
            <CameraOff className="mr-2 h-4 w-4" />
            Arrêter la caméra
          </Button>
        </div>
      )}
    </div>
  )
}
