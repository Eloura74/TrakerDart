/**
 * Wrapper component pour feature gating
 * Affiche automatiquement le paywall si l'utilisateur n'a pas accès
 */

import { ReactNode } from "react";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { PaywallModal } from "./PaywallModal";
import { FEATURE_LIMITS } from "@/config/features";
import { Loader2 } from "lucide-react";

interface FeatureGateProps {
  featureId: keyof typeof FEATURE_LIMITS;
  featureName: string;
  featureDescription?: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Composant wrapper pour protéger l'accès à une fonctionnalité
 *
 * @example
 * <FeatureGate featureId="pdf_exports" featureName="Export PDF">
 *   <ExportPDFButton />
 * </FeatureGate>
 */
export function FeatureGate({
  featureId,
  featureName,
  featureDescription,
  children,
  fallback,
  loadingFallback,
}: FeatureGateProps) {
  const { hasAccess, loading, recommendedTier } = useFeatureGate(featureId);

  // État de chargement
  if (loading) {
    return (
      loadingFallback || (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )
    );
  }

  // Pas d'accès : afficher le fallback ou le paywall
  if (!hasAccess) {
    return (
      fallback || (
        <PaywallModal
          isOpen={true}
          onClose={() => {
            // Vous pouvez gérer la fermeture ici si nécessaire
          }}
          featureName={featureName}
          featureDescription={featureDescription}
          recommendedTier={recommendedTier}
        />
      )
    );
  }

  // Accès autorisé : afficher le contenu
  return <>{children}</>;
}
