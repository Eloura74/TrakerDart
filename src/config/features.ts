/**
 * Configuration des fonctionnalités et limites par tier
 *
 * Valeur -1 = illimité
 */

import {
  SubscriptionTier,
  SubscriptionTierDetails,
} from "@/types/subscription";

/**
 * Limites par fonctionnalité et par tier
 * Structure: { featureId: { free: limit, pro: limit, elite: limit } }
 */
export const FEATURE_LIMITS = {
  // Capture et analyse
  sessions_per_month: { free: 10, pro: -1, elite: -1 },
  volleys_per_session: { free: 3, pro: -1, elite: -1 },

  // Export
  pdf_exports: { free: 0, pro: 10, elite: -1 },
  video_exports_720p: { free: 0, pro: 5, elite: 20 },
  video_exports_1080p: { free: 0, pro: 0, elite: 10 },
  video_exports_4k: { free: 0, pro: 0, elite: 3 },
  csv_exports: { free: -1, pro: -1, elite: -1 }, // Toujours gratuit

  // Comparaison
  comparable_sessions: { free: 2, pro: -1, elite: -1 },

  // IA et Coaching
  ai_recommendations: { free: 0, pro: 20, elite: -1 },
  ai_training_plans: { free: 0, pro: 2, elite: -1 },
  chatbot_messages: { free: 0, pro: 50, elite: -1 },

  // Stockage
  storage_mb: { free: 100, pro: 5000, elite: -1 },
  storage_cloud_gb: { free: 0, pro: 10, elite: 100 },

  // Rapports
  scheduled_reports: { free: 0, pro: 0, elite: -1 },

  // Calibration
  saved_calibration_profiles: { free: 0, pro: 3, elite: -1 },
} as const;

/**
 * Détails complets de chaque tier
 */
export const SUBSCRIPTION_TIERS: Record<
  SubscriptionTier,
  SubscriptionTierDetails
