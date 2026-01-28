/**
 * Hook React pour le feature gating
 * Facilite l'utilisation du feature gating dans les composants
 */

import { useState, useEffect } from "react";
import { canAccessFeature, trackFeatureUsage } from "@/services/featureGate";
import { FEATURE_LIMITS } from "@/config/features";
import type { FeatureAccessResult } from "@/types/subscription";

/**
 * Hook pour vérifier l'accès à une fonctionnalité
 * @param featureId - ID de la fonctionnalité à vérifier
 * @returns Informations d'accès, loading state, et fonction de refresh
 *
 * @example
 * const { hasAccess, remaining, limit, loading, refresh } = useFeatureGate('pdf_exports');
 *
 * if (loading) return <Loader />;
 * if (!hasAccess) return <PaywallModal />;
 * return <ExportButton onClick={() => { exportPDF(); refresh(); }} />;
 */
export function useFeatureGate(featureId: keyof typeof FEATURE_LIMITS) {
  const [result, setResult] = useState<FeatureAccessResult>({
    hasAccess: false,
    remaining: 0,
    limit: 0,
    tier: "free",
    requiresUpgrade: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fonction pour charger ou recharger l'état d'accès
  const checkAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      const accessResult = await canAccessFeature(featureId);
      setResult(accessResult);
    } catch (err) {
      console.error("Erreur lors de la vérification d'accès:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Charger l'état initial
  useEffect(() => {
    checkAccess();
  }, [featureId]);

  return {
    hasAccess: result.hasAccess,
    remaining: result.remaining,
    limit: result.limit,
    tier: result.tier,
    requiresUpgrade: result.requiresUpgrade,
    recommendedTier: result.recommendedTier,
    loading,
    error,
    refresh: checkAccess, // Permet de rafraîchir manuellement
  };
}

/**
 * Hook pour tracker l'usage d'une fonctionnalité
 * Retourne une fonction qui track et met à jour l'état local
 *
 * @example
 * const trackExport = useFeatureTracking('pdf_exports');
 *
 * async function handleExport() {
 *   const canExport = await trackExport();
 *   if (canExport) {
 *     await exportPDF();
 *   }
 * }
 */
export function useFeatureTracking(featureId: keyof typeof FEATURE_LIMITS) {
  const { hasAccess, refresh } = useFeatureGate(featureId);

  /**
   * Track l'usage et retourne si l'action peut être effectuée
   * @param count - Nombre d'utilisations (défaut: 1)
   * @returns true si l'usage a été tracké avec succès (donc action autorisée)
   */
  const track = async (count: number = 1): Promise<boolean> => {
    if (!hasAccess) {
      return false;
    }

    const success = await trackFeatureUsage(featureId, count);

    if (success) {
      // Rafraîchir l'état pour mettre à jour "remaining"
      await refresh();
      return true;
    }

    return false;
  };

  return track;
}
