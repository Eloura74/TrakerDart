/**
 * Panneau d'affichage des recommandations IA
 * Affiche les suggestions personnalisées générées par l'IA
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Lightbulb, 
  TrendingUp, 
  Brain, 
  Target, 
  Dumbbell,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { AIRecommendation, RecommendationType } from '@/types/ai';

interface RecommendationsPanelProps {
  recommendations: AIRecommendation[];
  loading?: boolean;
  onRefresh?: () => void;
}

const RECOMMENDATION_ICONS: Record<RecommendationType, React.ReactNode> = {
  technique: <Target className="h-4 w-4" />,
  training: <Dumbbell className="h-4 w-4" />,
  mental: <Brain className="h-4 w-4" />,
  equipment: <Lightbulb className="h-4 w-4" />,
  strategy: <TrendingUp className="h-4 w-4" />,
};

const PRIORITY_COLORS = {
  low: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export function RecommendationsPanel({ 
  recommendations, 
  loading = false,
  onRefresh 
}: RecommendationsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Sparkles className="h-8 w-8 text-primary mx-auto animate-pulse" />
            <p className="text-sm text-muted-foreground">
              L'IA analyse vos performances...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center mb-4">
            Aucune recommandation disponible.
            <br />
            Complétez quelques sessions pour obtenir des conseils personnalisés.
          </p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Générer des recommandations
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Recommandations IA</h3>
          <Badge variant="secondary" className="text-xs">
            {recommendations.length}
          </Badge>
        </div>
        {onRefresh && (
          <Button 
            onClick={onRefresh} 
            variant="ghost" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        )}
      </div>

      {/* Liste des recommandations */}
      <div className="space-y-3">
        {recommendations
          .sort((a, b) => {
            // Trier par priorité (high > medium > low)
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          })
          .map((rec) => {
            const isExpanded = expandedId === rec.id;
            
            return (
              <Card 
                key={rec.id}
                className={`border-l-4 ${
                  rec.priority === 'high' 
                    ? 'border-l-red-500' 
                    : rec.priority === 'medium'
                    ? 'border-l-yellow-500'
                    : 'border-l-blue-500'
                } transition-all hover:shadow-lg`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1 text-primary">
                        {RECOMMENDATION_ICONS[rec.type]}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base mb-1">
                          {rec.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {rec.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant="outline" 
                        className={PRIORITY_COLORS[rec.priority]}
                      >
                        {rec.priority === 'high' && '🔥 Prioritaire'}
                        {rec.priority === 'medium' && '⚡ Important'}
                        {rec.priority === 'low' && '💡 Suggestion'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Impact: {rec.estimatedImpact}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Actions rapides */}
                  {rec.actionItems.length > 0 && (
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                        className="w-full justify-between"
                      >
                        <span className="text-sm font-medium">
                          {rec.actionItems.length} actions recommandées
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>

                      {isExpanded && (
                        <div className="space-y-2 pl-4 pt-2 border-l-2 border-primary/20">
                          {rec.actionItems.map((action, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                              <p className="text-sm text-muted-foreground flex-1">
                                {action}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Raisonnement (collapsible) */}
                  {isExpanded && rec.reasoning && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Pourquoi cette recommandation ?
                      </p>
                      <p className="text-sm">{rec.reasoning}</p>
                    </div>
                  )}

                  {/* Métadonnées */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                    <Badge variant="outline" className="text-xs">
                      {rec.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      Généré le {new Date(rec.generatedAt).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {rec.modelUsed}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
