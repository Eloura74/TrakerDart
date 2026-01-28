/**
 * Service de détection de marqueurs ArUco
 * Utilise OpenCV.js pour détecter et calibrer avec précision
 */

import type {
  ArucoMarker,
  ArucoDictionary,
  ArucoDetectionOptions,
  ArucoTargetConfig,
  CalibrationResult,
} from '@/types/aruco';

// Déclaration globale OpenCV
declare global {
  interface Window {
    cv: any;
  }
}

/**
 * Service de détection ArUco
 */
export class ArucoDetector {
  private cv: any = null;
  private dictionary: any = null;
  private parameters: any = null;
  private loaded = false;

  /**
   * Charger OpenCV.js depuis CDN
   */
  async loadOpenCV(): Promise<void> {
    if (this.loaded && window.cv) {
      return;
    }

    return new Promise((resolve, reject) => {
      // Vérifier si déjà chargé
      if (window.cv && window.cv.Mat) {
        this.cv = window.cv;
        this.loaded = true;
        resolve();
        return;
      }

      // Charger depuis CDN
      const script = document.createElement('script');
      script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
      script.async = true;

      script.onload = () => {
        // OpenCV se charge de manière asynchrone
        const checkOpenCV = setInterval(() => {
          if (window.cv && window.cv.Mat) {
            clearInterval(checkOpenCV);
            this.cv = window.cv;
            this.loaded = true;
            console.log('OpenCV.js chargé avec succès');
            resolve();
          }
        }, 100);

        // Timeout après 30s
        setTimeout(() => {
          clearInterval(checkOpenCV);
          if (!this.loaded) {
            reject(new Error('Timeout chargement OpenCV.js'));
          }
        }, 30000);
      };

      script.onerror = () => {
        reject(new Error('Erreur chargement OpenCV.js'));
      };

      document.body.appendChild(script);
    });
  }

  /**
   * Initialiser le détecteur
   */
  async initialize(dictionaryType: ArucoDictionary, options?: ArucoDetectionOptions): Promise<void> {
    if (!this.loaded) {
      await this.loadOpenCV();
    }

    // Créer le dictionnaire ArUco
    const dictMap: Record<ArucoDictionary, number> = {
      'DICT_4X4_50': this.cv.aruco.DICT_4X4_50,
      'DICT_4X4_100': this.cv.aruco.DICT_4X4_100,
      'DICT_4X4_250': this.cv.aruco.DICT_4X4_250,
      'DICT_5X5_50': this.cv.aruco.DICT_5X5_50,
      'DICT_5X5_100': this.cv.aruco.DICT_5X5_100,
      'DICT_6X6_50': this.cv.aruco.DICT_6X6_50,
      'DICT_6X6_100': this.cv.aruco.DICT_6X6_100,
    };

    this.dictionary = this.cv.aruco.getPredefinedDictionary(dictMap[dictionaryType]);

    // Paramètres de détection
    this.parameters = new this.cv.aruco.DetectorParameters();
    
    if (options) {
      if (options.adaptiveThreshWinSizeMin) {
        this.parameters.adaptiveThreshWinSizeMin = options.adaptiveThreshWinSizeMin;
      }
      if (options.adaptiveThreshWinSizeMax) {
        this.parameters.adaptiveThreshWinSizeMax = options.adaptiveThreshWinSizeMax;
      }
      if (options.minMarkerPerimeterRate) {
        this.parameters.minMarkerPerimeterRate = options.minMarkerPerimeterRate;
      }
      if (options.maxMarkerPerimeterRate) {
        this.parameters.maxMarkerPerimeterRate = options.maxMarkerPerimeterRate;
      }
    }
  }

  /**
   * Détecter les marqueurs ArUco dans une image
   */
  detectMarkers(
    imageSource: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
  ): ArucoMarker[] {
    if (!this.loaded || !this.cv || !this.dictionary) {
      throw new Error('ArucoDetector non initialisé');
    }

    // Convertir l'image en Mat OpenCV
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    if (imageSource instanceof HTMLVideoElement) {
      canvas.width = imageSource.videoWidth;
      canvas.height = imageSource.videoHeight;
      ctx.drawImage(imageSource, 0, 0);
    } else {
      canvas.width = imageSource.width;
      canvas.height = imageSource.height;
      ctx.drawImage(imageSource, 0, 0);
    }

    const src = this.cv.imread(canvas);
    const markerIds = new this.cv.Mat();
    const markerCorners = new this.cv.MatVector();

    // Détection
    this.cv.aruco.detectMarkers(
      src,
      this.dictionary,
      markerCorners,
      markerIds,
      this.parameters
    );

    // Convertir en format ArucoMarker
    const markers: ArucoMarker[] = [];

    for (let i = 0; i < markerIds.rows; i++) {
      const id = markerIds.data32S[i];
      const corners = markerCorners.get(i);

      const marker: ArucoMarker = {
        id,
        corners: [
          { x: corners.data32F[0], y: corners.data32F[1] },
          { x: corners.data32F[2], y: corners.data32F[3] },
          { x: corners.data32F[4], y: corners.data32F[5] },
          { x: corners.data32F[6], y: corners.data32F[7] },
        ],
        center: {
          x: (corners.data32F[0] + corners.data32F[2] + corners.data32F[4] + corners.data32F[6]) / 4,
          y: (corners.data32F[1] + corners.data32F[3] + corners.data32F[5] + corners.data32F[7]) / 4,
        },
        confidence: 1.0, // OpenCV ArUco ne donne pas de score de confiance direct
      };

      markers.push(marker);
    }

    // Nettoyer
    src.delete();
    markerIds.delete();
    markerCorners.delete();

    return markers;
  }

