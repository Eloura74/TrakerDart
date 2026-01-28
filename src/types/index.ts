/**
 * Types et interfaces pour l'application TrakerDart
 * Définit les structures de données pour l'analyse biomécanique
 */

// ============================================================================
// TYPES DE BASE - DÉTECTION DE POSE
// ============================================================================

/**
 * Point 2D dans l'espace image
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Point détecté par le modèle de pose avec score de confiance
 */
export interface Keypoint {
  x: number;
  y: number;
  score: number; // Confiance de la détection (0-1)
  name?: string; // Nom du point (ex: 'left_shoulder')
}

/**
 * Noms des points clés du corps détectés par MoveNet
 */
export type KeypointName =
  | "nose"
  | "left_eye"
  | "right_eye"
  | "left_ear"
  | "right_ear"
  | "left_shoulder"
  | "right_shoulder"
  | "left_elbow"
  | "right_elbow"
  | "left_wrist"
  | "right_wrist"
  | "left_hip"
  | "right_hip"
  | "left_knee"
  | "right_knee"
  | "left_ankle"
  | "right_ankle";

/**
 * Pose complète détectée à un instant t
 */
export interface Pose {
  keypoints: Keypoint[];
  score: number; // Score global de confiance de la pose
  timestamp: number; // Timestamp en ms
}

// ============================================================================
// PHASES DU MOUVEMENT
// ============================================================================

/**
 * Les 5 phases du lancer de fléchette
 */
export type ThrowPhase =
  | "preparation" // Position initiale, vise
  | "wind_up" // Armement du bras
  | "acceleration" // Accélération vers l'avant
  | "release" // Relâchement de la fléchette
  | "follow_through"; // Fin du geste

/**
 * Segment temporel d'une phase
 */
export interface PhaseSegment {
  phase: ThrowPhase;
  startTime: number; // ms depuis début enregistrement
  endTime: number; // ms depuis début enregistrement
  duration: number; // ms
  poses: Pose[]; // Toutes les poses détectées dans cette phase
}

// ============================================================================
// ANALYSE BIOMÉCANIQUE
// ============================================================================

/**
 * Analyse d'un angle articulaire
 */
export interface JointAngle {
  angle: number; // Angle en degrés
  timestamp: number; // Moment de la mesure
  phase: ThrowPhase; // Phase du mouvement
  confidence: number; // Confiance de la mesure (0-1)
}

/**
 * Analyse complète du coude
 */
export interface ElbowAnalysis {
  // Angle du coude tout au long du mouvement
  angles: JointAngle[];

  // Angle moyen par phase
  avgAngleByPhase: Record<ThrowPhase, number>;

  // Déplacement latéral du coude (stabilité)
  lateralDisplacement: number; // En pixels

  // Stabilité verticale
  verticalStability: number; // Coefficient de variation

  // Amplitude du mouvement
  angleRange: {
    min: number;
    max: number;
    amplitude: number;
  };
}

/**
 * Analyse complète du poignet
 */
export interface WristAnalysis {
  // Angles de flexion/extension
  angles: JointAngle[];

  // Moment du relâchement (timestamp)
  releaseTime: number;

  // Angle au moment du relâchement
  releaseAngle: number;

  // Fluidité du mouvement (coefficient de variation)
  fluidity: number;

  // Cassure du poignet (changement brutal d'angle)
  snapDetected: boolean;
  snapAngle?: number;
}

/**
 * Analyse de l'épaule
 */
export interface ShoulderAnalysis {
  // Position verticale de l'épaule
  verticalPositions: Array<{ y: number; timestamp: number }>;

  // Rotation parasite (déplacement horizontal)
  rotation: number; // En pixels

  // Stabilité verticale
  verticalStability: number; // Coefficient de variation

  // Variation inter-lancers
  variance: number;
}

/**
 * Analyse du tronc
 */
export interface TrunkAnalysis {
  // Inclinaison du tronc (angle par rapport à la verticale)
  inclination: number; // En degrés

  // Balancement avant-arrière
  sway: number; // Coefficient de variation de la position

  // Alignement avec la cible (rotation gauche-droite)
  alignment: number; // En degrés

  // Stabilité globale
  stability: number;
}

/**
 * Analyse de la ligne de visée
 */
export interface GazeAnalysis {
  // Orientation de la tête
  headOrientation: number; // Angle en degrés

  // Stabilité de la tête avant le lancer
  preReleaseStability: number;

  // Variations pendant l'armement
  windUpVariation: number;

  // Fixation visuelle (la tête reste stable)
  hasStableGaze: boolean;
}

/**
 * Analyse biomécanique complète d'un lancer
 */
export interface BiomechanicalAnalysis {
  // Découpage en phases
  phases: PhaseSegment[];

  // Analyses articulaires
  elbow: ElbowAnalysis;
  wrist: WristAnalysis;
  shoulder: ShoulderAnalysis;
  trunk: TrunkAnalysis;
  gaze: GazeAnalysis;

  // Durée totale du lancer
  totalDuration: number;

  // Score global de qualité technique (0-100)
  technicalScore: number;

  // Timestamp d'analyse
  analyzedAt: number;
}

// ============================================================================
// LANCER ET VOLÉE
// ============================================================================

/**
 * Un lancer individuel
 */
