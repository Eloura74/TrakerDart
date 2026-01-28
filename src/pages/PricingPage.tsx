/**
 * Page de pricing
 * Affiche les différents tiers d'abonnement et permet de souscrire
 */

import { useState, useEffect } from "react";
import { Check, HelpCircle } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { PricingCard } from "@/components/subscription/PricingCard";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SUBSCRIPTION_TIERS } from "@/config/features";
import { getUserTier, createPayPalSubscription } from "@/services/subscription";
import type { SubscriptionTier } from "@/types/subscription";

// IDs des plans PayPal (à configurer via variables d'environnement)
const PAYPAL_PLAN_IDS = {
  pro: import.meta.env.VITE_PAYPAL_PRO_PLAN_ID || "P-XXX",
  elite: import.meta.env.VITE_PAYPAL_ELITE_PLAN_ID || "P-YYY",
};

const FAQ_ITEMS = [
  {
    question: "Puis-je annuler à tout moment ?",
    answer:
      "Oui, vous pouvez annuler votre abonnement à tout moment. Vous conserverez l'accès aux fonctionnalités premium jusqu'à la fin de votre période de facturation.",
  },
  {
    question: "Y a-t-il une garantie de remboursement ?",
    answer:
      "Oui, nous offrons une garantie satisfait ou remboursé de 30 jours. Si vous n'êtes pas satisfait, contactez-nous pour un remboursement complet.",
  },
  {
    question: "Puis-je changer de plan plus tard ?",
    answer:
      "Absolument ! Vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement (upgrade) ou à la fin du cycle de facturation (downgrade).",
  },
  {
    question: "Les données sont-elles sécurisées ?",
    answer:
      "Oui, toutes vos données sont stockées de manière sécurisée et chiffrée. Nous ne partageons jamais vos informations avec des tiers. Les paiements sont gérés par PayPal de manière sécurisée.",
  },
  {
    question: "Puis-je essayer gratuitement les fonctionnalités premium ?",
    answer:
      "Le plan gratuit vous permet de découvrir les fonctionnalités de base. Pour tester les fonctionnalités premium, profitez de notre garantie de remboursement de 30 jours.",
  },
];

export function PricingPage() {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>("free");
  const [loading, setLoading] = useState(false);
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);

  // Charger le tier actuel
  useEffect(() => {
    async function loadTier() {
      const tier = await getUserTier();
      setCurrentTier(tier);
    }
    loadTier();
  }, []);

  const handleSelectTier = async (tierId: SubscriptionTier) => {
    if (tierId === "free" || tierId === currentTier) {
      return;
    }

    try {
      setLoading(true);
      setLoadingTier(tierId);

      // Créer l'abonnement PayPal
      const result = await createPayPalSubscription({
        tierId,
        planId: PAYPAL_PLAN_IDS[tierId],
      });

      // Rediriger vers PayPal
      window.location.href = result.approvalUrl;
    } catch (error) {
      console.error("Erreur lors de la souscription:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <AppHeader />

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-400">
              Abonnement actuel :
            </span>
            <SubscriptionBadge tier={currentTier} />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Progressez plus rapidement avec nos outils d'analyse avancés et
            notre coaching IA
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {Object.values(SUBSCRIPTION_TIERS).map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              currentTier={currentTier}
              highlighted={tier.id === "pro"}
              onSelect={() => handleSelectTier(tier.id)}
              loading={loading && loadingTier === tier.id}
            />
          ))}
        </div>

        {/* Garanties */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-8 mb-16 backdrop-blur-sm">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-full mb-3">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2 text-white">
                Annulation flexible
              </h3>
              <p className="text-sm text-gray-400">
                Annulez à tout moment sans frais
              </p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-full mb-3">
                <Check className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2 text-white">
                Garantie 30 jours
              </h3>
              <p className="text-sm text-gray-400">Satisfait ou remboursé</p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-full mb-3">
                <Check className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2 text-white">
                Support prioritaire
              </h3>
              <p className="text-sm text-gray-400">
                Assistance rapide et personnalisée
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-white">
              Questions fréquentes
            </h2>
            <p className="text-gray-400">
              Tout ce que vous devez savoir sur nos abonnements
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-white/10"
              >
                <AccordionTrigger className="text-left text-white hover:no-underline hover:text-cyan-400">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA Final */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-primary/10 to-cyan-500/10 rounded-xl border border-primary/20 backdrop-blur-sm">
          <h3 className="text-2xl font-bold mb-2 text-white">
            Prêt à progresser plus rapidement ?
          </h3>
          <p className="text-gray-400 mb-6">
            Rejoignez des centaines de joueurs qui améliorent leur technique
            avec TrakerDart
          </p>
          <Button
            size="lg"
            onClick={() => handleSelectTier("pro")}
            disabled={loading || currentTier !== "free"}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Commencer l'essai
          </Button>
        </div>
      </div>
    </div>
  );
}
