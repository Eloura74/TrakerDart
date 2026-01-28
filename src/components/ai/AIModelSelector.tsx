/**
 * Sélecteur de modèle IA avec comparaison prix/qualité
 * Interface simple pour changer de modèle facilement
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, DollarSign, Gauge, Star } from 'lucide-react';
import type { AIModel, AIModelConfig } from '@/types/ai';
import { AI_MODELS } from '@/types/ai';

interface AIModelSelectorProps {
  config: AIModelConfig;
  onChange: (config: AIModelConfig) => void;
  usageStats?: {
    totalCostUSD: number;
    totalTokensUsed: number;
  };
}

export function AIModelSelector({ config, onChange, usageStats }: AIModelSelectorProps) {
  const currentModel = AI_MODELS[config.model];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Configuration IA Générative</CardTitle>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => onChange({ ...config, enabled })}
          />
        </div>
        <CardDescription>
          Personnalisez le modèle IA et les paramètres selon vos besoins
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sélection du modèle */}
        <div className="space-y-3">
          <Label>Modèle IA</Label>
          <Select
            value={config.model}
            onValueChange={(model) => onChange({ ...config, model: model as AIModel })}
            disabled={!config.enabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(AI_MODELS).map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center justify-between gap-4 w-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{model.name}</span>
                        {model.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Recommandé
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {model.description}
                      </p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Infos modèle sélectionné */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                Coût
              </div>
              <div className="text-sm font-medium">
                ${currentModel.costPer1KTokens}/1K
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />
                Vitesse
              </div>
              <div className="text-sm font-medium capitalize">
                {currentModel.speed}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Gauge className="h-3 w-3" />
                Qualité
              </div>
              <div className="text-sm font-medium capitalize">
                {currentModel.quality}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                Contexte
              </div>
              <div className="text-sm font-medium">
                {(currentModel.maxContextTokens / 1000).toFixed(0)}K
              </div>
            </div>
          </div>
        </div>

        {/* Température (créativité) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Créativité</Label>
            <span className="text-sm text-muted-foreground">
              {config.temperature.toFixed(1)}
            </span>
          </div>
          <Slider
            value={[config.temperature]}
            onValueChange={([temperature]) => onChange({ ...config, temperature })}
            min={0}
            max={2}
            step={0.1}
            disabled={!config.enabled}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            {config.temperature < 0.5 && 'Précis et factuel'}
            {config.temperature >= 0.5 && config.temperature < 1 && 'Équilibré (recommandé)'}
            {config.temperature >= 1 && config.temperature < 1.5 && 'Créatif'}
            {config.temperature >= 1.5 && 'Très créatif et varié'}
          </p>
        </div>

        {/* Limite de tokens */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Longueur des réponses</Label>
            <span className="text-sm text-muted-foreground">
              {config.maxTokens} tokens
            </span>
          </div>
          <Slider
            value={[config.maxTokens]}
            onValueChange={([maxTokens]) => onChange({ ...config, maxTokens })}
            min={100}
            max={4000}
            step={100}
            disabled={!config.enabled}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            {config.maxTokens < 500 && 'Réponses courtes'}
            {config.maxTokens >= 500 && config.maxTokens < 1500 && 'Réponses moyennes (recommandé)'}
            {config.maxTokens >= 1500 && 'Réponses détaillées'}
          </p>
        </div>

        {/* Stats d'utilisation */}
        {usageStats && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="text-sm font-medium mb-3">Utilisation ce mois-ci</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Tokens utilisés</p>
                <p className="text-lg font-bold text-primary">
                  {(usageStats.totalTokensUsed / 1000).toFixed(1)}K
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Coût estimé</p>
                <p className="text-lg font-bold text-primary">
                  ${usageStats.totalCostUSD.toFixed(3)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Note importante */}
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-xs text-yellow-200">
            <span className="font-medium">Note :</span> L'utilisation de l'IA nécessite une clé API OpenAI.
            Les coûts sont facturés directement par OpenAI selon votre utilisation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