  /**
   * Calibrer la caméra à partir de plusieurs frames
   */
  async calibrateCamera(
    frames: {
      imageData: ImageData;
      markers: ArucoMarker[];
    }[],
    targetConfig: ArucoTargetConfig,
    imageSize: { width: number; height: number }
  ): Promise<CalibrationResult> {
    if (!this.loaded || !this.cv) {
      throw new Error('OpenCV non chargé');
    }

    // Préparer les points objets (coordonnées 3D réelles)
    const objectPoints: number[][][] = [];
    const imagePoints: number[][][] = [];

    for (const frame of frames) {
      const frameObjectPoints: number[][] = [];
      const frameImagePoints: number[][] = [];

      for (const marker of frame.markers) {
        // Trouver la position du marqueur dans la config
        const markerPos = targetConfig.markerPositions.find(p => p.id === marker.id);
        if (!markerPos) continue;

        // Ajouter les 4 coins du marqueur
        const halfSize = targetConfig.markerSize / 2;
        
        // Points 3D (en mm, Z=0 car planaire)
        frameObjectPoints.push(
          [markerPos.x - halfSize, markerPos.y + halfSize, 0],  // Top-left
          [markerPos.x + halfSize, markerPos.y + halfSize, 0],  // Top-right
          [markerPos.x + halfSize, markerPos.y - halfSize, 0],  // Bottom-right
          [markerPos.x - halfSize, markerPos.y - halfSize, 0]   // Bottom-left
        );

        // Points 2D (pixels)
        marker.corners.forEach(corner => {
          frameImagePoints.push([corner.x, corner.y]);
        });
      }

      if (frameObjectPoints.length >= 4) {
        objectPoints.push(frameObjectPoints);
        imagePoints.push(frameImagePoints);
      }
    }

    if (objectPoints.length < 3) {
      throw new Error('Pas assez de frames valides pour la calibration (min: 3)');
    }

    // Convertir en Mat OpenCV
    const objPointsMat = new this.cv.MatVector();
    const imgPointsMat = new this.cv.MatVector();

    for (let i = 0; i < objectPoints.length; i++) {
      const objMat = this.cv.matFromArray(
        objectPoints[i].length,
        1,
        this.cv.CV_32FC3,
        objectPoints[i].flat()
      );
      const imgMat = this.cv.matFromArray(
        imagePoints[i].length,
        1,
        this.cv.CV_32FC2,
        imagePoints[i].flat()
      );

      objPointsMat.push_back(objMat);
      imgPointsMat.push_back(imgMat);
    }

    // Calibration
    const cameraMatrix = new this.cv.Mat();
    const distCoeffs = new this.cv.Mat();
    const rvecs = new this.cv.MatVector();
    const tvecs = new this.cv.MatVector();

    const reprojectionError = this.cv.calibrateCamera(
      objPointsMat,
      imgPointsMat,
      new this.cv.Size(imageSize.width, imageSize.height),
      cameraMatrix,
      distCoeffs,
      rvecs,
      tvecs
    );

    // Extraire les résultats
    const cameraMatrixArray: number[][] = [];
    for (let i = 0; i < 3; i++) {
      cameraMatrixArray.push([
        cameraMatrix.doubleAt(i, 0),
        cameraMatrix.doubleAt(i, 1),
        cameraMatrix.doubleAt(i, 2),
      ]);
    }

    const distCoeffsArray: number[] = [];
    for (let i = 0; i < 5; i++) {
      distCoeffsArray.push(distCoeffs.doubleAt(i, 0));
    }

    const result: CalibrationResult = {
      success: true,
      cameraMatrix: cameraMatrixArray,
      distortionCoeffs: distCoeffsArray,
      rvecs: [],
      tvecs: [],
      reprojectionError,
      calibrationDate: new Date(),
      framesUsed: objectPoints.length,
      resolution: imageSize,
      focalLength: {
        x: cameraMatrixArray[0][0],
        y: cameraMatrixArray[1][1],
      },
      principalPoint: {
        x: cameraMatrixArray[0][2],
        y: cameraMatrixArray[1][2],
      },
    };

    // Nettoyer
    objPointsMat.delete();
    imgPointsMat.delete();
    cameraMatrix.delete();
    distCoeffs.delete();
    rvecs.delete();
    tvecs.delete();

    return result;
  }

  /**
   * Dessiner les marqueurs détectés sur un canvas
   */
  drawMarkers(
    canvas: HTMLCanvasElement,
    markers: ArucoMarker[],
    options?: { showIds?: boolean; color?: string }
  ): void {
    const ctx = canvas.getContext('2d')!;
    const color = options?.color || '#00f2ff';
    const showIds = options?.showIds !== false;

    for (const marker of markers) {
      // Dessiner les bords
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(marker.corners[0].x, marker.corners[0].y);
      for (let i = 1; i < 4; i++) {
        ctx.lineTo(marker.corners[i].x, marker.corners[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      // Dessiner l'ID
      if (showIds) {
        ctx.fillStyle = color;
        ctx.font = 'bold 24px Arial';
        ctx.fillText(
          marker.id.toString(),
          marker.center.x - 12,
          marker.center.y + 8
        );
      }

      // Dessiner le centre
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(marker.center.x, marker.center.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  /**
   * Nettoyer les ressources
   */
  cleanup(): void {
    if (this.dictionary) {
      this.dictionary.delete();
      this.dictionary = null;
    }
    if (this.parameters) {
      this.parameters.delete();
      this.parameters = null;
    }
  }
}

/**
 * Instance singleton
 */
let detectorInstance: ArucoDetector | null = null;

/**
 * Obtenir l'instance du détecteur
 */
export function getArucoDetector(): ArucoDetector {
  if (!detectorInstance) {
    detectorInstance = new ArucoDetector();
  }
  return detectorInstance;
}
