/**
 * Graphique d'évolution des angles au cours du mouvement
 * Style: Oscilloscope / Néon Pro
 */

import { useMemo } from "react";
import type { JointAngle, ThrowPhase } from "@/types";

interface AngleChartProps {
  angles: JointAngle[];
  title: string;
  color?: string;
  height?: number;
}

/**
 * Graphique SVG style Oscilloscope
 */
export function AngleChart({
  angles,
  title,
  color = "#00f2ff", // Cyan néon par défaut
  height = 200,
}: AngleChartProps) {
  const chartId = useMemo(() => Math.random().toString(36).substr(2, 9), []);

  // Dimensions
  const width = 600;
  const padding = useMemo(
    () => ({ top: 30, right: 50, bottom: 30, left: 50 }),
    [],
  );
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Echelle
  const angleValues = angles.map((a) => a.angle);
  const minAngle = Math.max(Math.min(...angleValues) - 15, 0);
  const maxAngle = Math.min(Math.max(...angleValues) + 15, 180);
  const angleRange = maxAngle - minAngle || 1;

  // Points SVG
  const points = useMemo(() => {
    if (angles.length === 0) return "";
    return angles
      .map((angle, index) => {
        const x = padding.left + (index / (angles.length - 1)) * chartWidth;
        const y =
          padding.top +
          chartHeight -
          ((angle.angle - minAngle) / angleRange) * chartHeight;
        return `${x},${y}`;
      })
      .join(" ");
  }, [angles, chartWidth, chartHeight, minAngle, angleRange, padding]);

  // Zone sous la courbe (dégradé)
  const areaPath = useMemo(() => {
    if (angles.length === 0) return "";
    const firstPoint = `${padding.left},${padding.top + chartHeight}`;
    const lastPoint = `${padding.left + chartWidth},${padding.top + chartHeight}`;
    return `${firstPoint} ${points} ${lastPoint}`;
  }, [points, padding, chartHeight, chartWidth, angles]);

  // Couleurs des phases (Version Néon)
  const phaseColors: Record<ThrowPhase, string> = {
    preparation: "#94a3b8", // Slate 400
    wind_up: "#fbbf24", // Amber 400
    acceleration: "#ef4444", // Red 500
    release: "#10b981", // Emerald 500
    follow_through: "#818cf8", // Indigo 400
  };

  // Zones de phases
  const phaseZones = useMemo(() => {
    if (angles.length === 0) return [];
    const zones: Array<{ phase: ThrowPhase; startX: number; width: number }> =
      [];
    let currentPhase = angles[0].phase;
    let startIndex = 0;

    for (let i = 1; i <= angles.length; i++) {
      if (i === angles.length || angles[i].phase !== currentPhase) {
        const endIndex = i;
        const startX =
          padding.left + (startIndex / (angles.length - 1)) * chartWidth;
        const endX =
          padding.left + ((endIndex - 1) / (angles.length - 1)) * chartWidth;
        zones.push({
          phase: currentPhase,
          startX,
          width: endX - startX,
        });
        if (i < angles.length) {
          currentPhase = angles[i].phase;
          startIndex = i;
        }
      }
    }
    return zones;
  }, [angles, chartWidth, padding]);

  if (!angles || angles.length === 0) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-cyan-400 font-mono uppercase tracking-wider">
          {title}
        </h4>
        <div className="border border-white/10 rounded bg-black/60 p-8 text-center text-muted-foreground font-mono text-xs">
          NO DATA SIGNAL
        </div>
      </div>
    );
  }

  const yAxisTicks = [minAngle, (minAngle + maxAngle) / 2, maxAngle];

  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-cyan-400 font-mono uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          {title}
        </h4>
        <span className="text-[10px] font-mono text-cyan-500/70">
          {angles.length} SAMPLES // {minAngle.toFixed(0)}° -{" "}
          {maxAngle.toFixed(0)}°
        </span>
      </div>

      <div className="relative">
        {/* Effet de scanline CSS */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 pointer-events-none bg-[length:100%_2px,3px_100%] opacity-20" />

        <svg
          width={width}
          height={height}
          className="border border-white/10 rounded-lg bg-black/80 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            <linearGradient
              id={`gradient-${chartId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>

            {/* Glow Filter Pro */}
            <filter
              id={`glow-${chartId}`}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Pattern Grille */}
            <pattern
              id={`grid-${chartId}`}
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          {/* Fond Grille Technique */}
          <rect
            x={padding.left}
            y={padding.top}
            width={chartWidth}
            height={chartHeight}
            fill={`url(#grid-${chartId})`}
          />

          {/* Zones de phases (Subtiles) */}
          {phaseZones.map((zone, index) => (
            <rect
              key={index}
              x={zone.startX}
              y={padding.top}
              width={zone.width}
              height={chartHeight}
              fill={phaseColors[zone.phase]}
              opacity={0.05}
            />
          ))}

          {/* Grille Horizontale Principale */}
          {yAxisTicks.map((tick, index) => {
            const y =
              padding.top +
              chartHeight -
              ((tick - minAngle) / angleRange) * chartHeight;
            return (
              <g key={index}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke={color}
                  strokeWidth={0.5}
                  strokeDasharray="2,2"
                  opacity={0.3}
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={9}
                  fontFamily="monospace"
                  fill={color}
                  opacity={0.7}
                >
                  {tick.toFixed(0)}°
                </text>
              </g>
            );
          })}

          {/* Zone remplie */}
          <path d={areaPath} fill={`url(#gradient-${chartId})`} opacity={0.6} />

          {/* Ligne du graphique (Glow) */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            filter={`url(#glow-${chartId})`}
          />

          {/* Curseur de fin (Point actuel) */}
          {angles.length > 0 && (
            <g>
              <circle
                cx={
                  padding.left +
                  ((angles.length - 1) / (angles.length - 1)) * chartWidth
                }
                cy={
                  padding.top +
                  chartHeight -
                  ((angles[angles.length - 1].angle - minAngle) / angleRange) *
                    chartHeight
                }
                r={3}
                fill="#fff"
                filter={`url(#glow-${chartId})`}
              />
              <circle
                cx={
                  padding.left +
                  ((angles.length - 1) / (angles.length - 1)) * chartWidth
                }
                cy={
                  padding.top +
                  chartHeight -
                  ((angles[angles.length - 1].angle - minAngle) / angleRange) *
                    chartHeight
                }
                r={6}
                fill="none"
                stroke={color}
                strokeWidth={1}
                opacity={0.5}
              >
                <animate
                  attributeName="r"
                  from="3"
                  to="8"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.8"
                  to="0"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          )}

          {/* Axe X */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            stroke={color}
            strokeWidth={1}
            opacity={0.5}
          />

          {/* Axe Y */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke={color}
            strokeWidth={1}
            opacity={0.5}
          />
        </svg>
      </div>

      {/* Légende des phases (Style Tech) */}
      <div className="flex flex-wrap gap-3 text-[10px] font-mono justify-center pt-1">
        {Object.entries(phaseColors).map(([phase, pColor]) => (
          <div
            key={phase}
            className="flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity"
          >
            <div
              className="w-2 h-2 rounded-sm"
              style={{
                backgroundColor: pColor,
                boxShadow: `0 0 5px ${pColor}`,
              }}
            />
            <span className="text-gray-400 uppercase tracking-wider">
              {phase.replace("_", " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Grille de comparaison de plusieurs graphiques
 */
interface AngleChartGridProps {
  charts: Array<{
    angles: JointAngle[];
    title: string;
    color?: string;
  }>;
}

export function AngleChartGrid({ charts }: AngleChartGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {charts.map((chart, index) => (
        <AngleChart
          key={index}
          angles={chart.angles}
          title={chart.title}
          color={chart.color}
        />
      ))}
    </div>
  );
}
