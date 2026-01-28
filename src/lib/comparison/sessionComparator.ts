import { TrainingSession, Volley } from "@/types";

export interface ComparisonMetrics {
  consistencyTrend: number[];
  technicalScoreTrend: number[];
  elbowAngleTrend: number[];
  improvementRate: number;
  bestMetrics: MetricSnapshot;
  worstMetrics: MetricSnapshot;
}

export interface MetricSnapshot {
  sessionId: string;
  date: number;
  consistency: number;
  technicalScore: number;
}

export function compareSessionsMetrics(
  sessions: TrainingSession[],
): ComparisonMetrics {
  if (!sessions || sessions.length === 0) {
    return {
      consistencyTrend: [],
      technicalScoreTrend: [],
      elbowAngleTrend: [],
      improvementRate: 0,
      bestMetrics: {
        sessionId: "",
        date: 0,
        consistency: 0,
        technicalScore: 0,
      },
      worstMetrics: {
        sessionId: "",
        date: 0,
        consistency: 0,
        technicalScore: 0,
      },
    };
  }

  // Trier par date
  const sorted = [...sessions].sort((a, b) => a.createdAt - b.createdAt);

  // Calculer les tendances
  const consistencyTrend = sorted.map((s) => s.stats?.averageConsistency || 0);
  const technicalScoreTrend = sorted.map(
    (s) => s.stats?.averageTechnicalScore || 0,
  );

  // Calculer taux d'amélioration
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const firstConsistency = first.stats?.averageConsistency || 0;
  const lastConsistency = last.stats?.averageConsistency || 0;

  let improvementRate = 0;
  if (firstConsistency > 0) {
    improvementRate =
      ((lastConsistency - firstConsistency) / firstConsistency) * 100;
  }

  // Identifier meilleurs/pires
  const bestMetrics = findBestMetrics(sorted);
  const worstMetrics = findWorstMetrics(sorted);

  // Calculer angles moyens (si disponibles)
  const elbowAngleTrend = sorted.map((s) =>
    calculateAverageElbowAngle(s.volleys),
  );

  return {
    consistencyTrend,
    technicalScoreTrend,
    elbowAngleTrend,
    improvementRate,
    bestMetrics,
    worstMetrics,
  };
}

function findBestMetrics(sessions: TrainingSession[]): MetricSnapshot {
  if (sessions.length === 0)
    return { sessionId: "", date: 0, consistency: 0, technicalScore: 0 };

  const best = sessions.reduce((prev, current) =>
    (current.stats?.averageConsistency || 0) >
    (prev.stats?.averageConsistency || 0)
      ? current
      : prev,
  );

  return {
    sessionId: best.id,
    date: best.createdAt,
    consistency: best.stats?.averageConsistency || 0,
    technicalScore: best.stats?.averageTechnicalScore || 0,
  };
}

function findWorstMetrics(sessions: TrainingSession[]): MetricSnapshot {
  if (sessions.length === 0)
    return { sessionId: "", date: 0, consistency: 0, technicalScore: 0 };

  const worst = sessions.reduce((prev, current) =>
    (current.stats?.averageConsistency || 0) <
    (prev.stats?.averageConsistency || 0)
      ? current
      : prev,
  );

  return {
    sessionId: worst.id,
    date: worst.createdAt,
    consistency: worst.stats?.averageConsistency || 0,
    technicalScore: worst.stats?.averageTechnicalScore || 0,
  };
}

function calculateAverageElbowAngle(volleys: Volley[]): number {
  if (!volleys || volleys.length === 0) return 0;

  const angles = volleys.flatMap((v) =>
    v.throws.map((t) => t.analysis?.elbow?.avgAngleByPhase?.release || 0),
  );

  if (angles.length === 0) return 0;
  return angles.reduce((sum, a) => sum + a, 0) / angles.length;
}
