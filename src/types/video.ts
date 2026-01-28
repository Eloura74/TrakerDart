/**
 * Types pour l'export vidéo annotée
 */

export type VideoResolution = '720p' | '1080p' | '4K';
export type VideoCodec = 'h264' | 'h265';
export type VideoFPS = 30 | 60;

export interface VideoExportOptions {
  resolution: VideoResolution;
  fps: VideoFPS;
  codec: VideoCodec;
  overlays: VideoOverlay[];
  slowMotion: boolean;
  slowMotionFactor?: number; // 0.5 = 2x plus lent
  includeAudio?: boolean;
  watermark?: boolean;
}

export type OverlayType = 'skeleton' | 'angles' | 'scores' | 'text' | 'trajectory';

export interface VideoOverlay {
  type: OverlayType;
  enabled: boolean;
  position?: { x: number; y: number };
  color?: string;
  opacity?: number;
  fontSize?: number;
}

export interface VideoExportProgress {
  stage: 'frames' | 'overlays' | 'encoding' | 'done';
  percent: number;
  currentFrame?: number;
  totalFrames?: number;
  message: string;
}

export interface VideoResolutionConfig {
  width: number;
  height: number;
  bitrate: string;
  featureKey: string;
}

// Configuration des résolutions
export const VIDEO_RESOLUTIONS: Record<VideoResolution, VideoResolutionConfig> = {
  '720p': {
    width: 1280,
    height: 720,
    bitrate: '2M',
    featureKey: 'video_exports_720p',
  },
  '1080p': {
    width: 1920,
    height: 1080,
    bitrate: '5M',
    featureKey: 'video_exports_1080p',
  },
  '4K': {
    width: 3840,
    height: 2160,
    bitrate: '20M',
    featureKey: 'video_exports_4k',
  },
};
