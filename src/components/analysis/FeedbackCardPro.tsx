/**
 * Affichage des recommandations professionnelles avec catégories
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, TrendingUp, Lightbulb, ExternalLink } from 'lucide-react'
import type { DetailedRecommendation } from '@/lib/feedback/professionalRecommendations'

interface FeedbackCardProProps {
  recommendations: DetailedRecommendation[]
}

export function FeedbackCardPro({ recommendations }: FeedbackCardProProps) {
  // Grouper par catégorie
  const critical = recommendations.filter(r => r.category === 'critical')
  const important = recommendations.filter(r => r.category === 'important')
  const improvement = recommendations.filter(r => r.category === 'improvement')
  const good = recommendations.filter(r => r.category === 'good')
  
  return (
    <div className="space-y-4">
      {/* Critiques - Priorité absolue */}
      {critical.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Corrections critiques</CardTitle>
            </div>
            <CardDescription>
              À corriger immédiatement - Impact majeur sur la performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {critical.map(rec => (
              <RecommendationItem key={rec.id} recommendation={rec} />
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Importants */}
      {important.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-warning" />
              <CardTitle className="text-warning">Points à améliorer</CardTitle>
            </div>
            <CardDescription>
              Impact significatif - Travailler après les critiques
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {important.map(rec => (
              <RecommendationItem key={rec.id} recommendation={rec} />
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Améliorations */}
      {improvement.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle>Perfectionnement</CardTitle>
            </div>
            <CardDescription>
              Détails à polir pour passer au niveau supérieur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {improvement.map(rec => (
              <RecommendationItem key={rec.id} recommendation={rec} />
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Points forts */}
      {good.length > 0 && (
        <Card className="border-success/50 bg-success/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <CardTitle className="text-success">Points forts</CardTitle>
            </div>
            <CardDescription>
              Continuez comme ça ! 🎯
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {good.map(rec => (
              <div key={rec.id} className="text-sm">
                <strong>{rec.title}</strong>
                <p className="text-muted-foreground mt-1">{rec.solution}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Item de recommandation détaillé
 */
function RecommendationItem({ recommendation }: { recommendation: DetailedRecommendation }) {
  return (
    <div className="space-y-3 p-4 border rounded-lg bg-background">
      {/* Titre */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-base">{recommendation.title}</h4>
        <Badge variant="outline" className="shrink-0">
          #{recommendation.priority}
        </Badge>
      </div>
      
      {/* Problème */}
      {recommendation.problem && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">⚠️ Problème détecté</p>
          <p className="text-sm">{recommendation.problem}</p>
        </div>
      )}
      
      {/* Solution */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-primary">💡 Solution</p>
        <div className="text-sm whitespace-pre-line">{recommendation.solution}</div>
      </div>
      
      {/* Exercice */}
      {recommendation.exercice && (
        <div className="space-y-1 p-3 bg-muted/50 rounded border-l-4 border-primary">
          <p className="text-sm font-medium">🎯 Exercice recommandé</p>
          <p className="text-sm text-muted-foreground">{recommendation.exercice}</p>
        </div>
      )}
      
      {/* Vidéo référence */}
      {recommendation.videoRef && (
        <a 
          href={recommendation.videoRef}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Voir la technique en vidéo
        </a>
      )}
    </div>
  )
}
