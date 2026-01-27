/**
 * Visualisation superposée des 3 lancers
 * Affiche toutes les frames de chaque lancer en transparence
 * avec une couleur différente par lancer
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Throw } from "@/types";

interface MotionOverlayProps {
  throws: [Throw, Throw, Throw];
  referenceIndex: number;
}

const THROW_COLORS = [
  "#00f2ff", // Cyan Néon - Lancer 1
  "#ff0055", // Magenta Néon - Lancer 2
  "#ccff00", // Lime Néon - Lancer 3
];

export function MotionOverlay({ throws, referenceIndex }: MotionOverlayProps) {
  // Trouver les dimensions pour normaliser
  const allKeypoints = throws.flatMap((t) =>
    t.poses.flatMap((p) => p.keypoints),
  );
  const minX = Math.min(...allKeypoints.map((kp) => kp.x));
  const maxX = Math.max(...allKeypoints.map((kp) => kp.x));
  const minY = Math.min(...allKeypoints.map((kp) => kp.y));
  const maxY = Math.max(...allKeypoints.map((kp) => kp.y));

  const viewWidth = maxX - minX || 640;
  const viewHeight = maxY - minY || 480;
  const padding = 40;

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <span className="w-2 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
          Superposition des mouvements
        </CardTitle>
        <CardDescription className="text-gray-400">
          Visualisation haute précision des trajectoires
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Légende */}
        <div className="flex gap-6 mb-6 justify-center">
          {throws.map((throwData, index) => (
            <div key={throwData.id} className="flex items-center gap-2 group">
              <div
                className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor] transition-all group-hover:scale-125"
                style={{
                  backgroundColor: THROW_COLORS[index],
                  color: THROW_COLORS[index],
                }}
              />
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                Lancer {index + 1}
              </span>
              {index === referenceIndex && (
                <Badge
                  variant="outline"
                  className="text-[10px] border-primary/50 text-primary bg-primary/10"
                >
                  REF
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Canvas de superposition */}
        <div className="relative w-full bg-[#050505] rounded-xl border border-white/5 overflow-hidden shadow-inner">
          {/* Grille de fond technique */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <svg
            viewBox={`${minX - padding} ${minY - padding} ${viewWidth + padding * 2} ${viewHeight + padding * 2}`}
            className="w-full h-auto relative z-10"
            preserveAspectRatio="xMidYMid meet"
            style={{ minHeight: "400px", maxHeight: "600px" }}
          >
            <defs>
              {/* Filtres globaux */}
              <filter
                id="glow-strong"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Dessiner chaque lancer */}
            {throws.map((throwData, throwIndex) => {
              const color = THROW_COLORS[throwIndex];
              const isReference = throwIndex === referenceIndex;

              return (
                <g key={throwData.id} opacity={isReference ? 1 : 0.6}>
                  {/* Traînée de mouvement avec courbes lissées */}
                  {renderMotionTrail(throwData.poses, color, isReference)}

                  {/* Position finale complète avec alignement épaules */}
                  <g opacity={1}>
                    {renderFullPosture(
                      throwData.poses[throwData.poses.length - 1]?.keypoints ||
                        [],
                      color,
                      isReference,
                    )}
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Overlay HUD */}
          <div className="absolute bottom-4 right-4 text-[10px] font-mono text-white/30 text-right pointer-events-none">
            <p>BIO-MECHANICAL ANALYSIS // V.2.0</p>
            <p>SCALE: 1:1 // GRID: 40PX</p>
          </div>
        </div>

        {/* Informations */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
          <div className="flex items-start gap-2 p-3 rounded bg-white/5 border border-white/5">
            <span className="text-lg">💡</span>
            <p>
              <strong className="text-gray-200">Trajectoire :</strong> Le
              dégradé indique la vitesse et la direction. Une courbe fluide = un
              mouvement contrôlé.
            </p>
          </div>
          <div className="flex items-start gap-2 p-3 rounded bg-white/5 border border-white/5">
            <span className="text-lg">📏</span>
            <p>
              <strong className="text-gray-200">Stabilité :</strong> La ligne
              pointillée relie les épaules. Elle doit rester horizontale pour
              une précision maximale.
            </p>
          </div>
          <div className="flex items-start gap-2 p-3 rounded bg-white/5 border border-white/5">
            <span className="text-lg">🎯</span>
            <p>
              <strong className="text-gray-200">Impact :</strong> Les points
              lumineux marquent les articulations clés au moment du relâchement.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Génère une traînée de mouvement avec effet de courbe lissée
 */
function renderMotionTrail(
  poses: Array<{
    keypoints: Array<{ name?: string; x: number; y: number; score?: number }>;
  }>,
  color: string,
  isReference: boolean,
) {
  // Extraire les positions du poignet (point le plus important)
  const wristPositions = poses
    .map((pose) => {
      const rightWrist = pose.keypoints.find((kp) => kp.name === "right_wrist");
      const leftWrist = pose.keypoints.find((kp) => kp.name === "left_wrist");
      return (rightWrist?.score || 0) > (leftWrist?.score || 0)
        ? rightWrist
        : leftWrist;
    })
    .filter((p) => p && (p.score || 0) > 0.3);

  if (wristPositions.length < 3) return null;

  // Créer une courbe lissée avec Catmull-Rom spline
  const pathData = createSmoothPath(
    wristPositions as Array<{ x: number; y: number }>,
  );

  return (
    <g>
      {/* Traînée principale avec gradient */}
      <defs>
        <linearGradient
          id={`gradient-${color}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            stopColor={color}
            stopOpacity={isReference ? 0.1 : 0.05}
          />
          <stop
            offset="100%"
            stopColor={color}
            stopOpacity={isReference ? 0.6 : 0.4}
          />
        </linearGradient>
      </defs>

      <path
        d={pathData}
        fill="none"
        stroke={`url(#gradient-${color})`}
        strokeWidth={isReference ? 4 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow-strong)"
      />

      {/* Points clés espacés pour montrer la progression */}
      {wristPositions
        .filter((_, i) => i % 8 === 0)
        .map(
          (pos, i) =>
            pos && (
              <circle
                key={i}
                cx={pos.x}
                cy={pos.y}
                r={isReference ? 3 : 2}
                fill={color}
                opacity={0.3 + (i / wristPositions.length) * 0.5}
              />
            ),
        )}
    </g>
  );
}

/**
 * Crée un chemin SVG lissé avec Catmull-Rom spline
 */
function createSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return "";

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    // Points de contrôle pour courbe de Bézier cubique
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

/**
 * Dessine la posture complète avec alignement des épaules (rendu professionnel)
 */
function renderFullPosture(
  keypoints: Array<{ name?: string; x: number; y: number; score?: number }>,
  color: string,
  isReference: boolean,
) {
  // Récupérer tous les points clés
  const rightShoulder = keypoints.find((kp) => kp.name === "right_shoulder");
  const leftShoulder = keypoints.find((kp) => kp.name === "left_shoulder");
  const rightElbow = keypoints.find((kp) => kp.name === "right_elbow");
  const leftElbow = keypoints.find((kp) => kp.name === "left_elbow");
  const rightWrist = keypoints.find((kp) => kp.name === "right_wrist");
  const leftWrist = keypoints.find((kp) => kp.name === "left_wrist");

  // Déterminer le bras dominant
  const rightScore =
    (rightShoulder?.score || 0) +
    (rightElbow?.score || 0) +
    (rightWrist?.score || 0);
  const leftScore =
    (leftShoulder?.score || 0) +
    (leftElbow?.score || 0) +
    (leftWrist?.score || 0);
  const isDominantRight = rightScore > leftScore;

  const dominantShoulder = isDominantRight ? rightShoulder : leftShoulder;
  const dominantElbow = isDominantRight ? rightElbow : leftElbow;
  const dominantWrist = isDominantRight ? rightWrist : leftWrist;

  if (!dominantShoulder || !dominantElbow || !dominantWrist) return null;

  return (
    <>
      {/* Defs pour effets visuels professionnels */}
      <defs>
        <filter id={`glow-${color}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`shadow-${color}`}>
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="5"
            floodColor={color}
            floodOpacity="0.5"
          />
        </filter>
      </defs>

      {/* Ligne d'alignement des épaules (critique pour l'analyse) */}
      {rightShoulder &&
        leftShoulder &&
        (rightShoulder.score || 0) > 0.3 &&
        (leftShoulder.score || 0) > 0.3 && (
          <>
            <line
              x1={leftShoulder.x}
              y1={leftShoulder.y}
              x2={rightShoulder.x}
              y2={rightShoulder.y}
              stroke={color}
              strokeWidth={1}
              strokeOpacity={0.6}
              strokeDasharray="4,4"
            />
            {/* Point milieu épaules pour référence */}
            <circle
              cx={(leftShoulder.x + rightShoulder.x) / 2}
              cy={(leftShoulder.y + rightShoulder.y) / 2}
              r={3}
              fill={color}
              opacity={0.8}
            />
          </>
        )}

      {/* Bras dominant avec effet glow */}
      <g filter={`url(#glow-${color})`}>
        {/* Ligne épaule-coude */}
        <line
          x1={dominantShoulder.x}
          y1={dominantShoulder.y}
          x2={dominantElbow.x}
          y2={dominantElbow.y}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Ligne coude-poignet */}
        <line
          x1={dominantElbow.x}
          y1={dominantElbow.y}
          x2={dominantWrist.x}
          y2={dominantWrist.y}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </g>

      {/* Points articulaires avec ombre */}
      <g filter={`url(#shadow-${color})`}>
        {/* Épaule dominante */}
        <circle
          cx={dominantShoulder.x}
          cy={dominantShoulder.y}
          r={4}
          fill="#000"
          stroke={color}
          strokeWidth={2}
        />

        {/* Coude - plus gros car point critique */}
        <g>
          <circle
            cx={dominantElbow.x}
            cy={dominantElbow.y}
            r={6}
            fill="#000"
            stroke={color}
            strokeWidth={2}
          />
          <circle
            cx={dominantElbow.x}
            cy={dominantElbow.y}
            r={2}
            fill={color}
          />
        </g>

        {/* Poignet */}
        <circle
          cx={dominantWrist.x}
          cy={dominantWrist.y}
          r={5}
          fill="#000"
          stroke={color}
          strokeWidth={2}
        />

        {/* Épaules (alignement) */}
        {rightShoulder && (rightShoulder.score || 0) > 0.3 && (
          <circle
            cx={rightShoulder.x}
            cy={rightShoulder.y}
            r={3}
            fill={color}
            opacity={0.6}
          />
        )}
        {leftShoulder && (leftShoulder.score || 0) > 0.3 && (
          <circle
            cx={leftShoulder.x}
            cy={leftShoulder.y}
            r={3}
            fill={color}
            opacity={0.6}
          />
        )}
      </g>

      {/* Labels professionnels (seulement pour référence) */}
      {isReference && (
        <g
          opacity={0.9}
          style={{
            fontSize: "10px",
            fontFamily: "monospace",
            fontWeight: "bold",
          }}
        >
          <text x={dominantWrist.x + 10} y={dominantWrist.y} fill={color}>
            POIGNET
          </text>
          <text x={dominantElbow.x + 10} y={dominantElbow.y} fill={color}>
            COUDE
          </text>
        </g>
      )}
    </>
  );
}
