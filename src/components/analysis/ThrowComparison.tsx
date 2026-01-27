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
                
                {/* Vignette du mouvement (première pose) */}
                <div className="relative aspect-video bg-muted rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                  {throwData.poses[0] ? (
                    <svg className="w-full h-full p-4" viewBox="0 0 640 480" preserveAspectRatio="xMidYMid meet">
                      {/* Dessin simple du squelette de la première pose */}
                      {renderSimpleSkeleton(throwData.poses[0].keypoints)}
                    </svg>
                  ) : (
                    <div className="text-muted-foreground text-xs">Aucune donnée</div>
                  )}
                  
                  {/* Badge durée */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {((throwData.duration || 0) / 1000).toFixed(1)}s
                  </div>
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

/**
 * Dessine un squelette simplifié en SVG
 */
function renderSimpleSkeleton(keypoints: Array<{ name?: string; x: number; y: number; score?: number }>) {
  // Trouver les keypoints principaux
  const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder')
  const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder')
  const rightElbow = keypoints.find(kp => kp.name === 'right_elbow')
  const leftElbow = keypoints.find(kp => kp.name === 'left_elbow')
  const rightWrist = keypoints.find(kp => kp.name === 'right_wrist')
  const leftWrist = keypoints.find(kp => kp.name === 'left_wrist')
  const nose = keypoints.find(kp => kp.name === 'nose')
  
  // Utiliser le bras le mieux détecté
  const shoulder = (rightShoulder?.score || 0) > (leftShoulder?.score || 0) ? rightShoulder : leftShoulder
  const elbow = (rightElbow?.score || 0) > (leftElbow?.score || 0) ? rightElbow : leftElbow
  const wrist = (rightWrist?.score || 0) > (leftWrist?.score || 0) ? rightWrist : leftWrist
  
  if (!shoulder || !elbow || !wrist) {
    return (
      <text x="320" y="240" textAnchor="middle" fill="currentColor" fontSize="14">
        Données incomplètes
      </text>
    )
  }
  
  return (
    <g>
      {/* Tête */}
      {nose && nose.score && nose.score > 0.3 && (
        <>
          <line 
            x1={shoulder.x} y1={shoulder.y} 
            x2={nose.x} y2={nose.y} 
            stroke="hsl(var(--muted-foreground))" 
            strokeWidth="3" 
            opacity="0.5" 
          />
          <circle cx={nose.x} cy={nose.y} r="6" fill="hsl(var(--primary))" opacity="0.8" />
        </>
      )}
      
      {/* Bras - Épaule vers coude */}
      <line 
        x1={shoulder.x} y1={shoulder.y} 
        x2={elbow.x} y2={elbow.y} 
        stroke="hsl(var(--primary))" 
        strokeWidth="4" 
      />
      
      {/* Bras - Coude vers poignet */}
      <line 
        x1={elbow.x} y1={elbow.y} 
        x2={wrist.x} y2={wrist.y} 
        stroke="hsl(var(--primary))" 
        strokeWidth="4" 
      />
      
      {/* Points articulaires */}
      <circle cx={shoulder.x} cy={shoulder.y} r="6" fill="hsl(var(--primary))" />
      <circle cx={elbow.x} cy={elbow.y} r="8" fill="hsl(var(--chart-1))" />
      <circle cx={wrist.x} cy={wrist.y} r="8" fill="hsl(var(--chart-2))" />
      
      {/* Labels */}
      <text x={shoulder.x} y={shoulder.y - 15} textAnchor="middle" fill="currentColor" fontSize="10" opacity="0.7">
        Épaule
      </text>
      <text x={elbow.x} y={elbow.y - 15} textAnchor="middle" fill="currentColor" fontSize="10" opacity="0.7">
        Coude
      </text>
      <text x={wrist.x} y={wrist.y - 15} textAnchor="middle" fill="currentColor" fontSize="10" opacity="0.7">
        Poignet
      </text>
    </g>
  )
}
