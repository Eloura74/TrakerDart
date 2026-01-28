/**
 * Service de correction de distorsion
 * Applique la correction basée sur une calibration ArUco
 */

import type { CalibrationResult, Distortion2D3DMapping } from '@/types/aruco';
import type { Keypoint } from '@/types';

/**
 * Correcteur de distorsion
 */
export class DistortionCorrector {
  private calibration: CalibrationResult | null = null;
  private mapX: number[][] | null = null;
  private mapY: number[][] | null = null;

  /**
   * Charger une calibration
   */
  setCalibration(calibration: CalibrationResult): void {
    this.calibration = calibration;
    this.generateRemapTables();
  }

  /**
   * Générer les tables de remapping (pour optimisation)
   */
  private generateRemapTables(): void {
    if (!this.calibration) return;

    const { width, height } = this.calibration.resolution;
    const { cameraMatrix, distortionCoeffs } = this.calibration;

    // Extraire les paramètres
    const fx = cameraMatrix[0][0];
    const fy = cameraMatrix[1][1];
    const cx = cameraMatrix[0][2];
    const cy = cameraMatrix[1][2];

    const [k1, k2, p1, p2, k3] = distortionCoeffs;

    // Initialiser les maps
    this.mapX = Array(height).fill(0).map(() => Array(width).fill(0));
    this.mapY = Array(height).fill(0).map(() => Array(width).fill(0));

    // Calculer pour chaque pixel
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Normaliser les coordonnées
        const xNorm = (x - cx) / fx;
        const yNorm = (y - cy) / fy;

        // Rayon au carré
        const r2 = xNorm * xNorm + yNorm * yNorm;
        const r4 = r2 * r2;
        const r6 = r4 * r2;

        // Distorsion radiale
        const radialDistortion = 1 + k1 * r2 + k2 * r4 + k3 * r6;

        // Distorsion tangentielle
        const tangentialX = 2 * p1 * xNorm * yNorm + p2 * (r2 + 2 * xNorm * xNorm);
        const tangentialY = p1 * (r2 + 2 * yNorm * yNorm) + 2 * p2 * xNorm * yNorm;

        // Coordonnées corrigées (normalisées)
        const xCorrectedNorm = xNorm * radialDistortion + tangentialX;
        const yCorrectedNorm = yNorm * radialDistortion + tangentialY;

        // Reprojeter
        this.mapX[y][x] = fx * xCorrectedNorm + cx;
        this.mapY[y][x] = fy * yCorrectedNorm + cy;
      }
    }
  }

  /**
   * Corriger un point 2D
   */
  undistortPoint(point: { x: number; y: number }): { x: number; y: number } {
    if (!this.calibration) {
      return point; // Pas de calibration, retourner tel quel
    }

    const { cameraMatrix, distortionCoeffs } = this.calibration;

    // Extraire paramètres
    const fx = cameraMatrix[0][0];
    const fy = cameraMatrix[1][1];
    const cx = cameraMatrix[0][2];
    const cy = cameraMatrix[1][2];

    const [k1, k2, p1, p2, k3] = distortionCoeffs;

    // Normaliser
    let xNorm = (point.x - cx) / fx;
    let yNorm = (point.y - cy) / fy;

    // Itération pour trouver les coordonnées non distordues
    // (Newton-Raphson approximation)
    for (let i = 0; i < 5; i++) {
      const r2 = xNorm * xNorm + yNorm * yNorm;
      const r4 = r2 * r2;
      const r6 = r4 * r2;

      const radialDistortion = 1 + k1 * r2 + k2 * r4 + k3 * r6;

      const tangentialX = 2 * p1 * xNorm * yNorm + p2 * (r2 + 2 * xNorm * xNorm);
      const tangentialY = p1 * (r2 + 2 * yNorm * yNorm) + 2 * p2 * xNorm * yNorm;

      const xDistorted = xNorm * radialDistortion + tangentialX;
      const yDistorted = yNorm * radialDistortion + tangentialY;

      // Correction
      xNorm = xNorm - (xDistorted - (point.x - cx) / fx) * 0.5;
      yNorm = yNorm - (yDistorted - (point.y - cy) / fy) * 0.5;
    }

    // Reprojeter
    return {
      x: fx * xNorm + cx,
      y: fy * yNorm + cy,
    };
  }

  /**
   * Corriger un keypoint (pose detection)
   */
  undistortKeypoint(keypoint: Keypoint): Keypoint {
    if (!this.calibration) {
      return keypoint;
    }

    const undistorted = this.undistortPoint({ x: keypoint.x, y: keypoint.y });

    return {
      ...keypoint,
      x: undistorted.x,
      y: undistorted.y,
    };
  }

  /**
   * Corriger plusieurs keypoints
   */
  undistortKeypoints(keypoints: Keypoint[]): Keypoint[] {
    return keypoints.map(kp => this.undistortKeypoint(kp));
  }

  /**
   * Corriger une image complète (canvas)
   */
  undistortImage(
    sourceCanvas: HTMLCanvasElement,
    targetCanvas: HTMLCanvasElement
  ): void {
    if (!this.calibration || !this.mapX || !this.mapY) {
      // Pas de calibration, copier tel quel
      const ctx = targetCanvas.getContext('2d')!;
      ctx.drawImage(sourceCanvas, 0, 0);
      return;
    }

    const { width, height } = this.calibration.resolution;
    targetCanvas.width = width;
    targetCanvas.height = height;

    const sourceCtx = sourceCanvas.getContext('2d')!;
    const targetCtx = targetCanvas.getContext('2d')!;

    const sourceImageData = sourceCtx.getImageData(0, 0, width, height);
    const targetImageData = targetCtx.createImageData(width, height);

    const sourceData = sourceImageData.data;
    const targetData = targetImageData.data;

    // Appliquer le remapping
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcX = Math.round(this.mapX[y][x]);
        const srcY = Math.round(this.mapY[y][x]);

        // Vérifier les limites
        if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
          const targetIdx = (y * width + x) * 4;
          const sourceIdx = (srcY * width + srcX) * 4;

          targetData[targetIdx] = sourceData[sourceIdx];         // R
          targetData[targetIdx + 1] = sourceData[sourceIdx + 1]; // G
          targetData[targetIdx + 2] = sourceData[sourceIdx + 2]; // B
          targetData[targetIdx + 3] = sourceData[sourceIdx + 3]; // A
        }
      }
    }

    targetCtx.putImageData(targetImageData, 0, 0);
  }

  /**
   * Obtenir le mapping 2D→3D pour un point
   */
  get2D3DMapping(point2D: { x: number; y: number }, z: number = 0): Distortion2D3DMapping {
    const undistorted = this.undistortPoint(point2D);

    if (!this.calibration) {
      return {
        imagePoint: point2D,
        undistortedPoint: undistorted,
        worldPoint: { x: 0, y: 0, z },
      };
    }

    const { cameraMatrix } = this.calibration;
    const fx = cameraMatrix[0][0];
    const fy = cameraMatrix[1][1];
    const cx = cameraMatrix[0][2];
    const cy = cameraMatrix[1][2];

    // Projection inverse (assumant Z=0, plan de la cible)
    const worldX = (undistorted.x - cx) / fx * z;
    const worldY = (undistorted.y - cy) / fy * z;

    return {
      imagePoint: point2D,
      undistortedPoint: undistorted,
      worldPoint: { x: worldX, y: worldY, z },
    };
  }

  /**
   * Obtenir la distance focale moyenne
   */
  getFocalLength(): number | null {
    if (!this.calibration) return null;
    const { focalLength } = this.calibration;
    return (focalLength.x + focalLength.y) / 2;
  }

  /**
   * Obtenir l'erreur de reprojection
   */
  getReprojectionError(): number | null {
    if (!this.calibration) return null;
    return this.calibration.reprojectionError;
  }

  /**
   * Vérifier si une calibration est chargée
   */
  isCalibrated(): boolean {
    return this.calibration !== null;
  }

  /**
   * Nettoyer
   */
  clear(): void {
    this.calibration = null;
    this.mapX = null;
    this.mapY = null;
  }
}

/**
 * Instance singleton
 */
let correctorInstance: DistortionCorrector | null = null;

/**
 * Obtenir l'instance du correcteur
 */
export function getDistortionCorrector(): DistortionCorrector {
  if (!correctorInstance) {
    correctorInstance = new DistortionCorrector();
  }
  return correctorInstance;
}

/**
 * Hook React pour utiliser le correcteur
 */
export function useDistortionCorrector() {
  return getDistortionCorrector();
}
