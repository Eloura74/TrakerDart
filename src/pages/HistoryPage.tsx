/**
 * Page d'historique des sessions
 * Affiche toutes les sessions passées et permet de les consulter
 */

import { useState } from "react";
import { ArrowLeft, Calendar, Trash2, Eye, Play, TrendingUp, Target, Activity, Clock, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";
import { formatDateShort } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BiomechanicsRadar } from "@/components/analysis/BiomechanicsRadar";
import { ThrowReplay } from "@/components/analysis/ThrowReplay";
import { ScoreDisplay } from "@/components/analysis/ScoreDisplay";
import type { Throw } from "@/types";

export function HistoryPage() {
  const { sessions, deleteSession } = useAppStore();
  const [expandedVolleyId, setExpandedVolleyId] = useState<string | null>(null);

  /**
   * Retour à l'accueil
   */
  const goBack = () => {
    window.location.hash = "#/";
  };

  /**
   * Supprimer une session
   */
  const handleDelete = (sessionId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette session ?")) {
      deleteSession(sessionId);
    }
  };

  /**
   * Voir l'analyse d'une volée
   */
  const viewVolleyAnalysis = (volleyId: string) => {
    window.location.hash = `#/analysis/${volleyId}`;
  };

  // Trier les sessions par date (plus récente en premier)
  const sortedSessions = [...sessions].sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  /**
   * Toggle l'affichage du replay d'une volée
   */
  const toggleVolleyReplay = (volleyId: string) => {
    setExpandedVolleyId(expandedVolleyId === volleyId ? null : volleyId);
  };

  /**
   * Formater la durée en minutes et secondes
   */
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-20 text-white">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={goBack} className="text-gray-400 hover:text-white hover:bg-white/5">
              <ArrowLeft className="mr-2 h-4 w-4" />
              RETOUR
            </Button>

            <h1 className="text-xl font-bold font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">HISTORIQUE</h1>

            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl relative z-10">
        {sortedSessions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-xl font-bold mb-2">Aucune session</h2>
              <p className="text-muted-foreground mb-6">
                Commencez une session d'entraînement pour voir votre historique
              </p>
              <Button onClick={goBack}>Retour à l'accueil</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground">
                {sortedSessions.length} session(s) enregistrée(s)
              </p>
            </div>

            {sortedSessions.map((session) => (
              <Card key={session.id} className="glass-card overflow-hidden">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value={session.id} className="border-none">
                    <AccordionTrigger className="px-6 hover:no-underline hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="text-left">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-lg">
                              {formatDateShort(new Date(session.createdAt))}
                            </span>
                            <Badge
                              variant={
                                session.stats.consistencyTrend === "improving"
                                  ? "success"
                                  : session.stats.consistencyTrend ===
                                      "declining"
                                    ? "error"
                                    : "secondary"
                              }
                            >
                              {session.stats.consistencyTrend === "improving"
                                ? "↗ Progression"
                                : session.stats.consistencyTrend === "declining"
                                  ? "↘ Régression"
                                  : "→ Stable"}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {session.volleys.length} volée(s) ·{" "}
                            {session.stats.totalThrows} lancers
                          </div>
                        </div>

                        <div className="flex gap-8 text-right">
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              {session.stats.averageConsistency.toFixed(0)}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Régularité
                            </p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              {session.stats.averageTechnicalScore.toFixed(0)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Technique
                            </p>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-6 pb-6 pt-2 bg-black/20">
                      <div className="space-y-6">
                        <div className="flex justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(session.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer la session
                          </Button>
                        </div>

                        {/* Statistiques de session */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-cyan-400" />
                                <span className="text-xs text-gray-400 uppercase">Durée</span>
                              </div>
                              <p className="text-2xl font-bold text-white">{formatDuration(session.duration)}</p>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="h-4 w-4 text-purple-400" />
                                <span className="text-xs text-gray-400 uppercase">Vollées</span>
                              </div>
                              <p className="text-2xl font-bold text-white">{session.volleys.length}</p>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-green-400" />
                                <span className="text-xs text-gray-400 uppercase">Meilleur</span>
                              </div>
                              <p className="text-2xl font-bold text-white">
                                {Math.max(...session.volleys.map(v => v.comparison.consistencyIndex))}%
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Activity className="h-4 w-4 text-yellow-400" />
                                <span className="text-xs text-gray-400 uppercase">Lancers</span>
                              </div>
                              <p className="text-2xl font-bold text-white">{session.stats.totalThrows}</p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Graphiques de la session */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                          <Card className="bg-black/40 border-white/10">
                            <CardHeader>
                              <CardTitle className="text-sm flex items-center gap-2 text-white">
                                <BarChart className="h-4 w-4 text-cyan-400" />
                                Analyse Radar Moyenne
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {/* Calculer la moyenne des radars de toutes les vollées */}
                              {session.volleys.length > 0 && (
                                <BiomechanicsRadar
                                  data={[
                                    {
                                      value: Math.round(session.volleys.reduce((sum, v) => sum + v.comparison.elbowConsistency, 0) / session.volleys.length),
                                      label: "COUDE",
                                    },
                                    {
                                      value: Math.round(session.volleys.reduce((sum, v) => sum + v.comparison.wristConsistency, 0) / session.volleys.length),
                                      label: "POIGNET",
                                    },
                                    {
                                      value: Math.round(session.volleys.reduce((sum, v) => sum + v.comparison.shoulderConsistency, 0) / session.volleys.length),
                                      label: "ÉPAULE",
                                    },
                                    {
                                      value: Math.round(session.volleys.reduce((sum, v) => sum + v.comparison.trunkConsistency, 0) / session.volleys.length),
                                      label: "TRONC",
                                    },
                                    {
                                      value: Math.round(session.volleys.reduce((sum, v) => sum + v.comparison.gazeConsistency, 0) / session.volleys.length),
                                      label: "STABILITÉ",
                                    },
                                  ]}
                                />
                              )}
                            </CardContent>
                          </Card>

                          <Card className="bg-black/40 border-white/10">
                            <CardHeader>
                              <CardTitle className="text-sm flex items-center gap-2 text-white">
                                <Target className="h-4 w-4 text-purple-400" />
                                Scores Techniques
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-3 gap-4">
                                {session.volleys.slice(0, 3).map((volley, idx) => {
                                  const avgScore = volley.throws.reduce((sum, t) => sum + t.analysis.technicalScore, 0) / 3;
                                  return (
                                    <ScoreDisplay
                                      key={volley.id}
                                      score={avgScore}
                                      label={`Volée ${idx + 1}`}
                                      size="sm"
                                    />
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Détail des vollées avec replay */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            Détail des volées
                          </h4>
                          {session.volleys.map((volley, idx) => (
                            <Card key={volley.id} className="bg-black/40 border-white/10 overflow-hidden">
                              <div className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                      <span className="text-lg font-bold text-cyan-400">{idx + 1}</span>
                                    </div>
                                    <div>
                                      <p className="font-bold text-white">Volée {idx + 1}</p>
                                      <p className="text-xs text-gray-400">
                                        {new Date(volley.createdAt).toLocaleTimeString()}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-6">
                                    {/* Scores */}
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-cyan-400">
                                        {volley.comparison.consistencyIndex}
                                      </div>
                                      <div className="text-[10px] text-gray-500 uppercase">Régularité</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-purple-400">
                                        {Math.round(volley.throws.reduce((sum, t) => sum + t.analysis.technicalScore, 0) / 3)}
                                      </div>
                                      <div className="text-[10px] text-gray-500 uppercase">Technique</div>
                                    </div>

                                    {/* Boutons d'action */}
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => toggleVolleyReplay(volley.id)}
                                        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                                      >
                                        <Play className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => viewVolleyAnalysis(volley.id)}
                                        className="text-gray-400 hover:text-white hover:bg-white/10"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Replay vidéo (expandable) */}
                                {expandedVolleyId === volley.id && (
                                  <div className="mt-4 pt-4 border-t border-white/10 animate-in slide-in-from-top-2 duration-300">
                                    <ThrowReplay
                                      throws={volley.throws as [Throw, Throw, Throw]}
                                      referenceIndex={volley.comparison.referenceThrowIndex}
                                    />

                                    {/* Détail des 3 lancers */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                                      {volley.throws.map((throwData, throwIdx) => (
                                        <Card key={throwData.id} className="bg-white/5 border-white/10">
                                          <CardContent className="p-3">
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="text-xs font-bold text-gray-300">LANCER {throwIdx + 1}</span>
                                              {throwIdx === volley.comparison.referenceThrowIndex && (
                                                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-[10px] px-1 py-0">
                                                  REF
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="space-y-1 text-xs">
                                              <div className="flex justify-between">
                                                <span className="text-gray-400">Score:</span>
                                                <span className="font-bold text-white">{throwData.analysis.technicalScore}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-400">Durée:</span>
                                                <span className="font-bold text-white">{(throwData.duration / 1000).toFixed(1)}s</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-400">Frames:</span>
                                                <span className="font-bold text-white">{throwData.poses.length}</span>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
