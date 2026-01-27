/**
 * Visualisation superposée des 3 lancers
 * Affiche toutes les frames de chaque lancer en transparence
 * avec une couleur différente par lancer
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Throw } from '@/types'

interface MotionOverlayProps {
  throws: [Throw, Throw, Throw]
  referenceIndex: number
}

const THROW_COLORS = [
  '#3b82f6', // Bleu - Lancer 1
  '#f59e0b', // Orange - Lancer 2
  '#10b981', // Vert - Lancer 3
]

export function MotionOverlay({ throws, referenceIndex }: MotionOverlayProps) {
  // Trouver les dimensions pour normaliser
  const allKeypoints = throws.flatMap(t => t.poses.flatMap(p => p.keypoints))
  const minX = Math.min(...allKeypoints.map(kp => kp.x))
  const maxX = Math.max(...allKeypoints.map(kp => kp.x))
  const minY = Math.min(...allKeypoints.map(kp => kp.y))
  const maxY = Math.max(...allKeypoints.map(kp => kp.y))
  
  const viewWidth = maxX - minX || 640
  const viewHeight = maxY - minY || 480
  const padding = 40
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Superposition des mouvements</CardTitle>
        <CardDescription>
          Visualisation des 3 lancers superposés - chaque couleur représente un lancer
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Légende */}
        <div className="flex gap-4 mb-4">
          {throws.map((throwData, index) => (
            <div key={throwData.id} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border-2"
                style={{ 
                  backgroundColor: THROW_COLORS[index],
                  borderColor: THROW_COLORS[index]
                }}
              />
              <span className="text-sm font-medium">
                Lancer {index + 1}
              </span>
              {index === referenceIndex && (
                <Badge variant="success" className="text-xs">Référence</Badge>
              )}
            </div>
          ))}
        </div>
        
        {/* Canvas de superposition */}
        <div className="relative w-full bg-muted/20 rounded-lg border overflow-hidden">
          <svg 
            viewBox={`${minX - padding} ${minY - padding} ${viewWidth + padding * 2} ${viewHeight + padding * 2}`}
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
            style={{ minHeight: '400px', maxHeight: '600px' }}
          >
            {/* Dessiner chaque lancer */}
            {throws.map((throwData, throwIndex) => {
              const color = THROW_COLORS[throwIndex]
              const isReference = throwIndex === referenceIndex
              
              return (
                <g key={throwData.id}>
                  {/* Traînée de mouvement avec courbes lissées */}
                  {renderMotionTrail(throwData.poses, color, isReference)}
                  
                  {/* Position finale complète avec alignement épaules */}
                  <g opacity={1}>
                    {renderFullPosture(
                      throwData.poses[throwData.poses.length - 1]?.keypoints || [],
                      color,
                      isReference
                    )}
                  </g>
                </g>
              )
            })}
          </svg>
        </div>
        
        {/* Informations */}
        <div className="mt-4 text-sm text-muted-foreground space-y-1">
          <p>💡 <strong>Lecture :</strong> La traînée montre la trajectoire complète du poignet avec courbes lissées. Plus la couleur est intense, plus le mouvement est proche de la fin.</p>
          <p>📏 <strong>Alignement :</strong> La ligne pointillée entre les épaules montre la stabilité de votre posture (essentiel pour la précision).</p>
          <p>🎯 <strong>Position finale :</strong> Les articulations sont affichées avec effet de profondeur. Le lancer de référence a des labels pour les points clés.</p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Génère une traînée de mouvement avec effet de courbe lissée
 */
function renderMotionTrail(
  poses: Array<{ keypoints: Array<{ name?: string; x: number; y: number; score?: number }> }>,
  color: string,
  isReference: boolean
) {
  // Extraire les positions du poignet (point le plus important)
  const wristPositions = poses
    .map(pose => {
      const rightWrist = pose.keypoints.find(kp => kp.name === 'right_wrist')
      const leftWrist = pose.keypoints.find(kp => kp.name === 'left_wrist')
      return (rightWrist?.score || 0) > (leftWrist?.score || 0) ? rightWrist : leftWrist
    })
    .filter(p => p && (p.score || 0) > 0.3)
  
  if (wristPositions.length < 3) return null
  
  // Créer une courbe lissée avec Catmull-Rom spline
  const pathData = createSmoothPath(wristPositions as Array<{ x: number; y: number }>)
  
  return (
    <g>
      {/* Traînée principale avec gradient */}
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={isReference ? 0.1 : 0.05} />
          <stop offset="100%" stopColor={color} stopOpacity={isReference ? 0.6 : 0.4} />
        </linearGradient>
      </defs>
      
      <path
        d={pathData}
        fill="none"
        stroke={`url(#gradient-${color})`}
        strokeWidth={isReference ? 6 : 4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Points clés espacés pour montrer la progression */}
      {wristPositions
        .filter((_, i) => i % 8 === 0)
        .map((pos, i) => pos && (
          <circle
            key={i}
            cx={pos.x}
            cy={pos.y}
            r={isReference ? 3 : 2}
            fill={color}
            opacity={0.3 + (i / wristPositions.length) * 0.5}
          />
        ))}
    </g>
  )
}

