/**
 * Analyseur biomécanique principal
 * Orchestre toutes les analyses et génère les résultats complets
 */

import type {
  Pose,
  BiomechanicalAnalysis,
  ElbowAnalysis,
  WristAnalysis,
  ShoulderAnalysis,
  TrunkAnalysis,
  GazeAnalysis,
  JointAngle,
  Keypoint,
  ThrowPhase,
  PhaseSegment
} from '@/types'

import {
  calculateElbowAngle,
  calculateWristAngle,
  calculateHeadOrientation,
  calculateLateralDisplacement,
  detectAngleSnap
} from './angles'

import { detectThrowPhases, detectReleasePoint } from './phaseDetection'
import { coefficientOfVariation, average } from '@/lib/utils'

/**
 * Analyse complète d'un lancer
 * @param poses - Séquence de poses détectées
 * @param dominantHand - Main dominante du joueur
 * @returns Analyse biomécanique complète
 */
export function analyzethrow(
  poses: Pose[],
  dominantHand: 'left' | 'right' = 'right'
): BiomechanicalAnalysis {
  // 1. Détection des phases du mouvement
  const phases = detectThrowPhases(poses, dominantHand)
  
  // 2. Analyses articulaires spécifiques
  const elbow = analyzeElbow(poses, phases, dominantHand)
  const wrist = analyzeWrist(poses, phases, dominantHand)
  const shoulder = analyzeShoulder(poses, dominantHand)
  const trunk = analyzeTrunk(poses)
  const gaze = analyzeGaze(poses, phases)
  
  // 3. Calcul de la durée totale
  const totalDuration = poses.length > 0 
    ? poses[poses.length - 1].timestamp - poses[0].timestamp 
    : 0
  
  // 4. Calcul du score technique global
  const technicalScore = calculateTechnicalScore({
    elbow,
    wrist,
    shoulder,
    trunk,
    gaze
  })
  
  return {
    phases,
    elbow,
    wrist,
    shoulder,
    trunk,
    gaze,
    totalDuration,
    technicalScore,
    analyzedAt: Date.now()
  }
}

/**
 * Analyse du coude
 */
function analyzeElbow(
  poses: Pose[],
  phases: PhaseSegment[],
  dominantHand: 'left' | 'right'
): ElbowAnalysis {
  const shoulderKey = dominantHand === 'right' ? 'right_shoulder' : 'left_shoulder'
  const elbowKey = dominantHand === 'right' ? 'right_elbow' : 'left_elbow'
  const wristKey = dominantHand === 'right' ? 'right_wrist' : 'left_wrist'
  
  const angles: JointAngle[] = []
  const elbowPositions: { x: number; y: number }[] = []
  
  // Calcul des angles et positions à chaque frame
  for (const pose of poses) {
    const shoulder = findKeypoint(pose, shoulderKey)
    const elbow = findKeypoint(pose, elbowKey)
    const wrist = findKeypoint(pose, wristKey)
    
    if (shoulder && elbow && wrist) {
      const angle = calculateElbowAngle(shoulder, elbow, wrist)
      if (angle !== null) {
        // Déterminer la phase actuelle
        const phase = getCurrentPhase(pose.timestamp, phases)
        
        angles.push({
          angle,
          timestamp: pose.timestamp,
          phase: phase || 'preparation',
          confidence: Math.min(shoulder.score, elbow.score, wrist.score)
        })
      }
      
      elbowPositions.push({ x: elbow.x, y: elbow.y })
    }
  }
  
  // Calcul de l'angle moyen par phase
  const avgAngleByPhase = calculateAverageByPhase(angles)
  
  // Déplacement latéral (stabilité horizontale)
  const lateralDisplacement = calculateLateralDisplacement(elbowPositions)
  
  // Stabilité verticale
  const verticalStability = elbowPositions.length > 0
    ? coefficientOfVariation(elbowPositions.map(p => p.y))
    : 0
  
  // Amplitude du mouvement
  const angleValues = angles.map(a => a.angle)
  const angleRange = {
    min: Math.min(...angleValues, 180),
    max: Math.max(...angleValues, 0),
    amplitude: angleValues.length > 0
      ? Math.max(...angleValues) - Math.min(...angleValues)
      : 0
  }
  
  return {
    angles,
    avgAngleByPhase,
    lateralDisplacement,
    verticalStability,
    angleRange
  }
}

/**
 * Analyse du poignet
 */
