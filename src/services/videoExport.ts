/**
 * Service d'export vidéo annotée
 * Génère des vidéos avec overlays biomécaniques
 */

import type { Volley } from '@/types';
import type { VideoExportOptions, VideoExportProgress } from '@/types/video';
import { loadFFmpeg } from '@/lib/ffmpeg/loader';
import { encodeFramesToVideo, estimateVideoSize, estimateEncodingTime } from '@/lib/ffmpeg/encoder';
import { generateReplayFrames } from './videoFrames';
import { addOverlaysToFrames } from './videoOverlays';

/**
 * Exporter une volée en vidéo annotée
 * @param volley - Volée à exporter
 * @param options - Options d'export
 * @param onProgress - Callback progression
 * @returns Blob de la vidéo MP4
 */
export async function exportAnnotatedVideo(
  volley: Volley,
  options: VideoExportOptions,
  onProgress?: (progress: VideoExportProgress) => void
): Promise<Blob> {
  try {
    // Étape 1: Charger FFmpeg (si pas déjà fait)
    onProgress?.({
      stage: 'frames',
      percent: 0,
      message: 'Chargement de FFmpeg...'
    });

    const ffmpeg = await loadFFmpeg();

    // Étape 2: Générer les frames du replay
    onProgress?.({
      stage: 'frames',
      percent: 10,
      message: 'Génération des frames...'
    });

    const frames = await generateReplayFrames(volley, options);

    console.log(`✅ ${frames.length} frames générées`);

    // Étape 3: Ajouter les overlays
    onProgress?.({
      stage: 'overlays',
      percent: 30,
      totalFrames: frames.length,
      message: 'Ajout des overlays biomécaniques...'
    });

    const annotatedFrames = await addOverlaysToFrames(
      frames,
      volley,
      options,
      (currentFrame) => {
        onProgress?.({
          stage: 'overlays',
          percent: 30 + Math.round((currentFrame / frames.length) * 30),
          currentFrame,
          totalFrames: frames.length,
          message: `Annotation frame ${currentFrame}/${frames.length}...`
        });
      }
    );

    console.log('✅ Overlays ajoutés');

    // Étape 4: Encoder en vidéo
    onProgress?.({
      stage: 'encoding',
      percent: 60,
      message: 'Création de la vidéo...'
    });

    const videoBlob = await encodeFramesToVideo(
      ffmpeg,
      annotatedFrames,
      options,
      (encodingPercent) => {
        onProgress?.({
          stage: 'encoding',
          percent: 60 + Math.round(encodingPercent * 0.4), // 60-100%
          message: `Encoding ${encodingPercent.toFixed(0)}%...`
        });
      }
    );

    // Étape 5: Terminé
    onProgress?.({
      stage: 'done',
      percent: 100,
      message: 'Vidéo créée avec succès !'
    });

    return videoBlob;
  } catch (error) {
    console.error('❌ Erreur export vidéo:', error);
    throw error;
  }
}

/**
 * Obtenir les informations estimées avant export
 * @param volley - Volée à exporter
 * @param options - Options d'export
 * @returns Estimations (taille, durée, etc.)
 */
export function getExportEstimations(volley: Volley, options: VideoExportOptions) {
  // Compter le nombre total de frames
  const totalPoses = volley.throws.reduce((sum, t) => sum + t.poses.length, 0);
  
  // Estimer taille et temps
  const estimatedSize = estimateVideoSize(totalPoses, options.resolution, options.fps);
  const estimatedTime = estimateEncodingTime(totalPoses, options.resolution);

  return {
    frameCount: totalPoses,
    duration: totalPoses / options.fps, // secondes
    estimatedSize, // MB
    estimatedTime, // secondes
    resolution: options.resolution,
    fps: options.fps
  };
}

/**
 * Télécharger automatiquement la vidéo
 * @param blob - Blob vidéo
 * @param filename - Nom du fichier
 */
export function downloadVideo(blob: Blob, filename: string = 'trakerdart-video.mp4') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