export interface Throw {
  id: string;

  // Enregistrement vidéo
  videoBlob?: Blob;
  videoUrl?: string;

  // Données de pose
  poses: Pose[];

  // Analyse biomécanique
  analysis: BiomechanicalAnalysis;

  // Métadonnées
  recordedAt: number;
  duration: number;

  // Résultat du lancer (optionnel)
  result?: ThrowResult;
}

/**
 * Résultat d'un lancer (zone touchée sur la cible)
 */
export interface ThrowResult {
  score: number; // Points marqués
  sector: number; // Secteur de 1 à 20
  multiplier: 1 | 2 | 3; // Simple, double, triple
  isBullseye: boolean;
}

/**
 * Une volée de 3 lancers
 */
export interface Volley {
  id: string;

  // Les 3 lancers
  throws: [Throw, Throw, Throw];

  // Analyse comparative
  comparison: VolleyComparison;

  // Métadonnées
  createdAt: number;
  totalScore?: number;
}

/**
 * Comparaison des 3 lancers d'une volée
 */
export interface VolleyComparison {
  // Indice de régularité global (0-100, plus haut = plus régulier)
  consistencyIndex: number;

  // Comparaison par indicateur
  elbowConsistency: number;
  wristConsistency: number;
  shoulderConsistency: number;
  trunkConsistency: number;
  gazeConsistency: number;

  // Dérives progressives détectées
  drifts: Array<{
    indicator: string;
    direction: "increasing" | "decreasing";
    magnitude: number;
  }>;

  // Lancer de référence (le meilleur techniquement)
  referenceThrowIndex: 0 | 1 | 2;

  // Écarts par rapport à la référence
  deviations: Array<{
    throwIndex: 0 | 1 | 2;
    indicator: string;
    deviation: number;
    severity: "low" | "medium" | "high";
  }>;
}

// ============================================================================
// FEEDBACK ET RECOMMANDATIONS
// ============================================================================

/**
 * Type de feedback
 */
export type FeedbackType = "success" | "info" | "warning" | "error";

/**
 * Feedback pédagogique
 */
export interface Feedback {
  type: FeedbackType;
  indicator: string; // Indicateur concerné (ex: 'coude', 'poignet')
  message: string; // Message en français, clair et concret
  priority: number; // Priorité de correction (1 = haute, 3 = basse)
  detail?: string; // Détail complémentaire optionnel
}

/**
 * Recommandations d'amélioration
 */
export interface Recommendations {
  // Feedbacks par priorité
  feedbacks: Feedback[];

  // Axes d'amélioration principaux
  mainIssues: string[];

  // Points positifs
  strengths: string[];

  // Progression par rapport à la session précédente
  progression?: {
    improved: string[];
    regressed: string[];
  };
}

// ============================================================================
// SESSION ET HISTORIQUE
// ============================================================================

/**
 * Session d'entraînement
 */
export interface TrainingSession {
  id: string;

  // Vollées de la session
  volleys: Volley[];

  // Statistiques globales de session
  stats: SessionStats;

  // Métadonnées
  createdAt: number;
  endedAt?: number;
  duration: number;

  // Notes optionnelles
  notes?: string;
}

/**
 * Statistiques d'une session
 */
export interface SessionStats {
  totalThrows: number;
  averageConsistency: number;
  averageTechnicalScore: number;
  totalScore?: number;

  // Évolution au cours de la session
  consistencyTrend: "improving" | "stable" | "declining";

  // Meilleure volée
  bestVolley?: {
    id: string;
    consistencyIndex: number;
  };

  // Meilleure série
  bestStreak?: number;
}

// ============================================================================
// CONFIGURATION ET CALIBRATION
// ============================================================================

/**
 * Configuration de la caméra
 */
export interface CameraConfig {
  deviceId?: string;
  facingMode: "user" | "environment";
  resolution: {
    width: number;
    height: number;
  };
  frameRate: number;
}

/**
 * Calibration de la caméra
 */
export interface Calibration {
  // Position de référence du joueur
  referenceDistance: number; // Distance caméra-joueur en cm

  // Zone d'intérêt (ROI) dans l'image
  roi?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  // Côté dominant du joueur
  dominantHand: "left" | "right";

  // Timestamp de calibration
  calibratedAt: number;
}

/**
 * Préférences utilisateur
 */
export interface UserPreferences {
  // Langue
  language: "fr" | "en";

  // Unités
  units: "metric" | "imperial";

  // Niveau de détail des analyses
  analysisDetail: "beginner" | "intermediate" | "advanced";

  // Feedback sonore
  soundEnabled: boolean;

  // Vibration (mobile)
  vibrationEnabled: boolean;

  // Thème (actuellement dark uniquement)
  theme: "dark";
}

// ============================================================================
// ÉTAT DE L'APPLICATION
// ============================================================================

/**
 * État global de l'application (pour Zustand)
 */
export interface AppState {
  // Configuration
  cameraConfig: CameraConfig | null;
  calibration: Calibration | null;
  preferences: UserPreferences;

  // Session en cours
  currentSession: TrainingSession | null;
  currentVolley: Partial<Volley> | null;

  // Historique
  sessions: TrainingSession[];

  // État UI
  isRecording: boolean;
  isAnalyzing: boolean;

  // Erreurs
  error: string | null;
}
