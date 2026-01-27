/**
 * Module de comparaison des lancers
 * Compare les 3 lancers d'une volée pour évaluer la régularité
 */

import type {
  Throw,
  VolleyComparison,
  BiomechanicalAnalysis
} from '@/types'
import { coefficientOfVariation, average, standardDeviation } from '@/lib/utils'

/**
 * Compare les 3 lancers d'une volée
 * @param throws - Tableau de 3 lancers
 * @returns Analyse comparative
 */
export function compareThrows(throws: [Throw, Throw, Throw]): VolleyComparison {
  const analyses = throws.map(t => t.analysis)
  
  // 1. Calculer la régularité par indicateur
  const elbowConsistency = calculateElbowConsistency(analyses)
  const wristConsistency = calculateWristConsistency(analyses)
  const shoulderConsistency = calculateShoulderConsistency(analyses)
  const trunkConsistency = calculateTrunkConsistency(analyses)
  const gazeConsistency = calculateGazeConsistency(analyses)
  
  // 2. Indice de régularité global (moyenne pondérée)
  const consistencyIndex = calculateGlobalConsistency({
    elbowConsistency,
    wristConsistency,
    shoulderConsistency,
    trunkConsistency,
    gazeConsistency
  })
  
  // 3. Détection des dérives progressives
  const drifts = detectDrifts(analyses)
  
  // 4. Identifier le lancer de référence (meilleur score technique)
  const referenceThrowIndex = findReferenceThrow(analyses)
  
  // 5. Calculer les écarts par rapport à la référence
  const deviations = calculateDeviations(analyses, referenceThrowIndex)
  
  return {
    consistencyIndex,
    elbowConsistency,
    wristConsistency,
    shoulderConsistency,
    trunkConsistency,
    gazeConsistency,
    drifts,
    referenceThrowIndex,
    deviations
  }
}

/**
 * Calcule la régularité du coude (0-100, 100 = parfait)
 */
function calculateElbowConsistency(analyses: BiomechanicalAnalysis[]): number {
  // Extraire les angles moyens du coude en phase d'accélération
  const accelerationAngles = analyses.map(a => {
    const accelPhase = a.phases.find(p => p.phase === 'acceleration')
    if (!accelPhase) return 0
    
    const angles = a.elbow.angles.filter(angle => 
      angle.timestamp >= accelPhase.startTime && 
      angle.timestamp <= accelPhase.endTime
    )
    
    return average(angles.map(a => a.angle))
  })
  
  // Coefficient de variation (plus faible = plus régulier)
  const cv = coefficientOfVariation(accelerationAngles)
  
  // Convertir en score (0-100)
  return Math.max(0, 100 - cv * 500) // CV < 0.2 donne un bon score
}

/**
 * Calcule la régularité du poignet
 */
function calculateWristConsistency(analyses: BiomechanicalAnalysis[]): number {
  // Angles de relâchement
  const releaseAngles = analyses.map(a => a.wrist.releaseAngle)
  const cv = coefficientOfVariation(releaseAngles)
  
  return Math.max(0, 100 - cv * 400)
}

/**
 * Calcule la régularité de l'épaule
 */
function calculateShoulderConsistency(analyses: BiomechanicalAnalysis[]): number {
  // Stabilité verticale moyenne
  const stabilities = analyses.map(a => a.shoulder.verticalStability)
  const avgStability = average(stabilities)
  
  // Variation de la stabilité entre lancers
  const cv = coefficientOfVariation(stabilities)
  
  // Score combiné
  return Math.max(0, 100 - (avgStability * 300 + cv * 200))
}

/**
 * Calcule la régularité du tronc
 */
function calculateTrunkConsistency(analyses: BiomechanicalAnalysis[]): number {
  // Inclinaisons
  const inclinations = analyses.map(a => a.trunk.inclination)
  const cv = coefficientOfVariation(inclinations)
  
  return Math.max(0, 100 - cv * 500)
}

/**
 * Calcule la régularité de la ligne de visée
 */
