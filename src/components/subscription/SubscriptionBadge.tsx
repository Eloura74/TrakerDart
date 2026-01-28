/**
 * Badge affichant le tier actuel de l'utilisateur
 */

import { Crown, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SubscriptionTier } from "@/types/subscription";
import { cn } from "@/lib/utils";

interface SubscriptionBadgeProps {
  tier: SubscriptionTier;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const TIER_CONFIG = {
  free: {
    label: "Gratuit",
    icon: Zap,
    variant: "secondary" as const,
    className: "bg-gray-500/20 text-gray-300 border-gray-500",
  },
  pro: {
    label: "Pro",
    icon: Star,
    variant: "default" as const,
    className: "bg-blue-500/20 text-blue-400 border-blue-500",
  },
  elite: {
    label: "Elite",
    icon: Crown,
    variant: "default" as const,
    className:
      "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500",
  },
};

const SIZE_CLASSES = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-1.5",
};

export function SubscriptionBadge({
  tier,
  size = "md",
  showIcon = true,
  className,
}: SubscriptionBadgeProps) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "font-semibold flex items-center gap-1.5",
        config.className,
        SIZE_CLASSES[size],
        className,
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            size === "sm" && "h-3 w-3",
            size === "md" && "h-4 w-4",
            size === "lg" && "h-5 w-5",
          )}
        />
      )}
      {config.label}
    </Badge>
  );
}
