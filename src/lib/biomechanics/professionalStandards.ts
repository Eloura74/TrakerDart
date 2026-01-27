/**
 * Standards biomécaniques basés sur l'analyse de joueurs professionnels
 * Sources : études biomécanique, analyse vidéo de Peter Wright, Simon Whitlock, etc.
 */

/**
 * Standards pour un lancer de fléchettes professionnel
 */
export const PROFESSIONAL_STANDARDS = {
  // Durée du lancer
  throwDuration: {
    min: 400,      // 0.4s - minimum pour un mouvement fluide
    optimal: 600,  // 0.6s - durée typique des pros
    max: 1000,     // 1.0s - au-delà, trop lent
  },
  
  // Coude - Mouvement dynamique (PAS fixe !)
  elbow: {
    // L'angle du coude DOIT varier pendant le lancer (backswing → release)
    minAngleVariation: 30,   // Variation minimale attendue (degrés)
    optimalVariation: 50,    // Variation optimale pour les pros
    maxAngleVariation: 90,   // Variation maximale acceptable
    
    // Phase de backswing (position haute, près de l'œil)
    backswing: {
      minAngle: 45,    // Angle minimal en backswing
      maxAngle: 90,    // Angle maximal en backswing
    },
    
    // Phase de release (extension complète)
    release: {
      minAngle: 150,   // Extension quasi-complète
      maxAngle: 180,   // Extension totale
    },
    
    // Stabilité latérale (pas de "flaring" excessif)
    lateralStability: {
      maxDeviation: 50,  // Déviation latérale max acceptable (px)
      optimal: 20,       // Déviation optimale
    },
  },
  
  // Poignet - Alignement avec l'avant-bras au release
  wrist: {
    // Au moment du release, le poignet doit être aligné
    releaseAlignment: {
      optimalAngle: 165,   // ~165° = presque droit
      tolerance: 20,       // ±20° acceptable
    },
    
    // Le snap du poignet doit être contrôlé
    snapSpeed: {
      min: 10,      // Vitesse minimale du snap (°/frame)
      optimal: 25,  // Vitesse optimale
      max: 50,      // Au-delà, perte de contrôle
    },
  },
  
  // Épaule - Point d'ancrage STABLE
  shoulder: {
    // La stabilité de l'épaule est CRITIQUE
    maxMovement: {
      horizontal: 30,   // Mouvement horizontal max (px)
      vertical: 20,     // Mouvement vertical max (px)
    },
    
    // L'épaule ne doit pas tourner
    maxRotation: 10,    // Rotation max acceptable (degrés)
  },
  
  // Fluidité du mouvement
  smoothness: {
    // Accélération progressive (pas de saccades)
    maxAccelerationChange: 150,  // Changement max d'accélération (px/frame²)
    
    // Vitesse cible
    optimalPeakVelocity: 80,     // Vélocité de pointe optimale (px/frame)
    minPeakVelocity: 40,         // Minimum pour un lancer efficace
    maxPeakVelocity: 150,        // Maximum avant perte de contrôle
  },
  
  // Régularité (entre les 3 lancers)
  consistency: {
    excellent: 85,     // >85% = excellent
    good: 70,          // 70-85% = bon
    acceptable: 50,    // 50-70% = acceptable
    poor: 50,          // <50% = à travailler
  },
}

/**
 * Erreurs communes et leurs seuils de détection
 */
export const COMMON_ERRORS = {
  // Coude fixe (erreur #1 des débutants)
  fixedElbow: {
    threshold: 20,  // Variation < 20° = coude trop fixe
    severity: 'critical' as const,
    description: 'Coude trop fixe - limite la puissance et la précision',
    correction: 'Montez le coude pendant le backswing, près de l\'œil, puis étendez complètement lors du release',
  },
  
  // Manque de backswing
  insufficientBackswing: {
    threshold: 40,  // Angle de backswing < 40°
    severity: 'high' as const,
    description: 'Backswing insuffisant - réduit le contrôle',
    correction: 'Ramenez la fléchette près de votre œil/joue avant de lancer',
  },
  
  // Mouvement saccadé
  jerkyMotion: {
    threshold: 120,  // Changement d'accélération > 120
    severity: 'high' as const,
    description: 'Mouvement saccadé - affecte la trajectoire',
    correction: 'Travaillez un mouvement fluide et continu, sans forcer',
  },
  
  // Épaule instable
  unstableShoulder: {
    threshold: 35,  // Mouvement épaule > 35px
    severity: 'critical' as const,
    description: 'Épaule instable - point d\'ancrage compromis',
    correction: 'Gardez l\'épaule fixe, elle est votre point d\'appui pour tout le mouvement',
  },
  
  // Poignet mal aligné
  wristMisalignment: {
    threshold: 30,  // Angle au release > ±30° de l'optimal
    severity: 'medium' as const,
    description: 'Poignet mal aligné au release',
    correction: 'Alignez votre main avec l\'avant-bras au moment du lâcher',
  },
  
  // Release trop tôt/tard
  improperRelease: {
    thresholdEarly: 140,   // Release avec angle coude < 140°
    thresholdLate: 190,    // Release avec angle coude > 190° (hyperextension)
    severity: 'high' as const,
    description: 'Timing de release incorrect',
    correction: 'Relâchez la fléchette au moment de l\'extension complète du bras',
  },
  
  // Vitesse excessive
  excessiveSpeed: {
    threshold: 150,  // Vélocité > 150 px/frame
    severity: 'medium' as const,
    description: 'Lancer trop rapide - perte de contrôle',
    correction: 'Ralentissez à ~75% de votre vitesse max pour plus de précision',
  },
  
  // Trop lent
  tooSlow: {
    threshold: 35,  // Vélocité pic < 35 px/frame
    severity: 'low' as const,
    description: 'Lancer trop lent - manque de puissance',
    correction: 'Accélérez progressivement jusqu\'au release pour plus de puissance',
  },
}

