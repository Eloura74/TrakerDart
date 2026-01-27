/**
 * Composant de comparaison visuelle des 3 lancers
 * Affiche les lancers côte à côte avec mini-replay
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Throw } from '@/types'

interface ThrowComparisonProps {
  throws: [Throw, Throw, Throw]
  referenceIndex: number
}

export function ThrowComparison({ throws, referenceIndex }: ThrowComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparaison des 3 lancers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {throws.map((throwData, index) => {
            const isReference = index === referenceIndex
            
            return (
              <div
                key={throwData.id}
                className={`relative border-2 rounded-lg p-4 transition-all ${
                  isReference 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-background'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={isReference ? 'default' : 'outline'}>
                      Lancer {index + 1}
                    </Badge>
                    {isReference && (
                      <Badge variant="success">Référence</Badge>
                    )}
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">
                    {throwData.poses.length} frames
                  </span>
                </div>
                
                {/* Indicateur visuel simplifié */}
                <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-3 overflow-hidden flex items-center justify-center border-2 border-border">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {index + 1}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {throwData.poses.length} frames
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {((throwData.duration || 0) / 1000).toFixed(1)}s
                    </div>
                  </div>
                  
                  {/* Badge référence */}
                  {isReference && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="default" className="bg-success text-white">
                        ⭐ Meilleur
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* Statistiques */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Score technique</span>
                    <span className="font-bold">{throwData.analysis.technicalScore}/100</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Angles coude</span>
                    <span className="font-medium">
                      {throwData.analysis.elbow.angles.length} mesures
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confiance moy.</span>
                    <span className="font-medium">
                      {Math.round(
                        throwData.analysis.elbow.angles.reduce((sum, a) => sum + a.confidence, 0) 
                        / throwData.analysis.elbow.angles.length 
                        * 100
                      )}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Légende */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Lancer de référence :</strong> Le lancer avec le meilleur score technique. 
            Les autres lancers sont comparés à celui-ci pour calculer la régularité.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

