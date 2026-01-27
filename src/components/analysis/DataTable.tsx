/**
 * Tableau de données brutes pour la transparence de l'analyse
 * Affiche les valeurs mesurées et utilisées pour l'analyse
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { BiomechanicalAnalysis } from '@/types'
import { formatAngle } from '@/lib/utils'

interface DataTableProps {
  analysis: BiomechanicalAnalysis
  throwIndex: number
}

/**
 * Tableau des données mesurées
 */
export function DataTable({ analysis, throwIndex }: DataTableProps) {
  const data = [
    {
      category: 'Coude',
      rows: [
        {
          label: 'Angle minimal',
          value: formatAngle(analysis.elbow.angleRange.min),
          quality: analysis.elbow.angleRange.min > 70 && analysis.elbow.angleRange.min < 110 ? 'good' : 'warning'
        },
        {
          label: 'Angle maximal',
          value: formatAngle(analysis.elbow.angleRange.max),
          quality: 'info'
        },
        {
          label: 'Amplitude',
          value: formatAngle(analysis.elbow.angleRange.amplitude),
          quality: analysis.elbow.angleRange.amplitude > 30 && analysis.elbow.angleRange.amplitude < 90 ? 'good' : 'warning'
        },
        {
          label: 'Déplacement latéral',
          value: `${analysis.elbow.lateralDisplacement.toFixed(0)} px`,
          quality: analysis.elbow.lateralDisplacement < 30 ? 'good' : analysis.elbow.lateralDisplacement < 50 ? 'warning' : 'error'
        },
        {
          label: 'Stabilité verticale',
          value: `${(analysis.elbow.verticalStability * 100).toFixed(1)}%`,
          quality: analysis.elbow.verticalStability < 0.1 ? 'good' : analysis.elbow.verticalStability < 0.2 ? 'warning' : 'error'
        }
      ]
    },
    {
      category: 'Poignet',
      rows: [
        {
          label: 'Angle de relâchement',
          value: formatAngle(analysis.wrist.releaseAngle),
          quality: 'info'
        },
        {
          label: 'Temps de relâchement',
          value: `${(analysis.wrist.releaseTime - analysis.phases[0].startTime).toFixed(0)} ms`,
          quality: 'info'
        },
        {
          label: 'Fluidité',
          value: `${(analysis.wrist.fluidity * 100).toFixed(1)}%`,
          quality: analysis.wrist.fluidity < 0.1 ? 'good' : analysis.wrist.fluidity < 0.2 ? 'warning' : 'error'
        },
        {
          label: 'Snap détecté',
          value: analysis.wrist.snapDetected ? 'Oui' : 'Non',
          quality: analysis.wrist.snapDetected ? 'warning' : 'good'
        }
      ]
    },
    {
      category: 'Épaule',
      rows: [
        {
          label: 'Rotation parasite',
          value: `${analysis.shoulder.rotation.toFixed(0)} px`,
          quality: analysis.shoulder.rotation < 20 ? 'good' : analysis.shoulder.rotation < 40 ? 'warning' : 'error'
        },
        {
          label: 'Stabilité verticale',
          value: `${(analysis.shoulder.verticalStability * 100).toFixed(1)}%`,
          quality: analysis.shoulder.verticalStability < 0.1 ? 'good' : analysis.shoulder.verticalStability < 0.15 ? 'warning' : 'error'
        }
      ]
    },
    {
      category: 'Tronc',
      rows: [
        {
          label: 'Inclinaison',
          value: formatAngle(analysis.trunk.inclination),
          quality: analysis.trunk.inclination < 5 ? 'good' : analysis.trunk.inclination < 10 ? 'warning' : 'error'
        },
        {
          label: 'Balancement',
          value: `${(analysis.trunk.sway * 100).toFixed(1)}%`,
          quality: analysis.trunk.sway < 0.05 ? 'good' : analysis.trunk.sway < 0.1 ? 'warning' : 'error'
        },
        {
          label: 'Stabilité',
          value: `${(analysis.trunk.stability * 100).toFixed(0)}%`,
          quality: analysis.trunk.stability > 0.8 ? 'good' : analysis.trunk.stability > 0.6 ? 'warning' : 'error'
        }
      ]
    },
    {
      category: 'Ligne de visée',
      rows: [
        {
          label: 'Orientation tête',
          value: formatAngle(analysis.gaze.headOrientation),
          quality: 'info'
        },
        {
          label: 'Stabilité pré-relâchement',
          value: `${(analysis.gaze.preReleaseStability * 100).toFixed(1)}%`,
          quality: analysis.gaze.preReleaseStability < 0.1 ? 'good' : 'warning'
        },
        {
          label: 'Regard stable',
          value: analysis.gaze.hasStableGaze ? 'Oui' : 'Non',
          quality: analysis.gaze.hasStableGaze ? 'good' : 'error'
        }
      ]
    }
  ]
  
  const getQualityBadge = (quality: string) => {
    const variants = {
      good: 'success' as const,
      warning: 'warning' as const,
      error: 'error' as const,
      info: 'secondary' as const
    }
    return variants[quality as keyof typeof variants] || 'secondary'
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Données mesurées - Lancer {throwIndex}</span>
          <Badge variant="outline" className="font-mono">
            {analysis.phases.reduce((sum, p) => sum + p.poses.length, 0)} frames
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map((section) => (
            <div key={section.category}>
              <h4 className="text-sm font-semibold mb-3 text-primary">
                {section.category}
              </h4>
              <div className="space-y-2">
                {section.rows.map((row, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">
                      {row.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium font-mono">
                        {row.value}
                      </span>
                      <Badge variant={getQualityBadge(row.quality)} className="text-xs">
                        {row.quality === 'good' ? '✓' :
                         row.quality === 'warning' ? '!' :
                         row.quality === 'error' ? '✗' : 'ℹ'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Durée totale */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Durée totale du lancer</span>
            <span className="text-sm font-mono font-bold">
              {(analysis.totalDuration / 1000).toFixed(2)}s
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