function calculateGazeConsistency(analyses: BiomechanicalAnalysis[]): number {
  // Stabilité pré-relâchement
  const stabilities = analyses.map(a => a.gaze.preReleaseStability)
  const avgStability = average(stabilities)
  
  // Si tous les lancers ont un regard stable, score élevé
  const allStable = analyses.every(a => a.gaze.hasStableGaze)
  
  if (allStable) {
    return Math.max(80, 100 - avgStability * 200)
  } else {
    return Math.max(0, 50 - avgStability * 200)
  }
}

/**
 * Calcule l'indice de régularité global (0-100)
 * Moyenne pondérée des différents indicateurs
 */
function calculateGlobalConsistency(consistencies: {
  elbowConsistency: number
  wristConsistency: number
  shoulderConsistency: number
  trunkConsistency: number
  gazeConsistency: number
}): number {
  // Pondérations selon l'importance
  const weights = {
    elbow: 0.25,      // Coude = très important
    wrist: 0.25,      // Poignet = très important
    shoulder: 0.20,   // Épaule = important
    trunk: 0.20,      // Tronc = important
    gaze: 0.10        // Ligne de visée = modéré
  }
  
  const weighted = 
    consistencies.elbowConsistency * weights.elbow +
    consistencies.wristConsistency * weights.wrist +
    consistencies.shoulderConsistency * weights.shoulder +
    consistencies.trunkConsistency * weights.trunk +
    consistencies.gazeConsistency * weights.gaze
  
  return Math.round(weighted)
}

/**
 * Détecte les dérives progressives (tendances)
 */
function detectDrifts(analyses: BiomechanicalAnalysis[]) {
  const drifts: Array<{
    indicator: string
    direction: 'increasing' | 'decreasing'
    magnitude: number
  }> = []
  
  // Vérifier la dérive de l'angle du coude
  const elbowAngles = analyses.map(a => {
    const accelAngles = a.elbow.angles.filter(ang => ang.phase === 'acceleration')
    return average(accelAngles.map(ang => ang.angle))
  })
  
  if (isIncreasingTrend(elbowAngles)) {
    drifts.push({
      indicator: 'Angle du coude',
      direction: 'increasing',
      magnitude: elbowAngles[2] - elbowAngles[0]
    })
  } else if (isDecreasingTrend(elbowAngles)) {
    drifts.push({
      indicator: 'Angle du coude',
      direction: 'decreasing',
      magnitude: elbowAngles[0] - elbowAngles[2]
    })
  }
  
  // Vérifier la dérive du temps de relâchement
  const releaseTimes = analyses.map(a => a.wrist.releaseTime)
  const normalizedTimes = releaseTimes.map((t, i) => 
    t - analyses[i].phases[0].startTime
  )
  
  if (isIncreasingTrend(normalizedTimes)) {
    drifts.push({
      indicator: 'Temps de relâchement',
      direction: 'increasing',
      magnitude: normalizedTimes[2] - normalizedTimes[0]
    })
  } else if (isDecreasingTrend(normalizedTimes)) {
    drifts.push({
      indicator: 'Temps de relâchement',
      direction: 'decreasing',
      magnitude: normalizedTimes[0] - normalizedTimes[2]
    })
  }
  
  return drifts
}

/**
 * Vérifie si une série de valeurs montre une tendance croissante
 */
function isIncreasingTrend(values: number[]): boolean {
  if (values.length < 2) return false
  
  // Tendance simple: chaque valeur > précédente, ou tendance linéaire positive
  const firstHalf = average(values.slice(0, Math.ceil(values.length / 2)))
  const secondHalf = average(values.slice(Math.ceil(values.length / 2)))
  
  return secondHalf > firstHalf * 1.1 // +10% minimum
}

/**
 * Vérifie si une série de valeurs montre une tendance décroissante
 */
function isDecreasingTrend(values: number[]): boolean {
  if (values.length < 2) return false
  
  const firstHalf = average(values.slice(0, Math.ceil(values.length / 2)))
  const secondHalf = average(values.slice(Math.ceil(values.length / 2)))
  
  return secondHalf < firstHalf * 0.9 // -10% minimum
}

