/**
 * Service de coaching en temps réel
 * Analyse les poses et génère des feedbacks instantanés
 */

import type { Pose, Keypoint } from '@/types';
import type {
  RealtimeCoachingConfig,
  CoachingFeedback,
  CoachingStats,
  CoachingJoint
} from '@/types/coaching';
import {
  SENSITIVITY_THRESHOLDS,
  FEEDBACK_MESSAGES
} from '@/types/coaching';

export class RealtimeCoach {
  private lastFeedbackTime: number = 0;
  private config: RealtimeCoachingConfig;
  private stats: CoachingStats;

  constructor(config: RealtimeCoachingConfig) {
    this.config = config;
    this.stats = {
      totalFeedbacks: 0,
      errorsDetected: 0,
      warningsDetected: 0,
      mostCommonIssue: null,
      improvementRate: 0
    };
  }

  /**
   * Analyser une pose et retourner un feedback si nécessaire
   */
  analyzePose(pose: Pose): CoachingFeedback | null {
    if (!this.config.enabled) {
      return null;
    }

    const now = Date.now();
    
    // Cooldown pour éviter spam de feedbacks
    if (now - this.lastFeedbackTime < this.config.cooldownMs) {
      return null;
    }

    // Analyser chaque focus area par priorité
    const sortedAreas = [...this.config.focusAreas].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    for (const area of sortedAreas) {
      const feedback = this.analyzeJoint(pose, area.joint);
      
      if (feedback && feedback.severity > 30) {
        this.lastFeedbackTime = now;
        this.updateStats(feedback);
        return feedback;
      }
    }

    return null;
  }

  /**
   * Analyser une articulation spécifique
   */
  private analyzeJoint(pose: Pose, joint: CoachingJoint): CoachingFeedback | null {
    switch (joint) {
      case 'elbow':
        return this.analyzeElbow(pose);
      case 'shoulder':
        return this.analyzeShoulder(pose);
      case 'wrist':
        return this.analyzeWrist(pose);
      case 'gaze':
        return this.analyzeGaze(pose);
      default:
        return null;
    }
  }

  /**
   * Analyser l'angle du coude
   */
  private analyzeElbow(pose: Pose): CoachingFeedback | null {
    const shoulder = this.findKeypoint(pose, 'right_shoulder');
    const elbow = this.findKeypoint(pose, 'right_elbow');
    const wrist = this.findKeypoint(pose, 'right_wrist');

    if (!shoulder || !elbow || !wrist) {
      return null;
    }

    // Vérifier confiance minimale
    if (shoulder.score < 0.5 || elbow.score < 0.5 || wrist.score < 0.5) {
      return null;
    }

    const angle = this.calculateAngle(shoulder, elbow, wrist);
    const thresholds = SENSITIVITY_THRESHOLDS[this.config.sensitivity].elbow;

    if (angle < thresholds.min) {
      return {
        type: 'error',
        joint: 'elbow',
        message: FEEDBACK_MESSAGES.elbow.tooClosed,
        visualCue: {
          highlight: 'elbow',
          color: '#ff0055',
          pulse: true
        },
        direction: 'up',
        severity: 80,
        audioFile: 'elbow_closed.mp3'
      };
    }

    if (angle > thresholds.max) {
      return {
        type: 'error',
        joint: 'elbow',
        message: FEEDBACK_MESSAGES.elbow.tooOpen,
        visualCue: {
          highlight: 'elbow',
          color: '#ff0055',
          pulse: true
        },
        direction: 'down',
        severity: 70,
        audioFile: 'elbow_open.mp3'
      };
    }

    // Angle parfait
    if (Math.abs(angle - 110) < 5) {
      return {
        type: 'success',
        joint: 'elbow',
        message: FEEDBACK_MESSAGES.elbow.perfect,
        visualCue: {
          highlight: 'elbow',
          color: '#00ff88'
        },
        severity: 10
      };
    }

    return null;
  }

