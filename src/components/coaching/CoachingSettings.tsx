/**
 * Panneau de configuration du coaching temps réel
 */

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import type {
  RealtimeCoachingConfig,
  CoachingMode,
  CoachingSensitivity,
} from "@/types/coaching";
import { Target, Volume2, Smartphone, Zap } from "lucide-react";

interface CoachingSettingsProps {
  config: RealtimeCoachingConfig;
  onChange: (config: RealtimeCoachingConfig) => void;
}

export function CoachingSettings({ config, onChange }: CoachingSettingsProps) {
  const updateConfig = (updates: Partial<RealtimeCoachingConfig>) => {
    onChange({ ...config, ...updates });
  };

  const toggleFocusArea = (joint: "elbow" | "shoulder" | "wrist" | "gaze") => {
    const exists = config.focusAreas.find((a) => a.joint === joint);

    if (exists) {
      // Retirer
      updateConfig({
        focusAreas: config.focusAreas.filter((a) => a.joint !== joint),
      });
    } else {
      // Ajouter
      updateConfig({
        focusAreas: [
          ...config.focusAreas,
          { joint, threshold: 15, priority: "medium" },
        ],
      });
    }
  };

  return (
    <Card className="relative overflow-hidden border-cyan-500/20 bg-black/40 backdrop-blur-sm group hover:border-cyan-500/30 transition-colors duration-300">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />

      <CardHeader className="relative z-10 pb-4">
        <CardTitle className="flex items-center gap-3 text-white font-heading tracking-wide uppercase text-sm md:text-base">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Zap className="h-4 w-4 text-cyan-400" />
          </div>
          Coach Virtuel Temps Réel
        </CardTitle>
        <CardDescription className="text-gray-400 text-xs md:text-sm">
          Feedback instantané pendant l'entraînement
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        {/* Activation */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-colors">
          <div>
            <Label className="text-white font-medium">Coaching Actif</Label>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">
              Activer les corrections en temps réel
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => updateConfig({ enabled })}
            className="data-[state=checked]:bg-cyan-500"
          />
        </div>

        {config.enabled && (
          <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
            {/* Mode de feedback */}
            <div className="space-y-2">
              <Label className="text-xs text-cyan-400 uppercase tracking-wider font-bold ml-1">
                Mode de Feedback
              </Label>
              <Select
                value={config.mode}
                onValueChange={(mode) =>
                  updateConfig({ mode: mode as CoachingMode })
                }
              >
                <SelectTrigger className="bg-black/20 border-white/10 text-white focus:ring-cyan-500/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 text-white">
                  <SelectItem value="visual">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-cyan-400" />
                      <span>Visuel uniquement</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="audio">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-cyan-400" />
                      <span>Audio uniquement</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="haptic">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-cyan-400" />
                      <span>Vibrations (mobile)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-cyan-400" />
                      <span>Tout combiné</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sensibilité */}
            <div className="space-y-2">
              <Label className="text-xs text-cyan-400 uppercase tracking-wider font-bold ml-1">
                Sensibilité
              </Label>
              <Select
                value={config.sensitivity}
                onValueChange={(sensitivity) =>
                  updateConfig({
                    sensitivity: sensitivity as CoachingSensitivity,
                  })
                }
              >
                <SelectTrigger className="bg-black/20 border-white/10 text-white focus:ring-cyan-500/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 text-white">
                  <SelectItem value="relaxed">
                    <div>
                      <div className="font-medium">Relax</div>
                      <div className="text-xs text-gray-400">
                        Tolérances larges
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="normal">
                    <div>
                      <div className="font-medium">Normal</div>
                      <div className="text-xs text-gray-400">Équilibré</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="strict">
                    <div>
                      <div className="font-medium">Strict</div>
                      <div className="text-xs text-gray-400">
                        Précision maximale
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Zones de focus */}
            <div className="space-y-3">
              <Label className="text-xs text-cyan-400 uppercase tracking-wider font-bold ml-1">
                Zones de Focus
              </Label>

              <div className="grid gap-2">
                {[
                  { id: "elbow", label: "Coude", desc: "Angle 90-120°" },
                  { id: "shoulder", label: "Épaules", desc: "Alignement" },
                  { id: "wrist", label: "Poignet", desc: "Flexion" },
                  { id: "gaze", label: "Regard", desc: "Focus cible" },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-cyan-500/20 transition-all cursor-pointer"
                    onClick={() => toggleFocusArea(item.id as any)}
                  >
                    <div>
                      <Label className="text-sm cursor-pointer">
                        {item.label}
                      </Label>
                      <p className="text-[10px] text-gray-400">{item.desc}</p>
                    </div>
                    <Switch
                      checked={config.focusAreas.some(
                        (a) => a.joint === item.id,
                      )}
                      onCheckedChange={() => toggleFocusArea(item.id as any)}
                      className="scale-90 data-[state=checked]:bg-cyan-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Cooldown */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-cyan-400 uppercase tracking-wider font-bold">
                  Délai Feedback
                </Label>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded">
                  {(config.cooldownMs / 1000).toFixed(1)}s
                </span>
              </div>
              <Slider
                value={[config.cooldownMs]}
                onValueChange={([cooldownMs]) => updateConfig({ cooldownMs })}
                min={500}
                max={5000}
                step={500}
                className="w-full [&_.bg-primary]:bg-cyan-500"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
