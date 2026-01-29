/**
 * Page de configuration de l'IA générative
 * Permet de configurer la clé API OpenAI et les paramètres du modèle
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AIModelSelector } from "@/components/ai/AIModelSelector";
import { AppHeader } from "@/components/layout/AppHeader";
import { ArrowLeft, Key, Save, Eye, EyeOff, ExternalLink, AlertTriangle } from "lucide-react";
import type { AIModelConfig, AISettings } from "@/types/ai";
import { DEFAULT_AI_SETTINGS } from "@/types/ai";
import {
  safeLocalStorageGet,
  safeLocalStorageSet,
  safeLocalStorageGetString,
  safeLocalStorageSetString,
} from "@/lib/utils/secureStorage";

export function AISettingsPage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  // Charger les settings au montage
  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Charger les settings depuis le stockage sécurisé
   * - Clé API: localStorage (persistée, pratique mais à risque)
   * - Settings: localStorage (persistés entre sessions)
   */
  const loadSettings = () => {
    // Charger la clé API depuis localStorage (parsing sécurisé)
    const savedApiKey = safeLocalStorageGetString("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    // Charger les settings depuis localStorage (avec parsing sécurisé)
    const savedSettings = safeLocalStorageGet<AISettings>(
      "ai_settings",
      DEFAULT_AI_SETTINGS
    );
    setSettings(savedSettings);
  };

  /**
   * Sauvegarder les settings de manière sécurisée
   * - Clé API: localStorage (persistée entre sessions)
   * - Settings: localStorage (persistés)
   */
  const saveSettings = () => {
    let apiKeySuccess = true;
    let settingsSuccess = true;

    // Sauvegarder l'API key dans localStorage
    if (apiKey.trim()) {
      apiKeySuccess = safeLocalStorageSetString("openai_api_key", apiKey.trim());
    }

    // Sauvegarder les settings dans localStorage
    settingsSuccess = safeLocalStorageSet("ai_settings", settings);

    if (apiKeySuccess && settingsSuccess) {
      setHasChanges(false);
      toast({
        title: "Configuration sauvegardée",
        description: "Vos paramètres IA ont été enregistrés avec succès.",
      });
    } else {
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder certains paramètres. Vérifiez la console.",
        variant: "destructive",
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
      title: "Paramètres réinitialisés",
      description: "Les paramètres par défaut ont été restaurés.",
    });
  };

  return (
    <div className="min-h-screen app-bg-gradient">
      <AppHeader />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Retour</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading mb-2">
            Configuration IA Générative
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configurez votre clé API OpenAI et personnalisez les paramètres du
            modèle IA
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
                Obtenez votre clé API sur{" "}
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
                      type={showApiKey ? "text" : "password"}
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
                
                {/* Avertissement sécurité */}
                <div className="space-y-2">
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-yellow-200 space-y-1">
                        <p className="font-medium">⚠️ Stockage local</p>
                        <p>
                          Votre clé API est stockée dans <strong>localStorage</strong> de votre navigateur.
                          Elle est protégée par parsing sécurisé mais reste accessible en cas d'attaque XSS.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-200 space-y-1">
                        <p className="font-medium">💡 Recommandation production</p>
                        <p>
                          Pour une sécurité maximale, utilisez un <strong>backend proxy</strong>
                          (ex: Supabase Edge Function) qui stocke votre clé côté serveur et effectue
                          les appels OpenAI pour vous.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!apiKey && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-200">
                    <span className="font-medium">Important :</span> Sans clé
                    API OpenAI, les fonctionnalités IA ne seront pas
                    disponibles. L'utilisation de l'API OpenAI est facturée
                    directement par OpenAI.
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
                  variant={
                    settings.autoGenerateRecommendations ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      autoGenerateRecommendations:
                        !settings.autoGenerateRecommendations,
                    });
                    setHasChanges(true);
                  }}
                >
                  {settings.autoGenerateRecommendations
                    ? "Activé"
                    : "Désactivé"}
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
                  variant={settings.chatEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      chatEnabled: !settings.chatEnabled,
                    });
                    setHasChanges(true);
                  }}
                >
                  {settings.chatEnabled ? "Activé" : "Désactivé"}
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
                  variant={settings.trainingPlanEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      trainingPlanEnabled: !settings.trainingPlanEnabled,
                    });
                    setHasChanges(true);
                  }}
                >
                  {settings.trainingPlanEnabled ? "Activé" : "Désactivé"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              onClick={resetSettings}
              className="w-full sm:w-auto"
            >
              Réinitialiser
            </Button>

            <Button
              onClick={saveSettings}
              disabled={!hasChanges}
              className="gap-2 w-full sm:w-auto"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Sauvegarder les modifications</span>
              <span className="sm:hidden">Sauvegarder</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
