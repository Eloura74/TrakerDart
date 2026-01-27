/**
 * Page d'historique des sessions
 * Affiche toutes les sessions passées et permet de les consulter
 */

import { useState } from "react";
import { ArrowLeft, Calendar, TrendingUp, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";
import { formatDate, formatDateShort } from "@/lib/utils";
import type { TrainingSession } from "@/types";

export function HistoryPage() {
  const { sessions, deleteSession } = useAppStore();
  const [selectedSession, setSelectedSession] =
    useState<TrainingSession | null>(null);

  /**
   * Retour à l'accueil
   */
  const goBack = () => {
    window.location.hash = "#/";
  };

  /**
   * Voir le détail d'une session
   */
  const viewSession = (session: TrainingSession) => {
    setSelectedSession(session);
  };

  /**
   * Fermer le détail
   */
  const closeDetail = () => {
    setSelectedSession(null);
  };

  /**
   * Supprimer une session
   */
  const handleDelete = (sessionId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette session ?")) {
      deleteSession(sessionId);
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
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

  if (selectedSession) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <header className="border-b sticky top-0 bg-background z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={closeDetail}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'historique
              </Button>

              <h1 className="text-xl font-bold">Détail de la session</h1>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(selectedSession.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {formatDate(new Date(selectedSession.createdAt))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durée</span>
                  <span className="font-medium">
                    {Math.round(selectedSession.duration / 60000)} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vollées</span>
                  <span className="font-medium">
                    {selectedSession.volleys.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lancers totaux</span>
                  <span className="font-medium">
                    {selectedSession.stats.totalThrows}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">
                      {selectedSession.stats.averageConsistency.toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Régularité moyenne
                    </p>
                  </div>

                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">
                      {selectedSession.stats.averageTechnicalScore.toFixed(0)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Score technique moyen
                    </p>
                  </div>
                </div>

                {/* Tendance */}
                <div className="mt-4 p-3 border rounded-lg flex items-center gap-2">
                  <TrendingUp
                    className={`w-5 h-5 ${
                      selectedSession.stats.consistencyTrend === "improving"
                        ? "text-success"
                        : selectedSession.stats.consistencyTrend === "declining"
                          ? "text-error"
                          : "text-muted-foreground"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Tendance :{" "}
                      {selectedSession.stats.consistencyTrend === "improving"
                        ? "En progression"
                        : selectedSession.stats.consistencyTrend === "declining"
                          ? "En régression"
                          : "Stable"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liste des vollées */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Vollées ({selectedSession.volleys.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedSession.volleys.map((volley, index) => (
                    <div
                      key={volley.id}
                      className="p-4 border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge>Volée {index + 1}</Badge>
                          {selectedSession.stats.bestVolley?.id ===
                            volley.id && (
                            <Badge variant="success">Meilleure</Badge>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewVolleyAnalysis(volley.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">
                            Régularité
                          </p>
                          <p className="font-medium">
                            {volley.comparison.consistencyIndex}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">
                            Technique moy.
                          </p>
                          <p className="font-medium">
                            {(
                              volley.throws.reduce(
                                (sum, t) => sum + t.analysis.technicalScore,
                                0,
                              ) / 3
                            ).toFixed(0)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">
                            Écarts
                          </p>
                          <p className="font-medium">
                            {volley.comparison.deviations.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-20">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>

            <h1 className="text-xl font-bold">Historique</h1>

            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
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
              <Card
                key={session.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => viewSession(session)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {formatDateShort(new Date(session.createdAt))}
                      </CardTitle>
                      <CardDescription>
                        {session.volleys.length} volée(s) ·{" "}
                        {session.stats.totalThrows} lancers
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          session.stats.consistencyTrend === "improving"
                            ? "success"
                            : session.stats.consistencyTrend === "declining"
                              ? "error"
                              : "secondary"
                        }
                      >
                        {session.stats.consistencyTrend === "improving"
                          ? "↗ En progression"
                          : session.stats.consistencyTrend === "declining"
                            ? "↘ En régression"
                            : "→ Stable"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {session.stats.averageConsistency.toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Régularité
                      </p>
                    </div>

                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {session.stats.averageTechnicalScore.toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Technique
                      </p>
                    </div>

                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {Math.round(session.duration / 60000)}min
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Durée
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
