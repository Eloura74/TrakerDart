/**
 * Module de calcul des angles articulaires
 * Fonctions pour calculer les angles entre segments corporels
 */

import type { Keypoint, Point2D } from '@/types'
import { radToDeg } from '@/lib/utils'

/**
 * Calcule l'angle entre trois points (ABC)
 * L'angle est mesuré au point B
 * @param a - Premier point
 * @param b - Point central (sommet de l'angle)
 * @param c - Troisième point
 * @returns Angle en degrés (0-180)
 */
export function calculateAngle(a: Point2D, b: Point2D, c: Point2D): number {
  // Vecteurs BA et BC
  const ba = { x: a.x - b.x, y: a.y - b.y }
  const bc = { x: c.x - b.x, y: c.y - b.y }
  
  // Produit scalaire
  const dotProduct = ba.x * bc.x + ba.y * bc.y
  
  // Normes des vecteurs
  const magnitudeBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y)
  const magnitudeBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y)
  
  // Éviter la division par zéro
  if (magnitudeBA === 0 || magnitudeBC === 0) {
    return 0
  }
  
  // Calcul de l'angle en radians puis conversion en degrés
  const cosAngle = dotProduct / (magnitudeBA * magnitudeBC)
  
  // Clamp pour éviter les erreurs d'arrondi (cos doit être entre -1 et 1)
  const clampedCos = Math.max(-1, Math.min(1, cosAngle))
  
  const angleRad = Math.acos(clampedCos)
  return radToDeg(angleRad)
}

/**
 * Calcule l'angle du coude
 * @param shoulder - Point de l'épaule
 * @param elbow - Point du coude
 * @param wrist - Point du poignet
 * @returns Angle en degrés, ou null si confiance insuffisante
 */
export function calculateElbowAngle(
  shoulder: Keypoint,
  elbow: Keypoint,
  wrist: Keypoint,
  minConfidence: number = 0.3
): number | null {
  // Vérifier la confiance de détection
  if (shoulder.score < minConfidence || 
      elbow.score < minConfidence || 
      wrist.score < minConfidence) {
    return null
  }
  
  return calculateAngle(shoulder, elbow, wrist)
}

/**
 * Calcule l'angle du poignet (flexion/extension)
 * @param elbow - Point du coude
 * @param wrist - Point du poignet
 * @param hand - Point estimé de la main (ou utiliser les doigts si disponibles)
 * @returns Angle en degrés, ou null si confiance insuffisante
 */
export function calculateWristAngle(
  elbow: Keypoint,
  wrist: Keypoint,
  hand: Point2D,
  minConfidence: number = 0.3
): number | null {
  if (elbow.score < minConfidence || wrist.score < minConfidence) {
    return null
  }
  
  return calculateAngle(elbow, wrist, hand)
}

/**
 * Calcule l'angle de l'épaule par rapport à l'horizontale
 * @param shoulder - Point de l'épaule
 * @param elbow - Point du coude
 * @returns Angle en degrés par rapport à l'horizontale (0 = bras horizontal)
 */
export function calculateShoulderAngle(
  shoulder: Keypoint,
  elbow: Keypoint,
  minConfidence: number = 0.3
): number | null {
  if (shoulder.score < minConfidence || elbow.score < minConfidence) {
    return null
  }
  
  // Vecteur épaule-coude
  const dx = elbow.x - shoulder.x
  const dy = elbow.y - shoulder.y
  
  // Angle avec l'horizontale
  const angleRad = Math.atan2(dy, dx)
  return radToDeg(angleRad)
}

/**
 * Calcule l'inclinaison du tronc par rapport à la verticale
 * @param shoulder - Point de l'épaule
 * @param hip - Point de la hanche
 * @returns Angle en degrés par rapport à la verticale (0 = parfaitement vertical)
 */
export function calculateTrunkInclination(
  shoulder: Keypoint,
  hip: Keypoint,
  minConfidence: number = 0.3
): number | null {
  if (shoulder.score < minConfidence || hip.score < minConfidence) {
    return null
  }
  
  // Vecteur hanche-épaule
  const dx = shoulder.x - hip.x
  const dy = shoulder.y - hip.y
  
  // Angle avec la verticale (axe Y)
  const angleRad = Math.atan2(Math.abs(dx), Math.abs(dy))
  return radToDeg(angleRad)
}

/**
 * Calcule la rotation du tronc (torsion gauche-droite)
 * Utilise la position des deux épaules et des deux hanches
 * @param leftShoulder - Épaule gauche
 * @param rightShoulder - Épaule droite
 * @param leftHip - Hanche gauche
 * @param rightHip - Hanche droite
 * @returns Angle de rotation en degrés (positif = rotation droite)
 */