function analyzeWrist(
  poses: Pose[],
  phases: PhaseSegment[],
  dominantHand: 'left' | 'right'
): WristAnalysis {
  const elbowKey = dominantHand === 'right' ? 'right_elbow' : 'left_elbow'
  const wristKey = dominantHand === 'right' ? 'right_wrist' : 'left_wrist'
  
  const angles: JointAngle[] = []
  
  // Estimation du point de la main (15cm au-delà du poignet dans la direction du lancer)
  for (const pose of poses) {
    const elbow = findKeypoint(pose, elbowKey)
    const wrist = findKeypoint(pose, wristKey)
    
    if (elbow && wrist) {
      // Direction du vecteur coude->poignet
      const dx = wrist.x - elbow.x
      const dy = wrist.y - elbow.y
      const length = Math.sqrt(dx * dx + dy * dy)
      
      // Point main estimé (prolongation)
      const handExtension = 0.3 // 30% de la longueur avant-bras
      const hand = {
        x: wrist.x + (dx / length) * length * handExtension,
        y: wrist.y + (dy / length) * length * handExtension
      }
      
      const angle = calculateWristAngle(elbow, wrist, hand)
      if (angle !== null) {
        const phase = getCurrentPhase(pose.timestamp, phases)
        
        angles.push({
          angle,
          timestamp: pose.timestamp,
          phase: phase || 'preparation',
          confidence: Math.min(elbow.score, wrist.score)
        })
      }
    }
  }
  
  // Détection du relâchement
  const releaseIdx = detectReleasePoint(poses, dominantHand)
  const releaseTime = poses[releaseIdx]?.timestamp || 0
  const releaseAngle = angles.find(a => Math.abs(a.timestamp - releaseTime) < 50)?.angle || 0
  
  // Détection de snap (cassure du poignet)
  const angleValues = angles.map(a => a.angle)
  const snapIdx = detectAngleSnap(angleValues, 25)
  const snapDetected = snapIdx !== -1
  const snapAngle = snapDetected ? angleValues[snapIdx] : undefined
  
  // Fluidité (coefficient de variation des angles)
  const fluidity = coefficientOfVariation(angleValues)
  
  return {
    angles,
    releaseTime,
    releaseAngle,
    fluidity,
    snapDetected,
    snapAngle
  }
}

/**
 * Analyse de l'épaule
 */
function analyzeShoulder(
  poses: Pose[],
  dominantHand: 'left' | 'right'
): ShoulderAnalysis {
  const shoulderKey = dominantHand === 'right' ? 'right_shoulder' : 'left_shoulder'
  
  const verticalPositions: Array<{ y: number; timestamp: number }> = []
  const horizontalPositions: number[] = []
  
  for (const pose of poses) {
    const shoulder = findKeypoint(pose, shoulderKey)
    
    if (shoulder && shoulder.score > 0.3) {
      verticalPositions.push({
        y: shoulder.y,
        timestamp: pose.timestamp
      })
      horizontalPositions.push(shoulder.x)
    }
  }
  
  // Rotation parasite (déplacement horizontal)
  const rotation = horizontalPositions.length > 0
    ? Math.max(...horizontalPositions) - Math.min(...horizontalPositions)
    : 0
  
  // Stabilité verticale
  const yValues = verticalPositions.map(p => p.y)
  const verticalStability = coefficientOfVariation(yValues)
  
  // Variance (pour comparaison inter-lancers)
  const variance = verticalStability
  
  return {
    verticalPositions,
    rotation,
    verticalStability,
    variance
  }
}

/**
 * Analyse du tronc
 */
function analyzeTrunk(poses: Pose[]): TrunkAnalysis {
  const inclinations: number[] = []
  const centerPositions: { x: number; y: number }[] = []
  
  for (const pose of poses) {
    // Utiliser les deux épaules et les deux hanches
    const leftShoulder = findKeypoint(pose, 'left_shoulder')
    const rightShoulder = findKeypoint(pose, 'right_shoulder')
    const leftHip = findKeypoint(pose, 'left_hip')
    const rightHip = findKeypoint(pose, 'right_hip')
    
    if (leftShoulder && rightShoulder && leftHip && rightHip) {
      // Centre du tronc (milieu épaules + milieu hanches) / 2
      const shoulderCenter = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2
      }
      const hipCenter = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2
      }
      const trunkCenter = {
        x: (shoulderCenter.x + hipCenter.x) / 2,
        y: (shoulderCenter.y + hipCenter.y) / 2
      }
      
      centerPositions.push(trunkCenter)
      
      // Inclinaison (angle par rapport à la verticale)
      const dx = shoulderCenter.x - hipCenter.x
      const dy = shoulderCenter.y - hipCenter.y
      const inclination = Math.atan2(Math.abs(dx), Math.abs(dy)) * (180 / Math.PI)
      inclinations.push(inclination)
    }
  }
  
  // Inclinaison moyenne
  const inclination = average(inclinations)
  
  // Balancement (coefficient de variation de la position du centre)
  const xValues = centerPositions.map(p => p.x)
  const sway = coefficientOfVariation(xValues)
  
  // Alignement (rotation gauche-droite, approximé par l'écart horizontal)
  const alignment = xValues.length > 0
    ? Math.max(...xValues) - Math.min(...xValues)
    : 0
  
  // Stabilité globale (inverse du balancement)
  const stability = 1 - Math.min(sway, 1)
  
  return {
    inclination,
    sway,
    alignment,
    stability
  }
}

