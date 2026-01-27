/**
 * Page de capture automatique d'une volée de 3 lancers
 * Détection automatique du début et fin de chaque lancer
 */

import { useState, useCallback, useRef } from "react";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Zap,
  AlertCircle,
} from "lucide-react";
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

  const motionDetectorRef = useRef(
    createMotionDetector(calibration?.dominantHand || "right"),
  );

  /**
   * Callback quand une pose est détectée
   */
  const handlePoseDetected = useCallback(
    async (pose: Pose) => {
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
   */
  const startAutoDetection = () => {
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

  /**
   * Retour
   */
  const goBack = () => {
    window.location.hash = "#/";
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>

            <div className="text-center">
              <h1 className="text-xl font-bold">Capture automatique</h1>
              <p className="text-sm text-muted-foreground">
                Lancer {Math.min(currentThrowIndex + 1, 3)}/3
              </p>
            </div>

            <div className="w-20" />
          </div>

          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Caméra */}
        <CameraCapture
          onPoseDetected={handlePoseDetected}
          showSkeleton={true}
          isRecording={isReady && !isCompleted}
        />

        {/* État actuel */}
        <Card className={`${getStatusColor()} transition-colors`}>
          <CardContent className="p-6 text-center">
            <p className="text-lg font-medium">{getStatusMessage()}</p>
            {isReady && !isCompleted && !isAnalyzing && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  Effectuez votre lancer naturellement - La détection est
                  automatique
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Ouvrez la console (F12) pour voir la vélocité en temps réel
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lancers complétés */}
        {throws.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Lancers enregistrés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {throws.map((throwData, index) => (
                  <div
                    key={throwData.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="success">✓ Lancer {index + 1}</Badge>
                      <div className="text-sm">
                        <p className="font-medium">
                          {throwData.poses.length} frames
                        </p>
                        <p className="text-muted-foreground">
                          Score: {throwData.analysis.technicalScore}/100
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

        {/* Volée terminée */}
        {isCompleted && (
          <Card className="bg-success/10 border-success">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Volée terminée !</h2>
              <p className="text-muted-foreground mb-4">
                Redirection vers l'analyse...
              </p>
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-success" />
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!isReady && !isCompleted && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning" />
                Détection automatique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="font-medium">Comment ça marche ?</p>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Cliquez sur "Activer la détection automatique"</li>
                <li>Attendez d'être prêt (quelques secondes)</li>
                <li>
                  Effectuez votre lancer <strong>naturellement</strong>
                </li>
                <li>
                  L'application détecte automatiquement le début et la fin
                </li>
                <li>Répétez pour les lancers 2 et 3</li>
                <li>L'analyse se lance automatiquement</li>
              </ol>

              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <strong>Important :</strong> Faites des gestes nets et
                    complets. Évitez les faux mouvements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contrôles */}
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
      </main>
    </div>
  );
}
