/**
 * Page d'analyse détaillée d'une volée
 * Style: Glassmorphism / Pro Dashboard
 */

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Target,
  Activity,
  BarChart3,
  Table,
  Trophy,
  Zap,
  Crosshair,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeedbackList } from "@/components/analysis/FeedbackCard";
import { AngleChartGrid } from "@/components/analysis/AngleChart";
import { DataTable } from "@/components/analysis/DataTable";
import { ThrowComparison } from "@/components/analysis/ThrowComparison";
import { FeedbackCardPro } from "@/components/analysis/FeedbackCardPro";
import { TrainingPlan } from "@/components/analysis/TrainingPlan";
import { MotionOverlay } from "@/components/analysis/MotionOverlay";
import { BiomechanicsRadar } from "@/components/analysis/BiomechanicsRadar";
import { useAppStore } from "@/store/useAppStore";
import { generateRecommendations } from "@/lib/feedback/generator";
import {
  generateProfessionalRecommendations,
  getTopPriorities,
  generateTrainingPlan,
} from "@/lib/feedback/professionalRecommendations";
import type { Volley, Throw } from "@/types";

interface AnalysisPageProps {
  volleyId?: string;
}

export function AnalysisPage({ volleyId }: AnalysisPageProps) {
  const { currentSession } = useAppStore();
  const [selectedView, setSelectedView] = useState<
    "summary" | "charts" | "data"
  >("summary");

  // Trouver la volée à afficher
  const volley: Volley | null = useMemo(() => {
    if (!currentSession) return null;
    if (volleyId) {
      return currentSession.volleys.find((v) => v.id === volleyId) || null;
    }
    return currentSession.volleys[currentSession.volleys.length - 1] || null;
  }, [currentSession, volleyId]);

  // Générer les recommandations
  const recommendations = useMemo(() => {
    if (!volley) return null;
    const analyses = volley.throws.map((t) => t.analysis);
    return generateRecommendations(analyses, volley.comparison);
  }, [volley]);

  // Nouvelles recommandations professionnelles
  const proRecommendations = useMemo(() => {
    if (!volley) return [];
    try {
      const analyses = volley.throws.map((t) => t.analysis);
      return generateProfessionalRecommendations(analyses, volley.comparison);
    } catch (error) {
      console.error("Erreur génération recommandations:", error);
      return [];
    }
  }, [volley]);

  // Top 3 priorités
  const topPriorities = useMemo(() => {
    try {
      return getTopPriorities(proRecommendations);
    } catch (error) {
      console.error("Erreur génération top priorities:", error);
      return [];
    }
  }, [proRecommendations]);

  // Plan d'entraînement
  const trainingPlan = useMemo(() => {
    try {
      return generateTrainingPlan(proRecommendations);
    } catch (error) {
      console.error("Erreur génération plan:", error);
      return { week1: [], week2: [], week3: [], week4: [] };
    }
  }, [proRecommendations]);

  const goBack = () => {
    window.location.hash = "#/";
  };

  const startNewVolley = () => {
    window.location.hash = "#/capture";
  };

  if (!volley) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4 font-mono">
              NO DATA AVAILABLE
            </p>
            <Button onClick={goBack} variant="outline">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcul des scores moyens
  const avgTechnicalScore =
    volley.throws.reduce((sum, t) => sum + t.analysis.technicalScore, 0) / 3;

  return (
    <div className="min-h-screen bg-transparent pb-20 text-white selection:bg-cyan-500/30">
      {/* Background Grid Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={goBack}
              className="text-gray-400 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              RETOUR
            </Button>

            <div className="flex items-center gap-3">
              <div className="h-8 w-[1px] bg-white/10" />
              <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                ANALYSE <span className="text-cyan-400">PRO</span>
              </h1>
            </div>

            <Button
              onClick={startNewVolley}
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]"
            >
              <Zap className="mr-2 h-4 w-4" />
              NOUVELLE VOLÉE
            </Button>
          </div>

          {/* Onglets de navigation */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-fit backdrop-blur-md border border-white/5">
            {[
              { id: "summary", icon: Target, label: "RÉSUMÉ" },
              { id: "charts", icon: BarChart3, label: "GRAPHIQUES" },
              { id: "data", icon: Table, label: "DONNÉES" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setSelectedView(tab.id as "summary" | "charts" | "data")
                }
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedView === tab.id
                    ? "bg-white/10 text-white shadow-lg shadow-black/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Vue Résumé */}
        {selectedView === "summary" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Player Card Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score Principal */}
              <Card className="bg-black/40 border-white/10 backdrop-blur-md overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="h-3 w-3" />
                    Score Technique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-3">
                    <span className="text-6xl font-black text-white tracking-tighter">
                      {avgTechnicalScore.toFixed(0)}
                    </span>
                    <span className="text-xl text-gray-500 font-mono mb-2">
                      /100
                    </span>
                  </div>
                  <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      style={{ width: `${avgTechnicalScore}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Régularité */}
              <Card className="bg-black/40 border-white/10 backdrop-blur-md overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono text-purple-400 uppercase tracking-widest flex items-center gap-2">
                    <Crosshair className="h-3 w-3" />
                    Indice de Régularité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-3">
                    <span className="text-6xl font-black text-white tracking-tighter">
                      {volley.comparison.consistencyIndex}
                    </span>
                    <span className="text-xl text-gray-500 font-mono mb-2">
                      /100
                    </span>
                  </div>
                  <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                      style={{
                        width: `${volley.comparison.consistencyIndex}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Radar / Biomécanique */}
              <div className="md:row-span-2 h-full">
                <BiomechanicsRadar
                  data={[
                    {
                      value: volley.comparison.elbowConsistency,
                      label: "COUDE",
                    },
                    {
                      value: volley.comparison.wristConsistency,
                      label: "POIGNET",
                    },
                    {
                      value: volley.comparison.shoulderConsistency,
                      label: "ÉPAULE",
                    },
                    {
                      value: volley.comparison.trunkConsistency,
                      label: "TRONC",
                    },
                    {
                      value: volley.comparison.gazeConsistency,
                      label: "STABILITÉ",
                    },
                  ]}
                />
              </div>

              {/* Top Priorités */}
              <div className="md:col-span-2">
                <Card className="bg-gradient-to-br from-white/5 to-transparent border-white/10 backdrop-blur-md h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      PRIORITÉS D'ENTRAÎNEMENT
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FeedbackCardPro recommendations={topPriorities} />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Plan d'entraînement */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Plan Suggéré
                </h3>
                <Badge
                  variant="outline"
                  className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10"
                >
                  IA GÉNÉRATIVE
                </Badge>
              </div>
              <TrainingPlan plan={trainingPlan} compact={true} />
            </div>

            {/* Recommandations détaillées */}
            {recommendations && (
              <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">
                    Analyse Détaillée
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {recommendations.feedbacks.length} points d'amélioration
                    identifiés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FeedbackList feedbacks={recommendations.feedbacks} />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Vue Graphiques */}
        {selectedView === "charts" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Superposition des mouvements */}
            <MotionOverlay
              throws={volley.throws as [Throw, Throw, Throw]}
              referenceIndex={volley.comparison.referenceThrowIndex}
            />

            {/* Comparaison visuelle */}
            <ThrowComparison
              throws={volley.throws as [Throw, Throw, Throw]}
              referenceIndex={volley.comparison.referenceThrowIndex}
            />

            {/* Graphiques d'angles */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-cyan-400" />
                  Télémétrie Biomécanique
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Analyse frame par frame des angles articulaires
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {volley.throws.map((throwData, index) => (
                    <div key={throwData.id} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="bg-white/5 border-white/10 text-white"
                        >
                          LANCER {index + 1}
                        </Badge>
                        {index === volley.comparison.referenceThrowIndex && (
                          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30">
                            RÉFÉRENCE
                          </Badge>
                        )}
                      </div>

                      <AngleChartGrid
                        charts={[
                          {
                            angles: throwData.analysis.elbow.angles,
                            title: "ANGLE DU COUDE",
                            color: "#00f2ff",
                          },
                          {
                            angles: throwData.analysis.wrist.angles,
                            title: "ANGLE DU POIGNET",
                            color: "#10b981",
                          },
                        ]}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vue Données */}
        {selectedView === "data" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Données Brutes</CardTitle>
                <CardDescription className="text-gray-400">
                  Métriques détaillées pour chaque lancer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {volley.throws.map((throwData, index) => (
                    <DataTable
                      key={throwData.id}
                      analysis={throwData.analysis}
                      throwIndex={index + 1}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">
                  Qualité de Détection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {volley.throws.map((throwData, index) => {
                    const avgConfidence =
                      throwData.analysis.elbow.angles.reduce(
                        (sum, a) => sum + a.confidence,
                        0,
                      ) / throwData.analysis.elbow.angles.length;

                    return (
                      <div
                        key={throwData.id}
                        className="flex items-center justify-between p-4 border border-white/5 rounded-lg bg-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="bg-black/50 border-white/10 text-gray-300"
                          >
                            LANCER {index + 1}
                          </Badge>
                          <span className="text-sm text-gray-400 font-mono">
                            {throwData.poses.length} FRAMES ·{" "}
                            {throwData.analysis.phases.length} PHASES
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 uppercase tracking-wider">
                            Confiance IA
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-black/50 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  avgConfidence > 0.7
                                    ? "bg-green-500"
                                    : avgConfidence > 0.5
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${avgConfidence * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-white">
                              {(avgConfidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
