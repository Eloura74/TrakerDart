/**
 * Moteur de recommandations basé sur l'analyse biomécanique professionnelle
 * Génère des conseils précis et actionnables
 */

import { COMMON_ERRORS, PROFESSIONAL_STANDARDS } from '../biomechanics/professionalStandards'
import type { BiomechanicalAnalysis, Volley } from '@/types'

export interface DetailedRecommendation {
  id: string
  category: 'critical' | 'important' | 'improvement' | 'good'
  title: string
  problem: string
  solution: string
  exercice?: string
  priority: number
  videoRef?: string
}

/**
 * Génère des recommandations détaillées basées sur l'analyse
 */
export function generateProfessionalRecommendations(
  analyses: BiomechanicalAnalysis[],
  comparison: Volley['comparison']
): DetailedRecommendation[] {
  const recommendations: DetailedRecommendation[] = []
  let priority = 1
  
  // Analyser chaque lancer
  analyses.forEach((analysis, index) => {
    // 1. CRITIQUE : Coude fixe (erreur #1 des débutants)
    const elbowAngles = analysis.elbow.angles.map((a: any) => a.angle)
    const elbowVariation = Math.max(...elbowAngles) - Math.min(...elbowAngles)
    if (elbowVariation < COMMON_ERRORS.fixedElbow.threshold) {
      recommendations.push({
        id: `fixed-elbow-${index}`,
        category: 'critical',
        title: '🔴 CRITIQUE : Coude trop fixe',
        problem: `Lancer ${index + 1} : Votre coude bouge de seulement ${Math.round(elbowVariation)}° (minimum requis : ${COMMON_ERRORS.fixedElbow.threshold}°). Un coude fixe limite drastiquement votre puissance et précision.`,
        solution: `Le coude doit suivre une trajectoire DYNAMIQUE : 
• Backswing : Montez le coude à ~90° (fléchette près de l'œil)
• Release : Étendez complètement le bras (~170°)
• Cette variation de ~80° est ESSENTIELLE pour la puissance`,
        exercice: `Exercice mur : Tenez-vous face à un mur. Touchez votre épaule avec la fléchette (coude à 90°), puis pointez le mur en extension complète. Répétez lentement 20 fois pour mémoriser le mouvement.`,
        priority: priority++,
        videoRef: 'https://www.youtube.com/watch?v=MfszPqLHSd8'
      })
    }
    
    // 2. CRITIQUE : Épaule instable
    const shoulderMovement = Math.abs(analysis.shoulder.rotation || 0)
    if (shoulderMovement > COMMON_ERRORS.unstableShoulder.threshold) {
      recommendations.push({
        id: `unstable-shoulder-${index}`,
        category: 'critical',
        title: '🔴 CRITIQUE : Épaule instable',
        problem: `Lancer ${index + 1} : Votre épaule bouge de ${Math.round(shoulderMovement)}px (max acceptable : ${PROFESSIONAL_STANDARDS.shoulder.maxMovement.horizontal}px). L'épaule est votre POINT D'ANCRAGE, elle doit rester fixe.`,
        solution: `L'épaule est le point fixe de tout le système de levier du bras :
• Gardez l'épaule IMMOBILE pendant tout le mouvement
• Seuls l'avant-bras et le poignet bougent
• Imaginez l'épaule "vissée" en place`,
        exercice: `Exercice du mur : Collez votre épaule contre un mur. Lancez sans que l'épaule ne décolle. Si elle décolle, vous utilisez trop le haut du corps.`,
        priority: priority++,
      })
    }
    
    // 3. IMPORTANT : Backswing insuffisant
    const backswingAngle = Math.min(...elbowAngles)
    if (backswingAngle > COMMON_ERRORS.insufficientBackswing.threshold) {
      recommendations.push({
        id: `insufficient-backswing-${index}`,
        category: 'important',
        title: '⚠️ Backswing insuffisant',
        problem: `Lancer ${index + 1} : Angle de backswing de ${Math.round(backswingAngle)}° (optimal : ${PROFESSIONAL_STANDARDS.elbow.backswing.minAngle}-${PROFESSIONAL_STANDARDS.elbow.backswing.maxAngle}°). Un backswing court réduit le contrôle.`,
        solution: `Ramenez la fléchette plus près de votre visage :
• Position cible : fléchette au niveau de l'œil/joue
• Coude à ~60-90° en backswing
• Plus de backswing = plus de contrôle sur la trajectoire`,
        exercice: `Devant un miroir, pratiquez le backswing jusqu'à ce que la fléchette soit au niveau de votre œil. Maintenez 2 secondes, puis relâchez lentement.`,
        priority: priority++,
      })
    }
    
    // 4. IMPORTANT : Mouvement saccadé
    const acceleration = analysis.elbow.angles.map((_: any, i: number, arr: any[]) => {
      if (i < 2) return 0
      const v1 = arr[i].angle - arr[i - 1].angle
      const v0 = arr[i - 1].angle - arr[i - 2].angle
      return Math.abs(v1 - v0)
    })
    const maxAccelChange = Math.max(...acceleration)
    
    if (maxAccelChange > COMMON_ERRORS.jerkyMotion.threshold) {
      recommendations.push({
        id: `jerky-motion-${index}`,
        category: 'important',
        title: '⚠️ Mouvement saccadé',
        problem: `Lancer ${index + 1} : Des à-coups détectés dans le mouvement (changement d'accélération : ${Math.round(maxAccelChange)}). Cela perturbe la trajectoire.`,
        solution: `Travaillez la FLUIDITÉ :
• Mouvement CONTINU du backswing au release
• Accélération PROGRESSIVE (pas d'à-coups)
• Ne forcez PAS, laissez le mouvement couler naturellement
• Vitesse cible : ~75% de votre maximum`,
        exercice: `Lancer au ralenti : Effectuez 10 lancers à 50% de vitesse en vous concentrant sur la fluidité. Puis augmentez progressivement à 75%.`,
        priority: priority++,
      })
    }
    
    // 5. Poignet mal aligné
    const wristReleaseAngles = analysis.wrist.angles.slice(-5) // 5 dernières frames
    const avgWristAtRelease = wristReleaseAngles.reduce((sum, a) => sum + a.angle, 0) / wristReleaseAngles.length
    const wristDeviation = Math.abs(avgWristAtRelease - PROFESSIONAL_STANDARDS.wrist.releaseAlignment.optimalAngle)
    
    if (wristDeviation > COMMON_ERRORS.wristMisalignment.threshold) {
      recommendations.push({
        id: `wrist-misalignment-${index}`,
        category: 'improvement',
        title: '💡 Alignement du poignet à améliorer',
        problem: `Lancer ${index + 1} : Angle du poignet au release : ${Math.round(avgWristAtRelease)}° (optimal : ~${PROFESSIONAL_STANDARDS.wrist.releaseAlignment.optimalAngle}°). Déviation de ${Math.round(wristDeviation)}°.`,
        solution: `Au moment du lâcher, alignez main et avant-bras :
• Le poignet doit être presque droit (~165°)
• Évitez de "casser" le poignet vers le haut ou le bas
• Le snap du poignet (si utilisé) doit être contrôlé`,
        exercice: `Tenez une règle contre votre avant-bras et main. Lancez en gardant l'alignement visible. Le poignet doit rester dans le prolongement de l'avant-bras.`,
        priority: priority++,
      })
    }
  })
  
  // 6. Analyse de la régularité
  if (comparison.consistencyIndex < PROFESSIONAL_STANDARDS.consistency.acceptable) {
    recommendations.push({
      id: 'poor-consistency',
      category: 'critical',
      title: '🔴 Manque de régularité',
      problem: `Score de régularité : ${comparison.consistencyIndex}% (objectif : >${PROFESSIONAL_STANDARDS.consistency.good}%). Vos 3 lancers sont trop différents.`,
      solution: `La RÉGULARITÉ est la clé de la précision :
• Trouvez VOTRE technique et répétez-la à l'identique
• Concentrez-vous sur les sensations (pas le résultat)
• Créez une routine pré-lancer (stance, respiration, visée)
• La répétabilité bat la perfection`,
      exercice: `Technique des 100 lancers : Lancez 100 fléchettes en vous concentrant UNIQUEMENT sur la reproduction exacte du même geste. Notez vos sensations, pas le score.`,
      priority: 0, // Plus haute priorité
    })
  } else if (comparison.consistencyIndex >= PROFESSIONAL_STANDARDS.consistency.excellent) {
    recommendations.push({
      id: 'excellent-consistency',
      category: 'good',
      title: '✅ Excellente régularité !',
      problem: '',
      solution: `Régularité de ${comparison.consistencyIndex}% - EXCELLENT ! C'est le niveau des pros. Continuez exactement comme ça.`,
      priority: 999,
    })
  }
  
  // 7. Points forts à maintenir
  const avgTechnicalScore = analyses.reduce((sum: number, a: any) => sum + a.technicalScore, 0) / analyses.length
  if (avgTechnicalScore >= 80) {
    recommendations.push({
      id: 'good-technique',
      category: 'good',
      title: '✅ Bonne technique générale',
      problem: '',
      solution: `Score technique moyen : ${Math.round(avgTechnicalScore)}/100. Votre technique de base est solide. Travaillez maintenant les détails pour passer au niveau supérieur.`,
      priority: 999,
    })
  }
  
  // Trier par priorité
  return recommendations.sort((a, b) => a.priority - b.priority)
}

