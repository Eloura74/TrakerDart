/**
 * Hook personnalisé pour gérer la caméra
 * Simplifie l'accès et la gestion du flux vidéo
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/useAppStore'

export interface UseCameraOptions {
  autoStart?: boolean
  facingMode?: 'user' | 'environment'
  onError?: (error: Error) => void
}

/**
 * Hook de gestion de la caméra
 */
export function useCamera(options: UseCameraOptions = {}) {
  const { autoStart = false, facingMode = 'user', onError } = options
  
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const { setCameraConfig } = useAppStore()
  
  /**
   * Démarre le flux caméra
   */
  const start = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Configuration des contraintes
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false
      }
      
      // Demander l'accès
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      // Attacher au élément vidéo
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      
      // Sauvegarder la configuration
      const videoTrack = stream.getVideoTracks()[0]
      const settings = videoTrack.getSettings()
      
      setCameraConfig({
        deviceId: settings.deviceId,
        facingMode,
        resolution: {
          width: settings.width || 1280,
          height: settings.height || 720
        },
        frameRate: settings.frameRate || 30
      })
      
      setIsActive(true)
      setIsLoading(false)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur caméra inconnue')
      setError(error)
      setIsLoading(false)
      onError?.(error)
    }
  }, [facingMode, setCameraConfig, onError])
  
  /**
   * Arrête le flux caméra
   */
  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsActive(false)
  }, [])
  
  /**
   * Bascule entre démarrer et arrêter
   */
  const toggle = useCallback(() => {
    if (isActive) {
      stop()
    } else {
      start()
    }
  }, [isActive, start, stop])
  
  /**
   * Capture une frame comme image
   */
  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !isActive) return null
    
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    
    ctx.drawImage(videoRef.current, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.8)
  }, [isActive])
  
  /**
   * Démarre automatiquement si demandé
   */
  useEffect(() => {
    if (autoStart) {
      start()
    }
    
    return () => {
      stop()
    }
  }, [autoStart, start, stop])
  
  return {
    videoRef,
    stream: streamRef.current,
    isActive,
    isLoading,
    error,
    start,
    stop,
    toggle,
    captureFrame
  }
}
