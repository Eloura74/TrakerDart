/**
 * Section recommandations IA pour AnalysisPage
 * Permet de générer des recommandations personnalisées avec OpenAI
 */

import { useState, useEffect } from 'react';
import { safeLocalStorageGetString, safeLocalStorageGet } from '@/lib/utils/secureStorage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, AlertCircle, Lock } from 'lucide-react';
import { RecommendationsPanel } from '@/components/ai/RecommendationsPanel';
import { AIService } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';
import { getUserTier } from '@/services/subscription';
import type { AIRecommendation, AISettings } from '@/types/ai';
import type { TrainingSession } from '@/types';
import { DEFAULT_AI_SETTINGS } from '@/types/ai';

interface AIRecommendationsSectionProps {
  sessions: TrainingSession[];
}

export function AIRecommendationsSection({ sessions }: AIRecommendationsSectionProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [aiService, setAiService] = useState<AIService | null>(null);
  const [tier, setTier] = useState<'free' | 'pro' | 'elite'>('free');
  const [hasApiKey, setHasApiKey] = useState(false);

  // Charger config au montage de manière sécurisée
  useEffect(() => {
    const apiKey = safeLocalStorageGetString('openai_api_key');
    
    setHasApiKey(!!apiKey);

    if (apiKey) {
      const settings = safeLocalStorageGet<AISettings>(
        'ai_settings',
        DEFAULT_AI_SETTINGS
      );
      
      const service = new AIService(apiKey, settings.modelConfig);
      setAiService(service);
    }

    // Charger tier
    getUserTier().then(setTier);

    // Charger recommandations sauvegardées de manière sécurisée
    const savedRecs = safeLocalStorageGet<AIRecommendation[]>(
      'ai_recommendations',
      []
    );
    if (savedRecs.length > 0) {
      setRecommendations(savedRecs);
    }
  }, []);

  /**
   * Générer les recommandations
   */
  const generateRecommendations = async () => {
    if (!aiService || sessions.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Aucune session disponible ou IA non configurée.',
        variant: 'destructive',
      });
      return;
    }

    // Vérifier tier
    if (tier === 'free') {
      toast({
        title: 'Fonctionnalité Premium',
        description: 'Les recommandations IA sont réservées aux abonnés Pro et Elite.',
        variant: 'destructive',
      });
      window.location.hash = '#/pricing';
      return;
    }

    setLoading(true);

    try {
      const recs = await aiService.generateRecommendations(
        sessions.slice(-5), // 5 dernières sessions
      );

      setRecommendations(recs);

      // Sauvegarder
      localStorage.setItem('ai_recommendations', JSON.stringify(recs));

      toast({
        title: 'Recommandations générées !',
        description: `${recs.length} recommandations personnalisées ont été créées.`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Impossible de générer les recommandations.';
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Si pas de clé API
  if (!hasApiKey) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-black/40 to-primary/5">
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Recommandations IA Avancées</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Obtenez des conseils personnalisés générés par intelligence artificielle
                basés sur l'analyse complète de vos performances.
              </p>
            </div>
            <Button
              onClick={() => window.location.hash = '#/ai-settings'}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Configurer l'IA
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si Free tier
  if (tier === 'free') {
    return (
      <Card className="border-yellow-500/20 bg-gradient-to-br from-black/40 to-yellow-500/5">
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-yellow-500/10">
              <Lock className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
                Recommandations IA Premium
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Accédez à des analyses avancées par IA avec des recommandations
                personnalisées pour améliorer rapidement vos performances.
              </p>
              <Badge variant="outline" className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50">
                Réservé Pro & Elite
              </Badge>
            </div>
            <Button
              onClick={() => window.location.hash = '#/pricing'}
              className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              <Sparkles className="h-4 w-4" />
              Passer à Pro
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Interface principale
  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Recommandations IA Avancées</CardTitle>
                <CardDescription>
                  Conseils personnalisés générés par intelligence artificielle
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={generateRecommendations}
              disabled={loading || sessions.length === 0}
              className="gap-2"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {recommendations.length > 0 ? 'Actualiser' : 'Générer'}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {recommendations.length === 0 && !loading && (
        <Card className="border-primary/20">
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Aucune recommandation</h3>
                <p className="text-muted-foreground max-w-md">
                  Cliquez sur "Générer" pour obtenir des conseils personnalisés
                  basés sur vos {sessions.length} dernière(s) session(s).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {recommendations.length > 0 && (
        <RecommendationsPanel
          recommendations={recommendations}
          loading={loading}
          onRefresh={generateRecommendations}
        />
      )}
    </div>
  );
}
