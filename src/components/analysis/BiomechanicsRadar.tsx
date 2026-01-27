/**
 * Graphique Radar "Biomécanique" style Sci-Fi / Néon
 * Remplace les grilles de scores simples pour un rendu plus "Pro"
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface BiomechanicsRadarProps {
  data: {
    label: string;
    value: number; // 0-100
    fullMark?: number;
  }[];
  title?: string;
}

export function BiomechanicsRadar({
  data,
  title = "ANALYSE BIOMÉCANIQUE",
}: BiomechanicsRadarProps) {
  const size = 300;
  const center = size / 2;
  const radius = (size - 60) / 2; // Marge pour les labels

  // Calcul des points du polygone
  const points = useMemo(() => {
    const angleStep = (Math.PI * 2) / data.length;
    return data.map((item, i) => {
      const angle = i * angleStep - Math.PI / 2; // Commencer en haut
      const valueNormalized = item.value / 100;

      // Point sur le radar (valeur)
      const x = center + Math.cos(angle) * radius * valueNormalized;
      const y = center + Math.sin(angle) * radius * valueNormalized;

      // Point max (bordure)
      const xMax = center + Math.cos(angle) * radius;
      const yMax = center + Math.sin(angle) * radius;

      // Point label
      const xLabel = center + Math.cos(angle) * (radius + 20);
      const yLabel = center + Math.sin(angle) * (radius + 20);

      return { x, y, xMax, yMax, xLabel, yLabel, ...item };
    });
  }, [data, center, radius]);

  // Path du radar (valeurs)
  const radarPath = useMemo(() => {
    if (points.length === 0) return "";
    return (
      points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
      " Z"
    );
  }, [points]);

  // Path de fond (grille pentagone)
  const gridPaths = useMemo(() => {
    const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
    return levels.map((level) => {
      return (
        points
          .map((_, i) => {
            const angle = i * ((Math.PI * 2) / data.length) - Math.PI / 2;
            const r = radius * level;
            const x = center + Math.cos(angle) * r;
            const y = center + Math.sin(angle) * r;
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ") + " Z"
      );
    });
  }, [points, center, radius, data.length]);

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-md h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Activity className="h-3 w-3 text-cyan-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center relative">
        <div className="relative w-full max-w-[300px] aspect-square">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <defs>
              <linearGradient
                id="radarGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grille de fond */}
            {gridPaths.map((path, i) => (
              <path
                key={i}
                d={path}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
                strokeDasharray={i === 4 ? "0" : "4 4"}
              />
            ))}

            {/* Axes */}
            {points.map((p, i) => (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={p.xMax}
                y2={p.yMax}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            ))}

            {/* Forme du Radar (Valeurs) */}
            <path
              d={radarPath}
              fill="url(#radarGradient)"
              stroke="#22d3ee"
              strokeWidth="2"
              filter="url(#glow)"
              className="animate-in zoom-in duration-1000 ease-out"
            />

            {/* Points aux sommets */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="3" fill="#fff" />

                {/* Labels */}
                <text
                  x={p.xLabel}
                  y={p.yLabel}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={p.value > 80 ? "#22d3ee" : "#94a3b8"}
                  className="text-[10px] font-mono font-bold uppercase"
                  style={{ fontSize: "10px" }}
                >
                  {p.label}
                </text>
                <text
                  x={p.xLabel}
                  y={p.yLabel + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  className="text-[10px] font-bold"
                  style={{ fontSize: "10px" }}
                >
                  {p.value}
                </text>
              </g>
            ))}
          </svg>

          {/* Centre Tech */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#fff]" />
        </div>
      </CardContent>
    </Card>
  );
}
