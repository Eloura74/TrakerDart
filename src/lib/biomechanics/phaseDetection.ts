/**
 * Module de détection des phases du lancer
 * Découpe automatiquement le mouvement en 5 phases distinctes
 */

import type { Pose, ThrowPhase, PhaseSegment, Keypoint } from '@/types'
import { calculateElbowAngle, calculateDistance } from './angles'

/**
 * Détecte les phases du lancer à partir d'une séquence de poses
 * @param poses - Séquence de poses détectées
 * @param dominantHand - Main dominante ('left' | 'right')
 * @returns Tableau de segments de phases
 */
export function detectThrowPhases(
  poses: Pose[],
  dominantHand: 'left' | 'right' = 'right'
): PhaseSegment[] {
  if (poses.length === 0) return []
  
  // Sélection des keypoints selon la main dominante
  const shoulderKey = dominantHand === 'right' ? 'right_shoulder' : 'left_shoulder'
  const elbowKey = dominantHand === 'right' ? 'right_elbow' : 'left_elbow'
  const wristKey = dominantHand === 'right' ? 'right_wrist' : 'left_wrist'
  
  // Extraction des points clés à chaque frame
  const elbowAngles: number[] = []
  const wristVelocities: number[] = []
  
  for (let i = 0; i < poses.length; i++) {
    const pose = poses[i]
    const shoulder = findKeypoint(pose, shoulderKey)
    const elbow = findKeypoint(pose, elbowKey)
    const wrist = findKeypoint(pose, wristKey)
    
    if (shoulder && elbow && wrist) {
      // Calcul de l'angle du coude
      const angle = calculateElbowAngle(shoulder, elbow, wrist)
      elbowAngles.push(angle ?? 0)
      
      // Calcul de la vélocité du poignet (si on a une frame précédente)
      if (i > 0) {
        const prevWrist = findKeypoint(poses[i - 1], wristKey)
        if (prevWrist) {
          const distance = calculateDistance(prevWrist, wrist)
          const timeDelta = (pose.timestamp - poses[i - 1].timestamp) / 1000 // en secondes
          const velocity = timeDelta > 0 ? distance / timeDelta : 0
          wristVelocities.push(velocity)
        } else {
          wristVelocities.push(0)
        }
      } else {
        wristVelocities.push(0)
      }
    } else {
      elbowAngles.push(0)
      wristVelocities.push(0)
    }
  }
  
  // Détection des événements clés
  const minElbowAngleIdx = elbowAngles.indexOf(Math.min(...elbowAngles))
  const maxVelocityIdx = wristVelocities.indexOf(Math.max(...wristVelocities))
  
  // Construction des segments de phases
  const phases: PhaseSegment[] = []
  
  // 1. PRÉPARATION : du début jusqu'à 30% du mouvement ou jusqu'à l'armement
  const preparationEnd = Math.min(
    Math.floor(poses.length * 0.3),
    Math.max(0, minElbowAngleIdx - 5)
  )
  
  if (preparationEnd > 0) {
    phases.push(createPhaseSegment(
      'preparation',
      poses,
      0,
      preparationEnd
    ))
  }
  
  // 2. ARMEMENT (WIND-UP) : jusqu'au point d'angle minimal du coude
  const windUpEnd = minElbowAngleIdx
  
  if (windUpEnd > preparationEnd) {
    phases.push(createPhaseSegment(
      'wind_up',
      poses,
      preparationEnd,
      windUpEnd
    ))
  }
  
  // 3. ACCÉLÉRATION : de l'angle minimal jusqu'au pic de vélocité
  const accelerationEnd = Math.max(windUpEnd, maxVelocityIdx)
  
  if (accelerationEnd > windUpEnd) {
    phases.push(createPhaseSegment(
      'acceleration',
      poses,
      windUpEnd,
      accelerationEnd
    ))
  }
  
  // 4. RELÂCHEMENT (RELEASE) : moment du pic de vélocité (très court)
  const releaseStart = accelerationEnd
  const releaseEnd = Math.min(accelerationEnd + 3, poses.length - 1)
  
  if (releaseEnd > releaseStart) {
    phases.push(createPhaseSegment(
      'release',
      poses,
      releaseStart,
      releaseEnd
    ))
  }
  
  // 5. FOLLOW-THROUGH : du relâchement jusqu'à la fin
  if (releaseEnd < poses.length - 1) {
    phases.push(createPhaseSegment(
      'follow_through',
      poses,
      releaseEnd,
      poses.length - 1
    ))
  }
  
  return phases
}

/**
 * Crée un segment de phase à partir d'indices de début et fin
 */
