/**
 * Composant d'affichage d'un feedback individuel
 * Affiche une recommandation avec icône et couleur selon le type
 */

// Import React n'est pas nécessaire avec la nouvelle syntaxe JSX de React 17+
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Feedback } from '@/types'
import { cn } from '@/lib/utils'

interface FeedbackCardProps {
  feedback: Feedback
  compact?: boolean
}

/**
 * Carte de feedback pédagogique
 */
export function FeedbackCard({ feedback, compact = false }: FeedbackCardProps) {
  const { type, indicator, message, detail } = feedback
  
  // Icône selon le type
  const Icon = {
    success: CheckCircle,
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle
  }[type]
  
  // Couleurs selon le type
  const colors = {
    success: 'text-success border-success/20 bg-success/5',
    info: 'text-primary border-primary/20 bg-primary/5',
    warning: 'text-warning border-warning/20 bg-warning/5',
    error: 'text-error border-error/20 bg-error/5'
  }
  
  const iconColors = {
    success: 'text-success',
    info: 'text-primary',
    warning: 'text-warning',
    error: 'text-error'
  }
  
  return (
    <Card className={cn('border-l-4', colors[type])}>
      <CardContent className={cn('flex gap-3', compact ? 'p-3' : 'p-4')}>
        {/* Icône */}
        <div className="flex-shrink-0 pt-0.5">
          <Icon className={cn('w-5 h-5', iconColors[type])} />
        </div>
        
        {/* Contenu */}
        <div className="flex-1 min-w-0">
          {/* Indicateur */}
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {indicator}
          </p>
          
          {/* Message principal */}
          <p className={cn('font-medium', compact ? 'text-sm' : 'text-base')}>
            {message}
          </p>
          
          {/* Détail optionnel */}
          {detail && !compact && (
            <p className="text-sm text-muted-foreground mt-1">
              {detail}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Liste de feedbacks
 */
interface FeedbackListProps {
  feedbacks: Feedback[]
  maxItems?: number
  compact?: boolean
}

export function FeedbackList({ feedbacks, maxItems, compact = false }: FeedbackListProps) {
  const items = maxItems ? feedbacks.slice(0, maxItems) : feedbacks
  
  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Aucun feedback disponible</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-3">
      {items.map((feedback, index) => (
        <FeedbackCard key={index} feedback={feedback} compact={compact} />
      ))}
      
      {maxItems && feedbacks.length > maxItems && (
        <p className="text-sm text-muted-foreground text-center">
          +{feedbacks.length - maxItems} autre(s) recommandation(s)
        </p>
      )}
    </div>
  )
}
