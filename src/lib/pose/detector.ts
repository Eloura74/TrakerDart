/**
 * Module de détection de pose avec TensorFlow.js et MoveNet
 * Gère l'initialisation, la détection et le dessin du squelette
 */

import * as poseDetection from '@tensorflow-models/pose-detection'
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import type { Pose, Keypoint } from '@/types'

/**
 * Détecteur de pose (singleton)
 */
let detector: poseDetection.PoseDetector | null = null

/**
 * Configuration du modèle MoveNet
 */
export interface DetectorConfig {
  modelType: 'lightning' | 'thunder'  // lightning = rapide, thunder = précis
  enableSmoothing: boolean
  minPoseScore: number
  minKeypointScore: number
}

/**
 * Configuration par défaut optimisée pour mobile
 */
export const DEFAULT_CONFIG: DetectorConfig = {
  modelType: 'lightning',  // Plus rapide pour mobile
  enableSmoothing: true,   // Lissage des résultats
  minPoseScore: 0.25,      // Seuil de confiance minimal pour la pose
  minKeypointScore: 0.3    // Seuil de confiance minimal pour les keypoints
}

/**
 * Initialise le détecteur de pose
 * @param config - Configuration du détecteur
 * @returns Promesse du détecteur initialisé
 */
export async function initPoseDetector(
  config: DetectorConfig = DEFAULT_CONFIG
): Promise<poseDetection.PoseDetector> {
  try {
    // Si déjà initialisé, retourner l'instance existante
    if (detector) {
      return detector
    }
    
    console.log('🔧 Initialisation du backend TensorFlow...')
    
    // Forcer l'utilisation du backend WebGL (plus compatible que WebGPU)
    await tf.setBackend('webgl')
    await tf.ready()
    
    console.log('✅ Backend TensorFlow prêt:', tf.getBackend())
    
    // Configuration du modèle MoveNet
    const model = poseDetection.SupportedModels.MoveNet
    const detectorConfig: poseDetection.MoveNetModelConfig = {
      modelType: config.modelType === 'lightning' 
        ? poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        : poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
      enableSmoothing: config.enableSmoothing,
      minPoseScore: config.minPoseScore
    }
    
    console.log('📦 Chargement du modèle MoveNet...')
    
    // Création du détecteur
    detector = await poseDetection.createDetector(model, detectorConfig)
    
    console.log('✅ Détecteur de pose initialisé:', config.modelType)
    
    return detector
  } catch (error) {
    console.error('❌ Erreur initialisation détecteur:', error)
    throw new Error('Impossible d\'initialiser le détecteur de pose')
  }
}

/**
 * Détecte les poses dans une image/vidéo
 * @param input - Élément HTML (video, image, canvas)
 * @param timestamp - Timestamp actuel (ms)
 * @param minKeypointScore - Score minimal pour les keypoints
 * @returns Pose détectée ou null
 */
export async function detectPose(
  input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
  timestamp: number = Date.now(),
  minKeypointScore: number = 0.3
): Promise<Pose | null> {
  if (!detector) {
    throw new Error('Détecteur non initialisé. Appeler initPoseDetector() d\'abord.')
  }
  
  try {
    // Détection des poses
    const poses = await detector.estimatePoses(input)
    
    // MoveNet retourne une seule pose (single-pose model)
    if (poses.length === 0) {
      return null
    }
    
    const tfPose = poses[0]
    
    // Filtrer les keypoints avec score insuffisant
    const validKeypoints: Keypoint[] = tfPose.keypoints
      .filter(kp => (kp.score ?? 0) >= minKeypointScore)
      .map(kp => ({
        x: kp.x,
        y: kp.y,
        score: kp.score ?? 0,
        name: kp.name
      }))
    
    // Si trop peu de keypoints détectés, rejeter la pose
    if (validKeypoints.length < 8) {
      return null
    }
    
    return {
      keypoints: validKeypoints,
      score: tfPose.score ?? 0,
      timestamp
    }
  } catch (error) {
    console.error('Erreur détection pose:', error)
    return null
  }
}

/**
 * Détecte les poses en continu depuis une vidéo
 * @param video - Élément vidéo
 * @param onPoseDetected - Callback appelé à chaque pose détectée
 * @param minKeypointScore - Score minimal pour les keypoints
 * @returns Fonction d'arrêt
 */
