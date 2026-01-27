/**
 * Hook personnalisé pour la détection de pose
 * Gère l'initialisation et la détection continue
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { initPoseDetector, detectPose, isDetectorReady } from '@/lib/pose/detector'
import type { Pose } from '@/types'

export interface UsePoseDetectionOptions {
  enabled?: boolean
  minKeypointScore?: number
  onPoseDetected?: (pose: Pose) => void
  throttle?: number // ms entre chaque détection
}

/**
 * Hook de détection de pose
 */
export function usePoseDetection(
  videoElement: HTMLVideoElement | null,
  options: UsePoseDetectionOptions = {}
) {
  const {
    enabled = true,
    minKeypointScore = 0.3,
    onPoseDetected,
    throttle = 0
  } = options
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [latestPose, setLatestPose] = useState<Pose | null>(null)
  const [fps, setFps] = useState(0)
  
  const animationFrameRef = useRef<number>()
  const lastDetectionTimeRef = useRef(0)
  const fpsCounterRef = useRef({ frames: 0, lastTime: 0 })
  
  /**
   * Initialise le détecteur
   */
  useEffect(() => {
    const init = async () => {
      if (isDetectorReady()) {
        setIsInitialized(true)
        return
      }
      
      try {
        await initPoseDetector()
        setIsInitialized(true)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur initialisation détecteur')
        setError(error)
      }
    }
    
    init()
  }, [])
  
  /**
   * Détection continue
   */
  useEffect(() => {
    if (!enabled || !isInitialized || !videoElement) {
      setIsDetecting(false)
      return
    }
    
    let isRunning = true
    setIsDetecting(true)
    
    const detect = async () => {
      if (!isRunning) return
      
      const now = Date.now()
      
      // Throttling
      if (throttle > 0 && now - lastDetectionTimeRef.current < throttle) {
        animationFrameRef.current = requestAnimationFrame(detect)
        return
      }
      
      try {
        const pose = await detectPose(videoElement, now, minKeypointScore)
        
        if (pose) {
          setLatestPose(pose)
          onPoseDetected?.(pose)
          
          // Calcul FPS
          fpsCounterRef.current.frames++
          if (now - fpsCounterRef.current.lastTime >= 1000) {
            setFps(fpsCounterRef.current.frames)
            fpsCounterRef.current.frames = 0
            fpsCounterRef.current.lastTime = now
          }
        }
        
        lastDetectionTimeRef.current = now
      } catch (err) {
        console.error('Erreur détection:', err)
      }
      
      if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(detect)
      }
    }
    
    detect()
    
    return () => {
      isRunning = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      setIsDetecting(false)
    }
  }, [enabled, isInitialized, videoElement, minKeypointScore, throttle, onPoseDetected])
  
  return {
    isInitialized,
    isDetecting,
    error,
    latestPose,
    fps
  }
}