/**
 * Analyse de la ligne de visée
 */
function analyzeGaze(poses: Pose[], phases: PhaseSegment[]): GazeAnalysis {
  const headOrientations: number[] = []
  const preReleaseOrientations: number[] = []
  const windUpOrientations: number[] = []
  
  for (const pose of poses) {
    const nose = findKeypoint(pose, 'nose')
    const leftEye = findKeypoint(pose, 'left_eye')
    const rightEye = findKeypoint(pose, 'right_eye')
    
    if (nose && leftEye && rightEye) {
      const orientation = calculateHeadOrientation(nose, leftEye, rightEye)
      if (orientation !== null) {
        headOrientations.push(orientation)
        
        const phase = getCurrentPhase(pose.timestamp, phases)
        if (phase === 'wind_up') {
          windUpOrientations.push(orientation)
        } else if (phase === 'acceleration') {
          preReleaseOrientations.push(orientation)
        }
      }
    }
  }
  
  const headOrientation = average(headOrientations)
  const preReleaseStability = coefficientOfVariation(preReleaseOrientations)
  const windUpVariation = coefficientOfVariation(windUpOrientations)
  
  // La tête est stable si CV < 0.1 (10%)
  const hasStableGaze = preReleaseStability < 0.1
  
  return {
    headOrientation,
    preReleaseStability,
    windUpVariation,
    hasStableGaze
  }
}

/**
 * Calcule l'angle moyen par phase
 */
function calculateAverageByPhase(angles: JointAngle[]): Record<ThrowPhase, number> {
  const byPhase: Partial<Record<ThrowPhase, number[]>> = {}
  
  for (const angle of angles) {
    if (!byPhase[angle.phase]) {
      byPhase[angle.phase] = []
    }
    byPhase[angle.phase]!.push(angle.angle)
  }
  
  const averages: Partial<Record<ThrowPhase, number>> = {}
  
  for (const [phase, values] of Object.entries(byPhase) as [ThrowPhase, number[]][]) {
    averages[phase] = average(values)
  }
  
  return averages as Record<ThrowPhase, number>
}

/**
 * Détermine la phase actuelle à un timestamp donné
 */
function getCurrentPhase(timestamp: number, phases: PhaseSegment[]): ThrowPhase | null {
  for (const phase of phases) {
    if (timestamp >= phase.startTime && timestamp <= phase.endTime) {
      return phase.phase
    }
  }
  return null
}

/**
 * Trouve un keypoint par nom dans une pose
 */
function findKeypoint(pose: Pose, name: string): Keypoint | undefined {
  return pose.keypoints.find(kp => kp.name === name)
}

/**
 * Calcule le score technique global basé sur toutes les analyses
 * Score de 0 à 100
 */
function calculateTechnicalScore(analyses: {
  elbow: ElbowAnalysis
  wrist: WristAnalysis
  shoulder: ShoulderAnalysis
  trunk: TrunkAnalysis
  gaze: GazeAnalysis
}): number {
  let score = 100
  
  // Pénalités basées sur les défauts détectés
  
  // Coude : stabilité latérale (max -15 points)
  const elbowPenalty = Math.min(analyses.elbow.lateralDisplacement / 10, 15)
  score -= elbowPenalty
  
  // Poignet : fluidité (max -15 points)
  const wristPenalty = Math.min(analyses.wrist.fluidity * 100, 15)
  score -= wristPenalty
  
  // Épaule : rotation parasite (max -15 points)
  const shoulderPenalty = Math.min(analyses.shoulder.rotation / 10, 15)
  score -= shoulderPenalty
  
  // Tronc : balancement (max -20 points)
  const trunkPenalty = Math.min(analyses.trunk.sway * 100, 20)
  score -= trunkPenalty
  
  // Ligne de visée : instabilité (max -15 points)
  const gazePenalty = analyses.gaze.hasStableGaze ? 0 : 15
  score -= gazePenalty
  
  // Bonus : geste très fluide
  if (analyses.wrist.fluidity < 0.05 && analyses.elbow.verticalStability < 0.05) {
    score += 5
  }
  
  return Math.max(0, Math.min(100, score))
}
