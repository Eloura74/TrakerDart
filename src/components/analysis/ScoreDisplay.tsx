/**
 * Composant d'affichage des scores
 * Affiche un score avec une barre de progression circulaire
 */

// Import React n'est pas nécessaire avec la nouvelle syntaxe JSX de React 17+
import { cn } from '@/lib/utils'

interface ScoreDisplayProps {
  score: number // 0-100
  label: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

/**
 * Affichage circulaire d'un score
 */
export function ScoreDisplay({
  score,
  label,
  size = 'md',
  showLabel = true,
  className
}: ScoreDisplayProps) {
  // Tailles selon la variante
  const sizes = {
    sm: { outer: 60, inner: 50, stroke: 5 },
    md: { outer: 100, inner: 85, stroke: 7.5 },
    lg: { outer: 140, inner: 120, stroke: 10 }
  }
  
  const { outer, stroke } = sizes[size]
  const center = outer / 2
  const radius = (outer - stroke) / 2
  const circumference = 2 * Math.PI * radius
  
  // Calculer le décalage pour le cercle de progression
  const offset = circumference - (score / 100) * circumference
  
  // Couleur selon le score
  const getColor = () => {
    if (score >= 80) return 'hsl(142, 76%, 36%)' // success
    if (score >= 60) return 'hsl(217.2, 91.2%, 59.8%)' // primary
    if (score >= 40) return 'hsl(38, 92%, 50%)' // warning
    return 'hsl(0, 84%, 60%)' // error
  }
  
  const color = getColor()
  
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* Cercle SVG */}
      <div className="relative">
        <svg width={outer} height={outer} className="transform -rotate-90">
          {/* Cercle de fond */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={stroke}
          />
          
          {/* Cercle de progression */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        
        {/* Score au centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-bold"
            style={{
              fontSize: size === 'sm' ? '1rem' : size === 'md' ? '1.5rem' : '2rem',
              color
            }}
          >
            {Math.round(score)}
          </span>
        </div>
      </div>
      
      {/* Label */}
      {showLabel && (
        <p className="text-sm font-medium text-muted-foreground text-center">
          {label}
        </p>
      )}
    </div>
  )
}

/**
 * Grille de plusieurs scores
 */
interface ScoreGridProps {
  scores: Array<{
    value: number
    label: string
  }>
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreGrid({ scores, size = 'md' }: ScoreGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {scores.map((score, index) => (
        <ScoreDisplay
          key={index}
          score={score.value}
          label={score.label}
          size={size}
        />
      ))}
    </div>
  )
}