export function detectPosesFromVideo(
  video: HTMLVideoElement,
  onPoseDetected: (pose: Pose) => void,
  minKeypointScore: number = 0.3
): () => void {
  let isRunning = true
  let animationFrameId: number
  
  const detect = async () => {
    if (!isRunning) return
    
    try {
      const pose = await detectPose(video, Date.now(), minKeypointScore)
      
      if (pose) {
        onPoseDetected(pose)
      }
    } catch (error) {
      console.error('Erreur détection continue:', error)
    }
    
    // Continuer la détection
    if (isRunning) {
      animationFrameId = requestAnimationFrame(detect)
    }
  }
  
  // Démarrer la détection
  detect()
  
  // Retourner la fonction d'arrêt
  return () => {
    isRunning = false
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }
}

/**
 * Dessine le squelette sur un canvas
 * @param canvas - Canvas cible
 * @param pose - Pose à dessiner
 * @param options - Options de dessin
 */
export function drawPose(
  canvas: HTMLCanvasElement,
  pose: Pose,
  options: {
    drawKeypoints?: boolean
    drawSkeleton?: boolean
    keypointColor?: string
    skeletonColor?: string
    lineWidth?: number
    keypointRadius?: number
  } = {}
) {
  const {
    drawKeypoints = true,
    drawSkeleton = true,
    keypointColor = '#00ff00',
    skeletonColor = '#00ff00',
    lineWidth = 2,
    keypointRadius = 4
  } = options
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // Dessiner les connexions (squelette)
  if (drawSkeleton) {
    ctx.strokeStyle = skeletonColor
    ctx.lineWidth = lineWidth
    
    // Connexions du corps selon le modèle MoveNet
    const connections = getSkeletonConnections()
    
    for (const [startName, endName] of connections) {
      const start = pose.keypoints.find(kp => kp.name === startName)
      const end = pose.keypoints.find(kp => kp.name === endName)
      
      if (start && end && start.score > 0.3 && end.score > 0.3) {
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.stroke()
      }
    }
  }
  
  // Dessiner les keypoints
  if (drawKeypoints) {
    for (const kp of pose.keypoints) {
      if (kp.score < 0.3) continue
      
      // Couleur basée sur la confiance (vert = bon, jaune = moyen, rouge = faible)
      const hue = kp.score * 120 // 120 = vert, 0 = rouge
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
      
      ctx.beginPath()
      ctx.arc(kp.x, kp.y, keypointRadius, 0, 2 * Math.PI)
      ctx.fill()
      
      // Optionnel: afficher le nom du keypoint
      if (kp.name) {
        ctx.fillStyle = '#ffffff'
        ctx.font = '10px Arial'
        ctx.fillText(kp.name, kp.x + 5, kp.y - 5)
      }
    }
  }
}

/**
 * Retourne les connexions du squelette humain pour MoveNet
 */
function getSkeletonConnections(): Array<[string, string]> {
  return [
    // Tête
    ['nose', 'left_eye'],
    ['nose', 'right_eye'],
    ['left_eye', 'left_ear'],
    ['right_eye', 'right_ear'],
    
    // Tronc
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_hip', 'right_hip'],
    
    // Bras gauche
    ['left_shoulder', 'left_elbow'],
    ['left_elbow', 'left_wrist'],
    
    // Bras droit
    ['right_shoulder', 'right_elbow'],
    ['right_elbow', 'right_wrist'],
    
    // Jambe gauche
    ['left_hip', 'left_knee'],
    ['left_knee', 'left_ankle'],
    
    // Jambe droite
    ['right_hip', 'right_knee'],
    ['right_knee', 'right_ankle']
  ]
}

/**
 * Nettoie le détecteur et libère les ressources
 */
export async function disposePoseDetector(): Promise<void> {
  if (detector) {
    detector.dispose()
    detector = null
    console.log('🗑️ Détecteur de pose nettoyé')
  }
}

/**
 * Vérifie si le détecteur est initialisé
 */
export function isDetectorReady(): boolean {
  return detector !== null
}

/**
 * Redimensionne le canvas pour correspondre à la source vidéo
 * tout en conservant le ratio d'aspect
 * @param canvas - Canvas à redimensionner
 * @param video - Source vidéo
 */
export function resizeCanvas(canvas: HTMLCanvasElement, video: HTMLVideoElement): void {
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
}

/**
 * Efface complètement le canvas
 * @param canvas - Canvas à effacer
 */
export function clearCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

/**
 * Copie la frame vidéo sur le canvas
 * @param canvas - Canvas cible
 * @param video - Source vidéo
 */
export function drawVideoFrame(canvas: HTMLCanvasElement, video: HTMLVideoElement): void {
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  }
}
