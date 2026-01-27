import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { Throw, Keypoint } from "@/types";

interface ThrowReplayProps {
  throws: [Throw, Throw, Throw];
  referenceIndex: number;
}

const THROW_COLORS = [
  "#00f2ff", // Cyan - Lancer 1
  "#ff0055", // Magenta - Lancer 2
  "#ccff00", // Lime - Lancer 3
];

export function ThrowReplay({ throws, referenceIndex }: ThrowReplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [visibleThrows, setVisibleThrows] = useState([true, true, true]);
  const [showSkeleton, setShowSkeleton] = useState(true);

  // Calculer la durée max pour normaliser
  // Si la durée stockée est 0, on la calcule à partir des timestamps des poses
  const maxDuration = Math.max(...throws.map((t) => {
    if (t.duration > 0) return t.duration;
    // Calculer depuis les poses
    if (t.poses && t.poses.length > 1) {
      return t.poses[t.poses.length - 1].timestamp - t.poses[0].timestamp;
    }
    return 1000; // Durée par défaut de 1 seconde pour éviter division par 0
  }));

  // Animation loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp: number;

    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const newTime = prev + deltaTime * playbackSpeed;
          if (newTime >= maxDuration) {
            setIsPlaying(false);
            return maxDuration;
          }
          return newTime;
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, maxDuration, playbackSpeed]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Trouver les dimensions pour l'échelle
    const allKeypoints = throws.flatMap((t) =>
      (t.poses || []).flatMap((p) => p.keypoints || []),
    );

    if (allKeypoints.length === 0) return;

    const minX = Math.min(...allKeypoints.map((kp) => kp.x));
    const maxX = Math.max(...allKeypoints.map((kp) => kp.x));
    const minY = Math.min(...allKeypoints.map((kp) => kp.y));
    const maxY = Math.max(...allKeypoints.map((kp) => kp.y));

    const padding = 50;
    // Eviter la division par zéro si minX == maxX
    const width = Math.max(maxX - minX, 1);
    const height = Math.max(maxY - minY, 1);

    const scaleX = canvas.width / (width + padding * 2);
    const scaleY = canvas.height / (height + padding * 2);
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (canvas.width - width * scale) / 2 - minX * scale;
    const offsetY = (canvas.height - height * scale) / 2 - minY * scale;

    // Dessiner chaque lancer
    throws.forEach((throwData, index) => {
      if (!visibleThrows[index]) return;

      // Calculer la durée réelle de ce lancer
      const throwDuration = throwData.poses && throwData.poses.length > 1
        ? throwData.poses[throwData.poses.length - 1].timestamp - throwData.poses[0].timestamp
        : throwData.duration || 1000;

      // Trouver la pose correspondant au temps actuel
      // Utiliser les timestamps des poses pour une précision maximale
      const targetTimestamp = throwData.poses[0]?.timestamp + (currentTime / maxDuration) * throwDuration;
      
      // Trouver la pose la plus proche du timestamp cible
      let pose = throwData.poses[0];
      for (let i = 0; i < throwData.poses.length; i++) {
        if (throwData.poses[i].timestamp <= targetTimestamp) {
          pose = throwData.poses[i];
        } else {
          break;
        }
      }

      if (pose && showSkeleton) {
        drawSkeleton(
          ctx,
          pose.keypoints,
          THROW_COLORS[index],
          scale,
          offsetX,
          offsetY,
          index === referenceIndex,
        );
      }
    });
  }, [currentTime, throws, visibleThrows, showSkeleton, referenceIndex, maxDuration]);

  const drawSkeleton = (
    ctx: CanvasRenderingContext2D,
    keypoints: Keypoint[],
    color: string,
    scale: number,
    offsetX: number,
    offsetY: number,
    isReference: boolean,
  ) => {
    const connections = [
      ["nose", "left_eye"],
      ["left_eye", "left_ear"],
      ["nose", "right_eye"],
      ["right_eye", "right_ear"],
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

    ctx.strokeStyle = color;
    ctx.lineWidth = isReference ? 3 : 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Effet néon
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;

    // Dessiner les os
    connections.forEach(([p1, p2]) => {
      const kp1 = keypoints.find((k) => k.name === p1);
      const kp2 = keypoints.find((k) => k.name === p2);

      if (kp1 && kp2 && kp1.score > 0.3 && kp2.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(kp1.x * scale + offsetX, kp1.y * scale + offsetY);
        ctx.lineTo(kp2.x * scale + offsetX, kp2.y * scale + offsetY);
        ctx.stroke();
      }
    });

    // Dessiner les articulations
    keypoints.forEach((kp) => {
      if (kp.score > 0.3) {
        ctx.beginPath();
        ctx.arc(
          kp.x * scale + offsetX,
          kp.y * scale + offsetY,
          isReference ? 4 : 3,
          0,
          2 * Math.PI,
        );
        ctx.fillStyle = color;
        ctx.fill();
      }
    });

    ctx.shadowBlur = 0;
  };

  const togglePlay = () => {
    if (currentTime >= maxDuration) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-cyan-400" />
          Replay Vidéo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Zone de visualisation */}
        <div className="relative aspect-video bg-black/50 rounded-lg border border-white/5 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-full object-contain"
          />

          {/* Overlay info temps */}
          <div className="absolute top-4 right-4 font-mono text-xs text-white/50">
            {(currentTime / 1000).toFixed(2)}s /{" "}
            {(maxDuration / 1000).toFixed(2)}s
          </div>
        </div>

        {/* Contrôles */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlay}
              className="h-10 w-10 rounded-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-1" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={reset}
              className="text-gray-400 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <div className="flex-1">
              <Slider
                value={[currentTime]}
                max={maxDuration}
                step={10}
                onValueChange={([val]) => {
                  setIsPlaying(false);
                  setCurrentTime(val);
                }}
                className="cursor-pointer"
              />
            </div>

            <select
              className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            >
              <option value="0.25">0.25x</option>
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
            </select>
          </div>

          {/* Options d'affichage */}
          <div className="flex flex-wrap gap-4 justify-center pt-2 border-t border-white/5">
            {throws.map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Switch
                  checked={visibleThrows[index]}
                  onCheckedChange={(checked) => {
                    const newVisible = [...visibleThrows];
                    newVisible[index] = checked;
                    setVisibleThrows(newVisible);
                  }}
                  className="data-[state=checked]:bg-opacity-50"
                  style={{
                    backgroundColor: visibleThrows[index]
                      ? THROW_COLORS[index]
                      : undefined,
                  }}
                />
                <Label className="text-xs text-gray-300">
                  Lancer {index + 1} {index === referenceIndex && "(Ref)"}
                </Label>
              </div>
            ))}

            <div className="w-full h-[1px] bg-white/5 my-2" />

            <div className="flex items-center gap-2">
              <Switch
                checked={showSkeleton}
                onCheckedChange={setShowSkeleton}
              />
              <Label className="text-xs text-gray-300">
                Afficher Squelette
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
