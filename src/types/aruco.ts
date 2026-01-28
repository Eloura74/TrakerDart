/**
 * Types pour la calibration ArUco
 * Marqueurs fiduciaires pour calibration précise 2D→3D
 */

/**
 * Type de dictionnaire ArUco
 */
export type ArucoDictionary = 
  | 'DICT_4X4_50'      // 4x4 bits, 50 marqueurs
  | 'DICT_4X4_100'     // 4x4 bits, 100 marqueurs
  | 'DICT_4X4_250'     // 4x4 bits, 250 marqueurs
  | 'DICT_5X5_50'      // 5x5 bits, 50 marqueurs (recommandé)
  | 'DICT_5X5_100'     // 5x5 bits, 100 marqueurs
  | 'DICT_6X6_50'      // 6x6 bits, 50 marqueurs
  | 'DICT_6X6_100';    // 6x6 bits, 100 marqueurs

/**
 * Marqueur ArUco détecté
 */
export interface ArucoMarker {
  id: number;                    // ID du marqueur (0-49 pour DICT_5X5_50)
  corners: [                     // 4 coins du marqueur (pixels)
    { x: number; y: number },    // Top-left
    { x: number; y: number },    // Top-right
    { x: number; y: number },    // Bottom-right
    { x: number; y: number }     // Bottom-left
  ];
  center: { x: number; y: number };  // Centre du marqueur
  rvec?: number[];               // Rotation vector (3D)
  tvec?: number[];               // Translation vector (3D)
  confidence: number;            // Confiance détection (0-1)
}

/**
 * Configuration de la cible avec marqueurs ArUco
 */
export interface ArucoTargetConfig {
  dictionary: ArucoDictionary;
  markerSize: number;            // Taille physique en mm
  markerIds: number[];           // IDs des marqueurs sur la cible
  targetWidth: number;           // Largeur physique cible en mm
  targetHeight: number;          // Hauteur physique cible en mm
  markerPositions: {             // Position des marqueurs sur la cible
    id: number;
    x: number;                   // Position X en mm (origine: centre cible)
    y: number;                   // Position Y en mm
  }[];
}

/**
 * Résultat de calibration
 */
export interface CalibrationResult {
  success: boolean;
  cameraMatrix: number[][];      // Matrice intrinsèque 3x3
  distortionCoeffs: number[];    // Coefficients de distorsion [k1,k2,p1,p2,k3]
  rvecs: number[][];             // Vecteurs rotation par frame
  tvecs: number[][];             // Vecteurs translation par frame
  reprojectionError: number;     // Erreur de reprojection (pixels)
  
  // Métadonnées
  calibrationDate: Date;
  framesUsed: number;
  resolution: { width: number; height: number };
  focalLength: { x: number; y: number };  // En pixels
  principalPoint: { x: number; y: number }; // En pixels
}

/**
 * Profil de calibration sauvegardé
 */
export interface CalibrationProfile {
  id: string;
  name: string;
  description?: string;
  result: CalibrationResult;
  targetConfig: ArucoTargetConfig;
  createdAt: Date;
  updatedAt: Date;
  deviceInfo?: {
    userAgent: string;
    resolution: { width: number; height: number };
  };
}

/**
 * État de la calibration en cours
 */
export interface CalibrationState {
  status: 'idle' | 'detecting' | 'calibrating' | 'complete' | 'error';
  currentFrame?: HTMLVideoElement | HTMLCanvasElement;
  detectedMarkers: ArucoMarker[];
  capturedFrames: {
    imageData: ImageData;
    markers: ArucoMarker[];
    timestamp: Date;
  }[];
  targetConfig: ArucoTargetConfig;
  result?: CalibrationResult;
  error?: string;
}

/**
 * Options de détection ArUco
 */
export interface ArucoDetectionOptions {
  dictionary: ArucoDictionary;
  adaptiveThreshWinSizeMin?: number;    // Défaut: 3
  adaptiveThreshWinSizeMax?: number;    // Défaut: 23
  adaptiveThreshWinSizeStep?: number;   // Défaut: 10
  minMarkerPerimeterRate?: number;      // Défaut: 0.03
  maxMarkerPerimeterRate?: number;      // Défaut: 4.0
  polygonalApproxAccuracyRate?: number; // Défaut: 0.03
  cornerRefinementMethod?: 'none' | 'subpix' | 'contour'; // Défaut: 'none'
}

