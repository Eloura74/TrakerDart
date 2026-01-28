/**
 * Types pour le système d'abonnements et de fonctionnalités premium
 */

// Tiers d'abonnement disponibles
export type SubscriptionTier = "free" | "pro" | "elite";

// Statuts possibles d'un abonnement
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing";

/**
 * Interface pour un abonnement utilisateur
 */
export interface Subscription {
  id: string;
  userId: string;
  tierId: SubscriptionTier;
  paypalCustomerId?: string;
  paypalSubscriptionId?: string;
  status: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface pour les détails d'un tier
 */
export interface SubscriptionTierDetails {
  id: SubscriptionTier;
  name: string;
  price: number;
  currency: "EUR" | "USD";
  interval: "month" | "year";
  features: TierFeature[];
  limits: TierLimits;
  description?: string;
}

/**
 * Feature disponible dans un tier
 */
export interface TierFeature {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  limit?: number; // -1 = illimité
}

/**
 * Limites par tier
 */
export interface TierLimits {
  sessionsPerMonth: number;
  volleysPerSession: number;
  pdfExports: number;
  videoExports: number;
  videoExports720p: number;
  videoExports1080p: number;
  videoExports4K: number;
  aiRecommendations: number;
  storageMB: number;
  comparableSessions: number;
}

/**
 * Usage d'une fonctionnalité
 */
export interface FeatureUsage {
  id: string;
  userId: string;
  featureId: string;
  count: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
}

/**
 * Gate de fonctionnalité (configuration)
 */
export interface FeatureGate {
  id: string;
  featureId: string;
  freeLimit: number;
  proLimit: number;
  eliteLimit: number;
  description?: string;
  createdAt: Date;
}

/**
 * Résultat d'une vérification d'accès à une fonctionnalité
 */
export interface FeatureAccessResult {
  hasAccess: boolean;
  remaining: number;
  limit: number;
  tier: SubscriptionTier;
  requiresUpgrade: boolean;
  recommendedTier?: SubscriptionTier;
}

/**
 * Options pour la création d'une souscription PayPal
 */
export interface CreatePayPalSubscriptionOptions {
  tierId: SubscriptionTier;
  planId: string;
  returnUrl?: string;
  cancelUrl?: string;
}

/**
 * Résultat de la création d'une souscription PayPal
 */
export interface PayPalSubscriptionResult {
  subscriptionId: string;
  approvalUrl: string;
  status: string;
}

/**
 * Données d'un webhook PayPal
 */
export interface PayPalWebhookEvent {
  id: string;
  eventType: string;
  resourceType: string;
  summary: string;
  resource: unknown;
  createTime: string;
}

/**
 * Statistiques d'usage pour affichage UI
 */
export interface UsageStats {
  featureKey: string;
  featureName: string;
  currentUsage: number;
  limit: number;
  resetDate: Date;
  tier: SubscriptionTier;
}