export function calculateTrunkRotation(
  leftShoulder: Keypoint,
  rightShoulder: Keypoint,
  leftHip: Keypoint,
  rightHip: Keypoint,
  minConfidence: number = 0.3
): number | null {
  const points = [leftShoulder, rightShoulder, leftHip, rightHip]
  if (points.some(p => p.score < minConfidence)) {
    return null
  }
  
  // Angle de la ligne des épaules
  const shoulderAngle = Math.atan2(
    rightShoulder.y - leftShoulder.y,
    rightShoulder.x - leftShoulder.x
  )
  
  // Angle de la ligne des hanches
  const hipAngle = Math.atan2(
    rightHip.y - leftHip.y,
    rightHip.x - leftHip.x
  )
  
  // Différence = rotation du tronc
  const rotation = shoulderAngle - hipAngle
  return radToDeg(rotation)
}

/**
 * Calcule l'orientation de la tête
 * Utilise le nez et les yeux pour estimer la direction du regard
 * @param nose - Point du nez
 * @param leftEye - Œil gauche
 * @param rightEye - Œil droit
 * @returns Angle en degrés (0 = face caméra)
 */
export function calculateHeadOrientation(
  nose: Keypoint,
  leftEye: Keypoint,
  rightEye: Keypoint,
  minConfidence: number = 0.3
): number | null {
  const points = [nose, leftEye, rightEye]
  if (points.some(p => p.score < minConfidence)) {
    return null
  }
  
  // Centre des yeux
  const eyeCenter = {
    x: (leftEye.x + rightEye.x) / 2,
    y: (leftEye.y + rightEye.y) / 2
  }
  
  // Vecteur du centre des yeux vers le nez
  const dx = nose.x - eyeCenter.x
  const dy = nose.y - eyeCenter.y
  
  // Angle avec l'horizontale
  const angleRad = Math.atan2(dy, dx)
  return radToDeg(angleRad)
}

/**
 * Calcule la distance euclidienne entre deux points
 * @param a - Premier point
 * @param b - Deuxième point
 * @returns Distance en pixels
 */
export function calculateDistance(a: Point2D, b: Point2D): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Calcule le déplacement latéral d'un point
 * (variation sur l'axe X)
 * @param positions - Tableau de positions au fil du temps
 * @returns Amplitude du déplacement en pixels
 */
export function calculateLateralDisplacement(positions: Point2D[]): number {
  if (positions.length === 0) return 0
  
  const xValues = positions.map(p => p.x)
  const minX = Math.min(...xValues)
  const maxX = Math.max(...xValues)
  
  return maxX - minX
}

/**
 * Calcule le déplacement vertical d'un point
 * @param positions - Tableau de positions au fil du temps
 * @returns Amplitude du déplacement en pixels
 */
export function calculateVerticalDisplacement(positions: Point2D[]): number {
  if (positions.length === 0) return 0
  
  const yValues = positions.map(p => p.y)
  const minY = Math.min(...yValues)
  const maxY = Math.max(...yValues)
  
  return maxY - minY
}

/**
 * Détecte une cassure brutale dans une série d'angles
 * (changement rapide d'angle, typique du snap du poignet)
 * @param angles - Série d'angles au fil du temps
 * @param threshold - Seuil de changement en degrés (défaut: 30°)
 * @returns Index où la cassure est détectée, ou -1 si aucune
 */
export function detectAngleSnap(angles: number[], threshold: number = 30): number {
  for (let i = 1; i < angles.length; i++) {
    const change = Math.abs(angles[i] - angles[i - 1])
    if (change > threshold) {
      return i
    }
  }
  return -1
}

/**
 * Lisse une série d'angles avec une moyenne mobile
 * @param angles - Série d'angles
 * @param windowSize - Taille de la fenêtre de lissage (défaut: 3)
 * @returns Angles lissés
 */
export function smoothAngles(angles: number[], windowSize: number = 3): number[] {
  if (angles.length < windowSize) return angles
  
  const smoothed: number[] = []
  const halfWindow = Math.floor(windowSize / 2)
  
  for (let i = 0; i < angles.length; i++) {
    const start = Math.max(0, i - halfWindow)
    const end = Math.min(angles.length, i + halfWindow + 1)
    const window = angles.slice(start, end)
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length
    smoothed.push(avg)
  }
  
  return smoothed
}
