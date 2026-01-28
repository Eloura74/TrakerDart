/**
 * Page de capture automatique d'une volée de 3 lancers
 * Détection automatique du début et fin de chaque lancer
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  RotateCcw,
  CheckCircle2,
  Loader2,
  Zap,
  AlertCircle,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { checkAndTrackFeature } from "@/services/featureGate";
import { PaywallModal } from "@/components/subscription/PaywallModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CameraCapture } from "@/components/camera/CameraCapture";
import { useAppStore } from "@/store/useAppStore";
import { analyzethrow } from "@/lib/biomechanics/analyzer";
import { compareThrows } from "@/lib/biomechanics/comparison";
import { createMotionDetector } from "@/lib/biomechanics/motionDetector";
import { generateId } from "@/lib/utils";
import type { Pose, Throw, Volley } from "@/types";
import { RealtimeCoach } from "@/services/realtimeCoach";
import { CoachingOverlay } from "@/components/coaching/CoachingOverlay";
import { CoachingSettings } from "@/components/coaching/CoachingSettings";
import type { RealtimeCoachingConfig, CoachingFeedback } from "@/types/coaching";

export function CapturePageAuto() {
  const {
    calibration,
    currentSession,
    addVolleyToSession,
    setAnalyzing,
    startSession,
  } = useAppStore();

  const [isReady, setIsReady] = useState(false);
  const [currentThrowIndex, setCurrentThrowIndex] = useState(0);
  const [throws, setThrows] = useState<Throw[]>([]);
  const [isAnalyzing, setIsAnalyzingLocal] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [motionState, setMotionState] = useState<string>("idle");
  const [showPaywall, setShowPaywall] = useState(false);

  // États coaching temps réel
  const [coachingConfig, setCoachingConfig] = useState<RealtimeCoachingConfig>(() => {
    const saved = localStorage.getItem('coaching_config');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      mode: 'visual' as const,
      sensitivity: 'normal' as const,
      focusAreas: [
        { joint: 'elbow' as const, threshold: 15, priority: 'high' as const },
        { joint: 'shoulder' as const, threshold: 15, priority: 'medium' as const }
      ],
      cooldownMs: 2000
    };
  });
  const [currentFeedback, setCurrentFeedback] = useState<CoachingFeedback | null>(null);
  const coachRef = useRef<RealtimeCoach | null>(null);

  const motionDetectorRef = useRef(
    createMotionDetector(calibration?.dominantHand || "right"),
  );

  // Initialiser le coach et persister config
  useEffect(() => {
    coachRef.current = new RealtimeCoach(coachingConfig);
  }, []);

  useEffect(() => {
    if (coachRef.current) {
      coachRef.current.updateConfig(coachingConfig);
    }
    localStorage.setItem('coaching_config', JSON.stringify(coachingConfig));
  }, [coachingConfig]);

  /**
   * Callback quand une pose est détectée
   */
  const handlePoseDetected = useCallback(
    async (pose: Pose) => {
      // Coaching temps réel (même si pas ready)
      if (coachRef.current && coachingConfig.enabled && !isCompleted) {
        const feedback = coachRef.current.analyzePose(pose);
        if (feedback) {
          setCurrentFeedback(feedback);
          // Clear feedback après 3s
          setTimeout(() => setCurrentFeedback(null), 3000);
        }
      }

      if (!isReady || isAnalyzing || isCompleted) return;

      const detector = motionDetectorRef.current;
      const result = detector.processPose(pose);

      setMotionState(result.state);

      // Si un lancer est complété
      if (result.state === "completed" && result.poses) {
        console.log(`✅ Lancer ${currentThrowIndex + 1}/${3} enregistré`);

        setIsAnalyzingLocal(true);
        setAnalyzing(true);

        try {
          // Analyser le lancer
          const dominantHand = calibration?.dominantHand || "right";
          const analysis = analyzethrow(result.poses, dominantHand);

          const throwData: Throw = {
            id: generateId(),
            poses: result.poses,
            analysis,
            recordedAt: Date.now(),
            duration: detector.getCurrentDuration(),
          };

          const newThrows = [...throws, throwData];
          setThrows(newThrows);

          // Si c'est le 3ème lancer, créer la volée
          if (currentThrowIndex === 2) {
            await completeVolley(newThrows as [Throw, Throw, Throw]);
          } else {
            // Passer au lancer suivant
            setCurrentThrowIndex((prev) => prev + 1);
          }
        } catch (error) {
          console.error("❌ Erreur analyse:", error);
          console.error(
            "Stack:",
            error instanceof Error ? error.stack : "No stack",
          );
          alert(
            "Erreur analyse: " +
              (error instanceof Error ? error.message : String(error)),
          );
          setIsAnalyzingLocal(false);
          setAnalyzing(false);
        } finally {
          setIsAnalyzingLocal(false);
          setAnalyzing(false);
        }
      }
    },
    [
      isReady,
      isAnalyzing,
      isCompleted,
      currentThrowIndex,
      throws,
      calibration,
      setAnalyzing,
    ],
  );

  /**
   * Complète la volée et génère la comparaison
   */
  const completeVolley = useCallback(
    async (allThrows: [Throw, Throw, Throw]) => {
      console.log("📊 Analyse de la volée...");

      setIsAnalyzingLocal(true);
      setAnalyzing(true);

      try {
        const comparison = compareThrows(allThrows);
        console.log(`✅ Régularité: ${comparison.consistencyIndex}%`);

        const volley: Volley = {
          id: generateId(),
          throws: allThrows,
          comparison,
          createdAt: Date.now(),
        };

        // Créer une session automatiquement si elle n'existe pas
        if (!currentSession) {
          console.warn("⚠️ Pas de session, création automatique...");
          startSession();
          // Attendre que le store soit mis à jour
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        addVolleyToSession(volley);
        console.log("✅ Volée enregistrée");

        setIsCompleted(true);

        // Attendre que le store soit mis à jour avant de rediriger
        setTimeout(() => {
          console.log("🔀 Redirection analyse...");
          window.location.hash = `#/analysis/${volley.id}`;
        }, 500);
      } catch (error) {
        console.error("❌ Erreur création volée:", error);
        alert("Erreur lors de la création de la volée: " + error);
      } finally {
        setIsAnalyzingLocal(false);
        setAnalyzing(false);
      }
    },
    [currentSession, addVolleyToSession, setAnalyzing],
  );

  /**
   * Démarre la détection automatique
   * Vérifie d'abord la limite de sessions mensuelles
   */
  const startAutoDetection = async () => {
    // Vérifier la limite de sessions mensuelles
    const access = await checkAndTrackFeature('sessions_per_month');
    
    if (!access.hasAccess) {
      setShowPaywall(true);
      return;
    }
    
    setIsReady(true);
    motionDetectorRef.current.resetManually();
  };

  /**
   * Recommence la volée
   */
  const reset = () => {
    setIsReady(false);
    setCurrentThrowIndex(0);
    setThrows([]);
    setIsAnalyzingLocal(false);
    setIsCompleted(false);
    setMotionState("idle");
    motionDetectorRef.current.resetManually();
  };


  const progress = (throws.length / 3) * 100;

  // Messages selon l'état
  const getStatusMessage = () => {
    if (isCompleted) return "✅ Volée terminée !";
    if (isAnalyzing) return "⚙️ Analyse en cours...";

    switch (motionState) {
      case "idle":
        return "⏳ En attente... Préparez-vous à lancer";
      case "preparing":
        return "⚡ Mouvement détecté...";
      case "throwing":
        return "🎯 Lancer en cours !";
      default:
        return "⏳ En attente...";
    }
  };

  const getStatusColor = () => {
    if (isCompleted) return "bg-success/10 border-success";
    if (isAnalyzing) return "bg-primary/10 border-primary";

    switch (motionState) {
      case "idle":
        return "bg-muted border-muted";
      case "preparing":
        return "bg-warning/10 border-warning";
      case "throwing":
        return "bg-error/10 border-error";
      default:
        return "bg-muted border-muted";
    }
  };

  return (
    <div className="min-h-screen app-bg-gradient pb-20 overflow-hidden">
      {/* Header unifié */}
      <AppHeader />

      {/* Barre de progression */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-[73px] z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-lg font-bold">Capture automatique</h1>
              <p className="text-xs text-muted-foreground">
                Lancer {Math.min(currentThrowIndex + 1, 3)}/3
              </p>
            </div>
            <Badge variant="outline" className="font-mono">
              {isReady ? "ACTIF" : "STANDBY"}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne Gauche - Caméra (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Caméra avec overlay coaching */}
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl">
              <CameraCapture
                onPoseDetected={handlePoseDetected}
                showSkeleton={true}
                isRecording={isReady && !isCompleted}
              />
              
              {/* Overlay coaching par-dessus la caméra */}
              <CoachingOverlay
                feedback={currentFeedback}
                show={coachingConfig.enabled && (isReady || currentFeedback !== null)}
              />
            </div>

            {/* État actuel */}
            <Card className={`${getStatusColor()} transition-colors`}>
              <CardContent className="p-4 text-center">
                <p className="text-base font-medium">{getStatusMessage()}</p>
                {isReady && !isCompleted && !isAnalyzing && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Effectuez votre lancer naturellement - Détection automatique active
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Contrôles - Directement sous la caméra */}
            <div className="flex gap-3 justify-center">
              {!isReady && !isCompleted && (
                <Button
                  onClick={startAutoDetection}
                  size="lg"
                  className="min-w-[250px]"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Activer la détection automatique
                </Button>
              )}

              {isReady && !isCompleted && (
                <Button onClick={reset} variant="outline" size="lg">
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Recommencer
                </Button>
              )}
            </div>

            {/* Volée terminée */}
            {isCompleted && (
              <Card className="bg-success/10 border-success">
                <CardContent className="p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                  <h2 className="text-xl font-bold mb-2">Volée terminée !</h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    Redirection vers l'analyse...
                  </p>
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-success" />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne Droite - Infos & Coaching (1/3 width) */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-[140px] lg:h-fit">
            {/* Panneau coaching settings */}
            {!isReady && (
              <CoachingSettings
                config={coachingConfig}
                onChange={setCoachingConfig}
              />
            )}

            {/* Lancers complétés */}
            {throws.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Lancers enregistrés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {throws.map((throwData, index) => (
                      <div
                        key={throwData.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="text-sm">
                            <p className="font-medium">
                              {throwData.poses.length} frames
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Score: {throwData.analysis.technicalScore}
                            </p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            {!isReady && !isCompleted && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="w-4 h-4 text-warning" />
                    Détection automatique
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="font-medium">Comment ça marche ?</p>
                  <ol className="space-y-1.5 list-decimal list-inside text-xs">
                    <li>Activez la détection automatique</li>
                    <li>Attendez d'être prêt</li>
                    <li>Effectuez votre lancer <strong>naturellement</strong></li>
                    <li>L'appli détecte début et fin automatiquement</li>
                    <li>Répétez pour les lancers 2 et 3</li>
                  </ol>

                  <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded">
                    <div className="flex gap-2">
                      <AlertCircle className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        <strong>Important :</strong> Gestes nets et complets. Évitez les faux mouvements.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        featureName="Sessions d'entraînement"
        featureDescription="Vous avez atteint la limite de sessions pour ce mois. Passez à Pro pour des sessions illimitées !"
        onClose={() => setShowPaywall(false)}
      />
    </div>
  );
}
