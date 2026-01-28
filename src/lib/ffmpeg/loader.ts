/**
 * Chargeur FFmpeg.wasm
 * Gère l'initialisation et le cache de FFmpeg
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;
let loadPromise: Promise<FFmpeg> | null = null;

/**
 * Charge FFmpeg.wasm une seule fois (singleton)
 * @returns Instance FFmpeg prête à l'emploi
 */
export async function loadFFmpeg(): Promise<FFmpeg> {
  // Si déjà chargé, retourner l'instance
  if (ffmpegInstance && ffmpegInstance.loaded) {
    return ffmpegInstance;
  }

  // Si en cours de chargement, attendre la promesse existante
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Démarrer le chargement
  isLoading = true;
  loadPromise = (async () => {
    try {
      console.log('🎬 Chargement de FFmpeg.wasm...');

      const ffmpeg = new FFmpeg();

      // Écouter les logs FFmpeg (utile pour debug)
      ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message);
      });

      // Écouter la progression (utile pour UI)
      ffmpeg.on('progress', ({ progress, time }) => {
        console.log(`[FFmpeg] Progression: ${(progress * 100).toFixed(1)}% (${time}s)`);
      });

      // Charger les fichiers WASM depuis CDN
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      console.log('✅ FFmpeg.wasm chargé avec succès');

      ffmpegInstance = ffmpeg;
      isLoading = false;

      return ffmpeg;
    } catch (error) {
      console.error('❌ Erreur chargement FFmpeg:', error);
      isLoading = false;
      loadPromise = null;
      throw new Error('Impossible de charger FFmpeg. Vérifiez votre connexion internet.');
    }
  })();

  return loadPromise;
}

/**
 * Vérifier si FFmpeg est déjà chargé
 */
export function isFFmpegLoaded(): boolean {
  return ffmpegInstance?.loaded ?? false;
}

/**
 * Obtenir l'instance FFmpeg (si chargée)
 */
export function getFFmpegInstance(): FFmpeg | null {
  return ffmpegInstance;
}