/**
 * Mapping 2D→3D pour correction distorsion
 */
export interface Distortion2D3DMapping {
  imagePoint: { x: number; y: number };     // Point image 2D (pixels)
  worldPoint: { x: number; y: number; z: number }; // Point monde 3D (mm)
  undistortedPoint: { x: number; y: number }; // Point corrigé
}

/**
 * Matrice de transformation homogène 4x4
 */
export type TransformMatrix4x4 = [
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number]
];

/**
 * Configuration de la cible standard TrakerDart
 * Cible de fléchettes avec 4 marqueurs ArUco aux coins
 */
export const TRAKERDART_TARGET_CONFIG: ArucoTargetConfig = {
  dictionary: 'DICT_5X5_50',
  markerSize: 50,                // 50mm par marqueur
  targetWidth: 451,              // Largeur standard cible (451mm)
  targetHeight: 451,             // Hauteur standard cible
  markerIds: [0, 1, 2, 3],       // 4 marqueurs aux coins
  markerPositions: [
    { id: 0, x: -200, y: 200 },   // Top-left
    { id: 1, x: 200, y: 200 },    // Top-right
    { id: 2, x: 200, y: -200 },   // Bottom-right
    { id: 3, x: -200, y: -200 },  // Bottom-left
  ],
};

/**
 * Seuils de qualité de calibration
 */
export const CALIBRATION_QUALITY_THRESHOLDS = {
  excellent: {
    reprojectionError: 0.5,      // < 0.5 pixel
    minFrames: 20,
  },
  good: {
    reprojectionError: 1.0,      // < 1.0 pixel
    minFrames: 15,
  },
  acceptable: {
    reprojectionError: 2.0,      // < 2.0 pixels
    minFrames: 10,
  },
  poor: {
    reprojectionError: 5.0,      // < 5.0 pixels
    minFrames: 5,
  },
} as const;

/**
 * Obtenir le niveau de qualité de calibration
 */
export function getCalibrationQuality(result: CalibrationResult): 'excellent' | 'good' | 'acceptable' | 'poor' | 'bad' {
  const { reprojectionError, framesUsed } = result;

  if (reprojectionError < CALIBRATION_QUALITY_THRESHOLDS.excellent.reprojectionError && 
      framesUsed >= CALIBRATION_QUALITY_THRESHOLDS.excellent.minFrames) {
    return 'excellent';
  }

  if (reprojectionError < CALIBRATION_QUALITY_THRESHOLDS.good.reprojectionError && 
      framesUsed >= CALIBRATION_QUALITY_THRESHOLDS.good.minFrames) {
    return 'good';
  }

  if (reprojectionError < CALIBRATION_QUALITY_THRESHOLDS.acceptable.reprojectionError && 
      framesUsed >= CALIBRATION_QUALITY_THRESHOLDS.acceptable.minFrames) {
    return 'acceptable';
  }

  if (reprojectionError < CALIBRATION_QUALITY_THRESHOLDS.poor.reprojectionError && 
      framesUsed >= CALIBRATION_QUALITY_THRESHOLDS.poor.minFrames) {
    return 'poor';
  }

  return 'bad';
}

/**
 * Messages de qualité
 */
export const CALIBRATION_QUALITY_MESSAGES = {
  excellent: {
    title: 'Excellente calibration ! 🎯',
    description: 'Précision maximale atteinte. Idéal pour l\'analyse professionnelle.',
    color: 'text-green-400',
  },
  good: {
    title: 'Bonne calibration ✅',
    description: 'Précision élevée. Convient pour la plupart des analyses.',
    color: 'text-cyan-400',
  },
  acceptable: {
    title: 'Calibration acceptable ⚠️',
    description: 'Précision correcte. Recommandé de recalibrer pour plus de précision.',
    color: 'text-yellow-400',
  },
  poor: {
    title: 'Calibration médiocre 🔸',
    description: 'Précision limitée. Fortement recommandé de recalibrer.',
    color: 'text-orange-400',
  },
  bad: {
    title: 'Calibration insuffisante ❌',
    description: 'Précision trop faible. Recalibration nécessaire.',
    color: 'text-red-400',
  },
} as const;