function createPhaseSegment(
  phase: ThrowPhase,
  poses: Pose[],
  startIdx: number,
  endIdx: number
): PhaseSegment {
  const startPose = poses[startIdx]
  const endPose = poses[endIdx]
  
  return {
    phase,
    startTime: startPose.timestamp,
    endTime: endPose.timestamp,
    duration: endPose.timestamp - startPose.timestamp,
    poses: poses.slice(startIdx, endIdx + 1)
  }
}

/**
 * Trouve un keypoint spécifique dans une pose par son nom
 */
function findKeypoint(pose: Pose, name: string): Keypoint | undefined {
  return pose.keypoints.find(kp => kp.name === name)
}

/**
 * Détecte le moment du relâchement avec plus de précision
 * Utilise la décélération brutale du poignet
 * @param poses - Séquence de poses
 * @param dominantHand - Main dominante
 * @returns Index de la frame de relâchement
 */
export function detectReleasePoint(
  poses: Pose[],
  dominantHand: 'left' | 'right' = 'right'
): number {
  const wristKey = dominantHand === 'right' ? 'right_wrist' : 'left_wrist'
  
  const velocities: number[] = []
  
  for (let i = 1; i < poses.length; i++) {
    const currWrist = findKeypoint(poses[i], wristKey)
    const prevWrist = findKeypoint(poses[i - 1], wristKey)
    
    if (currWrist && prevWrist) {
      const distance = calculateDistance(prevWrist, currWrist)
      const timeDelta = (poses[i].timestamp - poses[i - 1].timestamp) / 1000
      const velocity = timeDelta > 0 ? distance / timeDelta : 0
      velocities.push(velocity)
    } else {
      velocities.push(0)
    }
  }
  
  // Le relâchement = pic de vélocité suivi d'une décélération
  let maxVelocity = 0
  let maxVelocityIdx = 0
  
  for (let i = 0; i < velocities.length; i++) {
    if (velocities[i] > maxVelocity) {
      maxVelocity = velocities[i]
      maxVelocityIdx = i
    }
  }
  
  return maxVelocityIdx + 1 // +1 car velocities commence à l'index 1
}

/**
 * Vérifie si une phase est valide (durée minimale)
 * @param phase - Segment de phase
 * @param minDuration - Durée minimale en ms (défaut: 50ms)
 * @returns true si la phase est valide
 */
export function isValidPhase(phase: PhaseSegment, minDuration: number = 50): boolean {
  return phase.duration >= minDuration && phase.poses.length >= 2
}

/**
 * Filtre les phases invalides
 * @param phases - Tableau de segments de phases
 * @returns Phases valides uniquement
 */
export function filterValidPhases(phases: PhaseSegment[]): PhaseSegment[] {
  return phases.filter(phase => isValidPhase(phase))
}

/**
 * Calcule les statistiques de durée par phase
 * @param phases - Segments de phases
 * @returns Map phase -> durée moyenne
 */
export function calculatePhaseDurations(
  phases: PhaseSegment[]
): Record<ThrowPhase, number> {
  const durations: Partial<Record<ThrowPhase, number[]>> = {}
  
  for (const phase of phases) {
    if (!durations[phase.phase]) {
      durations[phase.phase] = []
    }
    durations[phase.phase]!.push(phase.duration)
  }
  
  const averages: Partial<Record<ThrowPhase, number>> = {}
  
  for (const [phase, durs] of Object.entries(durations) as [ThrowPhase, number[]][]) {
    const avg = durs.reduce((sum, d) => sum + d, 0) / durs.length
    averages[phase] = avg
  }
  
  return averages as Record<ThrowPhase, number>
}

/**
 * Compare les durées de phases entre plusieurs lancers
 * @param allPhases - Tableau de tableaux de phases (un par lancer)
 * @returns Coefficient de variation par phase
 */
export function comparePhaseTimings(
  allPhases: PhaseSegment[][]
): Record<ThrowPhase, number> {
  const phaseNames: ThrowPhase[] = [
    'preparation',
    'wind_up',
    'acceleration',
    'release',
    'follow_through'
  ]
  
  const results: Partial<Record<ThrowPhase, number>> = {}
  
  for (const phaseName of phaseNames) {
    const durations: number[] = []
    
    for (const throwPhases of allPhases) {
      const phase = throwPhases.find(p => p.phase === phaseName)
      if (phase) {
        durations.push(phase.duration)
      }
    }
    
    if (durations.length > 0) {
      // Calcul du coefficient de variation
      const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length
      const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length
      const stdDev = Math.sqrt(variance)
      const cv = mean > 0 ? stdDev / mean : 0
      
      results[phaseName] = cv
    }
  }
  
  return results as Record<ThrowPhase, number>
}
