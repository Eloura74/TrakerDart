/**
 * Panneau de configuration du coaching temps réel
 */

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import type { RealtimeCoachingConfig, CoachingMode, CoachingSensitivity } from '@/types/coaching';
import { Target, Volume2, Smartphone, Zap } from 'lucide-react';

interface CoachingSettingsProps {
  config: RealtimeCoachingConfig;
  onChange: (config: RealtimeCoachingConfig) => void;
}

export function CoachingSettings({ config, onChange }: CoachingSettingsProps) {
  const updateConfig = (updates: Partial<RealtimeCoachingConfig>) => {
    onChange({ ...config, ...updates });
  };

  const toggleFocusArea = (joint: 'elbow' | 'shoulder' | 'wrist' | 'gaze') => {
    const exists = config.focusAreas.find(a => a.joint === joint);
    
    if (exists) {
      // Retirer
      updateConfig({
        focusAreas: config.focusAreas.filter(a => a.joint !== joint)
      });
    } else {
      // Ajouter
      updateConfig({
        focusAreas: [
          ...config.focusAreas,
          { joint, threshold: 15, priority: 'medium' }
        ]
      });
    }
  };

  return (
    <Card className="border-cyan-500/20 bg-black/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Zap className="h-5 w-5 text-cyan-400" />
          Coach Virtuel Temps Réel
        </CardTitle>
        <CardDescription className="text-gray-400">
          Feedback instantané pendant l'entraînement
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Activation */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white">Coaching Actif</Label>
            <p className="text-xs text-gray-400 mt-1">
              Activer les corrections en temps réel
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => updateConfig({ enabled })}
          />
        </div>

        {config.enabled && (
          <>
            {/* Mode de feedback */}
            <div className="space-y-2">
              <Label className="text-white">Mode de Feedback</Label>
              <Select
                value={config.mode}
                onValueChange={(mode) => updateConfig({ mode: mode as CoachingMode })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>Visuel uniquement</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="audio">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <span>Audio uniquement</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="haptic">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span>Vibrations (mobile)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span>Tout combiné</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sensibilité */}
            <div className="space-y-2">
              <Label className="text-white">Sensibilité</Label>
              <Select
                value={config.sensitivity}
                onValueChange={(sensitivity) => updateConfig({ sensitivity: sensitivity as CoachingSensitivity })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relaxed">
                    <div>
                      <div className="font-medium">Relax</div>
                      <div className="text-xs text-gray-400">Tolérances larges, moins de feedbacks</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="normal">
                    <div>
                      <div className="font-medium">Normal</div>
                      <div className="text-xs text-gray-400">Équilibre entre précision et confort</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="strict">
                    <div>
                      <div className="font-medium">Strict</div>
                      <div className="text-xs text-gray-400">Haute précision, coaching intensif</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Zones de focus */}
            <div className="space-y-3">
              <Label className="text-white">Zones de Focus</Label>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Coude</Label>
                    <p className="text-xs text-gray-400">Angle optimal 90-120°</p>
                  </div>
                  <Switch
                    checked={config.focusAreas.some(a => a.joint === 'elbow')}
                    onCheckedChange={() => toggleFocusArea('elbow')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Épaules</Label>
                    <p className="text-xs text-gray-400">Alignement horizontal</p>
                  </div>
                  <Switch
                    checked={config.focusAreas.some(a => a.joint === 'shoulder')}
                    onCheckedChange={() => toggleFocusArea('shoulder')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Poignet</Label>
                    <p className="text-xs text-gray-400">Position et flexion</p>
                  </div>
                  <Switch
                    checked={config.focusAreas.some(a => a.joint === 'wrist')}
                    onCheckedChange={() => toggleFocusArea('wrist')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Regard</Label>
                    <p className="text-xs text-gray-400">Direction vers la cible</p>
                  </div>
                  <Switch
                    checked={config.focusAreas.some(a => a.joint === 'gaze')}
                    onCheckedChange={() => toggleFocusArea('gaze')}
                  />
                </div>
              </div>
            </div>

            {/* Cooldown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Délai entre feedbacks</Label>
                <span className="text-sm text-gray-400">{(config.cooldownMs / 1000).toFixed(1)}s</span>
              </div>
              <Slider
                value={[config.cooldownMs]}
                onValueChange={([cooldownMs]) => updateConfig({ cooldownMs })}
                min={500}
                max={5000}
                step={500}
                className="w-full"
              />
              <p className="text-xs text-gray-400">
                Temps minimum entre deux corrections
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