/**
 * Génère un résumé exécutif avec les 3 actions prioritaires
 */
export function getTopPriorities(recommendations: DetailedRecommendation[]): DetailedRecommendation[] {
  return recommendations
    .filter(r => r.category === 'critical' || r.category === 'important')
    .slice(0, 3)
}

/**
 * Génère un plan d'entraînement progressif
 */
export function generateTrainingPlan(recommendations: DetailedRecommendation[]): {
  week1: string[]
  week2: string[]
  week3: string[]
  week4: string[]
} {
  const criticals = recommendations.filter(r => r.category === 'critical')
  const importants = recommendations.filter(r => r.category === 'important')
  const improvements = recommendations.filter(r => r.category === 'improvement')
  
  return {
    week1: [
      '🎯 Semaine 1 : Corriger les erreurs critiques',
      ...criticals.slice(0, 2).map(r => `• ${r.title} - ${r.exercice || r.solution.split('\n')[1]}`),
      '• Objectif : 100 lancers par jour en se concentrant sur ces 2 points',
    ],
    week2: [
      '🎯 Semaine 2 : Consolider et ajouter',
      ...criticals.slice(0, 1).map(r => `• Maintenir : ${r.title}`),
      ...importants.slice(0, 1).map(r => `• Ajouter : ${r.title}`),
      '• Objectif : 150 lancers par jour',
    ],
    week3: [
      '🎯 Semaine 3 : Perfectionnement',
      ...importants.map(r => `• ${r.title}`),
      '• Objectif : 200 lancers par jour + focus régularité',
    ],
    week4: [
      '🎯 Semaine 4 : Polissage final',
      ...improvements.slice(0, 2).map(r => `• ${r.title}`),
      '• Objectif : Tout intégrer naturellement',
    ],
  }
}
