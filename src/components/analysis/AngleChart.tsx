/**
 * Graphique d'évolution des angles au cours du mouvement
 * Affiche l'évolution d'un angle articulaire frame par frame
 */

import { useMemo } from 'react'
import type { JointAngle, ThrowPhase } from '@/types'

interface AngleChartProps {
  angles: JointAngle[]
  title: string
  color?: string
  height?: number
}

/**
 * Graphique SVG simple d'évolution d'angle
 */
export function AngleChart({ 
  angles, 
  title,
  color = '#3b82f6',
  height = 200
}: AngleChartProps) {
  // Vérification des données
  if (!angles || angles.length === 0) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium">{title}</h4>
        <div className="border rounded bg-muted/10 p-8 text-center text-muted-foreground">
          Aucune donnée disponible
        </div>
      </div>
    )
  }
  
  // Calculer les dimensions du graphique
  const width = 600
  const padding = { top: 20, right: 40, bottom: 30, left: 50 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  
  // Extraire les valeurs min/max pour l'échelle
  const angleValues = angles.map(a => a.angle)
  const minAngle = Math.max(Math.min(...angleValues) - 10, 0)
  const maxAngle = Math.min(Math.max(...angleValues) + 10, 180)
  const angleRange = maxAngle - minAngle || 1
  
  // Convertir les angles en points SVG
  const points = useMemo(() => {
    if (angles.length === 0) return ''
    
    return angles.map((angle, index) => {
      const x = padding.left + (index / (angles.length - 1)) * chartWidth
      const y = padding.top + chartHeight - ((angle.angle - minAngle) / angleRange) * chartHeight
      return `${x},${y}`
    }).join(' ')
  }, [angles, chartWidth, chartHeight, minAngle, angleRange, padding])
  
  // Couleurs des phases
  const phaseColors: Record<ThrowPhase, string> = {
    preparation: '#64748b',
    wind_up: '#f59e0b',
    acceleration: '#ef4444',
    release: '#10b981',
    follow_through: '#6366f1'
  }
  
  // Zones de phases
  const phaseZones = useMemo(() => {
    if (angles.length === 0) return []
    
    const zones: Array<{ phase: ThrowPhase; startX: number; width: number }> = []
    let currentPhase = angles[0].phase
    let startIndex = 0
    
    for (let i = 1; i <= angles.length; i++) {
      if (i === angles.length || angles[i].phase !== currentPhase) {
        const endIndex = i
        const startX = padding.left + (startIndex / (angles.length - 1)) * chartWidth
        const endX = padding.left + ((endIndex - 1) / (angles.length - 1)) * chartWidth
        
        zones.push({
          phase: currentPhase,
          startX,
          width: endX - startX
        })
        
        if (i < angles.length) {
          currentPhase = angles[i].phase
          startIndex = i
        }
      }
    }
    
    return zones
  }, [angles, chartWidth, padding])
  
  // Valeurs de l'axe Y
  const yAxisTicks = [minAngle, (minAngle + maxAngle) / 2, maxAngle]
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{title}</h4>
        <span className="text-xs text-muted-foreground">{angles.length} mesures</span>
      </div>
      
      <svg width={width} height={height} className="border rounded bg-background" viewBox={`0 0 ${width} ${height}`}>
        {/* Zones de phases en arrière-plan */}
        {phaseZones.map((zone, index) => (
          <rect
            key={index}
            x={zone.startX}
            y={padding.top}
            width={zone.width}
            height={chartHeight}
            fill={phaseColors[zone.phase]}
            opacity={0.1}
          />
        ))}
        
        {/* Grille horizontale */}
        {yAxisTicks.map((tick, index) => {
          const y = padding.top + chartHeight - ((tick - minAngle) / angleRange) * chartHeight
          return (
            <g key={index}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartWidth}
                y2={y}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="2,2"
                opacity={0.3}
              />
              <text
                x={padding.left - 5}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                fill="#94a3b8"
              >
                {tick.toFixed(0)}°
              </text>
            </g>
          )
        })}
        
        {/* Ligne du graphique */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        
        {/* Points individuels */}
        {angles.map((angle, index) => {
          const x = padding.left + (index / (angles.length - 1)) * chartWidth
          const y = padding.top + chartHeight - ((angle.angle - minAngle) / angleRange) * chartHeight
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={2}
              fill={color}
              opacity={angle.confidence}
            />
          )
        })}
        
        {/* Axe X */}
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={padding.left + chartWidth}
          y2={padding.top + chartHeight}
          stroke="#94a3b8"
          strokeWidth={1}
        />
        
        {/* Label axe X */}
        <text
          x={padding.left + chartWidth / 2}
          y={height - 5}
          textAnchor="middle"
          fontSize={10}
          fill="#94a3b8"
        >
          Temps →
        </text>
        
        {/* Axe Y */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke="#94a3b8"
          strokeWidth={1}
        />
      </svg>
      
      {/* Légende des phases */}
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(phaseColors).map(([phase, color]) => (
          <div key={phase} className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: color, opacity: 0.5 }}
            />
            <span className="text-muted-foreground capitalize">
              {phase.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Grille de comparaison de plusieurs graphiques
 */
interface AngleChartGridProps {
  charts: Array<{
    angles: JointAngle[]
    title: string
    color?: string
  }>
}

export function AngleChartGrid({ charts }: AngleChartGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {charts.map((chart, index) => (
        <AngleChart
          key={index}
          angles={chart.angles}
          title={chart.title}
          color={chart.color}
        />
      ))}
    </div>
  )
}
