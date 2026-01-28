/**
 * Encodeur vidéo avec FFmpeg.wasm
 * Transforme les frames canvas en vidéo MP4
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import type { VideoExportOptions } from '@/types/video';
import { VIDEO_RESOLUTIONS } from '@/types/video';

/**
 * Encoder des frames en vidéo MP4
 * @param ffmpeg - Instance FFmpeg chargée
 * @param frames - Array de blobs (images PNG/JPEG)
 * @param options - Options d'export vidéo
 * @param onProgress - Callback progression (0-100)
 * @returns Blob de la vidéo MP4
 */
export async function encodeFramesToVideo(
  ffmpeg: FFmpeg,
  frames: Blob[],
  options: VideoExportOptions,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  try {
    console.log(`🎬 Encoding ${frames.length} frames en ${options.resolution}...`);

    const config = VIDEO_RESOLUTIONS[options.resolution];
    const frameRate = options.fps;

    // 1. Écrire chaque frame dans le système de fichiers virtuel FFmpeg
    for (let i = 0; i < frames.length; i++) {
      const paddedIndex = String(i).padStart(4, '0');
      const fileName = `frame${paddedIndex}.png`;

      await ffmpeg.writeFile(fileName, await fetchFile(frames[i]));

      // Progression écriture frames (0-30%)
      if (onProgress) {
        const percent = Math.round((i / frames.length) * 30);
        onProgress(percent);
      }
    }

    console.log('✅ Frames écrites dans FFmpeg FS');

    // 2. Construire la commande FFmpeg
    const inputPattern = 'frame%04d.png';
    const outputFile = 'output.mp4';

    // Arguments FFmpeg
    const args = [
      '-framerate', String(frameRate),     // FPS
      '-i', inputPattern,                  // Pattern input
      '-c:v', 'libx264',                   // Codec vidéo
      '-preset', 'medium',                 // Preset encoding (balance qualité/vitesse)
      '-crf', '23',                        // Quality (18=haute, 28=basse)
      '-pix_fmt', 'yuv420p',              // Format pixel (compatibilité)
      '-vf', `scale=${config.width}:${config.height}`, // Résolution
      '-r', String(frameRate),             // FPS output
      '-y',                                // Overwrite sans demander
      outputFile
    ];

    // Slow motion si activé
    if (options.slowMotion && options.slowMotionFactor) {
      const factor = options.slowMotionFactor;
      // Modifier le setpts pour ralentir
      const vfIndex = args.indexOf('-vf');
      args[vfIndex + 1] = `scale=${config.width}:${config.height},setpts=${1 / factor}*PTS`;
    }

    console.log('🎬 Commande FFmpeg:', args.join(' '));

    // 3. Écouter la progression FFmpeg
    let lastProgress = 30;
    ffmpeg.on('progress', ({ progress }) => {
      if (onProgress) {
        // Progression encoding (30-90%)
        const percent = Math.round(30 + progress * 60);
        if (percent > lastProgress) {
          lastProgress = percent;
          onProgress(percent);
        }
      }
    });

    // 4. Exécuter FFmpeg
    await ffmpeg.exec(args);

    console.log('✅ Encoding terminé');

    // 5. Lire le fichier output
    const data = await ffmpeg.readFile(outputFile);

    if (onProgress) onProgress(95);

    // 6. Nettoyer les fichiers temporaires
    for (let i = 0; i < frames.length; i++) {
      const paddedIndex = String(i).padStart(4, '0');
      await ffmpeg.deleteFile(`frame${paddedIndex}.png`).catch(() => {});
    }
    await ffmpeg.deleteFile(outputFile).catch(() => {});

    if (onProgress) onProgress(100);

    // 7. Créer le Blob vidéo
    const videoBlob = new Blob([data as BlobPart], { type: 'video/mp4' });

    console.log('✅ Vidéo créée:', {
      size: `${(videoBlob.size / 1024 / 1024).toFixed(2)} MB`,
      resolution: options.resolution,
      fps: options.fps,
      frames: frames.length
    });

    return videoBlob;
  } catch (error) {
    console.error('❌ Erreur encoding vidéo:', error);
    throw new Error('Erreur lors de la création de la vidéo. Vérifiez les frames.');
  }
}

/**
 * Estimer la taille finale de la vidéo (en MB)
 * @param frameCount - Nombre de frames
 * @param resolution - Résolution vidéo
 * @param fps - Frames par seconde
 * @returns Taille estimée en MB
 */
export function estimateVideoSize(
  frameCount: number,
  resolution: VideoExportOptions['resolution'],
  fps: number
): number {
  const config = VIDEO_RESOLUTIONS[resolution];
  const duration = frameCount / fps; // durée en secondes

  // Estimation basée sur le bitrate
  const bitrateValue = parseFloat(config.bitrate); // ex: "5M" -> 5
  const sizeInMB = (bitrateValue * duration) / 8; // Mbits/s -> MBytes

  return Math.round(sizeInMB * 10) / 10;
}

/**
 * Estimer le temps d'encoding (en secondes)
 * Basé sur des benchmarks empiriques
 * @param frameCount - Nombre de frames
 * @param resolution - Résolution vidéo
 * @returns Temps estimé en secondes
 */
export function estimateEncodingTime(
  frameCount: number,
  resolution: VideoExportOptions['resolution']
): number {
  // Temps moyen par frame (ms) selon résolution
  const timePerFrame = {
    '720p': 50,    // ~50ms par frame
    '1080p': 120,  // ~120ms par frame
    '4K': 500      // ~500ms par frame
  };

  const totalMs = frameCount * timePerFrame[resolution];
  return Math.round(totalMs / 1000);
}
