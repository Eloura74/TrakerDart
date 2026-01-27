/**
 * Générateur de feedback pédagogique
 * Transforme les analyses techniques en recommandations compréhensibles
 */

import type {
  BiomechanicalAnalysis,
  VolleyComparison,
  Feedback,
  Recommendations,
  FeedbackType
} from '@/types'

/**
 * Génère les recommandations pour une volée complète
 * @param analyses - Analyses des 3 lancers
 * @param comparison - Comparaison inter-lancers
 * @returns Recommandations pédagogiques
 */
export function generateRecommendations(
  analyses: BiomechanicalAnalysis[],
  comparison: VolleyComparison
): Recommendations {
  const feedbacks: Feedback[] = []
  
  // 1. Feedback sur la régularité globale
  feedbacks.push(generateConsistencyFeedback(comparison))
  
  // 2. Feedback spécifique par lancer
  analyses.forEach((analysis, index) => {
    feedbacks.push(...generateThrowFeedback(analysis, index + 1))
  })
  
  // 3. Feedback sur les dérives détectées
  if (comparison.drifts.length > 0) {
    feedbacks.push(...generateDriftFeedback(comparison.drifts))
  }
  
  // 4. Trier par priorité
  feedbacks.sort((a, b) => a.priority - b.priority)
  
  // 5. Identifier les points forts et axes d'amélioration
  const mainIssues = identifyMainIssues(feedbacks)
  const strengths = identifyStrengths(analyses, comparison)
  
  return {
    feedbacks,
    mainIssues,
    strengths
  }
}

/**
 * Génère le feedback sur la régularité globale
 */
function generateConsistencyFeedback(comparison: VolleyComparison): Feedback {
  const { consistencyIndex } = comparison
  
  if (consistencyIndex >= 80) {
    return {
      type: 'success',
      indicator: 'Régularité',
      message: 'Excellente cohérence entre vos 3 lancers',
      priority: 3,
      detail: `Score de régularité: ${consistencyIndex}% - Continuez ainsi !`
    }
  } else if (consistencyIndex >= 60) {
    return {
      type: 'info',
      indicator: 'Régularité',
      message: 'Bonne régularité avec quelques variations',
      priority: 2,
      detail: `Score: ${consistencyIndex}% - Concentrez-vous sur la reproductibilité`
    }
  } else if (consistencyIndex >= 40) {
    return {
      type: 'warning',
      indicator: 'Régularité',
      message: 'Régularité moyenne, écarts notables entre lancers',
      priority: 1,
      detail: `Score: ${consistencyIndex}% - Travaillez la mémoire musculaire`
    }
  } else {
    return {
      type: 'error',
      indicator: 'Régularité',
      message: 'Faible régularité, geste à stabiliser',
      priority: 1,
      detail: `Score: ${consistencyIndex}% - Décomposez le mouvement et répétez lentement`
    }
  }
}

/**
 * Génère le feedback pour un lancer individuel
 */
function generateThrowFeedback(
  analysis: BiomechanicalAnalysis,
  throwNumber: number
): Feedback[] {
  const feedbacks: Feedback[] = []
  
  // Analyse du coude
  if (analysis.elbow.lateralDisplacement > 50) {
    feedbacks.push({
      type: 'warning',
      indicator: `Coude (lancer ${throwNumber})`,
      message: 'Votre coude se déplace latéralement',
      priority: 1,
      detail: `Déplacement: ${analysis.elbow.lateralDisplacement.toFixed(0)}px - Gardez le coude fixe`
    })
  }
  
  if (analysis.elbow.verticalStability > 0.15) {
    feedbacks.push({
      type: 'warning',
      indicator: `Coude (lancer ${throwNumber})`,
      message: 'Coude instable verticalement',
      priority: 2,
      detail: 'Stabilisez votre épaule pour un mouvement plus régulier'
    })
  }
  
  // Analyse du poignet
  if (analysis.wrist.fluidity > 0.2) {
    feedbacks.push({
      type: 'warning',
      indicator: `Poignet (lancer ${throwNumber})`,
      message: 'Mouvement du poignet saccadé',
      priority: 2,
      detail: 'Travaillez la fluidité du geste'
    })
  }
  
  if (analysis.wrist.snapDetected && analysis.wrist.snapAngle) {
    feedbacks.push({
      type: 'info',
      indicator: `Poignet (lancer ${throwNumber})`,
      message: `Cassure du poignet détectée à ${analysis.wrist.snapAngle.toFixed(0)}°`,
      priority: 3,
      detail: 'Ceci peut être volontaire ou à corriger selon votre style'
    })
  }
  
  // Analyse de l'épaule
  if (analysis.shoulder.rotation > 40) {
    feedbacks.push({
      type: 'warning',
      indicator: `Épaule (lancer ${throwNumber})`,
      message: 'Rotation parasite de l\'épaule',
      priority: 1,
      detail: 'Gardez l\'épaule fixe pendant le lancer'
    })
  }
  
  // Analyse du tronc
  if (analysis.trunk.inclination > 10) {
    feedbacks.push({
      type: 'info',
      indicator: `Tronc (lancer ${throwNumber})`,
      message: `Inclinaison du tronc: ${analysis.trunk.inclination.toFixed(1)}°`,
      priority: 2,
      detail: 'Maintenez le tronc plus vertical'
    })
  }
  
  if (analysis.trunk.sway > 0.1) {
    feedbacks.push({
      type: 'warning',
      indicator: `Tronc (lancer ${throwNumber})`,
      message: 'Balancement du corps détecté',
      priority: 1,
      detail: 'Travaillez votre équilibre et ancrage au sol'
    })
  }
  
  // Analyse de la ligne de visée
  if (!analysis.gaze.hasStableGaze) {
    feedbacks.push({
      type: 'warning',
      indicator: `Ligne de visée (lancer ${throwNumber})`,
      message: 'Regard instable avant le lancer',
      priority: 2,
      detail: 'Fixez la cible et maintenez votre regard stable'
    })
  }
  
  // Score technique global
  if (analysis.technicalScore >= 85) {
    feedbacks.push({
      type: 'success',
      indicator: `Lancer ${throwNumber}`,
      message: `Excellent geste technique (${analysis.technicalScore}/100)`,
      priority: 3
    })
  }
  
  return feedbacks
}

