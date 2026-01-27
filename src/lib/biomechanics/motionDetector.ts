/**
 * Détecteur de mouvement pour identifier automatiquement
 * le début et la fin d'un lancer de fléchettes
 */

import type { Pose } from '@/types'

/**
 * État du mouvement détecté
 */
export type MotionState = 
  | 'idle'           // Au repos, en attente
  | 'preparing'      // Mouvement détecté, préparation
  | 'throwing'       // Lancer en cours
  | 'completed'      // Lancer terminé

/**
 * Configuration du détecteur
 */
interface MotionDetectorConfig {
  dominantHand: 'left' | 'right'
  velocityThreshold: number      // Seuil de vélocité pour détecter le mouvement (px/frame)
  stabilityFrames: number         // Nombre de frames stables pour confirmer la fin
  minThrowDuration: number        // Durée minimale d'un lancer (ms)
  maxThrowDuration: number        // Durée maximale d'un lancer (ms)
}

/**
 * Détecteur de mouvement de lancer
 */
export class MotionDetector {
  private config: MotionDetectorConfig
  private state: MotionState = 'idle'
  private previousPose: Pose | null = null
  private throwStartTime: number = 0
  private stableFrameCount: number = 0
  private posesBuffer: Pose[] = []
  
  constructor(config: Partial<MotionDetectorConfig> = {}) {
    this.config = {
      dominantHand: config.dominantHand || 'right',
      velocityThreshold: config.velocityThreshold || 20,      // pixels par frame (équilibré)
      stabilityFrames: config.stabilityFrames || 20,          // ~0.7s à 30fps
      minThrowDuration: config.minThrowDuration || 500,       // 500ms minimum
      maxThrowDuration: config.maxThrowDuration || 3500       // 3.5s maximum
    }
  }
  
  /**
   * Traite une nouvelle pose et met à jour l'état du mouvement
   */
  public processPose(pose: Pose): {
    state: MotionState
    poses?: Pose[]  // Retourné quand le lancer est complété
  } {
    const now = Date.now()
    
    // Calculer la vélocité du poignet
    const velocity = this.calculateWristVelocity(pose)
    
    // Debug désactivé en production
    // if (velocity > 5) console.log(`Vélocité: ${velocity.toFixed(1)} | État: ${this.state}`)
    
    // Machine à états
    switch (this.state) {
      case 'idle':
        // Attendre un mouvement significatif
        if (velocity > this.config.velocityThreshold) {
          // console.log('🎯 Mouvement détecté !')
          this.state = 'preparing'
          this.throwStartTime = now
          this.posesBuffer = [pose]
          this.stableFrameCount = 0
        }
        break
        
      case 'preparing':
        this.posesBuffer.push(pose)
        
        // Si le mouvement continue et s'accélère, c'est le lancer
        if (velocity > this.config.velocityThreshold * 1.5) {
          // console.log('🚀 Lancer en cours !')
          this.state = 'throwing'
        }
        
        // Si retour au calme trop vite, faux départ
        if (velocity < this.config.velocityThreshold * 0.3) {
          this.stableFrameCount++
          if (this.stableFrameCount > 5) {
            this.reset()
          }
        } else {
          this.stableFrameCount = 0
        }
        
        // Timeout
        if (now - this.throwStartTime > this.config.maxThrowDuration) {
          this.reset()
        }
        break
        
      case 'throwing':
        this.posesBuffer.push(pose)
        
        // Détecter la fin du mouvement (retour au calme)
        if (velocity < this.config.velocityThreshold * 0.4) {
          this.stableFrameCount++
          
          // Si stable pendant N frames et durée suffisante
          if (this.stableFrameCount >= this.config.stabilityFrames) {
            const duration = now - this.throwStartTime
            
            if (duration >= this.config.minThrowDuration) {
              // Lancer valide !
              console.log(`✅ Lancer ${this.posesBuffer.length} frames en ${(duration/1000).toFixed(1)}s`)
              this.state = 'completed'
              const completedPoses = [...this.posesBuffer]
              this.reset()
              
              return {
                state: 'completed',
                poses: completedPoses
              }
            } else {
              // Trop court, probablement un faux mouvement
              // console.log('Mouvement trop court, ignoré')
              this.reset()
            }
          }
        } else {
          // Mouvement continue
          this.stableFrameCount = 0
        }
        
        // Timeout
        if (now - this.throwStartTime > this.config.maxThrowDuration) {
          console.warn('⚠️ Lancer trop long, abandon')
          this.reset()
        }
        break
        
      case 'completed':
        // Attendre retour à idle (géré par reset)
        break
    }
    
    this.previousPose = pose
    
    return { state: this.state }
  }
  
  /**
   * Calcule la vélocité du poignet entre deux frames
   */
  private calculateWristVelocity(pose: Pose): number {
    if (!this.previousPose) return 0
    
    const wristKey = this.config.dominantHand === 'right' ? 'right_wrist' : 'left_wrist'
    
    const currentWrist = pose.keypoints.find(kp => kp.name === wristKey)
    const previousWrist = this.previousPose.keypoints.find(kp => kp.name === wristKey)
    
    if (!currentWrist || !previousWrist || 
        currentWrist.score < 0.3 || previousWrist.score < 0.3) {
      return 0
    }
    
    const dx = currentWrist.x - previousWrist.x
    const dy = currentWrist.y - previousWrist.y
    
    return Math.sqrt(dx * dx + dy * dy)
  }
  
  /**
   * Réinitialise le détecteur
   */
  private reset() {
    this.state = 'idle'
    this.posesBuffer = []
    this.stableFrameCount = 0
    this.throwStartTime = 0
  }
  
  /**
   * Réinitialise manuellement le détecteur
   */
  public resetManually() {
    this.reset()
  }
  
  /**
   * Retourne l'état actuel
   */
  public getState(): MotionState {
    return this.state
  }
  
  /**
   * Retourne la durée du lancer en cours (ms)
   */
  public getCurrentDuration(): number {
    if (this.state === 'idle') return 0
    return Date.now() - this.throwStartTime
  }
  
  /**
   * Retourne le nombre de poses capturées
   */
  public getCapturedFrames(): number {
    return this.posesBuffer.length
  }
}

/**
 * Crée un détecteur de mouvement
 */
export function createMotionDetector(dominantHand: 'left' | 'right' = 'right'): MotionDetector {
  return new MotionDetector({ dominantHand })
}
