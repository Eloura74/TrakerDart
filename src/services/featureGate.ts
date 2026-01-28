/**
 * Service de Feature Gating
 * Gère la vérification d'accès aux fonctionnalités premium
 */

import { supabase } from "@/lib/supabase";
import { getUserTier } from "./subscription";
import {
  getFeatureLimit,
  getRecommendedTierForFeature,
  FEATURE_LIMITS,
} from "@/config/features";
import type { FeatureAccessResult, UsageStats } from "@/types/subscription";

/**
 * Vérifier si l'utilisateur a accès à une fonctionnalité
 * @param featureId - ID de la fonctionnalité à vérifier
 * @returns Résultat avec informations d'accès et limites
 */
export async function canAccessFeature(
  featureId: keyof typeof FEATURE_LIMITS,
): Promise<FeatureAccessResult> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        hasAccess: false,
        remaining: 0,
        limit: 0,
        tier: "free",
        requiresUpgrade: true,
        recommendedTier: getRecommendedTierForFeature(featureId),
      };
    }

    // Récupérer le tier de l'utilisateur
    const tier = await getUserTier();

    // Récupérer la limite pour ce tier
    const limit = getFeatureLimit(featureId, tier);

    // Si la limite est -1 (illimité), accès direct
    if (limit === -1) {
      return {
        hasAccess: true,
        remaining: -1,
        limit: -1,
        tier,
        requiresUpgrade: false,
      };
    }

    // Si la limite est 0, pas d'accès
    if (limit === 0) {
      return {
        hasAccess: false,
        remaining: 0,
        limit: 0,
        tier,
        requiresUpgrade: true,
        recommendedTier: getRecommendedTierForFeature(featureId),
      };
    }

    // Vérifier l'usage actuel
    const usage = await getMonthlyUsage(featureId);
    const remaining = Math.max(0, limit - usage);
    const hasAccess = usage < limit;

    return {
      hasAccess,
      remaining,
      limit,
      tier,
      requiresUpgrade: !hasAccess,
      recommendedTier: !hasAccess
        ? getRecommendedTierForFeature(featureId)
        : undefined,
    };
  } catch (error) {
    console.error("Erreur canAccessFeature:", error);
    // En cas d'erreur, refuser l'accès par sécurité
    return {
      hasAccess: false,
      remaining: 0,
      limit: 0,
      tier: "free",
      requiresUpgrade: true,
      recommendedTier: getRecommendedTierForFeature(featureId),
    };
  }
}

/**
 * Obtenir l'usage mensuel d'une fonctionnalité
 * @param featureId - ID de la fonctionnalité
 * @returns Nombre d'utilisations ce mois
 */
export async function getMonthlyUsage(featureId: string): Promise<number> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return 0;
    }

    // Date de début du mois en cours
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("usage_tracking")
      .select("count")
      .eq("user_id", user.id)
      .eq("feature_id", featureId)
      .gte("period_start", startOfMonth.toISOString());

    if (error) {
      console.error("Erreur getMonthlyUsage:", error);
      return 0;
    }

    // Sommer tous les compteurs
    const total =
      data?.reduce((sum: number, record: any) => sum + record.count, 0) || 0;
    return total;
  } catch (error) {
    console.error("Erreur getMonthlyUsage:", error);
    return 0;
  }
}

/**
 * Incrémenter l'usage d'une fonctionnalité
 * @param featureId - ID de la fonctionnalité
 * @param count - Nombre d'utilisations à ajouter (défaut: 1)
 */
export async function trackFeatureUsage(
  featureId: string,
  count: number = 1,
): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    // Date de début et fin du mois en cours
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    // Vérifier si un enregistrement existe déjà pour ce mois
    const { data: existing, error: selectError } = await supabase
      .from("usage_tracking")
      .select("id, count")
      .eq("user_id", user.id)
      .eq("feature_id", featureId)
      .gte("period_start", startOfMonth.toISOString())
      .lte("period_start", endOfMonth.toISOString())
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Erreur lors de la vérification de l'usage:", selectError);
    }

    if (existing) {
      // Mettre à jour le compteur existant
      const { error: updateError } = await supabase
        .from("usage_tracking")
        .update({ count: existing.count + count })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Erreur lors de la mise à jour de l'usage:", updateError);
        return false;
      }
    } else {
      // Créer un nouvel enregistrement
      const { error: insertError } = await supabase
        .from("usage_tracking")
        .insert({
          user_id: user.id,
          feature_id: featureId,
          count,
          period_start: startOfMonth.toISOString(),
          period_end: endOfMonth.toISOString(),
        });

      if (insertError) {
        console.error(
          "Erreur lors de la création de l'enregistrement d'usage:",
          insertError,
        );
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Erreur trackFeatureUsage:", error);
    return false;
  }
}

/**
 * Obtenir les usages de toutes les fonctionnalités pour l'utilisateur actuel
 * @returns Map de featureId => usage
 */
export async function getAllUsages(): Promise<Map<string, number>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Map();
    }

    // Date de début du mois en cours
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("usage_tracking")
      .select("feature_id, count")
      .eq("user_id", user.id)
      .gte("period_start", startOfMonth.toISOString());

    if (error) {
      console.error("Erreur getAllUsages:", error);
      return new Map();
    }

    // Agréger par feature_id
    const usageMap = new Map<string, number>();
    data?.forEach((record: any) => {
      const current = usageMap.get(record.feature_id) || 0;
      usageMap.set(record.feature_id, current + record.count);
    });

    return usageMap;
  } catch (error) {
    console.error("Erreur getAllUsages:", error);
    return new Map();
  }
}

/**
 * Vérifier l'accès et incrémenter l'usage automatiquement
 * Retourne true si l'accès est autorisé ET l'usage a été incrémenté
 * @param featureId - ID de la fonctionnalité
 * @param count - Nombre d'utilisations (défaut: 1)
 */
export async function checkAndTrackFeature(
  featureId: keyof typeof FEATURE_LIMITS,
  count: number = 1,
): Promise<FeatureAccessResult> {
  const accessResult = await canAccessFeature(featureId);

  if (accessResult.hasAccess) {
    // Incrémenter l'usage seulement si limite pas illimitée
    if (accessResult.limit !== -1) {
      await trackFeatureUsage(featureId, count);
    }
  }

  return accessResult;
}

/**
 * Obtenir les statistiques d'usage pour affichage UI
 * Retourne toutes les features avec leur usage actuel, limite et metadata
 */
export async function getUsageStats(): Promise<UsageStats[]> {
  try {
    const tier = await getUserTier();
    const usagesMap = await getAllUsages();

    // Liste des features à afficher
    const featureConfigs: Array<{
      key: keyof typeof FEATURE_LIMITS;
      name: string;
    }> = [
      { key: "sessions_per_month", name: "Sessions mensuelles" },
      { key: "volleys_per_session", name: "Lancers par session" },
      { key: "pdf_exports", name: "Exports PDF" },
      { key: "video_exports_720p", name: "Exports vidéo 720p" },
      { key: "ai_recommendations", name: "Requêtes IA" },
    ];

    const stats: UsageStats[] = featureConfigs.map(({ key, name }) => {
      const limit = getFeatureLimit(key, tier);
      const currentUsage = usagesMap.get(key) || 0;

      // Calculer date de reset (fin du mois)
      const now = new Date();
      const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      return {
        featureKey: key,
        featureName: name,
        currentUsage,
        limit,
        resetDate,
        tier,
      };
    });

    return stats;
  } catch (error) {
    console.error("Erreur getUsageStats:", error);
    return [];
  }
}
