/**
 * Types pour le système de coaching temps réel
 */

export type CoachingMode = 'visual' | 'audio' | 'haptic' | 'all';
export type CoachingSensitivity = 'relaxed' | 'normal' | 'strict';
export type CoachingJoint = 'elbow' | 'wrist' | 'shoulder' | 'trunk' | 'gaze';
export type FeedbackType = 'error' | 'warning' | 'success' | 'tip';
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface RealtimeCoachingConfig {
  enabled: boolean;
  mode: CoachingMode;
  sensitivity: CoachingSensitivity;
  focusAreas: CoachingFocusArea[];
  cooldownMs: number; // Temps minimum entre 2 feedbacks
}

export interface CoachingFocusArea {
  joint: CoachingJoint;
  threshold: number; // Seuil de déclenchement (degrés)
  priority: 'low' | 'medium' | 'high';
}

export interface CoachingFeedback {
  type: FeedbackType;
  joint: CoachingJoint;
  message: string;
  visualCue?: {
    highlight: CoachingJoint | CoachingJoint[];
    color: string;
    pulse?: boolean;
  };
  audioFile?: string;
  vibrationPattern?: number[]; // Pattern vibration [on, off, on, ...]
  direction?: Direction; // Direction de correction
  severity: number; // 0-100, plus haut = plus urgent
}

export interface CoachingStats {
  totalFeedbacks: number;
  errorsDetected: number;
  warningsDetected: number;
  mostCommonIssue: CoachingJoint | null;
  improvementRate: number; // Pourcentage d'amélioration
}

/**
 * Configuration des seuils par sensibilité
 */
export const SENSITIVITY_THRESHOLDS = {
  relaxed: {
    elbow: { min: 60, max: 160 },
    shoulder: { alignment: 20 },
    wrist: { flexion: 25 },
    gaze: { deviation: 30 }
  },
  normal: {
    elbow: { min: 70, max: 150 },
    shoulder: { alignment: 15 },
    wrist: { flexion: 20 },
    gaze: { deviation: 20 }
  },
  strict: {
    elbow: { min: 80, max: 140 },
    shoulder: { alignment: 10 },
    wrist: { flexion: 15 },
    gaze: { deviation: 15 }
  }
} as const;

/**
 * Messages de feedback prédéfinis
 */
export const FEEDBACK_MESSAGES = {
  elbow: {
    tooOpen: 'Coude trop ouvert ! Fléchissez légèrement',
    tooClosed: 'Coude trop fermé ! Ouvrez l\'angle',
    perfect: 'Angle du coude parfait ! ✅'
  },
  shoulder: {
    misaligned: 'Épaules non alignées ! Redressez-vous',
    perfect: 'Alignement épaules parfait ! ✅'
  },
  wrist: {
    tooFlexed: 'Poignet trop fléchi ! Relâchez',
    perfect: 'Position poignet parfaite ! ✅'
  },
  gaze: {
    offTarget: 'Regardez la cible ! 👁️',
    perfect: 'Regard bien fixé ! ✅'
  }
} as const;