  /**
   * Analyser l'alignement des épaules
   */
  private analyzeShoulder(pose: Pose): CoachingFeedback | null {
    const leftShoulder = this.findKeypoint(pose, 'left_shoulder');
    const rightShoulder = this.findKeypoint(pose, 'right_shoulder');

    if (!leftShoulder || !rightShoulder) {
      return null;
    }

    if (leftShoulder.score < 0.5 || rightShoulder.score < 0.5) {
      return null;
    }

    // Calculer désalignement vertical
    const misalignment = Math.abs(leftShoulder.y - rightShoulder.y);
    const threshold = SENSITIVITY_THRESHOLDS[this.config.sensitivity].shoulder.alignment;

    if (misalignment > threshold) {
      return {
        type: 'warning',
        joint: 'shoulder',
        message: FEEDBACK_MESSAGES.shoulder.misaligned,
        visualCue: {
          highlight: ['shoulder'],
          color: '#ffaa00',
          pulse: true
        },
        severity: 60,
        audioFile: 'shoulder_align.mp3'
      };
    }

    // Alignement parfait
    if (misalignment < 5) {
      return {
        type: 'success',
        joint: 'shoulder',
        message: FEEDBACK_MESSAGES.shoulder.perfect,
        visualCue: {
          highlight: ['shoulder'],
          color: '#00ff88'
        },
        severity: 10
      };
    }

    return null;
  }

  /**
   * Analyser la position du poignet
   */
  private analyzeWrist(pose: Pose): CoachingFeedback | null {
    const elbow = this.findKeypoint(pose, 'right_elbow');
    const wrist = this.findKeypoint(pose, 'right_wrist');

    if (!elbow || !wrist || elbow.score < 0.5 || wrist.score < 0.5) {
      return null;
    }

    // Calculer flexion du poignet (simplifié)
    const flexion = Math.abs(elbow.y - wrist.y);
    const threshold = SENSITIVITY_THRESHOLDS[this.config.sensitivity].wrist.flexion;

    if (flexion > threshold) {
      return {
        type: 'warning',
        joint: 'wrist',
        message: FEEDBACK_MESSAGES.wrist.tooFlexed,
        visualCue: {
          highlight: 'wrist',
          color: '#ffaa00'
        },
        severity: 50,
        audioFile: 'wrist_flex.mp3'
      };
    }

    return null;
  }

  /**
   * Analyser la direction du regard
   */
  private analyzeGaze(pose: Pose): CoachingFeedback | null {
    const nose = this.findKeypoint(pose, 'nose');
    const leftEye = this.findKeypoint(pose, 'left_eye');
    const rightEye = this.findKeypoint(pose, 'right_eye');

    if (!nose || !leftEye || !rightEye) {
      return null;
    }

    // Calculer orientation de la tête (simplifié)
    const headCenter = {
      x: (leftEye.x + rightEye.x) / 2,
      y: (leftEye.y + rightEye.y) / 2
    };

    const deviation = Math.abs(nose.x - headCenter.x);
    const threshold = SENSITIVITY_THRESHOLDS[this.config.sensitivity].gaze.deviation;

    if (deviation > threshold) {
      return {
        type: 'warning',
        joint: 'gaze',
        message: FEEDBACK_MESSAGES.gaze.offTarget,
        visualCue: {
          highlight: 'gaze',
          color: '#ffaa00'
        },
        severity: 40,
        audioFile: 'look_target.mp3'
      };
    }

    return null;
  }

  /**
   * Trouver un keypoint par nom
   */
  private findKeypoint(pose: Pose, name: string): Keypoint | null {
    return pose.keypoints.find(kp => kp.name === name) || null;
  }

  /**
   * Calculer l'angle entre 3 points
   */
  private calculateAngle(p1: Keypoint, p2: Keypoint, p3: Keypoint): number {
    const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) -
                    Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    
    if (angle > 180) {
      angle = 360 - angle;
    }
    
    return angle;
  }

  /**
   * Mettre à jour les statistiques
   */
  private updateStats(feedback: CoachingFeedback): void {
    this.stats.totalFeedbacks++;
    
    if (feedback.type === 'error') {
      this.stats.errorsDetected++;
    } else if (feedback.type === 'warning') {
      this.stats.warningsDetected++;
    }

    // TODO: Tracker joint le plus problématique
  }

  /**
   * Obtenir les statistiques
   */
  getStats(): CoachingStats {
    return { ...this.stats };
  }

  /**
   * Réinitialiser les statistiques
   */
  resetStats(): void {
    this.stats = {
      totalFeedbacks: 0,
      errorsDetected: 0,
      warningsDetected: 0,
      mostCommonIssue: null,
      improvementRate: 0
    };
  }

  /**
   * Mettre à jour la configuration
   */
  updateConfig(config: Partial<RealtimeCoachingConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