/**
 * Calcule le score basé sur les standards professionnels
 */
export function calculateProScore(metrics: {
  elbowAngleVariation: number
  elbowBackswingAngle: number
  elbowReleaseAngle: number
  shoulderMovement: number
  wristReleaseAngle: number
  peakVelocity: number
  accelerationVariance: number
  duration: number
}): {
  score: number
  breakdown: {
    elbowDynamics: number
    shoulderStability: number
    wristAlignment: number
    smoothness: number
    timing: number
  }
  errors: string[]
} {
  const errors: string[] = []
  
  // 1. Dynamique du coude (30 points)
  let elbowScore = 0
  if (metrics.elbowAngleVariation < COMMON_ERRORS.fixedElbow.threshold) {
    errors.push('fixed_elbow')
    elbowScore = 0
  } else if (metrics.elbowAngleVariation >= PROFESSIONAL_STANDARDS.elbow.optimalVariation) {
    elbowScore = 30
  } else {
    elbowScore = (metrics.elbowAngleVariation / PROFESSIONAL_STANDARDS.elbow.optimalVariation) * 30
  }
  
  // Bonus si backswing et release corrects
  if (metrics.elbowBackswingAngle >= PROFESSIONAL_STANDARDS.elbow.backswing.minAngle &&
      metrics.elbowBackswingAngle <= PROFESSIONAL_STANDARDS.elbow.backswing.maxAngle) {
    elbowScore += 5
  } else if (metrics.elbowBackswingAngle < COMMON_ERRORS.insufficientBackswing.threshold) {
    errors.push('insufficient_backswing')
  }
  
  if (metrics.elbowReleaseAngle >= PROFESSIONAL_STANDARDS.elbow.release.minAngle &&
      metrics.elbowReleaseAngle <= PROFESSIONAL_STANDARDS.elbow.release.maxAngle) {
    elbowScore += 5
  } else {
    errors.push('improper_release')
  }
  
  // 2. Stabilité de l'épaule (25 points)
  let shoulderScore = 0
  if (metrics.shoulderMovement > COMMON_ERRORS.unstableShoulder.threshold) {
    errors.push('unstable_shoulder')
    shoulderScore = 0
  } else if (metrics.shoulderMovement <= PROFESSIONAL_STANDARDS.shoulder.maxMovement.horizontal) {
    shoulderScore = 25
  } else {
    shoulderScore = (1 - (metrics.shoulderMovement - PROFESSIONAL_STANDARDS.shoulder.maxMovement.horizontal) 
      / COMMON_ERRORS.unstableShoulder.threshold) * 25
  }
  
  // 3. Alignement du poignet (20 points)
  let wristScore = 0
  const wristDeviation = Math.abs(metrics.wristReleaseAngle - PROFESSIONAL_STANDARDS.wrist.releaseAlignment.optimalAngle)
  if (wristDeviation > COMMON_ERRORS.wristMisalignment.threshold) {
    errors.push('wrist_misalignment')
    wristScore = 0
  } else if (wristDeviation <= PROFESSIONAL_STANDARDS.wrist.releaseAlignment.tolerance) {
    wristScore = 20
  } else {
    wristScore = (1 - wristDeviation / COMMON_ERRORS.wristMisalignment.threshold) * 20
  }
  
  // 4. Fluidité (15 points)
  let smoothnessScore = 0
  if (metrics.accelerationVariance > COMMON_ERRORS.jerkyMotion.threshold) {
    errors.push('jerky_motion')
    smoothnessScore = 0
  } else if (metrics.accelerationVariance <= PROFESSIONAL_STANDARDS.smoothness.maxAccelerationChange) {
    smoothnessScore = 15
  } else {
    smoothnessScore = (1 - (metrics.accelerationVariance - PROFESSIONAL_STANDARDS.smoothness.maxAccelerationChange) 
      / COMMON_ERRORS.jerkyMotion.threshold) * 15
  }
  
  // 5. Timing (10 points)
  let timingScore = 0
  if (metrics.duration >= PROFESSIONAL_STANDARDS.throwDuration.min &&
      metrics.duration <= PROFESSIONAL_STANDARDS.throwDuration.max) {
    if (metrics.duration >= PROFESSIONAL_STANDARDS.throwDuration.optimal - 100 &&
        metrics.duration <= PROFESSIONAL_STANDARDS.throwDuration.optimal + 100) {
      timingScore = 10
    } else {
      timingScore = 7
    }
  } else {
    timingScore = 3
  }
  
  // Vérifier la vitesse
  if (metrics.peakVelocity > COMMON_ERRORS.excessiveSpeed.threshold) {
    errors.push('excessive_speed')
    smoothnessScore *= 0.7
  } else if (metrics.peakVelocity < COMMON_ERRORS.tooSlow.threshold) {
    errors.push('too_slow')
    smoothnessScore *= 0.8
  }
  
  const totalScore = Math.round(elbowScore + shoulderScore + wristScore + smoothnessScore + timingScore)
  
  return {
    score: Math.min(100, Math.max(0, totalScore)),
    breakdown: {
      elbowDynamics: Math.round(elbowScore),
      shoulderStability: Math.round(shoulderScore),
      wristAlignment: Math.round(wristScore),
      smoothness: Math.round(smoothnessScore),
      timing: Math.round(timingScore),
    },
    errors,
  }
}
