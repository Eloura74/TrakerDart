/**
 * Page de développement pour tester les différents tiers
 * Visible uniquement en mode dev
 */

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { getUserTier } from "@/services/subscription";
import type { SubscriptionTier } from "@/types/subscription";

export function DevPage() {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>("free");

  useEffect(() => {
    async function loadTier() {
      const tier = await getUserTier();
      setCurrentTier(tier);
    }
    loadTier();
  }, []);

  // Vérifier si on est en mode dev
  const isDevMode = import.meta.env.VITE_DEV_MODE === "true";

  if (!isDevMode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center text-white">
        <Card className="max-w-md border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Page de développement</CardTitle>
            <CardDescription>
              Cette page n'est accessible qu'en mode développement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Pour activer le mode développement, définissez{" "}
              <code className="bg-white/10 px-1 py-0.5 rounded">
                VITE_DEV_MODE=true
              </code>{" "}
              dans votre fichier{" "}
              <code className="bg-white/10 px-1 py-0.5 rounded">.env</code>
            </p>
            <Button onClick={() => window.history.back()}>Retour</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tierOptions: {
    tier: SubscriptionTier;
    label: string;
    description: string;
  }[] = [
    {
      tier: "free",
      label: "Gratuit",
      description: "10 sessions/mois, 3 lancers/session",
    },
    { tier: "pro", label: "Pro", description: "Illimité + IA Coaching" },
    { tier: "elite", label: "Elite", description: "Tout + Multi-cam + API" },
  ];

  const handleSetTier = (tier: SubscriptionTier) => {
    // Instructions pour l'utilisateur
    alert(
      `Pour changer le tier en mode dev:\n\n` +
        `1. Ouvrez votre fichier .env\n` +
        `2. Modifiez VITE_DEV_DEFAULT_TIER=${tier}\n` +
        `3. Redémarrez le serveur de dev (npm run dev)\n\n` +
        `Le tier sera automatiquement appliqué !`,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <AppHeader />

      <div className="container mx-auto px-4 py-12">
        {/* Warning Banner */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 mb-8 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-500 mb-1">
                ⚠️ Page de Développement
              </h3>
              <p className="text-sm text-yellow-200/80">
                Cette page permet de tester les différents tiers sans PayPal.
                Les paiements sont désactivés en mode dev.
              </p>
            </div>
          </div>
        </div>

        {/* Current Tier */}
        <Card className="mb-8 border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Tier Actuel</CardTitle>
            <CardDescription className="text-gray-400">
              Configuré dans{" "}
              <code className="bg-white/10 px-1 py-0.5 rounded text-xs">
                .env
              </code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <SubscriptionBadge tier={currentTier} size="lg" />
              <span className="text-sm text-gray-400">
                (Variable:{" "}
                <code className="bg-white/10 px-1 py-0.5 rounded text-xs">
                  VITE_DEV_DEFAULT_TIER={currentTier}
                </code>
                )
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tier Options */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-white">
            Changer de Tier
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tierOptions.map((option) => (
              <Card
                key={option.tier}
                className={`bg-black/40 backdrop-blur-sm border-white/10 ${
                  currentTier === option.tier ? "border-cyan-500 border-2" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-white">{option.label}</CardTitle>
                    {currentTier === option.tier && (
                      <Badge
                        variant="outline"
                        className="bg-green-500/20 border-green-500 text-green-400"
                      >
                        Actif
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="min-h-[40px] text-gray-400">
                    {option.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleSetTier(option.tier)}
                    disabled={currentTier === option.tier}
                    className="w-full"
                    variant={
                      currentTier === option.tier ? "outline" : "default"
                    }
                  >
                    {currentTier === option.tier ? "Actif" : "Activer"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-8 border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-white">
                💡 Comment tester les tiers ?
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
                <li>
                  Modifiez{" "}
                  <code className="bg-white/10 px-1 py-0.5 rounded">
                    VITE_DEV_DEFAULT_TIER
                  </code>{" "}
                  dans votre fichier{" "}
                  <code className="bg-white/10 px-1 py-0.5 rounded">.env</code>
                </li>
                <li>
                  Redémarrez le serveur de développement (
                  <code className="bg-white/10 px-1 py-0.5 rounded">
                    npm run dev
                  </code>
                  )
                </li>
                <li>
                  Toutes les fonctionnalités du tier choisi seront débloquées
                </li>
                <li>
                  Les tentatives de paiement afficheront une alerte au lieu de
                  rediriger vers PayPal
                </li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-white">
                🚀 Activer les paiements réels
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
                <li>
                  Définissez{" "}
                  <code className="bg-white/10 px-1 py-0.5 rounded">
                    VITE_DEV_MODE=false
                  </code>{" "}
                  dans{" "}
                  <code className="bg-white/10 px-1 py-0.5 rounded">.env</code>
                </li>
                <li>
                  Configurez vos clés PayPal (
                  <code className="bg-white/10 px-1 py-0.5 rounded">
                    VITE_PAYPAL_CLIENT_ID
                  </code>
                  , etc.)
                </li>
                <li>Créez les Edge Functions PayPal dans Supabase</li>
                <li>Redémarrez le serveur</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
