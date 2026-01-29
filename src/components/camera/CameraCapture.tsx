/**
 * Composant de capture vidéo avec détection de pose
 * Gère l'accès à la webcam et l'affichage du flux
 */

import { useRef, useEffect, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumActionButton } from "@/components/ui/PremiumActionButton";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { initPoseDetector, detectPosesFromVideo } from "@/lib/pose/detector";
import type { Pose } from "@/types";

interface CameraCaptureProps {
  onPoseDetected?: (pose: Pose) => void;
  showSkeleton?: boolean;
  isRecording?: boolean;
}

/**
 * Composant de capture caméra avec overlay de squelette
 */
export function CameraCapture({
  onPoseDetected,
  showSkeleton = true,
  isRecording = false,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectorReady, setDetectorReady] = useState(false);
  const [fps, setFps] = useState(0);

  const { cameraConfig, setCameraConfig } = useAppStore();

  /**
   * Initialise le détecteur de pose au montage du composant
   */
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        await initPoseDetector();
        setDetectorReady(true);
      } catch (err) {
        setError("Impossible d'initialiser la détection de pose");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  /**
   * Démarre le flux caméra
   */
  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(
        "Caméra non supportée par ce navigateur. Essayez Chrome ou Firefox.",
      );
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Configuration optimisée mobile
      const constraints = {
        video: {
          facingMode: cameraConfig?.facingMode || "user",
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Attacher le flux au élément vidéo
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Attendre que la vidéo soit prête
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          }
        });

        await videoRef.current.play();

        // Ajuster le canvas à la taille de la vidéo
        if (canvasRef.current && videoRef.current.videoWidth > 0) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          console.log(
            "✅ Canvas dimensionné:",
            canvasRef.current.width,
            "x",
            canvasRef.current.height,
          );
        }
      }

      // Sauvegarder la config
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();

      setCameraConfig({
        deviceId: settings.deviceId,
        facingMode: cameraConfig?.facingMode || "user",
        resolution: {
          width: settings.width || 1280,
          height: settings.height || 720,
        },
        frameRate: settings.frameRate || 30,
      });

      setIsActive(true);
    } catch (err) {
      console.error("Erreur accès caméra:", err);
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Arrête le flux caméra
   */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
  };

  /**
   * Démarre la détection de pose en continu
   */
  // Buffer pour les traînées de mouvement
  const poseBufferRef = useRef<Pose[]>([]);
  const MAX_TRAIL_LENGTH = 8; // Nombre de frames pour la traînée

  /**
   * Démarre la détection de pose en continu
   */
  useEffect(() => {
    if (
      !isActive ||
      !detectorReady ||
      !videoRef.current ||
      !canvasRef.current
    ) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    let frameCount = 0;
    let lastFpsUpdate = Date.now();

    // Callback de détection
    const handlePoseDetected = (pose: Pose) => {
      // Calcul FPS
      frameCount++;
      const now = Date.now();
      if (now - lastFpsUpdate >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsUpdate = now;
      }

      // Gestion du buffer pour les traînées
      poseBufferRef.current.push(pose);
      if (poseBufferRef.current.length > MAX_TRAIL_LENGTH) {
        poseBufferRef.current.shift();
      }

      // Dessiner le squelette sur le canvas
      if (showSkeleton && canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Effacer le canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // 1. Dessiner les traînées (passé)
          poseBufferRef.current.forEach((trailPose, index) => {
            const opacity = (index / poseBufferRef.current.length) * 0.5; // Fade in
            const isLast = index === poseBufferRef.current.length - 1;

            if (!isLast) {
              drawRoboticPose(ctx, trailPose, {
                color: isRecording ? "#ef4444" : "#06b6d4", // Rouge ou Cyan
                opacity: opacity * 0.5,
                isMain: false,
              });
            }
          });

          // 2. Dessiner la pose actuelle (présent)
          drawRoboticPose(ctx, pose, {
            color: isRecording ? "#ef4444" : "#06b6d4",
            opacity: 1,
            isMain: true,
          });
        }
      }

      // Transmettre la pose au parent
      if (onPoseDetected) {
        onPoseDetected(pose);
      }
    };

    // Démarrer la détection continue
    const stopDetection = detectPosesFromVideo(video, handlePoseDetected, 0.3);

    // Cleanup
    return () => {
      stopDetection();
      poseBufferRef.current = []; // Reset buffer
    };
  }, [isActive, detectorReady, onPoseDetected, showSkeleton, isRecording]);

  /**
   * Fonction de dessin "Robotic/Sci-Fi" locale
   */
  function drawRoboticPose(
    ctx: CanvasRenderingContext2D,
    pose: Pose,
    options: { color: string; opacity: number; isMain: boolean },
  ) {
    const { color, opacity, isMain } = options;

    // Configuration du style
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = isMain ? 3 : 1;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Définition des connexions du squelette (standard BodyPix/MoveNet)
    const connections = [
      ["left_shoulder", "right_shoulder"],
      ["left_shoulder", "left_elbow"],
      ["left_elbow", "left_wrist"],
      ["right_shoulder", "right_elbow"],
      ["right_elbow", "right_wrist"],
      ["left_shoulder", "left_hip"],
      ["right_shoulder", "right_hip"],
      ["left_hip", "right_hip"],
      ["left_hip", "left_knee"],
      ["left_knee", "left_ankle"],
      ["right_hip", "right_knee"],
      ["right_knee", "right_ankle"],
    ];

    // Dessiner les connexions (Os)
    connections.forEach(([p1, p2]) => {
      const kp1 = pose.keypoints.find((k) => k.name === p1);
      const kp2 = pose.keypoints.find((k) => k.name === p2);

      if (kp1 && kp2 && (kp1.score || 0) > 0.3 && (kp2.score || 0) > 0.3) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.stroke();

        // Effet "Tech" : petits points au milieu des os pour le squelette principal
        if (isMain) {
          const midX = (kp1.x + kp2.x) / 2;
          const midY = (kp1.y + kp2.y) / 2;
          ctx.save();
          ctx.fillStyle = "#ffffff";
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.arc(midX, midY, 1, 0, 2 * Math.PI);
          ctx.fill();
          ctx.restore();
        }
      }
    });

    // Dessiner les articulations (Joints)
    pose.keypoints.forEach((kp) => {
      if ((kp.score || 0) > 0.3) {
        // Cercle extérieur
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, isMain ? 4 : 2, 0, 2 * Math.PI);
        ctx.fill();

        // Effet "Glow" pour le squelette principal
        if (isMain) {
          ctx.save();
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.restore();
        }
      }
    });

    ctx.globalAlpha = 1.0; // Reset
  }

  /**
   * Cleanup au démontage
   */
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* Zone vidéo + canvas overlay */}
      <Card className="relative w-full max-w-4xl aspect-video bg-black overflow-hidden">
        {/* Vidéo (cachée, sert de source) */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Canvas pour le squelette */}
        {showSkeleton && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Overlay de statut */}
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
            {error ? (
              <>
                <CameraOff className="w-16 h-16 text-destructive mb-4" />
                <p className="text-destructive text-center px-4">{error}</p>
                <Button
                  onClick={startCamera}
                  className="mt-4"
                  disabled={isLoading}
                >
                  Réessayer
                </Button>
              </>
            ) : isLoading ? (
              <>
                <div className="w-16 h-16 mb-4 animate-spin">⚙️</div>
                <p className="text-muted-foreground">Chargement...</p>
              </>
            ) : (
              <>
                <div className="w-full max-w-md px-4">
                  <PremiumActionButton
                    onClick={startCamera}
                    icon={Camera}
                    title="Activer la caméra"
                    subtitle="Initialisation du flux vidéo"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Badge REC si enregistrement */}
        {isRecording && isActive && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
            <div className="w-3 h-3 bg-white rounded-full" />
            <span className="text-sm font-bold">ENREGISTREMENT</span>
          </div>
        )}

        {/* FPS - Amélioré */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/10">
          <span className="text-sm font-mono font-bold">{fps} FPS</span>
        </div>

        {/* Grille de positionnement (si pas en enregistrement) */}
        {!isRecording && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-20">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/30" />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Contrôles */}
      {isActive && (
        <div className="mt-4 flex gap-2">
          <Button onClick={stopCamera} variant="outline">
            <CameraOff className="mr-2 h-4 w-4" />
            Arrêter la caméra
          </Button>
        </div>
      )}
    </div>
  );
}
