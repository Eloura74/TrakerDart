/**
 * Page de calibration et aide au positionnement
 * Guide l'utilisateur pour optimiser la détection
 */

import { useState } from "react";
import { ArrowLeft, Check, AlertCircle, Camera, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CameraCapture } from "@/components/camera/CameraCapture";
import { useAppStore } from "@/store/useAppStore";
import type { Pose } from "@/types";

export function CalibrationPage() {
  const { calibration, setCalibration } = useAppStore();
  const [currentPose, setCurrentPose] = useState<Pose | null>(null);
  const [dominantHand, setDominantHand] = useState<"left" | "right">(
    calibration?.dominantHand || "right",
  );

  const handlePoseDetected = (pose: Pose) => {
    setCurrentPose(pose);
  };

  const saveCalibration = () => {
    // Sauvegarder directement sans passer par le store
    localStorage.setItem(
      "trakerdart-calibration",
      JSON.stringify({
        dominantHand,
        referenceDistance: 200,
        calibratedAt: Date.now(),
      }),
    );

    // Navigation immédiate
    window.location.hash = "#/capture";
  };

  const skipCalibration = () => {
    window.location.hash = "#/capture";
  };

  // Vérifier la qualité de la détection
  const checkQuality = () => {
    if (!currentPose) return { ready: false, issues: ["Aucune pose détectée"] };

    const issues: string[] = [];
    const shoulderKey =
      dominantHand === "right" ? "right_shoulder" : "left_shoulder";
    const elbowKey = dominantHand === "right" ? "right_elbow" : "left_elbow";
    const wristKey = dominantHand === "right" ? "right_wrist" : "left_wrist";

    const shoulder = currentPose.keypoints.find(
      (kp) => kp.name === shoulderKey,
    );
    const elbow = currentPose.keypoints.find((kp) => kp.name === elbowKey);
    const wrist = currentPose.keypoints.find((kp) => kp.name === wristKey);
    const nose = currentPose.keypoints.find((kp) => kp.name === "nose");

    if (!shoulder || shoulder.score < 0.5) {
      issues.push("Épaule mal détectée - améliorez l'éclairage");
    }
    if (!elbow || elbow.score < 0.5) {
      issues.push("Coude mal détecté - dégagez le bras");
    }
    if (!wrist || wrist.score < 0.5) {
      issues.push("Poignet mal détecté - montrez votre main");
    }
    if (!nose || nose.score < 0.5) {
      issues.push("Tête mal détectée - regardez la caméra");
    }

    return {
      ready: issues.length === 0,
      issues,
      confidence: currentPose.score,
    };
  };

  const quality = checkQuality();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                window.location.hash = "#/";
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>

            <h1 className="text-xl font-bold">Calibration</h1>

            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Caméra */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Positionnement
                </CardTitle>
                <CardDescription>
                  Vérifiez que vous êtes bien visible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CameraCapture
                  onPoseDetected={handlePoseDetected}
                  showSkeleton={true}
                  isRecording={false}
                />

                {/* Statut de détection */}
                <div className="mt-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {quality.ready ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-warning" />
                    )}
                    <span className="font-medium">
                      {quality.ready
                        ? "Prêt à enregistrer"
                        : "Ajustements nécessaires"}
                    </span>
                  </div>

                  {quality.issues.length > 0 && (
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {quality.issues.map((issue, index) => (
                        <li key={index}>• {issue}</li>
                      ))}
                    </ul>
                  )}

                  {currentPose && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Confiance: {(quality.confidence! * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            {/* Main dominante */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Main dominante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    variant={dominantHand === "right" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setDominantHand("right")}
                  >
                    Droitier
                  </Button>
                  <Button
                    variant={dominantHand === "left" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setDominantHand("left")}
                  >
                    Gaucher
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Guide de positionnement */}
            <Card>
              <CardHeader>
                <CardTitle>Guide de positionnement optimal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge className="mt-0.5">1</Badge>
                    <div>
                      <p className="font-medium">Position de profil ou 3/4</p>
                      <p className="text-sm text-muted-foreground">
                        La caméra doit voir votre épaule, coude et poignet de
                        lancer
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Badge className="mt-0.5">2</Badge>
                    <div>
                      <p className="font-medium">Distance 2-3 mètres</p>
                      <p className="text-sm text-muted-foreground">
                        Ni trop près (manque de recul) ni trop loin (détails
                        flous)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Badge className="mt-0.5">3</Badge>
                    <div>
                      <p className="font-medium">Éclairage uniforme</p>
                      <p className="text-sm text-muted-foreground">
                        Évitez le contre-jour et les zones d'ombre
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Badge className="mt-0.5">4</Badge>
                    <div>
                      <p className="font-medium">Arrière-plan dégagé</p>
                      <p className="text-sm text-muted-foreground">
                        Pas d'objets ou de personnes derrière vous
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Badge className="mt-0.5">5</Badge>
                    <div>
                      <p className="font-medium">Vêtements contrastés</p>
                      <p className="text-sm text-muted-foreground">
                        Évitez les couleurs proches de l'arrière-plan
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Points détectés requis */}
            <Card>
              <CardHeader>
                <CardTitle>Points clés à détecter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {[
                    { name: "Tête", key: "nose" },
                    {
                      name: `Épaule ${dominantHand === "right" ? "droite" : "gauche"}`,
                      key: `${dominantHand}_shoulder`,
                    },
                    {
                      name: `Coude ${dominantHand === "right" ? "droit" : "gauche"}`,
                      key: `${dominantHand}_elbow`,
                    },
                    {
                      name: `Poignet ${dominantHand === "right" ? "droit" : "gauche"}`,
                      key: `${dominantHand}_wrist`,
                    },
                  ].map((point) => {
                    const detected = currentPose?.keypoints.find(
                      (kp) => kp.name === point.key,
                    );
                    const good = detected && detected.score > 0.5;

                    return (
                      <div
                        key={point.key}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span>{point.name}</span>
                        {detected ? (
                          <Badge variant={good ? "success" : "warning"}>
                            {(detected.score * 100).toFixed(0)}%
                          </Badge>
                        ) : (
                          <Badge variant="error">Non détecté</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={saveCalibration}
                disabled={!quality.ready}
                size="lg"
                className="w-full"
              >
                {quality.ready ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Enregistrer et continuer
                  </>
                ) : (
                  "Ajustez votre position"
                )}
              </Button>

              <Button
                onClick={skipCalibration}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                Passer cette étape
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
