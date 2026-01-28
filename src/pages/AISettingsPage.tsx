/**
 * Page de configuration de l'IA générative
 * Permet de configurer la clé API OpenAI et les paramètres du modèle
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AIModelSelector } from '@/components/ai/AIModelSelector';
import { AppHeader } from '@/components/layout/AppHeader';
import { ArrowLeft, Key, Save, Eye, EyeOff, ExternalLink } from 'lucide-react';
import type { AIModelConfig, AISettings } from '@/types/ai';
import { DEFAULT_AI_SETTINGS } from '@/types/ai';

export function AISettingsPage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  // Charger les settings au montage
  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Charger les settings depuis localStorage
   */
  const loadSettings = () => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    const savedSettings = localStorage.getItem('ai_settings');

    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  /**
   * Sauvegarder les settings
   */
  const saveSettings = () => {
    try {
      // Sauvegarder l'API key
      if (apiKey.trim()) {
        localStorage.setItem('openai_api_key', apiKey.trim());
      }

      // Sauvegarder les settings
      localStorage.setItem('ai_settings', JSON.stringify(settings));

      setHasChanges(false);

      toast({
        title: 'Configuration sauvegardée',
        description: 'Vos paramètres IA ont été enregistrés avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Mettre à jour la config du modèle
   */
  const handleModelConfigChange = (modelConfig: AIModelConfig) => {
    setSettings({ ...settings, modelConfig });
    setHasChanges(true);
  };

  /**
   * Réinitialiser les paramètres
   */
  const resetSettings = () => {
    setSettings(DEFAULT_AI_SETTINGS);
    setHasChanges(true);
    toast({
      title: 'Paramètres réinitialisés',
      description: 'Les paramètres par défaut ont été restaurés.',
    });
  };

  return (
    <div className="min-h-screen app-bg-gradient">
      <AppHeader />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold mb-2">Configuration IA Générative</h1>
          <p className="text-muted-foreground">
            Configurez votre clé API OpenAI et personnalisez les paramètres du modèle IA
          </p>
        </div>

        <div className="space-y-6">
          {/* Configuration API Key */}
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <CardTitle>Clé API OpenAI</CardTitle>
              </div>
              <CardDescription>
                Obtenez votre clé API sur{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  platform.openai.com
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Clé API</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="api-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setHasChanges(true);
                      }}
                      placeholder="sk-..."
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-0 top-0 h-full px-3"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  ⚠️ Votre clé API est stockée localement dans votre navigateur uniquement.
                  Elle n'est jamais envoyée à nos serveurs.
                </p>
              </div>

              {!apiKey && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-200">
                    <span className="font-medium">Important :</span> Sans clé API OpenAI,
                    les fonctionnalités IA ne seront pas disponibles. L'utilisation de
                    l'API OpenAI est facturée directement par OpenAI.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sélecteur de modèle */}
          <AIModelSelector
            config={settings.modelConfig}
            onChange={handleModelConfigChange}
          />

          {/* Fonctionnalités IA */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Fonctionnalités activées</CardTitle>
              <CardDescription>
                Choisissez les fonctionnalités IA que vous souhaitez utiliser
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Recommandations automatiques</p>
                  <p className="text-sm text-muted-foreground">
                    Génère des recommandations après chaque session
                  </p>
                </div>
                <Button
                  variant={settings.autoGenerateRecommendations ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      autoGenerateRecommendations: !settings.autoGenerateRecommendations,
                    });
                    setHasChanges(true);
                  }}
                >
                  {settings.autoGenerateRecommendations ? 'Activé' : 'Désactivé'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Assistant chat</p>
                  <p className="text-sm text-muted-foreground">
                    Posez des questions à votre coach IA
                  </p>
                </div>
                <Button
                  variant={settings.chatEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      chatEnabled: !settings.chatEnabled,
                    });
                    setHasChanges(true);
                  }}
                >
                  {settings.chatEnabled ? 'Activé' : 'Désactivé'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Plans d'entraînement</p>
                  <p className="text-sm text-muted-foreground">
                    Génère des plans d'entraînement personnalisés
                  </p>
                </div>
                <Button
                  variant={settings.trainingPlanEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      trainingPlanEnabled: !settings.trainingPlanEnabled,
                    });
                    setHasChanges(true);
                  }}
                >
                  {settings.trainingPlanEnabled ? 'Activé' : 'Désactivé'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={resetSettings}
            >
              Réinitialiser
            </Button>

            <Button
              onClick={saveSettings}
              disabled={!hasChanges}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Sauvegarder les modifications
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
