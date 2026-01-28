/**
 * Bannière affichant l'usage mensuel des features premium
 * Affichée en haut du dashboard pour informer l'utilisateur de ses limites
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserTier } from '@/services/subscription';
import { getFeatureUsage } from '@/services/featureGate';
import { UsageProgress } from './UsageProgress';
import type { SubscriptionTier } from '@/types/subscription';
import { Zap, TrendingUp } from 'lucide-react';

export function UsageBanner() {
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [usage, setUsage] = useState<Record<string, { current: number; limit: number }>>({});
  const [loading, setLoading] = useState(true);

  // Charger les données d'usage au montage
  useEffect(() => {
    loadUsageData();
  }, []);

  /**
   * Charge le tier utilisateur et l'usage des features principales
   */
  const loadUsageData = async () => {
    try {
      setLoading(true);
      
      // Récupérer le tier actuel
      const userTier = await getUserTier();
      setTier(userTier);

      // Si Elite, pas besoin d'afficher les limites (tout illimité)
      if (userTier === 'elite') {
        setLoading(false);
        return;
      }

      // Charger l'usage des features principales
      const [sessionsUsage, pdfUsage] = await Promise.all([
        getFeatureUsage('sessions_per_month'),
        getFeatureUsage('pdf_exports'),
      ]);

      setUsage({
        sessions: {
          current: sessionsUsage.usage,
          limit: sessionsUsage.limit,
        },
        pdf: {
          current: pdfUsage.usage,
          limit: pdfUsage.limit,
        },
      });
    } catch (error) {
      console.error('Erreur chargement usage:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ne rien afficher si Elite (tout illimité)
  if (tier === 'elite' || loading) return null;

  // Calculer si proche de la limite (>80%)
  const isNearLimit = (current: number, limit: number) => {
    if (limit === Infinity) return false;
    return (current / limit) >= 0.8;
  };

  const sessionsNearLimit = usage.sessions && isNearLimit(usage.sessions.current, usage.sessions.limit);
  const pdfNearLimit = usage.pdf && isNearLimit(usage.pdf.current, usage.pdf.limit);
  const anyNearLimit = sessionsNearLimit || pdfNearLimit;

  return (
    <Card className={`p-4 ${anyNearLimit ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-cyan-500/20 bg-cyan-500/5'} backdrop-blur-xl`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Informations d'usage */}
        <div className="space-y-3 flex-1 min-w-[300px]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              Usage ce mois {tier === 'free' ? '(Gratuit)' : '(Pro)'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sessions */}
            {usage.sessions && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400">Sessions</span>
                  <span className={`text-xs font-medium ${sessionsNearLimit ? 'text-yellow-400' : 'text-white'}`}>
                    {usage.sessions.current} / {tier === 'free' ? usage.sessions.limit : '∞'}
                  </span>
                </div>
                {tier === 'free' && (
                  <UsageProgress
                    label="Sessions"
                    current={usage.sessions.current}
                    limit={usage.sessions.limit}
                    showPercentage={false}
                  />
                )}
              </div>
            )}

            {/* PDF Exports (seulement si Pro) */}
            {tier === 'pro' && usage.pdf && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400">Exports PDF</span>
                  <span className={`text-xs font-medium ${pdfNearLimit ? 'text-yellow-400' : 'text-white'}`}>
                    {usage.pdf.current} / {usage.pdf.limit}
                  </span>
                </div>
                <UsageProgress
                  label="Exports PDF"
                  current={usage.pdf.current}
                  limit={usage.pdf.limit}
                  showPercentage={false}
                />
              </div>
            )}

            {/* Message pour Free (pas d'exports) */}
            {tier === 'free' && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>🔒 Exports PDF désactivés</span>
              </div>
            )}
          </div>

          {/* Message d'alerte si proche limite */}
          {anyNearLimit && (
            <div className="text-xs text-yellow-400 flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              <span>Vous approchez de vos limites mensuelles !</span>
            </div>
          )}
        </div>

        {/* Bouton Upgrade (seulement si Free) */}
        {tier === 'free' && (
          <Button
            onClick={() => window.location.hash = '#/pricing'}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/20 whitespace-nowrap"
            size="sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            Passer à Pro
          </Button>
        )}

        {/* Bouton Voir détails (si Pro) */}
        {tier === 'pro' && (
          <Button
            onClick={() => window.location.hash = '#/subscription'}
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
          >
            Voir détails
          </Button>
        )}
      </div>
    </Card>
  );
}
