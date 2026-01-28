/**
 * Composant UI pour configurer les options d'export vidéo
 */

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import type { VideoExportOptions, VideoOverlay } from '@/types/video';
import { Lock, Video, Zap } from 'lucide-react';

interface VideoExportOptionsProps {
  options: VideoExportOptions;
  onChange: (options: VideoExportOptions) => void;
  tier: 'free' | 'pro' | 'elite';
}

export function VideoExportOptionsComponent({
  options,
  onChange,
  tier
}: VideoExportOptionsProps) {
  /**
   * Met à jour un overlay spécifique
   */
  const updateOverlay = (type: VideoOverlay['type'], updates: Partial<VideoOverlay>) => {
    const newOverlays = options.overlays.map(overlay =>
      overlay.type === type ? { ...overlay, ...updates } : overlay
    );
    onChange({ ...options, overlays: newOverlays });
  };

  /**
   * Vérifie si une résolution est accessible selon le tier
   */
  const isResolutionLocked = (resolution: string): boolean => {
    if (tier === 'elite') return false;
    if (tier === 'pro' && (resolution === '720p' || resolution === '1080p')) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Résolution */}
      <div className="space-y-2">
        <Label>Résolution</Label>
        <Select
          value={options.resolution}
          onValueChange={(value) => onChange({ ...options, resolution: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="720p">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span>720p (HD)</span>
                {tier === 'pro' && <span className="text-xs text-muted-foreground">(5 restants)</span>}
              </div>
            </SelectItem>
            <SelectItem value="1080p" disabled={isResolutionLocked('1080p')}>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span>1080p (Full HD)</span>
                {isResolutionLocked('1080p') && <Lock className="h-3 w-3 text-yellow-500" />}
              </div>
            </SelectItem>
            <SelectItem value="4K" disabled={isResolutionLocked('4K')}>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span>4K (Ultra HD)</span>
                {isResolutionLocked('4K') && <Lock className="h-3 w-3 text-yellow-500" />}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {tier !== 'elite' && (
          <p className="text-xs text-muted-foreground">
            {tier === 'free' && '🔒 Vidéo disponible en tier Pro et Elite'}
            {tier === 'pro' && '💡 Elite débloque 1080p et 4K'}
          </p>
        )}
      </div>

      {/* FPS */}
      <div className="space-y-2">
        <Label>Images par seconde (FPS)</Label>
        <Select
          value={String(options.fps)}
          onValueChange={(value) => onChange({ ...options, fps: Number(value) as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 FPS (Standard)</SelectItem>
            <SelectItem value="60">60 FPS (Fluide)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overlays */}
      <Card className="border-cyan-500/20 bg-cyan-500/5">
        <CardContent className="pt-6 space-y-4">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400" />
            Overlays Biomécaniques
          </h4>

          {/* Skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Skeleton (Pose)</Label>
              <p className="text-xs text-muted-foreground">
                Afficher le squelette 3D
              </p>
            </div>
            <Switch
              checked={options.overlays.find(o => o.type === 'skeleton')?.enabled ?? true}
              onCheckedChange={(checked) => updateOverlay('skeleton', { enabled: checked })}
            />
          </div>

          {/* Angles */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Angles Articulaires</Label>
              <p className="text-xs text-muted-foreground">
                Coude, poignet, épaule
              </p>
            </div>
            <Switch
              checked={options.overlays.find(o => o.type === 'angles')?.enabled ?? true}
              onCheckedChange={(checked) => updateOverlay('angles', { enabled: checked })}
            />
          </div>

          {/* Scores */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Scores Techniques</Label>
              <p className="text-xs text-muted-foreground">
                Score et régularité
              </p>
            </div>
            <Switch
              checked={options.overlays.find(o => o.type === 'scores')?.enabled ?? true}
              onCheckedChange={(checked) => updateOverlay('scores', { enabled: checked })}
            />
          </div>

          {/* Trajectoire */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Trajectoire</Label>
              <p className="text-xs text-muted-foreground">
                Trace du mouvement
              </p>
            </div>
            <Switch
              checked={options.overlays.find(o => o.type === 'trajectory')?.enabled ?? false}
              onCheckedChange={(checked) => updateOverlay('trajectory', { enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Slow Motion */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Ralenti</Label>
          <p className="text-xs text-muted-foreground">
            Ralentir 2x sur phases critiques
          </p>
        </div>
        <Switch
          checked={options.slowMotion}
          onCheckedChange={(checked) => onChange({ ...options, slowMotion: checked })}
        />
      </div>

      {/* Watermark */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Watermark TrakerDart</Label>
          <p className="text-xs text-muted-foreground">
            Logo en bas à droite
          </p>
        </div>
        <Switch
          checked={options.watermark ?? true}
          onCheckedChange={(checked) => onChange({ ...options, watermark: checked })}
        />
      </div>
    </div>
  );
}
