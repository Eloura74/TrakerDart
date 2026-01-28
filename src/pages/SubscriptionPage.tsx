import { useState, useEffect } from "react";
import { Crown, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { UsageProgress } from "@/components/subscription/UsageProgress";
import {
  getUserTier,
  getUserSubscription,
  cancelSubscription,
  reactivateSubscription,
} from "@/services/subscription";
import { getUsageStats } from "@/services/featureGate";
import type { SubscriptionTier, UsageStats } from "@/types/subscription";

export function SubscriptionPage() {
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [loading, setLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<UsageStats[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [userTier, userSub, usage] = await Promise.all([
        getUserTier(),
        getUserSubscription(),
        getUsageStats(),
      ]);
      setTier(userTier);
      setSubscription(userSub);
      setUsageStats(usage);
    } catch (error) {
      console.error("Erreur chargement subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir annuler votre abonnement ?\\n\\nVous conserverez vos avantages jusqu'à la fin de la période en cours.",
      )
    ) {
      return;
    }
    try {
      setCanceling(true);
      const success = await cancelSubscription();
      if (success) {
        const endDate = subscription?.currentPeriodEnd
          ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
          : "";
        alert(
          "✅ Abonnement annulé avec succès.\\nVous conservez vos avantages jusqu'au " +
            endDate,
        );
        await loadSubscriptionData();
      } else {
        alert("❌ Erreur lors de l'annulation. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur annulation:", error);
      alert("❌ Erreur lors de l'annulation.");
    } finally {
      setCanceling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      const success = await reactivateSubscription();
      if (success) {
        alert("✅ Abonnement réactivé avec succès !");
        await loadSubscriptionData();
      } else {
        alert("❌ Erreur lors de la réactivation.");
      }
    } catch (error) {
      console.error("Erreur réactivation:", error);
      alert("❌ Erreur lors de la réactivation.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen app-bg-gradient flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg-gradient">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    Plan Actuel
                  </CardTitle>
                  <CardDescription>Votre tier et avantages</CardDescription>
                </div>
                <SubscriptionBadge tier={tier} size="lg" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Statut :</span>
                    <span className="font-medium">
                      {subscription.status === "active"
                        ? "✅ Actif"
                        : "⏸️ Inactif"}
                    </span>
                  </div>
                  {subscription.currentPeriodEnd && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Renouvellement :
                      </span>
                      <span className="font-medium">
                        {new Date(
                          subscription.currentPeriodEnd,
                        ).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Vos avantages :</h3>
                <div className="grid gap-2">
                  {tier === "free" && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>10 sessions par mois</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>❌ Exports PDF</span>
                      </div>
                    </>
                  )}
                  {tier === "pro" && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Sessions illimitées</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>10 exports PDF/mois</span>
                      </div>
                    </>
                  )}
                  {tier === "elite" && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>✨ Tout illimité</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {tier === "free" && (
                  <Button
                    onClick={() => (window.location.hash = "#/pricing")}
                    className="flex-1"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Passer à Pro
                  </Button>
                )}
                {tier === "pro" && (
                  <Button
                    onClick={() => (window.location.hash = "#/pricing")}
                    className="flex-1"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Passer à Elite
                  </Button>
                )}
                {tier !== "free" && !subscription?.cancelAtPeriodEnd && (
                  <Button
                    variant="outline"
                    onClick={handleCancelSubscription}
                    disabled={canceling}
                  >
                    {canceling ? "Annulation..." : "Annuler l'abonnement"}
                  </Button>
                )}
                {subscription?.cancelAtPeriodEnd && (
                  <Button
                    variant="default"
                    onClick={handleReactivateSubscription}
                  >
                    Réactiver l'abonnement
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Utilisation Ce Mois</CardTitle>
              <CardDescription>
                Suivez votre consommation des fonctionnalités
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {usageStats.length > 0 ? (
                usageStats.map((stat) => (
                  <UsageProgress
                    key={stat.featureKey}
                    label={stat.featureName}
                    current={stat.currentUsage}
                    limit={stat.limit}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune utilisation ce mois-ci
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">
                    Découvrez tous nos plans
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Comparez les fonctionnalités et trouvez le plan parfait pour
                    vous
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => (window.location.hash = "#/pricing")}
                >
                  Voir les plans
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
