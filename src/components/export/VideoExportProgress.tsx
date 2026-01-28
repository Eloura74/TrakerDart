/**
 * Composant de progression pour l'export vidéo
 * Affiche les étapes et le pourcentage d'avancement
 */

import { Progress } from '@/components/ui/progress';
import type { VideoExportProgress as VideoExportProgressType } from '@/types/video';
import { Film, Sparkles, Video, CheckCircle2 } from 'lucide-react';

interface VideoExportProgressProps {
  progress: VideoExportProgressType;
}

export function VideoExportProgress({ progress }: VideoExportProgressProps) {
  /**
   * Obtenir l'icône selon l'étape
   */
  const getStageIcon = () => {
    switch (progress.stage) {
      case 'frames':
        return <Film className="h-5 w-5 text-cyan-400 animate-pulse" />;
      case 'overlays':
        return <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />;
      case 'encoding':
        return <Video className="h-5 w-5 text-blue-400 animate-pulse" />;
      case 'done':
        return <CheckCircle2 className="h-5 w-5 text-green-400" />;
    }
  };

  /**
   * Obtenir le label selon l'étape
   */
  const getStageLabel = () => {
    switch (progress.stage) {
      case 'frames':
        return '🎬 Génération des frames...';
      case 'overlays':
        return '✨ Ajout des overlays biomécaniques...';
      case 'encoding':
        return '🎥 Création de la vidéo MP4...';
      case 'done':
        return '✅ Export terminé !';
    }
  };

  /**
   * Obtenir la couleur de la barre selon l'étape
   */
  const getProgressColor = () => {
    switch (progress.stage) {
      case 'frames':
        return 'bg-cyan-500';
      case 'overlays':
        return 'bg-yellow-500';
      case 'encoding':
        return 'bg-blue-500';
      case 'done':
        return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-4 p-4 border border-cyan-500/20 rounded-lg bg-black/20 backdrop-blur-sm">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        {getStageIcon()}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">
              {getStageLabel()}
            </span>
            <span className="text-sm font-bold text-cyan-400">
              {progress.percent}%
            </span>
          </div>
          <Progress 
            value={progress.percent} 
            indicatorClassName={getProgressColor()}
            className="h-2"
          />
        </div>
      </div>

      {/* Message détaillé */}
      <p className="text-xs text-gray-400">
        {progress.message}
      </p>

      {/* Détails frames si disponibles */}
      {progress.currentFrame && progress.totalFrames && (
        <div className="text-xs text-gray-500">
          Frame {progress.currentFrame} / {progress.totalFrames}
        </div>
      )}

      {/* Timeline visuelle des étapes */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-700">
        <div className={`flex items-center gap-1 ${progress.stage === 'frames' || progress.stage === 'overlays' || progress.stage === 'encoding' || progress.stage === 'done' ? 'text-cyan-400' : 'text-gray-600'}`}>
          <div className={`w-2 h-2 rounded-full ${progress.stage === 'frames' || progress.stage === 'overlays' || progress.stage === 'encoding' || progress.stage === 'done' ? 'bg-cyan-400' : 'bg-gray-600'}`} />
          <span className="text-xs">Frames</span>
        </div>

        <div className={`flex items-center gap-1 ${progress.stage === 'overlays' || progress.stage === 'encoding' || progress.stage === 'done' ? 'text-yellow-400' : 'text-gray-600'}`}>
          <div className={`w-2 h-2 rounded-full ${progress.stage === 'overlays' || progress.stage === 'encoding' || progress.stage === 'done' ? 'bg-yellow-400' : 'bg-gray-600'}`} />
          <span className="text-xs">Overlays</span>
        </div>

        <div className={`flex items-center gap-1 ${progress.stage === 'encoding' || progress.stage === 'done' ? 'text-blue-400' : 'text-gray-600'}`}>
          <div className={`w-2 h-2 rounded-full ${progress.stage === 'encoding' || progress.stage === 'done' ? 'bg-blue-400' : 'bg-gray-600'}`} />
          <span className="text-xs">Encoding</span>
        </div>

        <div className={`flex items-center gap-1 ${progress.stage === 'done' ? 'text-green-400' : 'text-gray-600'}`}>
          <div className={`w-2 h-2 rounded-full ${progress.stage === 'done' ? 'bg-green-400' : 'bg-gray-600'}`} />
          <span className="text-xs">Terminé</span>
        </div>
      </div>
    </div>
  );
}