> = {
  free: {
    id: "free",
    name: "Gratuit",
    price: 0,
    currency: "EUR",
    interval: "month",
    description: "Parfait pour découvrir et s'entraîner régulièrement",
    features: [
      {
        id: "basic_analysis",
        name: "Analyse biomécanique basique",
        enabled: true,
      },
      {
        id: "pose_detection",
        name: "Détection de pose temps réel",
        enabled: true,
      },
      { id: "technical_score", name: "Score technique", enabled: true },
      { id: "feedback", name: "Feedback pédagogique basique", enabled: true },
      { id: "csv_export", name: "Export CSV/JSON", enabled: true },
      {
        id: "sessions_limit",
        name: "10 sessions par mois",
        enabled: true,
        limit: 10,
      },
      {
        id: "volleys_limit",
        name: "3 lancers par session",
        enabled: true,
        limit: 3,
      },
    ],
    limits: {
      sessionsPerMonth: 10,
      volleysPerSession: 3,
      pdfExports: 0,
      videoExports: 0,
      videoExports720p: 0,
      videoExports1080p: 0,
      videoExports4K: 0,
      aiRecommendations: 0,
      storageMB: 100,
      comparableSessions: 2,
    },
  },

  pro: {
    id: "pro",
    name: "Pro",
    price: 9.99,
    currency: "EUR",
    interval: "month",
    description: "Pour les joueurs sérieux qui veulent progresser rapidement",
    features: [
      {
        id: "all_free",
        name: "Toutes les fonctionnalités Gratuit",
        enabled: true,
      },
      {
        id: "unlimited_sessions",
        name: "Sessions illimitées",
        enabled: true,
        limit: -1,
      },
      { id: "advanced_analytics", name: "Analyses avancées", enabled: true },
      { id: "dashboard", name: "Dashboard personnalisable", enabled: true },
      { id: "charts", name: "Graphiques d'évolution", enabled: true },
      {
        id: "pdf_export",
        name: "Export PDF (10/mois)",
        enabled: true,
        limit: 10,
      },
      {
        id: "video_720p",
        name: "Export vidéo 720p (5/mois)",
        enabled: true,
        limit: 5,
      },
      {
        id: "ai_coaching",
        name: "Coaching IA (20 recommandations/mois)",
        enabled: true,
        limit: 20,
      },
      {
        id: "chatbot",
        name: "Chatbot assistant (50 msg/mois)",
        enabled: true,
        limit: 50,
      },
      { id: "realtime_coaching", name: "Coaching temps réel", enabled: true },
      {
        id: "cloud_storage",
        name: "Stockage cloud 10 GB",
        enabled: true,
        limit: 10000,
      },
      {
        id: "priority_support",
        name: "Support prioritaire 48h",
        enabled: true,
      },
    ],
    limits: {
      sessionsPerMonth: -1,
      volleysPerSession: -1,
      pdfExports: 10,
      videoExports: 5,
      videoExports720p: 5,
      videoExports1080p: 0,
      videoExports4K: 0,
      aiRecommendations: 20,
      storageMB: 5000,
      comparableSessions: -1,
    },
  },

  elite: {
    id: "elite",
    name: "Elite",
    price: 19.99,
    currency: "EUR",
    interval: "month",
    description: "Pour les compétiteurs et professionnels exigeants",
    features: [
      { id: "all_pro", name: "Toutes les fonctionnalités Pro", enabled: true },
      {
        id: "video_1080p",
        name: "Export vidéo 1080p (10/mois)",
        enabled: true,
        limit: 10,
      },
      {
        id: "video_4k",
        name: "Export vidéo 4K (3/mois)",
        enabled: true,
        limit: 3,
      },
      { id: "ai_unlimited", name: "IA illimitée", enabled: true, limit: -1 },
      {
        id: "pro_comparison",
        name: "Comparaison avec joueurs pro",
        enabled: true,
      },
      {
        id: "advanced_recognition",
        name: "Reconnaissance gestuelle avancée",
        enabled: true,
      },
      { id: "multi_camera", name: "Support multi-caméras", enabled: true },
      { id: "aruco_markers", name: "Calibration ArUco", enabled: true },
      {
        id: "scheduled_reports",
        name: "Rapports automatiques programmés",
        enabled: true,
      },
      { id: "api_access", name: "Accès API", enabled: true },
      {
        id: "white_label",
        name: "White label / Branding personnalisé",
        enabled: true,
      },
      { id: "coach_collab", name: "Collaboration coach", enabled: true },
      {
        id: "cloud_unlimited",
        name: "Stockage cloud 100 GB",
        enabled: true,
        limit: 100000,
      },
      { id: "vip_support", name: "Support VIP 24h", enabled: true },
    ],
    limits: {
      sessionsPerMonth: -1,
      volleysPerSession: -1,
      pdfExports: -1,
      videoExports: 33, // Total: 3 4K + 10 1080p + 20 720p
      videoExports720p: 20,
      videoExports1080p: 10,
      videoExports4K: 3,
      aiRecommendations: -1,
      storageMB: 100000, // 100 GB
      comparableSessions: -1,
    },
  },
};

/**
 * Obtenir la limite d'une fonctionnalité pour un tier donné
 */
export function getFeatureLimit(
  featureId: keyof typeof FEATURE_LIMITS,
  tier: SubscriptionTier,
): number {
  const featureLimits = FEATURE_LIMITS[featureId];
  if (!featureLimits) {
    console.warn(`Feature limit not found for: ${featureId}`);
    return 0;
  }
  return featureLimits[tier];
}

/**
 * Vérifier si une fonctionnalité est illimitée pour un tier
 */
export function isFeatureUnlimited(
  featureId: keyof typeof FEATURE_LIMITS,
  tier: SubscriptionTier,
): boolean {
  return getFeatureLimit(featureId, tier) === -1;
}

/**
 * Obtenir le tier recommandé pour accéder à une fonctionnalité
 */
export function getRecommendedTierForFeature(
  featureId: keyof typeof FEATURE_LIMITS,
): SubscriptionTier {
  const limits = FEATURE_LIMITS[featureId];

  // Si disponible en Pro, recommander Pro
  if (limits.pro > 0 || limits.pro === -1) {
    return "pro";
  }

  // Sinon, recommander Elite
  return "elite";
}
