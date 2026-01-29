/**
 * Page de génération de plans d'entraînement par IA
 * Permet de créer des programmes personnalisés selon les objectifs
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/layout/AppHeader";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  Target,
  CheckCircle,
  Loader2,
  Download,
  Settings,
} from "lucide-react";
import { AIService } from "@/services/aiService";
import type { AITrainingPlan, AISettings } from "@/types/ai";
import { DEFAULT_AI_SETTINGS } from "@/types/ai";

export function AITrainingPlanPage() {
  const { toast } = useToast();
  const { sessions } = useAppStore();
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [trainingPlan, setTrainingPlan] = useState<AITrainingPlan | null>(null);
  const [aiService, setAiService] = useState<AIService | null>(null);

  // Charger la config IA au montage
  useEffect(() => {
    const apiKey = localStorage.getItem("openai_api_key");
    const savedSettings = localStorage.getItem("ai_settings");

    if (!apiKey) {
      toast({
        title: "Configuration requise",
        description:
          "Veuillez configurer votre clé API OpenAI dans les paramètres.",
        variant: "destructive",
      });
      return;
    }

    const settings: AISettings = savedSettings
      ? JSON.parse(savedSettings)
      : DEFAULT_AI_SETTINGS;

    if (!settings.trainingPlanEnabled) {
      toast({
        title: "Plans d'entraînement désactivés",
        description: "Activez cette fonctionnalité dans les paramètres IA.",
        variant: "destructive",
      });
      return;
    }

    const service = new AIService(apiKey, settings.modelConfig);
    setAiService(service);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Générer le plan d'entraînement
   */
  const generatePlan = async () => {
    if (!aiService || !goal.trim() || !sessions || sessions.length === 0) {
      toast({
        title: "Erreur",
        description: "Complétez quelques sessions avant de générer un plan.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const plan = await aiService.generateTrainingPlan(
        sessions.slice(-10), // 10 dernières sessions
        goal.trim(),
        duration,
      );

      setTrainingPlan(plan);

      toast({
        title: "Plan généré !",
        description: `Votre plan d'entraînement de ${duration} jours est prêt.`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer le plan.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exporter le plan (TODO: implémenter export PDF)
   */
  const exportPlan = () => {
    toast({
      title: "Bientôt disponible",
      description: "L'export PDF sera disponible prochainement.",
    });
  };

  return (
    <div className="min-h-screen app-bg-gradient">
      <AppHeader />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Retour</span>
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold font-heading truncate">
                Plan d'Entraînement IA
              </h1>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.hash = "#/ai-settings")}
            className="flex-shrink-0"
          >
            <Settings className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Paramètres</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Formulaire de génération */}
          <Card className="md:col-span-1 border-primary/20 h-fit">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Nouveau Plan</CardTitle>
              </div>
              <CardDescription>
                Définissez votre objectif et la durée
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Objectif principal</Label>
                <Textarea
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Ex: Améliorer ma précision de 20%, Corriger mon geste du coude..."
                  className="min-h-[100px]"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Durée (jours)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                  min={7}
                  max={90}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Entre 7 et 90 jours
                </p>
              </div>

              <Button
                onClick={generatePlan}
                disabled={!aiService || !goal.trim() || loading}
                className="w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Générer le Plan
                  </>
                )}
              </Button>

              {!aiService && (
                <p className="text-xs text-yellow-500">
                  ⚠️ Configuration requise dans les paramètres IA
                </p>
              )}

              {(!sessions || sessions.length === 0) && (
                <p className="text-xs text-yellow-500">
                  ⚠️ Complétez quelques sessions pour des recommandations
                  personnalisées
                </p>
              )}
            </CardContent>
          </Card>

          {/* Affichage du plan */}
          <div className="md:col-span-2 space-y-4">
            {!trainingPlan && !loading && (
              <Card className="border-primary/20">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Aucun plan généré
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Définissez votre objectif et générez un plan d'entraînement
                    personnalisé basé sur vos performances actuelles.
                  </p>
                </CardContent>
              </Card>
            )}

            {loading && (
              <Card className="border-primary/20">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  <p className="text-muted-foreground">
                    L'IA analyse vos performances et crée votre plan...
                  </p>
                </CardContent>
              </Card>
            )}

            {trainingPlan && (
              <>
                {/* En-tête du plan */}
                <Card className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <CardTitle>{trainingPlan.goal}</CardTitle>
                      </div>
                      <Button variant="outline" size="sm" onClick={exportPlan}>
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          Durée
                        </p>
                        <p className="text-lg font-semibold">
                          {trainingPlan.duration} jours
                        </p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          Semaines
                        </p>
                        <p className="text-lg font-semibold">
                          {trainingPlan.weeks.length}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Niveau actuel</p>
                      <p className="text-sm text-muted-foreground">
                        {trainingPlan.currentLevel}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Niveau visé</p>
                      <p className="text-sm text-muted-foreground">
                        {trainingPlan.targetLevel}
                      </p>
                    </div>

                    <Badge variant="secondary" className="text-xs">
                      Généré le{" "}
                      {new Date(trainingPlan.generatedAt).toLocaleDateString(
                        "fr-FR",
                      )}
                      {" • "} {trainingPlan.modelUsed}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Semaines d'entraînement */}
                {trainingPlan.weeks.map((week) => (
                  <Card key={week.weekNumber} className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Semaine {week.weekNumber} : {week.focus}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {week.sessions.map((session) => (
                        <div
                          key={session.day}
                          className="border border-border/50 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                                J{session.day}
                              </div>
                              <div>
                                <p className="font-medium">
                                  Jour {session.day}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {session.duration} minutes
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {session.exercises.map((exercise, idx) => (
                              <div
                                key={idx}
                                className="pl-4 border-l-2 border-primary/30"
                              >
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">
                                      {exercise.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-1">
                                      {exercise.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                      <Badge variant="outline">
                                        {exercise.sets} séries
                                      </Badge>
                                      <Badge variant="outline">
                                        {exercise.reps} répétitions
                                      </Badge>
                                      <Badge variant="outline">
                                        {exercise.restSeconds}s repos
                                      </Badge>
                                      <Badge variant="secondary">
                                        {exercise.focusArea}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {session.notes && (
                            <div className="mt-3 p-2 bg-muted/30 rounded text-xs text-muted-foreground">
                              💡 {session.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
