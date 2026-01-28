/**
 * Barre de progression d'usage d'une fonctionnalité
 */

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UsageProgressProps {
  label: string;
  current: number;
  limit: number;
  className?: string;
  showPercentage?: boolean;
}

export function UsageProgress({
  label,
  current,
  limit,
  className,
  showPercentage = true,
}: UsageProgressProps) {
  // Si illimité (limit = -1)
  const isUnlimited = limit === -1;

  // Calculer le pourcentage
  const percentage = isUnlimited ? 100 : Math.min((current / limit) * 100, 100);

  // Déterminer la couleur en fonction de l'usage
  const getProgressColor = () => {
    if (isUnlimited) return "bg-green-500";
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    if (percentage < 100) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {isUnlimited ? (
            <span className="text-green-500 font-semibold">Illimité</span>
          ) : (
            <>
              <span
                className={cn(
                  "font-semibold",
                  percentage >= 100 && "text-red-500",
                  percentage >= 80 && percentage < 100 && "text-orange-500",
                )}
              >
                {current}
              </span>
              {" / "}
              {limit}
              {showPercentage && ` (${Math.round(percentage)}%)`}
            </>
          )}
        </span>
      </div>

      <Progress
        value={percentage}
        className="h-2"
        indicatorClassName={getProgressColor()}
      />

      {percentage >= 100 && !isUnlimited && (
        <p className="text-xs text-red-500 font-medium">⚠️ Limite atteinte</p>
      )}

      {percentage >= 80 && percentage < 100 && !isUnlimited && (
        <p className="text-xs text-orange-500">⚠️ Bientôt à la limite</p>
      )}
    </div>
  );
}
