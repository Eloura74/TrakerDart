/**
 * Service de gestion des abonnements
 * Gère les interactions avec Supabase et PayPal
 */

import { supabase } from "@/lib/supabase";
import type {
  Subscription,
  SubscriptionTier,
  CreatePayPalSubscriptionOptions,
  PayPalSubscriptionResult,
} from "@/types/subscription";

/**
 * Récupérer le tier de l'utilisateur connecté
 * En mode dev, retourne le tier configuré dans .env
 * @returns Le tier actuel ou 'free' par défaut
 */
export async function getUserTier(): Promise<SubscriptionTier> {
  // Mode développement : bypass base de données
  if (import.meta.env.VITE_DEV_MODE === "true") {
    const devTier = import.meta.env.VITE_DEV_DEFAULT_TIER as SubscriptionTier;
    console.log("🔧 Mode DEV : Tier forcé à", devTier);
    return devTier || "elite";
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return "free";
    }

    // Appeler la fonction PostgreSQL pour obtenir le tier
    const { data, error } = await supabase.rpc("get_user_tier", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("Erreur lors de la récupération du tier:", error);
      return "free";
    }

    return (data as SubscriptionTier) || "free";
  } catch (error) {
    console.error("Erreur getUserTier:", error);
    return "free";
  }
}

/**
 * Récupérer l'abonnement complet de l'utilisateur
 */
export async function getUserSubscription(): Promise<Subscription | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Pas d'abonnement trouvé, c'est normal
        return null;
      }
      console.error("Erreur lors de la récupération de l'abonnement:", error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      tierId: data.tier_id,
      paypalCustomerId: data.paypal_customer_id,
      paypalSubscriptionId: data.paypal_subscription_id,
      status: data.status,
      currentPeriodStart: data.current_period_start
        ? new Date(data.current_period_start)
        : undefined,
      currentPeriodEnd: data.current_period_end
        ? new Date(data.current_period_end)
        : undefined,
      cancelAtPeriodEnd: data.cancel_at_period_end,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error("Erreur getUserSubscription:", error);
    return null;
  }
}

/**
 * Créer une session de souscription PayPal
 * En mode dev, simule juste le changement de tier
 * Cette fonction appelle une Edge Function Supabase qui gère PayPal
 */
export async function createPayPalSubscription(
  options: CreatePayPalSubscriptionOptions,
): Promise<PayPalSubscriptionResult> {
  // Mode développement : simuler subscription sans PayPal
  if (import.meta.env.VITE_DEV_MODE === "true") {
    console.log("🔧 Mode DEV : Simulation souscription", options.tierId);
    alert(
      `Mode DEV : Souscription ${options.tierId} simulée !\n\n` +
        `En production, vous seriez redirigé vers PayPal.\n\n` +
        `Changez VITE_DEV_DEFAULT_TIER dans .env pour tester différents tiers.`,
    );

    // Simuler un succès
    return {
      subscriptionId: "DEV-SUBSCRIPTION-ID",
      approvalUrl: window.location.href,
      status: "active",
    };
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Utilisateur non connecté");
    }

    // Appeler l'Edge Function Supabase
    const { data, error } = await supabase.functions.invoke(
      "create-paypal-subscription",
      {
        body: {
          userId: user.id,
          tierId: options.tierId,
          planId: options.planId,
          returnUrl:
            options.returnUrl ||
            `${window.location.origin}/#/subscription?success=true`,
          cancelUrl: options.cancelUrl || `${window.location.origin}/#/pricing`,
        },
      },
    );

    if (error) {
      console.error(
        "Erreur lors de la création de l'abonnement PayPal:",
        error,
      );
      throw error;
    }

    return data as PayPalSubscriptionResult;
  } catch (error) {
    console.error("Erreur createPayPalSubscription:", error);
    throw error;
  }
}

/**
 * Annuler un abonnement
 * L'abonnement restera actif jusqu'à la fin de la période en cours
 */
export async function cancelSubscription(): Promise<boolean> {
  try {
    const subscription = await getUserSubscription();

    if (!subscription || !subscription.paypalSubscriptionId) {
      throw new Error("Aucun abonnement actif trouvé");
    }

    // Marquer l'abonnement comme "à annuler à la fin de la période"
    const { error } = await supabase
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    if (error) {
      console.error("Erreur lors de l'annulation:", error);
      throw error;
    }

    // TODO: Optionnellement, appeler l'API PayPal pour annuler côté PayPal aussi
    // via une Edge Function

    return true;
  } catch (error) {
    console.error("Erreur cancelSubscription:", error);
    return false;
  }
}

/**
 * Réactiver un abonnement qui était marqué pour annulation
 */
export async function reactivateSubscription(): Promise<boolean> {
  try {
    const subscription = await getUserSubscription();

    if (!subscription) {
      throw new Error("Aucun abonnement trouvé");
    }

    const { error } = await supabase
      .from("subscriptions")
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    if (error) {
      console.error("Erreur lors de la réactivation:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Erreur reactivateSubscription:", error);
    return false;
  }
}

/**
 * Obtenir l'URL du portail client PayPal
 * (pour gérer les moyens de paiement, voir les factures, etc.)
 */
export async function getPayPalPortalUrl(): Promise<string | null> {
  try {
    const subscription = await getUserSubscription();

    if (!subscription || !subscription.paypalSubscriptionId) {
      return null;
    }

    // TODO: Implémenter via Edge Function si PayPal fournit un portail client
    // Pour l'instant, retourner null
    return null;
  } catch (error) {
    console.error("Erreur getPayPalPortalUrl:", error);
    return null;
  }
}
