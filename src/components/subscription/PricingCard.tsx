/**
 * Carte de pricing pour afficher un tier d'abonnement
 */

import { Check, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  SubscriptionTierDetails,
  SubscriptionTier,
} from "@/types/subscription";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  tier: SubscriptionTierDetails;
  currentTier?: SubscriptionTier;
  highlighted?: boolean;
  onSelect: () => void;
  loading?: boolean;
}

export function PricingCard({
  tier,
  currentTier,
  highlighted = false,
  onSelect,
  loading = false,
}: PricingCardProps) {
  const isCurrentTier = currentTier === tier.id;
  const isFree = tier.price === 0;

  return (
    <Card
      className={cn(
        "relative transition-all duration-300 hover:shadow-xl",
        highlighted && "border-2 border-primary shadow-2xl scale-105",
        isCurrentTier && "border-green-500",
      )}
    >
      {/* Badge "Recommandé" */}
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-bold flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Recommandé
          </Badge>
        </div>
      )}

      {/* Badge "Actuel" */}
      {isCurrentTier && (
        <div className="absolute -top-4 right-4 z-10">
          <Badge
            variant="outline"
            className="bg-green-500/20 border-green-500 text-green-500"
          >
            Actuel
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-8 pt-6">
        <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
        <CardDescription className="mt-2 min-h-[40px]">
          {tier.description}
        </CardDescription>

        <div className="mt-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold tracking-tight">
              {tier.price === 0 ? "Gratuit" : `${tier.price}€`}
            </span>
            {tier.price > 0 && (
              <span className="text-muted-foreground">/mois</span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {tier.features.map((feature) => (
            <li key={feature.id} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">
                {feature.name}
                {feature.limit !== undefined && feature.limit !== -1 && (
                  <span className="text-muted-foreground ml-1">
                    ({feature.limit})
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-6">
        <Button
          onClick={onSelect}
          disabled={isCurrentTier || loading}
          className={cn(
            "w-full",
            highlighted && "bg-primary hover:bg-primary/90",
            isCurrentTier && "opacity-50 cursor-not-allowed",
          )}
          variant={highlighted ? "default" : "outline"}
        >
          {loading
            ? "Chargement..."
            : isCurrentTier
              ? "Abonnement actuel"
              : isFree
                ? "Gratuit"
                : "Souscrire"}
        </Button>
      </CardFooter>
    </Card>
  );
}