/**
 * Génère le feedback sur les dérives progressives
 */
function generateDriftFeedback(
  drifts: Array<{ indicator: string; direction: string; magnitude: number }>
): Feedback[] {
  return drifts.map(drift => ({
    type: 'warning' as FeedbackType,
    indicator: 'Dérive progressive',
    message: `${drift.indicator} ${drift.direction === 'increasing' ? 'augmente' : 'diminue'} au fil des lancers`,
    priority: 1,
    detail: `Écart de ${drift.magnitude.toFixed(1)}° entre le 1er et le 3ème lancer`
  }))
}

/**
 * Identifie les axes d'amélioration principaux
 */
function identifyMainIssues(feedbacks: Feedback[]): string[] {
  // Extraire les feedbacks d'erreur et warning uniquement
  const issues = feedbacks
    .filter(f => f.type === 'error' || f.type === 'warning')
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3) // Top 3 des problèmes
    .map(f => f.message)
  
  return issues
}

/**
 * Identifie les points forts
 */
function identifyStrengths(
  analyses: BiomechanicalAnalysis[],
  comparison: VolleyComparison
): string[] {
  const strengths: string[] = []
  
  // Régularité excellente
  if (comparison.consistencyIndex >= 80) {
    strengths.push('Excellente régularité entre les lancers')
  }
  
  // Coude stable
  if (comparison.elbowConsistency >= 80) {
    strengths.push('Stabilité du coude remarquable')
  }
  
  // Poignet fluide
  const avgFluidity = analyses.reduce((sum, a) => sum + a.wrist.fluidity, 0) / analyses.length
  if (avgFluidity < 0.05) {
    strengths.push('Mouvement du poignet très fluide')
  }
  
  // Tronc stable
  if (comparison.trunkConsistency >= 80) {
    strengths.push('Excellent maintien du tronc')
  }
  
  // Ligne de visée
  if (analyses.every(a => a.gaze.hasStableGaze)) {
    strengths.push('Fixation visuelle parfaite')
  }
  
  // Score technique élevé
  const avgScore = analyses.reduce((sum, a) => sum + a.technicalScore, 0) / analyses.length
  if (avgScore >= 85) {
    strengths.push('Technique globale de haut niveau')
  }
  
  return strengths
}

/**
 * Génère un feedback court et actionable
 * @param analysis - Analyse biomécanique
 * @returns Message court (max 100 caractères)
 */
export function generateQuickTip(analysis: BiomechanicalAnalysis): string {
  // Identifier le problème principal
  if (analysis.elbow.lateralDisplacement > 50) {
    return '💡 Fixez votre coude pendant le lancer'
  }
  
  if (analysis.shoulder.rotation > 40) {
    return '💡 Bloquez l\'épaule, seul le bras doit bouger'
  }
  
  if (analysis.trunk.sway > 0.1) {
    return '💡 Améliorez votre équilibre et ancrage'
  }
  
  if (!analysis.gaze.hasStableGaze) {
    return '💡 Fixez la cible avant de lancer'
  }
  
  if (analysis.wrist.fluidity > 0.2) {
    return '💡 Rendez le mouvement plus fluide'
  }
  
  // Aucun problème majeur
  if (analysis.technicalScore >= 85) {
    return '✅ Excellent geste, continuez !'
  }
  
  return '💡 Concentrez-vous sur la reproductibilité'
}
