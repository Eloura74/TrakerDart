/**
 * Génération des frames vidéo à partir des poses
 * Crée des images canvas pour chaque frame du replay
 */

import type { Volley, Pose } from '@/types';
import type { VideoExportOptions } from '@/types/video';
import { VIDEO_RESOLUTIONS } from '@/types/video';

/**
 * Générer les frames du replay pour toute la volée
 * @param volley - Volée contenant les 3 lancers
 * @param options - Options d'export vidéo
 * @returns Array de Blobs (images PNG)
 */
export async function generateReplayFrames(
  volley: Volley,
  options: VideoExportOptions
): Promise<Blob[]> {
  const config = VIDEO_RESOLUTIONS[options.resolution];
  const frames: Blob[] = [];

  // Pour chaque lancer de la volée
  for (const throwData of volley.throws) {
    const throwFrames = await generateThrowFrames(
      throwData.poses,
      config.width,
      config.height
    );
    frames.push(...throwFrames);
  }

  return frames;
}

/**
 * Générer les frames pour un seul lancer
 * @param poses - Séquence de poses du lancer
 * @param width - Largeur vidéo
 * @param height - Hauteur vidéo
 * @returns Array de Blobs
 */
async function generateThrowFrames(
  poses: Pose[],
  width: number,
  height: number
): Promise<Blob[]> {
  const frames: Blob[] = [];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  for (const pose of poses) {
    // Dessiner le fond (noir ou gradient)
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Dessiner la pose (skeleton) sur le canvas
    drawPoseSkeleton(ctx, pose);

    // Convertir canvas en Blob
    const blob = await canvasToBlob(canvas);
    frames.push(blob);
  }

  return frames;
}

/**
 * Dessiner le skeleton d'une pose sur le canvas
 * @param ctx - Contexte canvas 2D
 * @param pose - Pose à dessiner
 * @param width - Largeur canvas
 * @param height - Hauteur canvas
 */
function drawPoseSkeleton(
  ctx: CanvasRenderingContext2D,
  pose: Pose
) {
  const keypoints = pose.keypoints;

  // Définir les connexions entre points (squelette)
  const connections = [
    // Torse
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_hip', 'right_hip'],
    
    // Bras gauche
    ['left_shoulder', 'left_elbow'],
    ['left_elbow', 'left_wrist'],
    
    // Bras droit
    ['right_shoulder', 'right_elbow'],
    ['right_elbow', 'right_wrist'],
    
    // Jambe gauche
    ['left_hip', 'left_knee'],
    ['left_knee', 'left_ankle'],
    
    // Jambe droite
    ['right_hip', 'right_knee'],
    ['right_knee', 'right_ankle'],
    
    // Tête
    ['left_shoulder', 'left_ear'],
    ['right_shoulder', 'right_ear'],
    ['left_ear', 'left_eye'],
    ['right_ear', 'right_eye'],
    ['left_eye', 'nose'],
    ['right_eye', 'nose']
  ];

  // Dessiner les lignes du skeleton
  ctx.strokeStyle = '#00f2ff'; // Cyan
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  for (const [start, end] of connections) {
    const startPoint = keypoints.find(kp => kp.name === start);
    const endPoint = keypoints.find(kp => kp.name === end);

    if (startPoint && endPoint && startPoint.score > 0.3 && endPoint.score > 0.3) {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    }
  }

  // Dessiner les points (articulations)
  ctx.fillStyle = '#00f2ff';
  for (const kp of keypoints) {
    if (kp.score > 0.3) {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}

/**
 * Convertir un canvas en Blob PNG
 * @param canvas - Canvas à convertir
 * @returns Promise<Blob>
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
      1.0 // Qualité maximale
    );
  });
}
