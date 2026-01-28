/**
 * Modal de paywall affichant les options d'upgrade
 * S'affiche quand l'utilisateur tente d'accéder à une fonctionnalité premium
 */

import { useState } from "react";
import { Lock, X, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PricingCard } from "./PricingCard";
import { SUBSCRIPTION_TIERS } from "@/config/features";
import { createPayPalSubscription } from "@/services/subscription";
import type { SubscriptionTier } from "@/types/subscription";
import { useAppStore } from "@/store/useAppStore";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  featureDescription?: string;
  recommendedTier?: SubscriptionTier;
}

// IDs des plans PayPal (à configurer dans PayPal Dashboard)
const PAYPAL_PLAN_IDS = {
  pro: import.meta.env.VITE_PAYPAL_PRO_PLAN_ID || "P-XXX",
  elite: import.meta.env.VITE_PAYPAL_ELITE_PLAN_ID || "P-YYY",
};

export function PaywallModal({
  isOpen,
  onClose,
  featureName,
  featureDescription,
  recommendedTier = "pro",
}: PaywallModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(
    null,
  );
  const currentTier = useAppStore(
    (state) => state.subscription?.tier || "free",
  );

  const handleSelectTier = async (tierId: SubscriptionTier) => {
    if (tierId === "free" || tierId === currentTier) {
      return;
    }

    try {
      setLoading(true);
      setSelectedTier(tierId);

      // Créer l'abonnement PayPal
      const result = await createPayPalSubscription({
        tierId,
        planId: PAYPAL_PLAN_IDS[tierId],
      });

      // Rediriger vers PayPal pour approuver l'abonnement
      window.location.href = result.approvalUrl;
    } catch (error) {
      console.error("Erreur lors de la création de l'abonnement:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
      setSelectedTier(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl">
                  Fonctionnalité Premium
                </DialogTitle>
                <DialogDescription className="mt-1">
                  <strong>{featureName}</strong> nécessite un abonnement payant
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {featureDescription && (
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              {featureDescription}
            </p>
          </div>
        )}

        <div className="mt-6">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Choisissez votre plan
            </h3>
            <p className="text-sm text-muted-foreground">
              Débloquez toutes les fonctionnalités et progressez plus rapidement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.values(SUBSCRIPTION_TIERS).map((tier) => (
              <PricingCard
                key={tier.id}
                tier={tier}
                currentTier={currentTier}
                highlighted={tier.id === recommendedTier}
                onSelect={() => handleSelectTier(tier.id)}
                loading={loading && selectedTier === tier.id}
              />
            ))}
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              ✓ Annulation à tout moment · ✓ Garantie satisfait ou remboursé 30
              jours
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