/**
 * Trouve le lancer de référence (meilleur score technique)
 */
function findReferenceThrow(analyses: BiomechanicalAnalysis[]): 0 | 1 | 2 {
  const scores = analyses.map(a => a.technicalScore)
  const maxScore = Math.max(...scores)
  const index = scores.indexOf(maxScore)
  
  return index as 0 | 1 | 2
}

/**
 * Calcule les écarts de chaque lancer par rapport à la référence
 */
function calculateDeviations(
  analyses: BiomechanicalAnalysis[],
  referenceIndex: number
) {
  const reference = analyses[referenceIndex]
  const deviations: Array<{
    throwIndex: 0 | 1 | 2
    indicator: string
    deviation: number
    severity: 'low' | 'medium' | 'high'
  }> = []
  
  analyses.forEach((analysis, index) => {
    if (index === referenceIndex) return // Pas de comparaison avec soi-même
    
    // Écart d'angle du coude
    const refElbowAngle = average(reference.elbow.angles.map(a => a.angle))
    const currentElbowAngle = average(analysis.elbow.angles.map(a => a.angle))
    const elbowDeviation = Math.abs(currentElbowAngle - refElbowAngle)
    
    if (elbowDeviation > 3) {
      deviations.push({
        throwIndex: index as 0 | 1 | 2,
        indicator: 'Angle du coude',
        deviation: elbowDeviation,
        severity: elbowDeviation > 10 ? 'high' : elbowDeviation > 5 ? 'medium' : 'low'
      })
    }
    
    // Écart d'angle de relâchement du poignet
    const wristDeviation = Math.abs(analysis.wrist.releaseAngle - reference.wrist.releaseAngle)
    
    if (wristDeviation > 5) {
      deviations.push({
        throwIndex: index as 0 | 1 | 2,
        indicator: 'Relâchement du poignet',
        deviation: wristDeviation,
        severity: wristDeviation > 15 ? 'high' : wristDeviation > 10 ? 'medium' : 'low'
      })
    }
    
    // Écart d'inclinaison du tronc
    const trunkDeviation = Math.abs(analysis.trunk.inclination - reference.trunk.inclination)
    
    if (trunkDeviation > 2) {
      deviations.push({
        throwIndex: index as 0 | 1 | 2,
        indicator: 'Inclinaison du tronc',
        deviation: trunkDeviation,
        severity: trunkDeviation > 5 ? 'high' : trunkDeviation > 3 ? 'medium' : 'low'
      })
    }
  })
  
  return deviations
}

/**
 * Génère un résumé textuel de la comparaison
 * @param comparison - Comparaison des lancers
 * @returns Résumé en français
 */
export function getComparisonSummary(comparison: VolleyComparison): string {
  const { consistencyIndex, drifts, deviations } = comparison
  
  let summary = ''
  
  // Évaluation globale
  if (consistencyIndex >= 80) {
    summary = 'Excellente régularité ! Vos 3 lancers sont très cohérents.'
  } else if (consistencyIndex >= 60) {
    summary = 'Bonne régularité. Quelques petites variations à corriger.'
  } else if (consistencyIndex >= 40) {
    summary = 'Régularité moyenne. Des écarts notables entre les lancers.'
  } else {
    summary = 'Faible régularité. Travaillez la reproductibilité du geste.'
  }
  
  // Dérives
  if (drifts.length > 0) {
    summary += '\n\n⚠️ Dérives détectées :'
    drifts.forEach(drift => {
      const direction = drift.direction === 'increasing' ? 'augmente' : 'diminue'
      summary += `\n- ${drift.indicator} ${direction} progressivement`
    })
  }
  
  // Écarts importants
  const highSeverityDeviations = deviations.filter(d => d.severity === 'high')
  if (highSeverityDeviations.length > 0) {
    summary += '\n\n❗ Écarts importants détectés :'
    highSeverityDeviations.forEach(dev => {
      summary += `\n- Lancer ${dev.throwIndex + 1}: ${dev.indicator} (${dev.deviation.toFixed(1)}°)`
    })
  }
  
  return summary
}