/**
 * Crée un chemin SVG lissé avec Catmull-Rom spline
 */
function createSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return ''
  
  let path = `M ${points[0].x} ${points[0].y}`
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(i + 2, points.length - 1)]
    
    // Points de contrôle pour courbe de Bézier cubique
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  
  return path
}

/**
 * Dessine la posture complète avec alignement des épaules (rendu professionnel)
 */
function renderFullPosture(
  keypoints: Array<{ name?: string; x: number; y: number; score?: number }>,
  color: string,
  isReference: boolean
) {
  // Récupérer tous les points clés
  const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder')
  const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder')
  const rightElbow = keypoints.find(kp => kp.name === 'right_elbow')
  const leftElbow = keypoints.find(kp => kp.name === 'left_elbow')
  const rightWrist = keypoints.find(kp => kp.name === 'right_wrist')
  const leftWrist = keypoints.find(kp => kp.name === 'left_wrist')
  
  // Déterminer le bras dominant
  const rightScore = (rightShoulder?.score || 0) + (rightElbow?.score || 0) + (rightWrist?.score || 0)
  const leftScore = (leftShoulder?.score || 0) + (leftElbow?.score || 0) + (leftWrist?.score || 0)
  const isDominantRight = rightScore > leftScore
  
  const dominantShoulder = isDominantRight ? rightShoulder : leftShoulder
  const dominantElbow = isDominantRight ? rightElbow : leftElbow
  const dominantWrist = isDominantRight ? rightWrist : leftWrist
  
  if (!dominantShoulder || !dominantElbow || !dominantWrist) return null
  
  return (
    <>
      {/* Defs pour effets visuels professionnels */}
      <defs>
        <filter id={`glow-${color}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id={`shadow-${color}`}>
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* Ligne d'alignement des épaules (critique pour l'analyse) */}
      {rightShoulder && leftShoulder && 
       (rightShoulder.score || 0) > 0.3 && (leftShoulder.score || 0) > 0.3 && (
        <>
          <line
            x1={leftShoulder.x}
            y1={leftShoulder.y}
            x2={rightShoulder.x}
            y2={rightShoulder.y}
            stroke={color}
            strokeWidth={3}
            strokeOpacity={0.4}
            strokeDasharray="5,5"
          />
          {/* Point milieu épaules pour référence */}
          <circle
            cx={(leftShoulder.x + rightShoulder.x) / 2}
            cy={(leftShoulder.y + rightShoulder.y) / 2}
            r={4}
            fill={color}
            opacity={0.5}
          />
        </>
      )}
      
      {/* Bras dominant avec effet glow */}
      <g filter={`url(#glow-${color})`}>
        {/* Ligne épaule-coude */}
        <line
          x1={dominantShoulder.x}
          y1={dominantShoulder.y}
          x2={dominantElbow.x}
          y2={dominantElbow.y}
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
        />
        
        {/* Ligne coude-poignet */}
        <line
          x1={dominantElbow.x}
          y1={dominantElbow.y}
          x2={dominantWrist.x}
          y2={dominantWrist.y}
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
        />
      </g>
      
      {/* Points articulaires avec ombre */}
      <g filter={`url(#shadow-${color})`}>
        {/* Épaule dominante */}
        <circle cx={dominantShoulder.x} cy={dominantShoulder.y} r={8} fill={color} stroke="white" strokeWidth={2} />
        
        {/* Coude - plus gros car point critique */}
        <circle cx={dominantElbow.x} cy={dominantElbow.y} r={11} fill={color} stroke="white" strokeWidth={3} />
        
        {/* Poignet */}
        <circle cx={dominantWrist.x} cy={dominantWrist.y} r={10} fill={color} stroke="white" strokeWidth={3} />
        
        {/* Épaules (alignement) */}
        {rightShoulder && (rightShoulder.score || 0) > 0.3 && (
          <circle cx={rightShoulder.x} cy={rightShoulder.y} r={6} fill={color} opacity={0.6} stroke="white" strokeWidth={1.5} />
        )}
        {leftShoulder && (leftShoulder.score || 0) > 0.3 && (
          <circle cx={leftShoulder.x} cy={leftShoulder.y} r={6} fill={color} opacity={0.6} stroke="white" strokeWidth={1.5} />
        )}
      </g>
      
      {/* Labels professionnels (seulement pour référence) */}
      {isReference && (
        <g opacity={0.8} style={{ fontSize: '11px', fontWeight: 'bold' }}>
          <text x={dominantWrist.x + 15} y={dominantWrist.y} fill={color} stroke="black" strokeWidth={0.5}>
            Poignet
          </text>
          <text x={dominantElbow.x + 15} y={dominantElbow.y} fill={color} stroke="black" strokeWidth={0.5}>
            Coude
          </text>
        </g>
      )}
    </>
  )
}
