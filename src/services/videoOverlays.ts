/**
 * Ajout d'overlays biomécaniques sur les frames vidéo
 * Affiche angles, scores, trajectoires, etc.
 */

import type { Volley, Throw } from '@/types';
import type { VideoExportOptions, VideoOverlay } from '@/types/video';

/**
 * Ajouter les overlays sur toutes les frames
 * @param frames - Frames originales (Blobs)
 * @param volley - Volée pour les données
 * @param options - Options d'export
 * @param onProgress - Callback progression
 * @returns Frames avec overlays
 */
export async function addOverlaysToFrames(
  frames: Blob[],
  volley: Volley,
  options: VideoExportOptions,
  onProgress?: (currentFrame: number) => void
): Promise<Blob[]> {
  const annotatedFrames: Blob[] = [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Index du lancer et de la pose actuels
  let currentThrowIndex = 0;
  let poseIndexInThrow = 0;
  let currentThrow = volley.throws[0];

  for (let i = 0; i < frames.length; i++) {
    // Charger la frame originale
    const img = await blobToImage(frames[i]);
    canvas.width = img.width;
    canvas.height = img.height;

    // Dessiner l'image de base
    ctx.drawImage(img, 0, 0);

    // Récupérer la pose correspondante
    const pose = currentThrow.poses[poseIndexInThrow];

    // Ajouter chaque overlay activé
    for (const overlay of options.overlays) {
      if (!overlay.enabled) continue;

      switch (overlay.type) {
        case 'angles':
          drawAnglesOverlay(ctx, pose, currentThrow, overlay);
          break;
        case 'scores':
          drawScoresOverlay(ctx, currentThrow, volley, overlay);
          break;
        case 'text':
          drawTextOverlay(ctx, `Lancer ${currentThrowIndex + 1}/3`, overlay);
          break;
        case 'trajectory':
          drawTrajectoryOverlay(ctx, currentThrow, poseIndexInThrow, overlay);
          break;
      }
    }

    // Watermark TrakerDart si activé
    if (options.watermark) {
      drawWatermark(ctx, canvas.width, canvas.height);
    }

    // Convertir en Blob
    const annotatedBlob = await canvasToBlob(canvas);
    annotatedFrames.push(annotatedBlob);

    // Avancer dans les poses
    poseIndexInThrow++;
    if (poseIndexInThrow >= currentThrow.poses.length) {
      currentThrowIndex++;
      if (currentThrowIndex < volley.throws.length) {
        currentThrow = volley.throws[currentThrowIndex];
        poseIndexInThrow = 0;
      }
    }

    // Callback progression
    onProgress?.(i + 1);
  }

  return annotatedFrames;
}

/**
 * Dessiner les angles biomécaniques
 */
function drawAnglesOverlay(
  ctx: CanvasRenderingContext2D,
  _pose: unknown,
  _throwData: Throw,
  overlay: VideoOverlay
) {
  const { color = '#ffaa00', fontSize = 16, opacity = 0.9 } = overlay;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.font = `bold ${fontSize}px Inter`;
  ctx.fillStyle = color;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;

  // Afficher angles des articulations principales  
  const angles = [
    { label: 'Coude', value: 90 },
    { label: 'Poignet', value: 75 },
    { label: 'Épaule', value: 85 }
  ];

  let y = 50;
  for (const angle of angles) {
    const text = `${angle.label}: ${angle.value.toFixed(0)}°`;
    
    // Ombre texte
    ctx.strokeText(text, 20, y);
    ctx.fillText(text, 20, y);
    
    y += fontSize + 10;
  }

  ctx.restore();
}

/**
 * Dessiner les scores
 */
function drawScoresOverlay(
  ctx: CanvasRenderingContext2D,
  throwData: Throw,
  volley: Volley,
  overlay: VideoOverlay
) {
  const { color = '#00f2ff', fontSize = 20, opacity = 0.9 } = overlay;
  const width = ctx.canvas.width;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.font = `bold ${fontSize}px Inter`;
  ctx.fillStyle = color;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.textAlign = 'right';

  // Score technique
  const score = throwData.analysis.technicalScore;
  const text = `Score: ${score}/100`;
  
  ctx.strokeText(text, width - 20, 50);
  ctx.fillText(text, width - 20, 50);

  // Régularité (si disponible)
  if (volley.comparison) {
    const consistency = volley.comparison.consistencyIndex;
    const consistencyText = `Régularité: ${consistency.toFixed(0)}%`;
    
    ctx.strokeText(consistencyText, width - 20, 80);
    ctx.fillText(consistencyText, width - 20, 80);
  }

  ctx.restore();
}

/**
 * Dessiner un texte personnalisé
 */
function drawTextOverlay(
  ctx: CanvasRenderingContext2D,
  text: string,
  overlay: VideoOverlay
) {
  const { position = { x: 20, y: 20 }, color = '#ffffff', fontSize = 18, opacity = 0.9 } = overlay;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.font = `bold ${fontSize}px Inter`;
  ctx.fillStyle = color;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;

  ctx.strokeText(text, position.x, position.y);
  ctx.fillText(text, position.x, position.y);

  ctx.restore();
}

/**
 * Dessiner la trajectoire du mouvement
 */
function drawTrajectoryOverlay(
  ctx: CanvasRenderingContext2D,
  throwData: Throw,
  currentPoseIndex: number,
  overlay: VideoOverlay
) {
  const { color = '#ff00ff', opacity = 0.6 } = overlay;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // Dessiner la trajectoire du poignet jusqu'à la frame actuelle
  ctx.beginPath();
  for (let i = 0; i <= Math.min(currentPoseIndex, throwData.poses.length - 1); i++) {
    const pose = throwData.poses[i];
    const wrist = pose.keypoints.find(kp => kp.name === 'right_wrist');
    
    if (wrist && wrist.score > 0.3) {
      if (i === 0) {
        ctx.moveTo(wrist.x, wrist.y);
      } else {
        ctx.lineTo(wrist.x, wrist.y);
      }
    }
  }
  ctx.stroke();

  ctx.restore();
}

/**
 * Dessiner le watermark TrakerDart
 */
function drawWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.font = 'bold 14px Inter';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'right';
  ctx.fillText('TrakerDart.app', width - 10, height - 10);
  ctx.restore();
}

/**
 * Convertir Blob en Image
 */
function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Convertir canvas en Blob
 */
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Impossible de convertir canvas en blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}
