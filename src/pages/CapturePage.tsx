/**
 * Page de capture d'une volée de 3 lancers
 * Style: HUD Militaire / Sci-Fi
 */

import { useState, useCallback, useRef } from "react";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Zap,
  Crosshair,
  Timer,
  Maximize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CameraCapture } from "@/components/camera/CameraCapture";
import { useAppStore } from "@/store/useAppStore";
import { analyzethrow } from "@/lib/biomechanics/analyzer";
import { compareThrows } from "@/lib/biomechanics/comparison";
import { generateId } from "@/lib/utils";
import type { Pose, Throw, Volley } from "@/types";

type RecordingState =
  | "idle"
  | "countdown"
  | "recording"
  | "analyzing"
  | "completed";

export function CapturePage() {
  const { calibration, currentSession, addVolleyToSession, setAnalyzing } =
    useAppStore();

  // État de la capture
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [currentThrowIndex, setCurrentThrowIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);

  // Stockage des poses pendant l'enregistrement
  const posesBufferRef = useRef<Pose[]>([]);
  const throwsRef = useRef<Throw[]>([]);

  // Chronomètre
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number>();

  /**
   * Démarre le compte à rebours avant l'enregistrement
   */
  const startCountdown = useCallback(() => {
    // Vérifier que l'état est bien "idle" avant de démarrer
    if (recordingState !== "idle") {
      console.warn(
        "Tentative de démarrage alors que l'état n'est pas idle:",
        recordingState,
      );
      return;
    }

    setRecordingState("countdown");
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Démarrer l'enregistrement après le compte à rebours
          setRecordingState("recording");
          setElapsedTime(0);
          posesBufferRef.current = [];

          // Démarrer le chronomètre
          timerRef.current = window.setInterval(() => {
            setElapsedTime((t) => t + 100);
          }, 100);

          console.log(
            `🎯 Démarrage enregistrement lancer ${currentThrowIndex + 1}/3`,
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [recordingState, currentThrowIndex]);

  /**
   * Arrête l'enregistrement du lancer actuel
   */
  const stopRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setRecordingState("idle");

    // Vérifier qu'on a bien des poses
    if (posesBufferRef.current.length < 10) {
      alert("Enregistrement trop court. Recommencez.");
      return;
    }

    // Analyser le lancer
    setAnalyzing(true);

    try {
      const dominantHand = calibration?.dominantHand || "right";
      const analysis = analyzethrow(posesBufferRef.current, dominantHand);

      // Créer l'objet Throw
      const throwData: Throw = {
        id: generateId(),
        poses: posesBufferRef.current,
        analysis,
        recordedAt: Date.now(),
        duration: elapsedTime,
      };

      throwsRef.current.push(throwData);

      // Si c'est le 3ème lancer, créer la volée
      if (currentThrowIndex === 2) {
        await completeVolley();
      } else {
        // Passer au lancer suivant
        setCurrentThrowIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Erreur analyse:", error);
      alert("Erreur lors de l'analyse. Recommencez.");
    } finally {
      setAnalyzing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentThrowIndex, elapsedTime, calibration, setAnalyzing]);

  /**
   * Complète la volée et génère la comparaison
   */
  const completeVolley = useCallback(async () => {
    if (throwsRef.current.length !== 3) return;

    setAnalyzing(true);

    try {
      // Comparer les 3 lancers
      const comparison = compareThrows(
        throwsRef.current as [Throw, Throw, Throw],
      );

      // Créer la volée
      const volley: Volley = {
        id: generateId(),
        throws: throwsRef.current as [Throw, Throw, Throw],
        comparison,
        createdAt: Date.now(),
      };

      // Ajouter à la session
      if (currentSession) {
        addVolleyToSession(volley);
      }

      // Passer à l'état terminé
      setRecordingState("completed");

      // Rediriger vers l'analyse après 2 secondes
      setTimeout(() => {
        window.location.hash = `#/analysis/${volley.id}`;
      }, 2000);
    } catch (error) {
      console.error("Erreur création volée:", error);
      alert("Erreur lors de la création de la volée.");
    } finally {
      setAnalyzing(false);
    }
  }, [currentSession, addVolleyToSession, setAnalyzing]);

  /**
   * Recommence la volée
   */
  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setRecordingState("idle");
    setCurrentThrowIndex(0);
    setElapsedTime(0);
    posesBufferRef.current = [];
    throwsRef.current = [];
  }, []);

  /**
   * Callback de détection de pose
   */
  const handlePoseDetected = useCallback(
    (pose: Pose) => {
      if (recordingState === "recording") {
        posesBufferRef.current.push(pose);
      }
    },
    [recordingState],
  );

  /**
   * Retour à l'accueil
   */
  const goBack = () => {
    window.location.hash = "#/";
  };

  // Calcul du pourcentage de progression
  const progress =
    ((currentThrowIndex + (recordingState === "completed" ? 1 : 0)) / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pb-20 text-white overflow-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Header HUD */}
      <header className="border-b border-white/10 sticky top-0 bg-black/80 backdrop-blur-md z-20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={goBack}
              className="text-gray-400 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              ABORT
            </Button>

            <div className="text-center">
              <h1 className="text-lg font-bold font-mono tracking-widest text-cyan-500">
                SEQUENCE D'ACQUISITION
              </h1>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-mono">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                REC STATUS: {recordingState.toUpperCase()}
              </div>
            </div>

            <div className="w-24 flex justify-end">
              <Badge
                variant="outline"
                className="font-mono border-cyan-500/30 text-cyan-400"
              >
                CAM_01
              </Badge>
            </div>
          </div>

          {/* Barre de progression Tech */}
          <div className="mt-4 relative h-1 bg-white/5 w-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Zone de capture */}
      <main className="container mx-auto px-4 py-6 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Colonne Gauche - Caméra & HUD */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl group">
              {/* Viseur HUD Overlay */}
              <div className="absolute inset-0 z-20 pointer-events-none">
                {/* Coins */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500/50" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50" />

                {/* Crosshair Central */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30">
                  <Crosshair className="w-12 h-12 text-cyan-500" />
                </div>

                {/* Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-10" />

                {/* Info Overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-1 rounded-full border border-white/10 text-xs font-mono text-cyan-400">
                  AI TRACKING: ACTIVE
                </div>
              </div>

              <CameraCapture
                onPoseDetected={handlePoseDetected}
                showSkeleton={true}
                isRecording={recordingState === "recording"}
              />

              {/* Compte à rebours Overlay */}
              {recordingState === "countdown" && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="text-9xl font-black text-white animate-ping">
                    {countdown}
                  </div>
                </div>
              )}
            </div>

            {/* Contrôles Principaux */}
            <div className="flex gap-4 justify-center">
              {recordingState === "idle" && (
                <>
                  <Button
                    onClick={startCountdown}
                    size="lg"
                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold min-w-[200px] shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    INITIALISER LANCER
                  </Button>

                  {throwsRef.current.length > 0 && (
                    <Button
                      onClick={reset}
                      variant="outline"
                      size="lg"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <RotateCcw className="mr-2 h-5 w-5" />
                      RESET
                    </Button>
                  )}
                </>
              )}

              {recordingState === "recording" && (
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  size="lg"
                  className="min-w-[200px] animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                >
                  <div className="w-3 h-3 bg-white rounded-sm mr-2" />
                  STOP RECORDING
                </Button>
              )}
            </div>
          </div>

          {/* Colonne Droite - Stats Temps Réel */}
          <div className="lg:col-span-4 space-y-4">
            {/* État Actuel */}
            <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                  Statut Système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-white">
                    LANCER {currentThrowIndex + 1} / 3
                  </span>
                  <Badge
                    variant={
                      recordingState === "recording" ? "destructive" : "outline"
                    }
                    className="font-mono"
                  >
                    {recordingState === "recording" ? "REC" : "STANDBY"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 font-mono">
                    <span>BUFFER</span>
                    <span>{posesBufferRef.current.length} FRAMES</span>
                  </div>
                  <Progress
                    value={Math.min(posesBufferRef.current.length, 100)}
                    className="h-1"
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Timer className="h-4 w-4" />
                    <span className="font-mono text-xl font-bold">
                      {(elapsedTime / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historique Lancers */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest pl-1">
                Historique de Session
              </h3>
              {throwsRef.current.map((throwData, index) => (
                <div
                  key={throwData.id}
                  className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-mono">
                        {(throwData.duration / 1000).toFixed(1)}s
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      {throwData.analysis.technicalScore}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase">
                      Score
                    </div>
                  </div>
                </div>
              ))}

              {/* Placeholder pour les lancers à venir */}
              {Array.from({ length: 3 - throwsRef.current.length }).map(
                (_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded border border-white/5 border-dashed opacity-30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-xs text-gray-500">
                        {throwsRef.current.length + i + 1}
                      </div>
                      <span className="text-xs text-gray-600 font-mono">
                        EN ATTENTE...
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* Instructions Rapides */}
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Maximize className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-blue-400 uppercase">
                      Alignement Optimal
                    </h4>
                    <p className="text-xs text-blue-200/70 leading-relaxed">
                      Placez-vous de profil. Assurez-vous que votre épaule,
                      coude et poignet sont bien visibles dans le cadre.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Overlay de chargement final */}
      {recordingState === "completed" && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center">
          <div className="text-center space-y-6 animate-in zoom-in duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20 rounded-full" />
              <CheckCircle2 className="w-24 h-24 text-cyan-500 mx-auto relative z-10" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                ACQUISITION TERMINÉE
              </h2>
              <p className="text-gray-400 font-mono">
                Traitement des données biomécaniques...
              </p>
            </div>
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500" />
          </div>
        </div>
      )}
    </div>
  );
}
